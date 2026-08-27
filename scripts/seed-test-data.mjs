#!/usr/bin/env node
/**
 * seed-test-data.mjs
 * ──────────────────
 * يضيف 10 طلبات تجريبية + محادثات + رسائل + إشعارات بحالات متنوعة
 * لتغطية جميع أنماط لوحة التحكم
 */

import { createRequire } from "module";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(import.meta.url);
const Database = require(join(ROOT, "lib/db/node_modules/better-sqlite3"));
const db = new Database(join(ROOT, "data/sabaik.db"));

const now = () => new Date().toISOString();
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString();
const hoursAgo = (n) => new Date(Date.now() - n * 36e5).toISOString();

// ──────────────────────────────────────────────────────────────────────────────
// 1. الطلبات التجريبية العشرة
// ──────────────────────────────────────────────────────────────────────────────
const REQUESTS = [
  {
    client_name:      "أحمد العتيبي",
    phone:            "0501234567",
    email:            "ahmed@example.com",
    service_type:     "تأجير باقات التنظيف مخلفات الهدم",
    package_size:   "باقة التنظيف كبيرة",
    location:         "الرياض - حي النزهة",
    duration:         "أسبوع",
    notes:            "موقع بناء طابقين، كمية كبيرة من الأنقاض",
    appointment_type: "immediate",
    scheduled_at:     null,
    status:           "pending",
    created_at:       daysAgo(0),
    updated_at:       daysAgo(0),
    admin_notes:      null,
  },
  {
    client_name:      "فهد الشمري",
    phone:            "0557654321",
    email:            "fahad@example.com",
    service_type:     "نقل الأنقاض والمخلفات",
    package_size:   "باقة التنظيف صغيرة",
    location:         "الرياض - حي الملقا",
    duration:         "يوم واحد",
    notes:            "هدم جدار داخلي — كمية متوسطة",
    appointment_type: "scheduled",
    scheduled_at:     new Date(Date.now() + 2 * 864e5).toISOString(),
    status:           "pending",
    created_at:       hoursAgo(3),
    updated_at:       hoursAgo(3),
    admin_notes:      null,
  },
  {
    client_name:      "سعود القحطاني",
    phone:            "0531122334",
    email:            "saud@example.com",
    service_type:     "ردم وتسوية الأراضي",
    package_size:   "",
    location:         "الرياض - حي العارض",
    duration:         "3 أيام",
    notes:            "أرض 500 متر تحتاج ردم وتسوية كاملة",
    appointment_type: "immediate",
    scheduled_at:     null,
    status:           "in_progress",
    created_at:       daysAgo(3),
    updated_at:       daysAgo(1),
    admin_notes:      "تم إرسال فريق الردم، متوقع الانتهاء خلال يومين",
  },
  {
    client_name:      "محمد الدوسري",
    phone:            "0509988776",
    email:            "mohammed@example.com",
    service_type:     "تنظيف وتطهير المواقع",
    package_size:   "مكبس نفايات كهربائي",
    location:         "الرياض - حي الروضة",
    duration:         "شهر",
    notes:            "موقع مصنع يحتاج تنظيف دوري أسبوعي",
    appointment_type: "scheduled",
    scheduled_at:     new Date(Date.now() + 5 * 864e5).toISOString(),
    status:           "in_progress",
    created_at:       daysAgo(5),
    updated_at:       daysAgo(2),
    admin_notes:      "عقد موقّع، بدء الخدمة الأسبوع القادم",
  },
  {
    client_name:      "عبدالله الرشيدي",
    phone:            "0544332211",
    email:            "abdullah@example.com",
    service_type:     "عقد نظافة / نفايات",
    package_size:   "عقد نظافة / نفايات",
    location:         "الرياض - حي السليمانية",
    duration:         "سنة",
    notes:            "عقد سنوي لمجمع تجاري 20 محل",
    appointment_type: "scheduled",
    scheduled_at:     new Date(Date.now() + 10 * 864e5).toISOString(),
    status:           "in_progress",
    created_at:       daysAgo(7),
    updated_at:       daysAgo(1),
    admin_notes:      "جارٍ استكمال إجراءات العقد والتسعير النهائي",
  },
  {
    client_name:      "نورة السبيعي",
    phone:            "0561234567",
    email:            "noura@example.com",
    service_type:     "تأجير باقات التنظيف مخلفات الهدم",
    package_size:   "باقة التنظيف نفايات صغيرة",
    location:         "الرياض - حي الياسمين",
    duration:         "3 أيام",
    notes:            "تجديد شقة سكنية",
    appointment_type: "immediate",
    scheduled_at:     null,
    status:           "completed",
    created_at:       daysAgo(10),
    updated_at:       daysAgo(7),
    admin_notes:      "تم تسليم الباقة التنظيف وإعادتها بعد الانتهاء. العميل راضٍ تماماً",
  },
  {
    client_name:      "تركي العنزي",
    phone:            "0508877665",
    email:            "turki@example.com",
    service_type:     "خدمات الترميم والصيانة",
    package_size:   "باقة التنظيف كبيرة",
    location:         "الرياض - حي الغدير",
    duration:         "أسبوعان",
    notes:            "ترميم فيلا كاملة — طبقتين",
    appointment_type: "scheduled",
    scheduled_at:     daysAgo(5),
    status:           "completed",
    created_at:       daysAgo(18),
    updated_at:       daysAgo(4),
    admin_notes:      "اكتملت الخدمة. فاتورة مدفوعة",
  },
  {
    client_name:      "خالد المطيري",
    phone:            "0535544332",
    email:            "khalid@example.com",
    service_type:     "خدمات المصانع والشركات",
    package_size:   "مكبس نفايات كهربائي",
    location:         "الرياض - المنطقة الصناعية",
    duration:         "شهران",
    notes:            "مصنع بلاستيك يحتاج حل دائم للنفايات",
    appointment_type: "immediate",
    scheduled_at:     null,
    status:           "completed",
    created_at:       daysAgo(20),
    updated_at:       daysAgo(10),
    admin_notes:      "تم تركيب المكبس وتدريب الفريق. عميل مميز",
  },
  {
    client_name:      "ريم الحربي",
    phone:            "0572233445",
    email:            "reem@example.com",
    service_type:     "نقل الأنقاض والمخلفات",
    package_size:   "باقة التنظيف صغيرة",
    location:         "الرياض - حي الربوة",
    duration:         "يوم واحد",
    notes:            "كمية صغيرة من مخلفات التشطيب",
    appointment_type: "immediate",
    scheduled_at:     null,
    status:           "cancelled",
    created_at:       daysAgo(4),
    updated_at:       daysAgo(3),
    admin_notes:      "العميلة ألغت الطلب — قررت التأجيل لموعد لاحق",
  },
  {
    client_name:      "بندر الغامدي",
    phone:            "0516677889",
    email:            "bandar@example.com",
    service_type:     "ردم وتسوية الأراضي",
    package_size:   "",
    location:         "الرياض - حي الشفا",
    duration:         "أسبوع",
    notes:            "أرض فضاء 800 متر",
    appointment_type: "scheduled",
    scheduled_at:     new Date(Date.now() + 1 * 864e5).toISOString(),
    status:           "cancelled",
    created_at:       daysAgo(6),
    updated_at:       daysAgo(5),
    admin_notes:      "لم يتم التواصل — العميل لم يرد على المكالمات",
  },
];

const insertReq = db.prepare(`
  INSERT INTO service_requests
    (client_name, phone, email, service_type, package_size, location, duration, notes,
     appointment_type, scheduled_at, status, admin_notes, created_at, updated_at)
  VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertedReqIds = [];
const insertMany = db.transaction(() => {
  for (const r of REQUESTS) {
    const res = insertReq.run(
      r.client_name, r.phone, r.email, r.service_type, r.package_size,
      r.location, r.duration, r.notes, r.appointment_type, r.scheduled_at,
      r.status, r.admin_notes, r.created_at, r.updated_at
    );
    insertedReqIds.push(res.lastInsertRowid);
    console.log(`  ✅ طلب #${res.lastInsertRowid} — ${r.client_name} [${r.status}]`);
  }
});
console.log("\n▶ إدراج الطلبات العشرة...");
insertMany();

// ──────────────────────────────────────────────────────────────────────────────
// 2. المحادثات والرسائل (لأول 6 طلبات)
// ──────────────────────────────────────────────────────────────────────────────
const CONVERSATIONS = [
  {
    reqIndex: 0,
    subject: "استفسار عن تأجير باقة التنظيف كبيرة",
    status:  "open",
    msgs: [
      { sender: "client", text: "السلام عليكم، أريد باقة التنظيف كبيرة لموقع بناء في حي النزهة", ago: hoursAgo(2) },
      { sender: "admin",  text: "وعليكم السلام! بكل سرور. ما هي الفترة المطلوبة تقريباً؟", ago: hoursAgo(1.5) },
      { sender: "client", text: "أسبوع كامل تقريباً، الموقع كبير", ago: hoursAgo(1) },
    ],
  },
  {
    reqIndex: 1,
    subject: "تأكيد موعد نقل الأنقاض",
    status:  "open",
    msgs: [
      { sender: "client", text: "مرحبا، هل يمكن التأكيد على الموعد بعد يومين؟", ago: hoursAgo(5) },
      { sender: "admin",  text: "تم التأكيد، سيصل الفريق في الساعة 8 صباحاً", ago: hoursAgo(4) },
      { sender: "client", text: "ممتاز، شكراً جزيلاً", ago: hoursAgo(3.5) },
      { sender: "admin",  text: "العفو، في حال احتجتم أي شيء لا تترددون", ago: hoursAgo(3) },
    ],
  },
  {
    reqIndex: 2,
    subject: "متابعة عملية الردم",
    status:  "open",
    msgs: [
      { sender: "client", text: "كيف سير العمل في الردم؟", ago: daysAgo(1) },
      { sender: "admin",  text: "الفريق يعمل بشكل ممتاز، أنجزنا 60% من المساحة", ago: hoursAgo(20) },
      { sender: "client", text: "هل تحتاجون مواد إضافية؟", ago: hoursAgo(18) },
      { sender: "admin",  text: "لا، كل شيء متوفر. سننتهي خلال يومين إن شاء الله", ago: hoursAgo(17) },
      { sender: "client", text: "تمام، أبقوني على اطلاع", ago: hoursAgo(16) },
    ],
  },
  {
    reqIndex: 4,
    subject: "تفاصيل عقد النظافة السنوي",
    status:  "open",
    msgs: [
      { sender: "client", text: "أريد معرفة التفاصيل الكاملة للعقد السنوي", ago: daysAgo(2) },
      { sender: "admin",  text: "بالتأكيد، سأرسل لك العرض التفصيلي على إيميلك", ago: daysAgo(2) },
      { sender: "client", text: "تسلم، انتظر العرض", ago: daysAgo(1.5) },
    ],
  },
  {
    reqIndex: 5,
    subject: "شكر وتقييم الخدمة",
    status:  "closed",
    msgs: [
      { sender: "client", text: "الله يجزاكم خير، الخدمة كانت ممتازة والفريق محترم", ago: daysAgo(7) },
      { sender: "admin",  text: "شكراً لثقتكم، يسعدنا خدمتكم دائماً 🌟", ago: daysAgo(7) },
      { sender: "client", text: "سأتواصل معكم في المشاريع القادمة بإذن الله", ago: daysAgo(6) },
      { sender: "admin",  text: "أهلاً وسهلاً بكم في أي وقت", ago: daysAgo(6) },
    ],
  },
  {
    reqIndex: 7,
    subject: "استفسار عن المكبس الكهربائي",
    status:  "closed",
    msgs: [
      { sender: "client", text: "هل المكبس يحتاج صيانة دورية؟", ago: daysAgo(12) },
      { sender: "admin",  text: "نعم، صيانة كل 3 أشهر، ونحن نتكفل بها ضمن العقد", ago: daysAgo(12) },
      { sender: "client", text: "رائع، هذا يوفر علينا الكثير", ago: daysAgo(11) },
    ],
  },
];

const insertConv = db.prepare(`
  INSERT INTO conversations (client_name, phone, email, subject, status, last_message, unread_count, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertMsg = db.prepare(`
  INSERT INTO messages (conversation_id, content, sender_type, is_read, created_at)
  VALUES (?, ?, ?, ?, ?)
`);
const updateConv = db.prepare(`
  UPDATE conversations SET last_message=?, unread_count=?, updated_at=? WHERE id=?
`);

console.log("\n▶ إدراج المحادثات والرسائل...");
const insertConvs = db.transaction(() => {
  for (const conv of CONVERSATIONS) {
    const req = REQUESTS[conv.reqIndex];
    const lastMsg = conv.msgs[conv.msgs.length - 1];
    const unread = conv.msgs.filter(m => m.sender === "client").length;

    const convRes = insertConv.run(
      req.client_name, req.phone, req.email,
      conv.subject, conv.status,
      lastMsg.text, unread,
      conv.msgs[0].ago, lastMsg.ago
    );
    const convId = convRes.lastInsertRowid;

    for (const msg of conv.msgs) {
      const isRead = msg.sender === "admin" ? 1 : (conv.status === "closed" ? 1 : 0);
      insertMsg.run(convId, msg.text, msg.sender, String(isRead), msg.ago);
    }

    // update unread for open convs
    const finalUnread = conv.status === "open"
      ? conv.msgs.filter(m => m.sender === "client").length
      : 0;
    updateConv.run(lastMsg.text, finalUnread, lastMsg.ago, convId);

    console.log(`  ✅ محادثة #${convId} — ${req.client_name} [${conv.status}] (${conv.msgs.length} رسائل)`);
  }
});
insertConvs();

// ──────────────────────────────────────────────────────────────────────────────
// 3. الإشعارات بأنواع وحالات مختلفة
// ──────────────────────────────────────────────────────────────────────────────
const NOTIFICATIONS = [
  // طلبات جديدة — غير مقروءة
  { title: "طلب جديد — أحمد العتيبي",        message: "طلب تأجير باقة التنظيف كبيرة في حي النزهة",                  type: "request",      is_read: 0, ref_type: "request",      created_at: daysAgo(0),    ref_id: insertedReqIds[0] },
  { title: "طلب جديد — فهد الشمري",           message: "طلب نقل أنقاض في حي الملقا — موعد مجدول بعد يومين",   type: "request",      is_read: 0, ref_type: "request",      created_at: hoursAgo(3),   ref_id: insertedReqIds[1] },
  // محادثات — غير مقروءة
  { title: "رسالة جديدة — أحمد العتيبي",     message: "أسبوع كامل تقريباً، الموقع كبير",                      type: "message",      is_read: 0, ref_type: "conversation", created_at: hoursAgo(1),   ref_id: null },
  { title: "رسالة جديدة — سعود القحطاني",    message: "تمام، أبقوني على اطلاع",                               type: "message",      is_read: 0, ref_type: "conversation", created_at: hoursAgo(16),  ref_id: null },
  { title: "رسالة جديدة — فهد الشمري",       message: "ممتاز، شكراً جزيلاً",                                  type: "message",      is_read: 0, ref_type: "conversation", created_at: hoursAgo(3.5), ref_id: null },
  // إشعارات النظام — مقروءة
  { title: "طلب مكتمل — نورة السبيعي",       message: "تم إنجاز طلب تأجير باقة التنظيف نفايات صغيرة بنجاح",          type: "system",       is_read: 1, ref_type: "request",      created_at: daysAgo(7),    ref_id: insertedReqIds[5] },
  { title: "طلب مكتمل — تركي العنزي",        message: "اكتمال ترميم فيلا في حي الغدير — الفاتورة مدفوعة",     type: "system",       is_read: 1, ref_type: "request",      created_at: daysAgo(4),    ref_id: insertedReqIds[6] },
  // إشعارات الإلغاء — مقروءة
  { title: "طلب ملغى — ريم الحربي",          message: "ألغت العميلة الطلب — تأجيل لموعد لاحق",                type: "warning",      is_read: 1, ref_type: "request",      created_at: daysAgo(3),    ref_id: insertedReqIds[8] },
  { title: "طلب ملغى — بندر الغامدي",        message: "العميل لم يرد على المكالمات بعد 3 محاولات",             type: "warning",      is_read: 0, ref_type: "request",      created_at: daysAgo(5),    ref_id: insertedReqIds[9] },
  // إشعار واتساب
  { title: "رسالة واتساب جديدة",             message: "خالد المطيري: متى موعد الصيانة القادمة للمكبس؟",        type: "whatsapp",     is_read: 0, ref_type: "whatsapp",     created_at: hoursAgo(2),   ref_id: null },
  // إشعار متابعة عقد
  { title: "تذكير: عقد سنوي قيد الإعداد",   message: "عقد عبدالله الرشيدي — يحتاج تأكيد التسعير النهائي",    type: "system",       is_read: 0, ref_type: "request",      created_at: daysAgo(1),    ref_id: insertedReqIds[4] },
  // إشعار مكتمل قديم — مقروء
  { title: "طلب مكتمل — خالد المطيري",       message: "تم تركيب المكبس الكهربائي في المنطقة الصناعية بنجاح",   type: "system",       is_read: 1, ref_type: "request",      created_at: daysAgo(10),   ref_id: insertedReqIds[7] },
];

const insertNotif = db.prepare(`
  INSERT INTO notifications (title, message, type, is_read, ref_id, ref_type, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

console.log("\n▶ إدراج الإشعارات...");
const insertNotifs = db.transaction(() => {
  for (const n of NOTIFICATIONS) {
    const res = insertNotif.run(n.title, n.message, n.type, n.is_read, n.ref_id, n.ref_type, n.created_at);
    const badge = n.is_read ? "📖" : "🔔";
    console.log(`  ${badge} إشعار #${res.lastInsertRowid} — ${n.title} [${n.type}]`);
  }
});
insertNotifs();

// ──────────────────────────────────────────────────────────────────────────────
// ملخص
// ──────────────────────────────────────────────────────────────────────────────
const totals = {
  requests:      db.prepare("SELECT COUNT(*) AS c FROM service_requests").get().c,
  pending:       db.prepare("SELECT COUNT(*) AS c FROM service_requests WHERE status='pending'").get().c,
  in_progress:   db.prepare("SELECT COUNT(*) AS c FROM service_requests WHERE status='in_progress'").get().c,
  completed:     db.prepare("SELECT COUNT(*) AS c FROM service_requests WHERE status='completed'").get().c,
  cancelled:     db.prepare("SELECT COUNT(*) AS c FROM service_requests WHERE status='cancelled'").get().c,
  conversations: db.prepare("SELECT COUNT(*) AS c FROM conversations").get().c,
  messages:      db.prepare("SELECT COUNT(*) AS c FROM messages").get().c,
  notifications: db.prepare("SELECT COUNT(*) AS c FROM notifications").get().c,
  unread_notifs: db.prepare("SELECT COUNT(*) AS c FROM notifications WHERE is_read=0").get().c,
};

db.close();

console.log(`
════════════════════════════════════════════════════════════
✅ البيانات التجريبية أُضيفت بنجاح

  الطلبات الكلية:  ${totals.requests}
    جديدة:         ${totals.pending}
    قيد التنفيذ:   ${totals.in_progress}
    مكتملة:        ${totals.completed}
    ملغاة:         ${totals.cancelled}

  المحادثات:       ${totals.conversations}
  الرسائل:         ${totals.messages}
  الإشعارات:       ${totals.notifications} (${totals.unread_notifs} غير مقروءة)
════════════════════════════════════════════════════════════
`);
