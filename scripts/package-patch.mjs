import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, rmSync, cpSync, statSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

console.log('\n📦 جارٍ إنشاء أرشيف ملفات التحديث فقط (بدون الصور والمكتبات الضخمة)...');

const patchDir = join(ROOT, 'build_patch');
if (existsSync(patchDir)) rmSync(patchDir, { recursive: true, force: true });
mkdirSync(patchDir, { recursive: true });

// 1. مجلد الـ API الكامل (PHP backend)
mkdirSync(join(patchDir, 'api'), { recursive: true });
copyFileSync(join(ROOT, 'build_php/api/index.php'), join(patchDir, 'api/index.php'));
if (existsSync(join(ROOT, 'build_php/api/.htaccess'))) {
  copyFileSync(join(ROOT, 'build_php/api/.htaccess'), join(patchDir, 'api/.htaccess'));
}

// 2. ملفات الـ JS والـ CSS المحدثة فقط (assets)
if (existsSync(join(ROOT, 'build_php/assets'))) {
  mkdirSync(join(patchDir, 'assets'), { recursive: true });
  cpSync(join(ROOT, 'build_php/assets'), join(patchDir, 'assets'), { recursive: true });
}

// 3. ملف index.html الرئيسي و .htaccess
if (existsSync(join(ROOT, 'build_php/index.html'))) {
  copyFileSync(join(ROOT, 'build_php/index.html'), join(patchDir, 'index.html'));
}
if (existsSync(join(ROOT, 'build_php/.htaccess'))) {
  copyFileSync(join(ROOT, 'build_php/.htaccess'), join(patchDir, '.htaccess'));
}

// 4. قاعدة البيانات المحدثة
if (existsSync(join(ROOT, 'build_php/data/sabaik.db'))) {
  mkdirSync(join(patchDir, 'data'), { recursive: true });
  copyFileSync(join(ROOT, 'build_php/data/sabaik.db'), join(patchDir, 'data/sabaik.db'));
}

// 5. الصور التي تشير إليها قاعدة البيانات. Keeping these in the patch is
// necessary when an image URL was fixed without rebuilding the whole archive.
if (existsSync(join(ROOT, 'build_php/uploads'))) {
  mkdirSync(join(patchDir, 'uploads'), { recursive: true });
  cpSync(join(ROOT, 'build_php/uploads'), join(patchDir, 'uploads'), { recursive: true });
}

// ضغط حزمة التحديث
const patchZip = join(ROOT, 'cleanflow-update-patch.zip');
rmSync(patchZip, { force: true });

if (process.platform === 'win32') {
  execSync(`powershell -Command "Compress-Archive -Path '${join(patchDir, '*')}' -DestinationPath '${patchZip}' -Force"`, { cwd: ROOT, stdio: 'inherit' });
} else {
  execSync(`zip -r cleanflow-update-patch.zip build_patch/*`, { cwd: ROOT, stdio: 'inherit' });
}

if (existsSync(patchZip)) {
  const sizeKb = Math.round(statSync(patchZip).size / 1024);
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ تم إنشاء حزمة التحديث بنجاح: cleanflow-update-patch.zip (${sizeKb} KB)`);
  console.log(`⚡ الحزمة جاهزة للرفع المباشر وتحديث النظام دون إعادة رفع المشروع بالكامل.`);
  console.log(`${'═'.repeat(60)}\n`);
}
