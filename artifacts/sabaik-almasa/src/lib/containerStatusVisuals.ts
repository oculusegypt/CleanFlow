export type CleaningPackageVisualStatus = "available" | "rented" | "maintenance" | "other"

const statusImages: Record<CleaningPackageVisualStatus, string> = {
  available: "/images/container-status-green.png",
  rented: "/images/container-status-red.png",
  maintenance: "/images/container-status-yellow.png",
  other: "/images/container-status-blue.png",
}

export function getCleaningPackageVisualStatus(status: unknown): CleaningPackageVisualStatus {
  const value = String(status ?? "").toLowerCase()
  if (["available", "متاحة", "متاح", "ready", "جاهزة"].includes(value)) return "available"
  if (["maintenance", "صيانة", "inspection", "تحت الفحص"].includes(value)) return "maintenance"
  if (["rented", "with_customer", "مؤجرة", "لدى العميل", "reserved", "محجوزة"].includes(value)) return "rented"
  return "other"
}

export function getCleaningServiceStatus(status: unknown): string {
  return statusImages[getCleaningPackageVisualStatus(status)]
}
