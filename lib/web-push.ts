import webpush from "web-push";

function getWebPush() {
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!subject || !publicKey || !privateKey) {
    throw new Error("VAPID env vars not configured");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return webpush;
}

export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body: string; url?: string }
) {
  try {
    const wp = getWebPush();
    await wp.sendNotification(subscription, JSON.stringify(payload));
  } catch (err: unknown) {
    console.warn("Push failed:", (err as Error).message);
  }
}
