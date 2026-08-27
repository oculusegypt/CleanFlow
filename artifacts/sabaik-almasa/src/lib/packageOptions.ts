import type { CleaningPackage } from "@workspace/api-client-react"

export function getActiveCleaningPackages(containers: CleaningPackage[] | undefined): CleaningPackage[] {
  return (containers ?? [])
    .filter((container) => container.isActive && !["debris", "waste", "contract"].includes(container.category ?? ""))
    .sort((a, b) => a.order - b.order)
}

export function getCleaningPackageValue(container: CleaningPackage): string {
  return `${container.name}${container.size ? ` (${container.size})` : ""}`
}

export function getPackagesForService(
  containers: CleaningPackage[] | undefined,
  serviceType: string,
): CleaningPackage[] {
  const active = getActiveCleaningPackages(containers)
  const st = typeof serviceType === "string"
    ? serviceType
    : (serviceType && typeof serviceType === "object" ? (serviceType as any).name || (serviceType as any).title || "" : String(serviceType || ""))

  if (st.includes("شقق") || st.includes("منازل")) {
    return active.filter((container) => ["apartments", "move_clean"].includes(container.category ?? ""))
  }
  if (st.includes("فلل") || st.includes("قصور")) {
    return active.filter((container) => ["villas", "palaces", "move_clean"].includes(container.category ?? ""))
  }
  if (st.includes("مجالس") || st.includes("كنب")) return active.filter((container) => container.category === "majlis")
  if (st.includes("مكيف")) return active.filter((container) => container.category === "ac")
  if (st.includes("حشرات")) return active.filter((container) => container.category === "pest")
  if (st.includes("خزانات")) return active.filter((container) => container.category === "tanks")
  if (st.includes("رخام") || st.includes("بلاط")) return active.filter((container) => container.category === "marble")
  if (st.includes("بناء") || st.includes("تشطيب")) return active.filter((container) => container.category === "postcon")
  if (st.includes("واجهات") || st.includes("شركات")) return active.filter((container) => container.category === "facades")
  return active
}