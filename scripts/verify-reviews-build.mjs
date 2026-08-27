import fs from "node:fs";

const villaHtml = fs.readFileSync("build_php/services/tanzeef-filal-alryad/index.html", "utf8");
const acHtml = fs.readFileSync("build_php/services/tanzeef-mokeyafat-alryad/index.html", "utf8");
const homeHtml = fs.readFileSync("build_php/index.html", "utf8");

console.log("=== VILLA CLEANING SERVICE PAGE ===");
console.log("Has reviews section:", villaHtml.includes('id="service-reviews"'));
console.log("Has customer name (أبو فهد القحطاني):", villaHtml.includes("أبو فهد القحطاني"));
console.log("Has customer name (المهندس بندر السبيعي):", villaHtml.includes("المهندس بندر السبيعي"));
console.log("No self-serving AggregateRating in Schema:", !villaHtml.includes('"@type": "AggregateRating"'));

console.log("\n=== AC CLEANING SERVICE PAGE ===");
console.log("Has reviews section:", acHtml.includes('id="service-reviews"'));
console.log("Has customer name (خالد التميمي):", acHtml.includes("خالد التميمي"));
console.log("No self-serving AggregateRating in Schema:", !acHtml.includes('"@type": "AggregateRating"'));

console.log("\n=== HOMEPAGE ===");
console.log("No self-serving AggregateRating in Schema:", !homeHtml.includes('"@type": "AggregateRating"'));
console.log("H1 present:", homeHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.trim());
