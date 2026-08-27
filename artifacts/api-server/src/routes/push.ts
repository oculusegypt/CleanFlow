import { Router } from "express";
import { db, pushSubscriptionsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { requireAdmin, requireNonDriver, type AdminRequest } from "../middleware/adminAuth";
import { getVapidConfig } from "../lib/pushNotifications";

const router = Router();

router.get("/push/public-key", requireAdmin, requireNonDriver, async (_req, res) => {
  const config = await getVapidConfig();
  if (!config) {
    return res.status(503).json({ error: "Push notifications are not configured" });
  }
  return res.json({ publicKey: config.publicKey });
});

router.post("/push/subscriptions", requireAdmin, requireNonDriver, async (req, res) => {
  const { endpoint, keys } = req.body as {
    endpoint?: unknown;
    keys?: { p256dh?: unknown; auth?: unknown };
  };
  if (
    typeof endpoint !== "string" ||
    !endpoint.startsWith("https://") ||
    typeof keys?.p256dh !== "string" ||
    typeof keys.auth !== "string"
  ) {
    return res.status(400).json({ error: "Invalid push subscription" });
  }

  const adminId = (req as AdminRequest).adminId;
  const now = new Date().toISOString();
  await db.insert(pushSubscriptionsTable)
    .values({
      adminId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: pushSubscriptionsTable.endpoint,
      set: { adminId, p256dh: keys.p256dh, auth: keys.auth, updatedAt: now },
    });

  return res.json({ success: true });
});

router.delete("/push/subscriptions", requireAdmin, requireNonDriver, async (req, res) => {
  const endpoint = typeof req.body?.endpoint === "string" ? req.body.endpoint : null;
  const adminId = (req as AdminRequest).adminId;
  if (endpoint) {
    await db.delete(pushSubscriptionsTable).where(and(
      eq(pushSubscriptionsTable.endpoint, endpoint),
      eq(pushSubscriptionsTable.adminId, adminId),
    ));
  } else {
    await db.delete(pushSubscriptionsTable)
      .where(eq(pushSubscriptionsTable.adminId, adminId));
  }
  return res.json({ success: true });
});

export default router;