<?php
declare(strict_types=1);

// Helper for Base64Url
function b64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function b64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

// Convert DER ECDSA signature to IEEE P1363 (64 bytes: r[32] || s[32])
function derToP1363(string $der): string {
    $pos = 2; // skip 0x30, length
    if (ord($der[1]) & 0x80) {
        $pos += (ord($der[1]) & 0x7f);
    }
    
    // R
    $pos++; // 0x02
    $rLen = ord($der[$pos++]);
    $r = substr($der, $pos, $rLen);
    $pos += $rLen;
    
    // S
    $pos++; // 0x02
    $sLen = ord($der[$pos++]);
    $s = substr($der, $pos, $sLen);
    
    $r = ltrim($r, "\x00");
    $s = ltrim($s, "\x00");
    
    $r = str_pad($r, 32, "\x00", STR_PAD_LEFT);
    $s = str_pad($s, 32, "\x00", STR_PAD_LEFT);
    
    return $r . $s;
}

// Convert VAPID base64url private key to OpenSSL EC private key PEM
function vapidPrivateToPem(string $rawPrivB64, string $rawPubB64): string {
    $priv = b64url_decode($rawPrivB64);
    $pub = b64url_decode($rawPubB64);
    
    // EC private key DER structure for prime256v1
    // SEQUENCE (4 elements)
    //   INTEGER 1 (version)
    //   OCTET STRING (private key 32 bytes)
    //   [0] (namedCurve oid: prime256v1 / 1.2.840.10045.3.1.7)
    //   [1] (publicKey bit string 65 bytes)
    $oid = "\x06\x08\x2a\x86\x48\xce\x3d\x03\x01\x07";
    $privOctet = "\x04\x20" . $priv;
    $pubBit = "\x03\x42\x00" . $pub;
    $seq = "\x02\x01\x01" . $privOctet . "\xa0\x0a" . $oid . "\xa1\x44" . $pubBit;
    $der = "\x30\x77" . $seq;
    
    return "-----BEGIN EC PRIVATE KEY-----\n" . chunk_split(base64_encode($der), 64, "\n") . "-----END EC PRIVATE KEY-----\n";
}

// Convert raw client public key (65 bytes) to OpenSSL EC public key PEM
function rawPubToPem(string $rawPub): string {
    // SubjectPublicKeyInfo for prime256v1:
    // SEQUENCE { SEQUENCE { OID id-ecPublicKey, OID prime256v1 }, BIT STRING { rawPub } }
    $header = "\x30\x59\x30\x13\x06\x07\x2a\x86\x48\xce\x3d\x02\x01\x06\x08\x2a\x86\x48\xce\x3d\x03\x01\x07\x03\x42\x00";
    $der = $header . $rawPub;
    return "-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode($der), 64, "\n") . "-----END PUBLIC KEY-----\n";
}

function sendWebPushNotification(
    array $subscription,
    array $payloadArray,
    string $vapidPublicKey,
    string $vapidPrivateKey,
    string $vapidSubject
): bool {
    $endpoint = $subscription['endpoint'] ?? '';
    $userPubB64 = $subscription['p256dh'] ?? '';
    $userAuthB64 = $subscription['auth'] ?? '';
    
    if (empty($endpoint) || empty($userPubB64) || empty($userAuthB64)) {
        return false;
    }
    
    $userPubKey = b64url_decode($userPubB64);
    $userAuth = b64url_decode($userAuthB64);
    if (strlen($userPubKey) !== 65 || strlen($userAuth) < 16) {
        return false;
    }
    
    $payload = json_encode($payloadArray, JSON_UNESCAPED_UNICODE);
    
    // 1. Generate local ephemeral EC key
    $localKey = openssl_pkey_new([
        'curve_name' => 'prime256v1',
        'private_key_type' => OPENSSL_KEYTYPE_EC,
    ]);
    if (!$localKey) return false;
    
    $localDetails = openssl_pkey_get_details($localKey);
    $localPubPem = $localDetails['key'];
    $localX = $localDetails['ec']['x'];
    $localY = $localDetails['ec']['y'];
    $localPubKey = "\x04" . $localX . $localY; // 65 bytes
    
    // 2. Derive shared secret
    $userPubPem = rawPubToPem($userPubKey);
    $userPubKeyRes = openssl_pkey_get_public($userPubPem);
    if (!$userPubKeyRes) return false;
    
    $sharedSecret = openssl_pkey_derive($userPubKeyRes, $localKey, 32);
    if (!$sharedSecret) return false;
    
    // 3. Key derivation (RFC 8291 / RFC 8188)
    $salt = random_bytes(16);
    $info = "WebPush: info\0" . $userPubKey . $localPubKey;
    $prk = hash_hkdf('sha256', $sharedSecret, 32, $info, $userAuth);
    
    $cek = hash_hkdf('sha256', $prk, 16, "Content-Encoding: aes128gcm\0", $salt);
    $nonce = hash_hkdf('sha256', $prk, 12, "Content-Encoding: nonce\0", $salt);
    
    // 4. Encrypt payload
    $paddedPayload = $payload . "\x02";
    $tag = '';
    $ciphertext = openssl_encrypt($paddedPayload, 'aes-128-gcm', $cek, OPENSSL_RAW_DATA, $nonce, $tag);
    if ($ciphertext === false) return false;
    
    // Body: salt (16) || rs (4) || idlen (1) || keyid (65) || ciphertext || tag (16)
    $rs = pack('N', 4096);
    $idLen = pack('C', 65);
    $body = $salt . $rs . $idLen . $localPubKey . $ciphertext . $tag;
    
    // 5. VAPID JWT (RFC 8292)
    $parsedUrl = parse_url($endpoint);
    $audience = $parsedUrl['scheme'] . '://' . $parsedUrl['host'] . (isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '');
    
    $jwtHeader = b64url_encode(json_encode(['typ' => 'JWT', 'alg' => 'ES256']));
    $jwtClaims = b64url_encode(json_encode([
        'aud' => $audience,
        'exp' => time() + 43200,
        'sub' => $vapidSubject
    ]));
    
    $signingData = $jwtHeader . '.' . $jwtClaims;
    $vapidPem = vapidPrivateToPem($vapidPrivateKey, $vapidPublicKey);
    $privKeyRes = openssl_pkey_get_private($vapidPem);
    if (!$privKeyRes) return false;
    
    $derSignature = '';
    openssl_sign($signingData, $derSignature, $privKeyRes, OPENSSL_ALGO_SHA256);
    $rawSignature = derToP1363($derSignature);
    $jwt = $signingData . '.' . b64url_encode($rawSignature);
    
    // 6. Send HTTP POST request via cURL
    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/octet-stream',
            'Content-Encoding: aes128gcm',
            'TTL: 86400',
            'Urgency: high',
            'Authorization: vapid t=' . $jwt . ', k=' . $vapidPublicKey
        ]
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $httpCode >= 200 && $httpCode < 300;
}

echo "WebPush Helper defined successfully.\n";
