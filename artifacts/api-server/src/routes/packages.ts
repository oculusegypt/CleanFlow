import { Router } from "express";
import { db } from "@workspace/db";
import { packagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin, requireSectionPermission } from "../middleware/adminAuth";

const router = Router();

function normalizeArabicSlug(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\u0600-\u06FF0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function toOfferNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeOffer(input: {
  discountPercent?: unknown
  originalPrice?: unknown
  salePriceExpiresAt?: unknown
  discountLabel?: unknown
}, fallback?: {
  discountPercent?: unknown
  originalPrice?: unknown
  salePriceExpiresAt?: unknown
  discountLabel?: unknown
}) {
  const discountPercent = Math.min(100, Math.max(0, toOfferNumber(input.discountPercent, toOfferNumber(fallback?.discountPercent))));
  const originalPrice = Math.max(0, toOfferNumber(input.originalPrice, toOfferNumber(fallback?.originalPrice)));
  const salePrice = discountPercent > 0 && originalPrice > 0
    ? Math.round(originalPrice * (1 - discountPercent / 100) * 100) / 100
    : 0;
  return {
    discountPercent,
    originalPrice,
    salePrice,
    salePriceExpiresAt: discountPercent > 0 ? String(input.salePriceExpiresAt ?? fallback?.salePriceExpiresAt ?? "") : "",
    discountLabel: discountPercent > 0 ? String(input.discountLabel ?? fallback?.discountLabel ?? "") : "",
  };
}

router.get(["/packages", "/packages", "/cleaning-packages"], async (_req, res) => {
  const containers = await db.select().from(packagesTable).orderBy(asc(packagesTable.order));
  return res.json(containers);
});

router.post("/packages", requireAdmin, requireSectionPermission("packages"), async (req, res) => {
  const {
    name, category, size, capacity, description, features,
    suitableFor, priceText, priceNote, rentalPeriod,
    contactPhone1, contactPhone2, pricePerDay, imageUrl, images,
    discountPercent, originalPrice, salePrice, salePriceExpiresAt, discountLabel,
    order, isActive, seoEnabled, seoTitle, seoDescription, seoKeywords, seoSlug,
  } = req.body;
  const offer = normalizeOffer({ discountPercent, originalPrice, salePriceExpiresAt, discountLabel });
  const [container] = await db.insert(packagesTable).values({
    name,
    category: category ?? "debris",
    size: size ?? "",
    capacity: capacity ?? "",
    description,
    features: features ?? [],
    suitableFor: suitableFor ?? "",
    priceText: priceText ?? "",
    priceNote: priceNote ?? "",
    rentalPeriod: rentalPeriod ?? "",
    contactPhone1: contactPhone1 ?? "",
    contactPhone2: contactPhone2 ?? "",
    pricePerDay: Number(pricePerDay ?? 0),
    ...offer,
    imageUrl: imageUrl ?? "",
    images: images ?? "[]",
    order: order ?? 0,
    isActive: isActive ?? true,
    seoEnabled: seoEnabled ?? false,
    seoTitle: seoTitle ?? "",
    seoDescription: seoDescription ?? "",
    seoKeywords: seoKeywords ?? "",
     seoSlug: normalizeArabicSlug(seoSlug),
  }).returning();
  return res.status(201).json(container);
});

router.patch("/packages/:id", requireAdmin, requireSectionPermission("packages"), async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  const {
    name, category, size, capacity, description, features,
    suitableFor, priceText, priceNote, rentalPeriod,
    contactPhone1, contactPhone2, pricePerDay, imageUrl, images,
    discountPercent, originalPrice, salePrice, salePriceExpiresAt, discountLabel,
     order, isActive, seoEnabled, seoTitle, seoDescription, seoKeywords, seoSlug,
  } = req.body;
  const [existing] = await db.select({
    discountPercent: packagesTable.discountPercent,
    originalPrice: packagesTable.originalPrice,
    salePriceExpiresAt: packagesTable.salePriceExpiresAt,
    discountLabel: packagesTable.discountLabel,
  }).from(packagesTable).where(eq(packagesTable.id, id));
  if (!existing) return res.status(404).json({ error: "Not found" });
  const offer = normalizeOffer({ discountPercent, originalPrice, salePriceExpiresAt, discountLabel }, existing);
  const updateData: Record<string, unknown> = {
    name, category, size, capacity, description, features,
    suitableFor, priceText, priceNote, rentalPeriod,
    contactPhone1, contactPhone2, imageUrl, images,
    ...offer,
     order, isActive, seoEnabled, seoTitle, seoDescription, seoKeywords,
  };
  if (pricePerDay !== undefined) updateData.pricePerDay = Number(pricePerDay);
  // Strip undefined keys so partial patches work correctly
  for (const k of Object.keys(updateData)) {
    if (updateData[k] === undefined) delete updateData[k];
  }
   if (seoSlug !== undefined) updateData.seoSlug = normalizeArabicSlug(seoSlug);
  const [container] = await db.update(packagesTable)
    .set(updateData)
    .where(eq(packagesTable.id, id))
    .returning();
  return res.json(container);
});

router.delete("/packages/:id", requireAdmin, requireSectionPermission("packages"), async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  await db.delete(packagesTable).where(eq(packagesTable.id, id));
  return res.status(204).send();
});

export default router;
