import fs from "node:fs";

const h = fs.readFileSync("build_php/index.html", "utf8");

const h1 = h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.trim() || "NOT_FOUND";
const h2s = [...h.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, "").trim());
const pricesFound = h.includes("350") && h.includes("750") && h.includes("900") && h.includes("200") && h.includes("80") && h.includes("15");
const ratingFound = h.includes("4.9") && h.includes("184");
const faqFound = h.includes("الأسئلة الشائعة حول خدمات التنظيف بالرياض");
const areasFound = h.includes("حي الملقا") && h.includes("حي الياسمين") && h.includes("حي النرجس");

console.log("=== BUILD OUTPUT VERIFICATION ===");
console.log("HTML Size:", h.length, "bytes");
console.log("H1:", h1);
console.log("H2s (Count:", h2s.length, "):", h2s);
console.log("Prices in Raw HTML:", pricesFound);
console.log("Rating 4.9/184 in Raw HTML:", ratingFound);
console.log("FAQ in Raw HTML:", faqFound);
console.log("Areas in Raw HTML:", areasFound);
