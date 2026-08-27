import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Resolve data dir relative to this file (lib/db/src → workspace root = ../../../data)
const _dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(_dirname, "../../../data");
fs.mkdirSync(dbDir, { recursive: true });

const dbPath = process.env["DB_PATH"] ?? path.join(dbDir, "sabaik.db");

const sqlite: Database.Database = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("busy_timeout = 5000");

// A portable deployment can arrive with an empty SQLite file when the
// database was uploaded separately from the application archive. Create the
// request table before additive migrations and indexes run so the API can
// boot and the normal seed/push flow can finish.
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS service_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    service_type TEXT NOT NULL,
    container_size TEXT NOT NULL DEFAULT '',
    package_size TEXT,
    property_type TEXT,
    area_size TEXT,
    location TEXT NOT NULL,
    duration TEXT,
    notes TEXT,
    appointment_type TEXT NOT NULL DEFAULT 'immediate',
    scheduled_at TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    customer_record_id INTEGER,
    package_record_id INTEGER,
    contract_record_id INTEGER,
    assigned_driver_id INTEGER,
    assigned_vehicle_id INTEGER,
    assigned_vehicle_plate TEXT,
    driver_status TEXT NOT NULL DEFAULT 'unassigned',
    driver_response_at TEXT,
    driver_started_at TEXT,
    driver_completed_at TEXT,
    driver_notes TEXT,
    driver_location_lat TEXT,
    driver_location_lng TEXT,
    driver_proof_photo_url TEXT,
    driver_signature_data TEXT,
    driver_receiver_name TEXT,
    assigned_at TEXT,
    session_id TEXT NOT NULL DEFAULT '',
    acquisition_source TEXT NOT NULL DEFAULT 'مباشر',
    attribution_referrer TEXT NOT NULL DEFAULT '',
    attribution_landing_page TEXT NOT NULL DEFAULT '',
    attribution_utm_source TEXT NOT NULL DEFAULT '',
    attribution_utm_medium TEXT NOT NULL DEFAULT '',
    attribution_utm_campaign TEXT NOT NULL DEFAULT '',
    attribution_gclid TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// ── Schema migrations: add new columns if they don't exist ───────────────────
const adminMigrations = [
  "ALTER TABLE admins ADD COLUMN email TEXT",
  "ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'admin'",
  "ALTER TABLE admins ADD COLUMN permissions TEXT",
  "ALTER TABLE admins ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1",
  "ALTER TABLE admins ADD COLUMN created_by INTEGER",
];
for (const sql of adminMigrations) {
  try { sqlite.exec(sql); } catch { /* column already exists — safe to ignore */ }
}

const packageMigrations = [
  "ALTER TABLE packages ADD COLUMN discount_percent REAL NOT NULL DEFAULT 0",
  "ALTER TABLE packages ADD COLUMN original_price REAL NOT NULL DEFAULT 0",
  "ALTER TABLE packages ADD COLUMN sale_price REAL NOT NULL DEFAULT 0",
  "ALTER TABLE packages ADD COLUMN sale_price_expires_at TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE packages ADD COLUMN discount_label TEXT NOT NULL DEFAULT ''",
];
for (const sql of packageMigrations) {
  try { sqlite.exec(sql); } catch { /* column already exists — safe to ignore */ }
}

// Keep the public seasonal-offers section useful on first boot while leaving
// every offer editable from the admin panel.
try {
  const offerCount = sqlite.prepare("SELECT COUNT(*) as count FROM ads WHERE type = 'offer'").get() as { count: number };
  if (offerCount.count === 0) {
    const addOffer = sqlite.prepare(`
      INSERT INTO ads (title, content, image_url, link_url, button_text, position, type, bg_color, is_active, "order")
      VALUES (?, ?, ?, '', 'اطلب العرض', 'after_offers', 'offer', '#0f172a', 1, ?)
    `);
    const addOffers = sqlite.transaction(() => {
      addOffer.run("عرض التنظيف الموسمي", "خصم خاص على خدمات التنظيف المنزلية لفترة محدودة.", "/images/service-villas.jpg", 0);
      addOffer.run("عرض العناية بالمجالس", "استمتع بتنظيف وتعقيم المجالس والكنب بسعر موسمي مميز.", "/images/service-majlis.jpg", 1);
      addOffer.run("عرض تجهيز المنزل", "حلول تنظيف متكاملة قبل المناسبات والانتقال إلى منزل جديد.", "/images/service-apartments.jpg", 2);
    });
    addOffers();
  }
} catch { /* portable databases may not have ads yet; normal migrations handle it */ }

const serviceRequestMigrations = [
  "ALTER TABLE service_requests ADD COLUMN email TEXT",
  "ALTER TABLE service_requests ADD COLUMN container_size TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE service_requests ADD COLUMN package_size TEXT",
  "ALTER TABLE service_requests ADD COLUMN duration TEXT",
  "ALTER TABLE service_requests ADD COLUMN notes TEXT",
  "ALTER TABLE service_requests ADD COLUMN appointment_type TEXT NOT NULL DEFAULT 'immediate'",
  "ALTER TABLE service_requests ADD COLUMN scheduled_at TEXT",
  "ALTER TABLE service_requests ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'",
  "ALTER TABLE service_requests ADD COLUMN admin_notes TEXT",
  "ALTER TABLE service_requests ADD COLUMN assigned_driver_id INTEGER",
  "ALTER TABLE service_requests ADD COLUMN assigned_vehicle_id INTEGER",
  "ALTER TABLE service_requests ADD COLUMN assigned_vehicle_plate TEXT",
  "ALTER TABLE service_requests ADD COLUMN driver_status TEXT NOT NULL DEFAULT 'unassigned'",
  "ALTER TABLE service_requests ADD COLUMN driver_response_at TEXT",
  "ALTER TABLE service_requests ADD COLUMN driver_started_at TEXT",
  "ALTER TABLE service_requests ADD COLUMN driver_completed_at TEXT",
  "ALTER TABLE service_requests ADD COLUMN driver_notes TEXT",
  "ALTER TABLE service_requests ADD COLUMN assigned_at TEXT",
  "ALTER TABLE service_requests ADD COLUMN property_type TEXT",
  "ALTER TABLE service_requests ADD COLUMN area_size TEXT",
  "ALTER TABLE service_requests ADD COLUMN session_id TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE service_requests ADD COLUMN acquisition_source TEXT NOT NULL DEFAULT 'مباشر'",
  "ALTER TABLE service_requests ADD COLUMN attribution_referrer TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE service_requests ADD COLUMN attribution_landing_page TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE service_requests ADD COLUMN attribution_utm_source TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE service_requests ADD COLUMN attribution_utm_medium TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE service_requests ADD COLUMN attribution_utm_campaign TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE service_requests ADD COLUMN attribution_gclid TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE service_requests ADD COLUMN customer_record_id INTEGER",
  "ALTER TABLE service_requests ADD COLUMN package_record_id INTEGER",
  "ALTER TABLE service_requests ADD COLUMN contract_record_id INTEGER",
  "ALTER TABLE service_requests ADD COLUMN driver_location_lat TEXT",
  "ALTER TABLE service_requests ADD COLUMN driver_location_lng TEXT",
  "ALTER TABLE service_requests ADD COLUMN driver_proof_photo_url TEXT",
  "ALTER TABLE service_requests ADD COLUMN driver_signature_data TEXT",
  "ALTER TABLE service_requests ADD COLUMN driver_receiver_name TEXT",
];
for (const sql of serviceRequestMigrations) {
  try { sqlite.exec(sql); } catch { /* column already exists — safe to ignore */ }
}

const analyticsMigrations = [
  "ALTER TABLE page_views ADD COLUMN country TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE page_views ADD COLUMN city TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE page_views ADD COLUMN utm_source TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE page_views ADD COLUMN utm_medium TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE page_views ADD COLUMN utm_campaign TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE page_views ADD COLUMN gclid TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE active_visitors ADD COLUMN conversation_id INTEGER",
  "ALTER TABLE active_visitors ADD COLUMN client_name TEXT",
  "ALTER TABLE active_visitors ADD COLUMN phone TEXT",
  "ALTER TABLE active_visitors ADD COLUMN invitation_message TEXT",
  "ALTER TABLE active_visitors ADD COLUMN invitation_created_at TEXT",
];
for (const sql of analyticsMigrations) {
  try { sqlite.exec(sql); } catch { /* column already exists — safe to ignore */ }
}

const conversationMigrations = [
  "ALTER TABLE conversations ADD COLUMN package_id INTEGER",
  "ALTER TABLE conversations ADD COLUMN package_name TEXT",
  "ALTER TABLE conversations ADD COLUMN client_typing_at TEXT",
  "ALTER TABLE conversations ADD COLUMN admin_typing_at TEXT",
];
for (const sql of conversationMigrations) {
  try { sqlite.exec(sql); } catch { /* column already exists — safe to ignore */ }
}

// Ads were added after some portable SQLite databases were created. Keep the
// table available at startup so the admin list and public ad slots never fail
// simply because an older database was deployed.
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    link_url TEXT NOT NULL DEFAULT '',
    button_text TEXT NOT NULL DEFAULT '',
    position TEXT NOT NULL DEFAULT 'middle',
    type TEXT NOT NULL DEFAULT 'banner',
    bg_color TEXT NOT NULL DEFAULT '#eff6ff',
    is_active INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const messageMigrations = [
  "ALTER TABLE messages ADD COLUMN message_type TEXT NOT NULL DEFAULT 'text'",
  "ALTER TABLE messages ADD COLUMN metadata TEXT",
  "ALTER TABLE messages ADD COLUMN attachment_url TEXT",
  "ALTER TABLE messages ADD COLUMN attachment_type TEXT",
  "ALTER TABLE messages ADD COLUMN location_lat TEXT",
  "ALTER TABLE messages ADD COLUMN location_lng TEXT",
  "ALTER TABLE messages ADD COLUMN location_label TEXT",
];
for (const sql of messageMigrations) {
  try { sqlite.exec(sql); } catch { /* column already exists — safe to ignore */ }
}

try { sqlite.exec("ALTER TABLE notifications ADD COLUMN recipient_admin_id INTEGER"); } catch { /* already exists */ }
try { sqlite.exec("CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created ON notifications(recipient_admin_id, created_at)"); } catch { /* already exists */ }

// Standalone SEO landing pages. Kept as a startup migration because the
// portable SQLite database may predate this feature.
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS seo_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    target_keyword TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    excerpt TEXT NOT NULL DEFAULT '',
    cover_image TEXT DEFAULT '',
    category TEXT NOT NULL DEFAULT 'خدمات التنظيف',
    tags TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TEXT,
    view_count INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    seo_title TEXT NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    seo_keywords TEXT NOT NULL DEFAULT '',
    seo_slug TEXT NOT NULL DEFAULT '',
    og_image TEXT NOT NULL DEFAULT '',
    canonical_url TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Defensive SQLite constraints for portable databases. Triggers are used here
// because older installations cannot add CHECK constraints without rebuilding
// tables; they protect new writes without rewriting existing records.
sqlite.exec(`
  CREATE INDEX IF NOT EXISTS idx_service_requests_driver_status
    ON service_requests(assigned_driver_id, driver_status);
  CREATE INDEX IF NOT EXISTS idx_service_requests_status_created
    ON service_requests(status, created_at);
  CREATE TRIGGER IF NOT EXISTS validate_service_request_values_insert
    BEFORE INSERT ON service_requests
    WHEN NEW.appointment_type NOT IN ('immediate', 'scheduled')
      OR NEW.driver_status NOT IN ('unassigned', 'assigned', 'accepted', 'started', 'en_route', 'arrived', 'completed', 'rejected')
      OR NEW.status NOT IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected')
    BEGIN
      SELECT RAISE(ABORT, 'invalid service request status');
    END;
  CREATE TRIGGER IF NOT EXISTS validate_service_request_values_update
    BEFORE UPDATE OF appointment_type, driver_status, status ON service_requests
    WHEN NEW.appointment_type NOT IN ('immediate', 'scheduled')
      OR NEW.driver_status NOT IN ('unassigned', 'assigned', 'accepted', 'started', 'en_route', 'arrived', 'completed', 'rejected')
      OR NEW.status NOT IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected')
    BEGIN
      SELECT RAISE(ABORT, 'invalid service request status');
    END;
`);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

// Cleaning operations records are intentionally kept in portable SQLite
// tables so the local app and Hostinger PHP export share the same data shape.
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS cleaning_operations_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    reference TEXT NOT NULL DEFAULT '',
    payload TEXT NOT NULL DEFAULT '{}',
    operation_key TEXT,
    created_by INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_cleaning_operations_records_kind
    ON cleaning_operations_records(kind);
  CREATE INDEX IF NOT EXISTS idx_cleaning_operations_records_status
    ON cleaning_operations_records(status);
  CREATE TABLE IF NOT EXISTS cleaning_operations_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id INTEGER,
    kind TEXT NOT NULL,
    action TEXT NOT NULL,
    before_payload TEXT,
    after_payload TEXT,
    actor_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_cleaning_operations_audit_created_at
    ON cleaning_operations_audit(created_at);
`);

// Migrate legacy operational rows once, preserving their relationships while
// translating the domain vocabulary to cleaning packages.
try {
  sqlite.exec(`
    INSERT OR IGNORE INTO cleaning_operations_records
      (id, kind, status, reference, payload, created_by, created_at, updated_at)
    SELECT id,
      CASE WHEN kind IN ('container', 'container_asset') THEN 'package_asset'
           WHEN kind = 'contract' THEN 'contract'
           ELSE kind END,
      status, reference, payload, created_by, created_at, updated_at
    FROM container_system_records
  `);
  sqlite.exec(`
    INSERT OR IGNORE INTO cleaning_operations_audit
      (id, record_id, kind, action, before_payload, after_payload, actor_id, created_at)
    SELECT id, record_id,
      CASE WHEN kind IN ('container', 'container_asset') THEN 'package_asset'
           ELSE kind END,
      action, before_payload, after_payload, actor_id, created_at
    FROM container_system_audit
  `);
} catch { /* legacy tables are absent on a fresh database */ }

// Normalize legacy fixture identifiers while preserving every relationship
// that references a package code in another record's JSON payload.
function normalizeCleaningPackageCodes(value: string) {
  return value.replace(/(?:DEMO-)?CNT-(12|20)-(\d{2})/g, (_match, size: string, sequence: string) => {
    const offset = size === "12" ? 100 : 110;
    return `CNT-${offset + Number(sequence)}`;
  });
}
const legacyCleaningPackageRecords = sqlite.prepare(
  "SELECT id, kind, reference, payload FROM cleaning_operations_records WHERE reference LIKE 'DEMO-CNT-%' OR payload LIKE '%DEMO-CNT-%'",
).all() as Array<{ id: number; kind: string; reference: string; payload: string }>;
const updateLegacyCleaningPackage = sqlite.prepare(
  "UPDATE cleaning_operations_records SET reference = ?, payload = ?, updated_at = ? WHERE id = ?",
);
for (const record of legacyCleaningPackageRecords) {
  const reference = record.kind === "package" || record.kind === "package_asset"
    ? normalizeCleaningPackageCodes(record.reference)
    : record.reference;
  const payload = normalizeCleaningPackageCodes(record.payload);
  if (reference !== record.reference || payload !== record.payload) {
    updateLegacyCleaningPackage.run(reference, payload, new Date().toISOString(), record.id);
  }
}

// Typed financial core. The legacy container record remains readable during
// migration, but all newly posted financial sources receive a typed ledger
// projection with database uniqueness constraints.
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS financial_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS financial_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period_key TEXT NOT NULL UNIQUE,
    starts_on TEXT NOT NULL,
    ends_on TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    closed_by INTEGER,
    closed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS financial_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_number TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    source_kind TEXT NOT NULL,
    source_id INTEGER NOT NULL,
    reference TEXT NOT NULL DEFAULT '',
    transaction_date TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'SAR',
    status TEXT NOT NULL DEFAULT 'posted',
    operation_key TEXT UNIQUE,
    created_by INTEGER,
    approved_by INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    posted_at TEXT,
    cancelled_at TEXT,
    cancellation_reason TEXT,
    UNIQUE(source_kind, source_id)
  );
  CREATE TABLE IF NOT EXISTS financial_journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL UNIQUE,
    entry_number TEXT NOT NULL,
    total_debit REAL NOT NULL DEFAULT 0,
    total_credit REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'posted',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    CHECK (abs(total_debit - total_credit) < 0.011)
  );
  CREATE TABLE IF NOT EXISTS financial_journal_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journal_entry_id INTEGER NOT NULL,
    account_code TEXT NOT NULL,
    debit REAL NOT NULL DEFAULT 0,
    credit REAL NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',
    CHECK (debit >= 0 AND credit >= 0 AND NOT (debit > 0 AND credit > 0))
  );
  CREATE TABLE IF NOT EXISTS financial_allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    contract_id INTEGER,
    invoice_id INTEGER,
    amount REAL NOT NULL CHECK (amount > 0)
  );
  CREATE TABLE IF NOT EXISTS bank_reconciliations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deposit_record_id INTEGER NOT NULL,
    bank_account_code TEXT NOT NULL DEFAULT 'BANK-001',
    deposit_reference TEXT NOT NULL DEFAULT '',
    deposit_date TEXT NOT NULL,
    amount REAL NOT NULL,
    linked_transaction_id INTEGER,
    bank_fee REAL NOT NULL DEFAULT 0,
    difference REAL NOT NULL DEFAULT 0,
    difference_reason TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'unmatched',
    approved_by INTEGER,
    approved_at TEXT,
    reviewed_by INTEGER,
    reviewed_at TEXT,
    rejection_reason TEXT NOT NULL DEFAULT '',
    audit_trail TEXT NOT NULL DEFAULT '[]'
  );
`);
for (const sql of [
  "ALTER TABLE bank_reconciliations ADD COLUMN reviewed_by INTEGER",
  "ALTER TABLE bank_reconciliations ADD COLUMN reviewed_at TEXT",
  "ALTER TABLE bank_reconciliations ADD COLUMN rejection_reason TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE bank_reconciliations ADD COLUMN audit_trail TEXT NOT NULL DEFAULT '[]'",
]) {
  try { sqlite.exec(sql); } catch { /* existing portable database */ }
}
const financialAccounts = [
  ["CASH-001", "الخزينة الرئيسية", "cash"],
  ["BANK-001", "الحساب البنكي الرئيسي", "bank"],
  ["AR-001", "ذمم العملاء", "receivable"],
  ["AP-001", "ذمم الموردين", "payable"],
  ["REV-001", "إيرادات الخدمات", "revenue"],
  ["REV-OTHER", "إيرادات أخرى", "other_revenue"],
  ["EXP-001", "المصروفات العامة", "expense"],
  ["EXP-MAINT", "مصروفات الصيانة", "maintenance"],
  ["INV-001", "المخزون", "inventory"],
  ["COGS-001", "تكلفة المبيعات", "cogs"],
  ["COMM-001", "العمولات", "commission"],
  ["BANK-FEE", "رسوم بنكية", "bank_fee"],
  ["TRANSFER-001", "تحويلات داخلية", "transfer"],
  ["REFUND-001", "المرتجعات", "refund"],
  ["ADJ-001", "التسويات", "adjustment"],
] as const;
const accountInsert = sqlite.prepare("INSERT OR IGNORE INTO financial_accounts (code, name, category) VALUES (?, ?, ?)");
for (const account of financialAccounts) accountInsert.run(...account);

try { sqlite.exec("ALTER TABLE container_system_records ADD COLUMN operation_key TEXT"); } catch { /* already exists */ }
try {
  sqlite.exec(`
    UPDATE container_system_records
    SET operation_key = json_extract(payload, '$.operationKey')
    WHERE operation_key IS NULL
      AND json_extract(payload, '$.operationKey') IS NOT NULL
  `);
} catch { /* older SQLite builds may not expose json_extract */ }
try {
  sqlite.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_container_system_records_operation_key
      ON container_system_records(kind, operation_key)
      WHERE operation_key IS NOT NULL AND operation_key <> '' AND status <> 'archived'
  `);
} catch { /* legacy operational tables are absent on a fresh database */ }

export const db = drizzle(sqlite, { schema });
export { sqlite };
export * from "./schema";
export * from "./financial-core";
