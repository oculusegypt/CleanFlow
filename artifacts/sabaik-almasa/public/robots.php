<?php
declare(strict_types=1);
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = trim((string)($_SERVER['HTTP_HOST'] ?? ''));
header('Content-Type: text/plain; charset=utf-8');
echo "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\n";
if ($host !== '') echo "Sitemap: {$scheme}://{$host}/sitemap.xml\n";
echo "\nUser-agent: GPTBot\nAllow: /\nUser-agent: ChatGPT-User\nAllow: /\nUser-agent: OAI-SearchBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: anthropic-ai\nAllow: /\nUser-agent: Bytespider\nDisallow: /\n";