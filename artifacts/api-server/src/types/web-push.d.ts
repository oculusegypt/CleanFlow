declare module "web-push" {
  export interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  export interface SendResult {
    statusCode: number;
    headers: Record<string, string | string[] | undefined>;
    body: string;
  }

  export interface WebPush {
    generateVAPIDKeys(): {
      publicKey: string;
      privateKey: string;
    };
    setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
    sendNotification(
      subscription: PushSubscription,
      payload?: string | Buffer,
    ): Promise<SendResult>;
  }

  const webpush: WebPush;
  export default webpush;
}