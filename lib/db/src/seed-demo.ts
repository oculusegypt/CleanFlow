import { db } from "./index.js";
import { serviceRequestsTable } from "./schema/serviceRequests.js";
import { conversationsTable, messagesTable } from "./schema/conversations.js";
import { notificationsTable } from "./schema/notifications.js";

console.log("🌱 Seeding demo data (service requests, conversations, notifications)...");

// Clear existing demo data
db.delete(notificationsTable).run();
db.delete(messagesTable).run();
db.delete(conversationsTable).run();
db.delete(serviceRequestsTable).run();

// ── Service Requests ────────────────────────────────────────────────────────

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();

const serviceRequests = [
  {
    clientName: "أحمد محمد العتيبي",
    phone: "0501234567",
    email: "ahmed@example.com",
    serviceType: "تأجير باقة التنظيف",
    packageSize: "10 أمتار",
    location: "الرياض - حي النزهة",
    duration: "أسبوع",
    notes: "أحتاج الباقة التنظيف لنقل أنقاض تجديد منزل",
    appointmentType: "immediate",
    scheduledAt: null,
    status: "completed",
    adminNotes: "تم التوصيل في الموعد المحدد",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(12),
  },
  {
    clientName: "سارة عبدالله الزهراني",
    phone: "0557891234",
    email: "sara@example.com",
    serviceType: "نقل أنقاض",
    packageSize: "20 أمتار",
    location: "الرياض - حي العليا",
    duration: "يومان",
    notes: "موقع بناء جديد، يحتاج إخلاء سريع",
    appointmentType: "scheduled",
    scheduledAt: daysAgo(-2),
    status: "pending",
    adminNotes: null,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    clientName: "فهد سالم الدوسري",
    phone: "0512345678",
    email: null,
    serviceType: "تأجير باقة التنظيف",
    packageSize: "5 أمتار",
    location: "الرياض - حي الملز",
    duration: "3 أيام",
    notes: null,
    appointmentType: "immediate",
    scheduledAt: null,
    status: "in_progress",
    adminNotes: "الباقة التنظيف في الموقع",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
  },
  {
    clientName: "نورة خالد القحطاني",
    phone: "0566789012",
    email: "noura@example.com",
    serviceType: "نقل أنقاض",
    packageSize: "15 أمتار",
    location: "الرياض - حي الروضة",
    duration: "أسبوعان",
    notes: "هدم مبنى قديم",
    appointmentType: "scheduled",
    scheduledAt: daysAgo(-5),
    status: "pending",
    adminNotes: null,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    clientName: "عمر يوسف الشمري",
    phone: "0523456789",
    email: "omar@example.com",
    serviceType: "تأجير باقة التنظيف",
    packageSize: "10 أمتار",
    location: "الرياض - حي الورود",
    duration: "أسبوع",
    notes: "تجديد مكتبي",
    appointmentType: "immediate",
    scheduledAt: null,
    status: "cancelled",
    adminNotes: "العميل ألغى الطلب",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(6),
  },
  {
    clientName: "محمد علي الغامدي",
    phone: "0534567890",
    email: null,
    serviceType: "نقل أنقاض",
    packageSize: "20 أمتار",
    location: "الرياض - حي السليمانية",
    duration: "شهر",
    notes: "مشروع تجاري كبير",
    appointmentType: "scheduled",
    scheduledAt: daysAgo(-7),
    status: "in_progress",
    adminNotes: "يسير بشكل جيد",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(2),
  },
  {
    clientName: "هند عبدالرحمن العسيري",
    phone: "0545678901",
    email: "hind@example.com",
    serviceType: "تأجير باقة التنظيف",
    packageSize: "5 أمتار",
    location: "الرياض - حي الياسمين",
    duration: "يوم",
    notes: "[طلب عرض سعر] أرغب في معرفة السعر قبل التأكيد",
    appointmentType: "immediate",
    scheduledAt: null,
    status: "pending",
    adminNotes: null,
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    clientName: "طارق إبراهيم المطيري",
    phone: "0556789012",
    email: "tarek@example.com",
    serviceType: "نقل أنقاض",
    packageSize: "10 أمتار",
    location: "الرياض - حي بدر",
    duration: "3 أيام",
    notes: "إزالة مخلفات بناء قديم",
    appointmentType: "immediate",
    scheduledAt: null,
    status: "completed",
    adminNotes: "تم بنجاح",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(18),
  },
  {
    clientName: "ريم سعد الحربي",
    phone: "0567890123",
    email: null,
    serviceType: "تأجير باقة التنظيف",
    packageSize: "20 أمتار",
    location: "الرياض - حي الربوة",
    duration: "أسبوعان",
    notes: "ترميم فيلا",
    appointmentType: "scheduled",
    scheduledAt: daysAgo(-3),
    status: "pending",
    adminNotes: null,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    clientName: "عبدالعزيز نواف الرشيدي",
    phone: "0578901234",
    email: "aziz@example.com",
    serviceType: "تأجير باقة التنظيف",
    packageSize: "15 أمتار",
    location: "الرياض - حي الشفاء",
    duration: "شهر",
    notes: "مصنع صغير يحتاج إلى باقة التنظيف دائمة",
    appointmentType: "immediate",
    scheduledAt: null,
    status: "completed",
    adminNotes: "عميل منتظم - تم تجديد العقد",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(28),
  },
];

const insertedRequests = serviceRequests.map((r) =>
  db.insert(serviceRequestsTable).values(r as any).returning().get()
);

console.log(`✅ Inserted ${insertedRequests.length} service requests`);

// ── Conversations & Messages ─────────────────────────────────────────────────

const conversations = [
  {
    clientName: "أحمد محمد العتيبي",
    phone: "0501234567",
    email: "ahmed@example.com",
    subject: "استفسار عن أسعار الباقات التنظيف",
    status: "closed",
    lastMessage: "شكراً جزيلاً على سرعة الرد",
    unreadCount: 0,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(9),
  },
  {
    clientName: "سارة عبدالله الزهراني",
    phone: "0557891234",
    email: "sara@example.com",
    subject: "استفسار عن موعد التوصيل",
    status: "open",
    lastMessage: "متى يمكن إرسال الباقة التنظيف؟",
    unreadCount: 2,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(0),
  },
  {
    clientName: "محمد علي الغامدي",
    phone: "0534567890",
    email: null,
    subject: "شكوى تأخير في الخدمة",
    status: "open",
    lastMessage: "الباقة التنظيف لم تصل في الموعد المحدد",
    unreadCount: 1,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
  },
  {
    clientName: "نورة خالد القحطاني",
    phone: "0566789012",
    email: "noura@example.com",
    subject: "طلب عرض أسعار لمشروع كبير",
    status: "open",
    lastMessage: "هل يوجد خصم للكميات الكبيرة؟",
    unreadCount: 3,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(0),
  },
  {
    clientName: "طارق إبراهيم المطيري",
    phone: "0556789012",
    email: "tarek@example.com",
    subject: "شكراً على الخدمة الممتازة",
    status: "closed",
    lastMessage: "سأتواصل معكم في مشاريعي القادمة",
    unreadCount: 0,
    createdAt: daysAgo(18),
    updatedAt: daysAgo(17),
  },
];

for (const conv of conversations) {
  const inserted = db.insert(conversationsTable).values(conv as any).returning().get();

  // Add messages per conversation
  if (inserted.clientName === "أحمد محمد العتيبي") {
    const msgs = [
      { conversationId: inserted.id, content: "السلام عليكم، أريد الاستفسار عن أسعار الباقات التنظيف", senderType: "client", isRead: "true", createdAt: daysAgo(10) },
      { conversationId: inserted.id, content: "وعليكم السلام، أهلاً بك. ما حجم الباقة التنظيف الذي تحتاجه؟", senderType: "admin", isRead: "true", createdAt: daysAgo(10) },
      { conversationId: inserted.id, content: "أحتاج باقة التنظيف 10 متر لأسبوع واحد", senderType: "client", isRead: "true", createdAt: daysAgo(10) },
      { conversationId: inserted.id, content: "سعر باقة التنظيف 10 متر لأسبوع هو 800 ريال شاملاً التوصيل والرفع", senderType: "admin", isRead: "true", createdAt: daysAgo(9) },
      { conversationId: inserted.id, content: "شكراً جزيلاً على سرعة الرد", senderType: "client", isRead: "true", createdAt: daysAgo(9) },
    ];
    for (const m of msgs) db.insert(messagesTable).values(m as any).run();
  }

  if (inserted.clientName === "سارة عبدالله الزهراني") {
    const msgs = [
      { conversationId: inserted.id, content: "أحتاج الباقة التنظيف للموقع في حي العليا خلال يومين", senderType: "client", isRead: "true", createdAt: daysAgo(2) },
      { conversationId: inserted.id, content: "تم استلام طلبكم، سنقوم بالتواصل معكم لتحديد الموعد", senderType: "admin", isRead: "true", createdAt: daysAgo(2) },
      { conversationId: inserted.id, content: "متى يمكن إرسال الباقة التنظيف؟", senderType: "client", isRead: "false", createdAt: daysAgo(0) },
      { conversationId: inserted.id, content: "هل هناك تحديث على موعد التوصيل؟", senderType: "client", isRead: "false", createdAt: daysAgo(0) },
    ];
    for (const m of msgs) db.insert(messagesTable).values(m as any).run();
  }

  if (inserted.clientName === "محمد علي الغامدي") {
    const msgs = [
      { conversationId: inserted.id, content: "الباقة التنظيف لم تصل في الموعد المحدد وهذا تأخير غير مقبول", senderType: "client", isRead: "true", createdAt: daysAgo(3) },
      { conversationId: inserted.id, content: "نعتذر عن التأخير، سنتواصل مع فريق التوصيل فوراً", senderType: "admin", isRead: "true", createdAt: daysAgo(3) },
      { conversationId: inserted.id, content: "الباقة التنظيف لم تصل في الموعد المحدد", senderType: "client", isRead: "false", createdAt: daysAgo(1) },
    ];
    for (const m of msgs) db.insert(messagesTable).values(m as any).run();
  }

  if (inserted.clientName === "نورة خالد القحطاني") {
    const msgs = [
      { conversationId: inserted.id, content: "مرحباً، عندي مشروع هدم كبير يحتاج إلى عدة باقات التنظيف", senderType: "client", isRead: "true", createdAt: daysAgo(1) },
      { conversationId: inserted.id, content: "أهلاً وسهلاً، يسعدنا خدمتكم. كم عدد الباقات التنظيف المطلوبة؟", senderType: "admin", isRead: "true", createdAt: daysAgo(1) },
      { conversationId: inserted.id, content: "حوالي 5 باقات التنظيف بحجم 20 متر لمدة شهر", senderType: "client", isRead: "false", createdAt: daysAgo(0) },
      { conversationId: inserted.id, content: "هل يوجد خصم للكميات الكبيرة؟", senderType: "client", isRead: "false", createdAt: daysAgo(0) },
      { conversationId: inserted.id, content: "وما هي مواعيد توفر الباقات التنظيف؟", senderType: "client", isRead: "false", createdAt: daysAgo(0) },
    ];
    for (const m of msgs) db.insert(messagesTable).values(m as any).run();
  }

  if (inserted.clientName === "طارق إبراهيم المطيري") {
    const msgs = [
      { conversationId: inserted.id, content: "أريد الشكر على الخدمة الممتازة والتوصيل في الوقت المحدد", senderType: "client", isRead: "true", createdAt: daysAgo(18) },
      { conversationId: inserted.id, content: "شكراً لكلماتكم الطيبة، سعداء بخدمتكم دائماً", senderType: "admin", isRead: "true", createdAt: daysAgo(17) },
      { conversationId: inserted.id, content: "سأتواصل معكم في مشاريعي القادمة", senderType: "client", isRead: "true", createdAt: daysAgo(17) },
    ];
    for (const m of msgs) db.insert(messagesTable).values(m as any).run();
  }
}

console.log(`✅ Inserted ${conversations.length} conversations with messages`);

// ── Notifications ────────────────────────────────────────────────────────────

const notifications = [
  {
    title: "طلب خدمة جديد",
    message: "هند عبدالرحمن العسيري طلبت عرض سعر لباقة التنظيف 5 متر",
    type: "service_request",
    isRead: false,
    refId: insertedRequests.find(r => r.clientName === "هند عبدالرحمن العسيري")?.id ?? null,
    refType: "service_request",
    createdAt: daysAgo(0),
  },
  {
    title: "طلب خدمة جديد",
    message: "ريم سعد الحربي طلبت تأجير باقة التنظيف 20 متر في حي الربوة",
    type: "service_request",
    isRead: false,
    refId: insertedRequests.find(r => r.clientName === "ريم سعد الحربي")?.id ?? null,
    refType: "service_request",
    createdAt: daysAgo(1),
  },
  {
    title: "رسالة جديدة",
    message: "نورة خالد القحطاني أرسلت 3 رسائل جديدة",
    type: "message",
    isRead: false,
    refId: null,
    refType: "conversation",
    createdAt: daysAgo(0),
  },
  {
    title: "رسالة جديدة",
    message: "سارة عبدالله الزهراني تسأل عن موعد التوصيل",
    type: "message",
    isRead: false,
    refId: null,
    refType: "conversation",
    createdAt: daysAgo(0),
  },
  {
    title: "تم إتمام الطلب",
    message: "تم إتمام طلب خدمة عبدالعزيز نواف الرشيدي بنجاح",
    type: "service_request",
    isRead: true,
    refId: insertedRequests.find(r => r.clientName === "عبدالعزيز نواف الرشيدي")?.id ?? null,
    refType: "service_request",
    createdAt: daysAgo(28),
  },
  {
    title: "طلب خدمة جديد",
    message: "نورة خالد القحطاني طلبت نقل أنقاض لمشروع هدم",
    type: "service_request",
    isRead: true,
    refId: insertedRequests.find(r => r.clientName === "نورة خالد القحطاني")?.id ?? null,
    refType: "service_request",
    createdAt: daysAgo(2),
  },
];

for (const n of notifications) {
  db.insert(notificationsTable).values(n as any).run();
}

console.log(`✅ Inserted ${notifications.length} notifications`);
console.log("🎉 Demo seed complete!");
