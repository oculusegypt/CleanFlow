import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('data/sabaik.db');
const db = new Database(dbPath);

const drivers = db.prepare("SELECT id, name FROM admins WHERE role = 'driver' LIMIT 5").all();
const driverId1 = drivers[0] ? drivers[0].id : null;
const driverId2 = drivers[1] ? drivers[1].id : driverId1;

const sampleRequests = [
  {
    client_name: 'سلطان فهد القحطاني',
    phone: '0501234567',
    email: 'sultan.qa@gmail.com',
    service_type: 'تنظيف منازل وفلل',
    package_size: 'باقة تنظيف الفلل الدوبلكس الشاملة',
    property_type: 'villa',
    area_size: '450 م²',
    location: 'حي النرجس، شمال الرياض، شارع أنس بن مالك',
    duration: 'يومي',
    notes: 'تنظيف كامل للأدوار مع جلي وتلميع أرضيات الرخام وغسيل الحوش الخارجي',
    appointment_type: 'immediate',
    scheduled_at: null,
    status: 'pending',
    admin_notes: 'العميل يفضل البدء صباحاً',
    assigned_driver_id: null,
    driver_status: 'unassigned',
    acquisition_source: 'بحث Google المجاني',
    attribution_referrer: 'https://www.google.com/',
  },
  {
    client_name: 'د. خالد عبد الرحمن المطيري',
    phone: '0559876543',
    email: 'dr.khaled@outlook.com',
    service_type: 'مكافحة وإبادة الحشرات',
    package_size: 'باقة إبادة النمل الأبيض ورش المبيدات بضمان سنة',
    property_type: 'villa',
    area_size: '600 م²',
    location: 'حي الملقا، الرياض، طريق الملك سلمان',
    duration: 'عقد سنوي',
    notes: 'رش وقائي شامل للأساسات والحديقة مع ضمان 12 شهر ورشات مجانية دورية',
    appointment_type: 'scheduled',
    scheduled_at: '2026-08-20T10:00:00',
    status: 'in_progress',
    admin_notes: 'تم تكليف المشرف لتجهيز المعدات',
    assigned_driver_id: driverId1,
    driver_status: 'started',
    driver_started_at: new Date().toISOString(),
    assigned_at: new Date(Date.now() - 3600000).toISOString(),
    acquisition_source: 'إعلانات Google المأجورة',
    attribution_referrer: 'https://www.google.com/',
  },
  {
    client_name: 'شركة ريادة الأعمال للتقنية',
    phone: '0543219876',
    email: 'contact@reyada-tech.sa',
    service_type: 'تنظيف واجهات ومكاتب',
    package_size: 'باقة تنظيف المقرات والواجهات الزجاجية',
    property_type: 'office',
    area_size: '1200 م²',
    location: 'حي العليا، طريق الملك فهد، برج الفيصلية',
    duration: 'شهري',
    notes: 'غسيل واجهات كلادينج وزجاج بالرافعات وتنظيف مكاتب 3 أدوار',
    appointment_type: 'scheduled',
    scheduled_at: '2026-08-22T08:30:00',
    status: 'pending',
    admin_notes: 'يحتاج تصريح دخول المبنى من إدارة البرج',
    assigned_driver_id: driverId2,
    driver_status: 'assigned',
    assigned_at: new Date().toISOString(),
    acquisition_source: 'مباشر',
    attribution_referrer: '',
  },
  {
    client_name: 'أحمد بن عبد الله السبيعي',
    phone: '0567891234',
    email: 'ahmed.subaie@hotmail.com',
    service_type: 'غسيل مجالس وكنب بالبخار',
    package_size: 'باقة غسيل المجالس والفرش بالبخار الحراري 140°',
    property_type: 'apartment',
    area_size: 'طقمين مجالس + 3 سجادات',
    location: 'حي اليرموك، شرق الرياض، شارع الصحابة',
    duration: 'يومي',
    notes: 'غسيل وتطهير مجلس رجال ومجلس نساء وإزالة البقع مع التعطير الفندقي',
    appointment_type: 'immediate',
    scheduled_at: null,
    status: 'completed',
    admin_notes: 'تم التنفيذ بنجاح ورضا العميل 100%',
    assigned_driver_id: driverId1,
    driver_status: 'completed',
    driver_started_at: new Date(Date.now() - 86400000).toISOString(),
    assigned_at: new Date(Date.now() - 90000000).toISOString(),
    acquisition_source: 'بحث Google المجاني',
    attribution_referrer: 'https://www.google.com/',
  },
  {
    client_name: 'سارة محمد الدوسري',
    phone: '0531122334',
    email: 'sara.aldosari@gmail.com',
    service_type: 'تنظيف بعد التشطيب والترميم',
    package_size: 'باقة إزالة دهانات وتلميع سيراميك بعد البناء',
    property_type: 'apartment',
    area_size: '220 م²',
    location: 'حي الياسمين، شمال الرياض',
    duration: 'يومي',
    notes: 'إزالة آثار الدهانات والإسمنت وتلميع النوافذ ودورات المياه',
    appointment_type: 'immediate',
    scheduled_at: null,
    status: 'cancelled',
    admin_notes: 'طلب العميل التأجيل لعدم انتهاء أعمال الدهان',
    assigned_driver_id: null,
    driver_status: 'unassigned',
    acquisition_source: 'مباشر',
    attribution_referrer: '',
  },
  {
    client_name: 'فهد عبد العزيز الشمري',
    phone: '0598877665',
    email: 'fahad.shammari@yahoo.com',
    service_type: 'تطهير خزانات المياه',
    package_size: 'باقة غسيل وتعقيم الخزان الأرضي والعلوي بالعزل',
    property_type: 'villa',
    area_size: 'خزان أرضي 30م³ + علوي',
    location: 'حي حطين، شمال الرياض',
    duration: 'يومي',
    notes: 'شفط الرواسب والتعقيم بمواد معتمدة من هيئة الغذاء والدواء مع تقرير فحص',
    appointment_type: 'scheduled',
    scheduled_at: '2026-08-25T16:00:00',
    status: 'in_progress',
    admin_notes: 'تم التنسيق مع العميل لفصل مضخة المياه قبل الموعد',
    assigned_driver_id: driverId2,
    driver_status: 'accepted',
    assigned_at: new Date(Date.now() - 1800000).toISOString(),
    acquisition_source: 'بحث Google المجاني',
    attribution_referrer: 'https://www.google.com/',
  }
];

const insert = db.prepare(`
  INSERT INTO service_requests (
    client_name, phone, email, service_type, package_size, property_type, area_size,
    location, duration, notes, appointment_type, scheduled_at, status, admin_notes,
    assigned_driver_id, driver_status, driver_started_at, assigned_at,
    acquisition_source, attribution_referrer, session_id, created_at, updated_at
  ) VALUES (
    @client_name, @phone, @email, @service_type, @package_size, @property_type, @area_size,
    @location, @duration, @notes, @appointment_type, @scheduled_at, @status, @admin_notes,
    @assigned_driver_id, @driver_status, @driver_started_at, @assigned_at,
    @acquisition_source, @attribution_referrer, 'sample-session', datetime('now'), datetime('now')
  )
`);

for (const req of sampleRequests) {
  insert.run({
    ...req,
    driver_started_at: req.driver_started_at || null,
    assigned_at: req.assigned_at || null
  });
}

console.log('✅ تم إدخال 6 طلبات نموذجية شاملة لكافة الحالات بنجاح!');
