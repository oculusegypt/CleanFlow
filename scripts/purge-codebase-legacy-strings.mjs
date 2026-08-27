import fs from "node:fs";
import path from "node:path";

const ROOT = "e:/Hawiat";

const TARGET_DIRS = [
  path.join(ROOT, "lib"),
  path.join(ROOT, "scripts"),
  path.join(ROOT, "artifacts/api-server"),
  path.join(ROOT, "artifacts/sabaik-almasa/src"),
  path.join(ROOT, "docs")
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git" && entry.name !== "dist" && entry.name !== "build_php") {
        walk(fullPath, files);
      }
    } else if (/\.(ts|tsx|js|mjs|json|md)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

let modifiedCount = 0;

for (const targetDir of TARGET_DIRS) {
  const files = walk(targetDir);
  for (const file of files) {
    // skip this purge script itself
    if (file.includes("purge-codebase-legacy-strings.mjs")) continue;
    
    let content = fs.readFileSync(file, "utf8");
    if (content.includes("سبائك الماسة") || content.includes("سبائك الماسه") || content.includes("سبائك")) {
      const updated = content
        .replace(/سبائك الماسة/g, "مؤسسة السهم كلين")
        .replace(/سبائك الماسه/g, "مؤسسة السهم كلين")
        .replace(/مؤسسة سبائك/g, "مؤسسة السهم كلين")
        .replace(/شركة سبائك/g, "شركة السهم كلين")
        .replace(/منصة سبائك/g, "منصة السهم كلين")
        .replace(/سبائك/g, "السهم كلين");
      
      fs.writeFileSync(file, updated, "utf8");
      modifiedCount++;
      console.log(`✅ Updated: ${path.relative(ROOT, file)}`);
    }
  }
}

console.log(`\n🎉 تم تنظيف ${modifiedCount} ملفاً برمجياً من الاسم القديم.`);
