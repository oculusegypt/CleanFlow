import {
  Box, Truck, FileText, Sparkles, Layers, ShieldCheck, Wrench, Factory,
  Building2, Home, Droplets, Wind, Bug, Gem, Waves, Briefcase, HardHat,
  ClipboardCheck, Flame,
} from "lucide-react"

export const SERVICE_TYPES = [
  {
    id: "تنظيف الشقق السكنية", label: "تنظيف الشقق السكنية", icon: Building2,
    desc: "تنظيف عميق وتطهير شامل للشقق بجميع المساحات",
    color: "from-blue-500/20 to-blue-600/10 border-blue-200 text-blue-700"
  },
  {
    id: "تنظيف الفلل والقصور", label: "تنظيف الفلل والقصور", icon: Home,
    desc: "تنظيف شامل للأدوار والأحواش والدرج والواجهات الزجاجية",
    color: "from-emerald-500/20 to-emerald-600/10 border-emerald-200 text-emerald-700"
  },
  {
    id: "غسيل المجالس والكنب بالبخار", label: "غسيل المجالس والكنب بالبخار", icon: Sparkles,
    desc: "بخار حراري وتعقيم وتجفيف سريع للمجالس والكنب والسجاد",
    color: "from-purple-500/20 to-purple-600/10 border-purple-200 text-purple-700"
  },
  {
    id: "تنظيف وغسيل المكيفات", label: "تنظيف وغسيل المكيفات", icon: Wind,
    desc: "غسيل مكيفات السبلت والمخفي والمركزية بالضغط العالي",
    color: "from-cyan-500/20 to-cyan-600/10 border-cyan-200 text-cyan-700"
  },
  {
    id: "مكافحة وإبادة الحشرات", label: "مكافحة وإبادة الحشرات والرش", icon: Bug,
    desc: "إبادة شاملة للصراصير والبق والقوارض بضمان سنة",
    color: "from-rose-500/20 to-rose-600/10 border-rose-200 text-rose-700"
  },
  {
    id: "تنظيف وتطهير خزانات المياه", label: "تنظيف وتطهير خزانات المياه", icon: Droplets,
    desc: "غسيل وتطهير الخزانات الأرضية والعلوية وإزالة الرواسب",
    color: "from-teal-500/20 to-teal-600/10 border-teal-200 text-teal-700"
  },
  {
    id: "تنظيف وتعقيم المسابح", label: "تنظيف وتعقيم المسابح", icon: Waves,
    desc: "شفط الرواسب وغسيل الجدران وضبط التوازن الكيميائي",
    color: "from-sky-500/20 to-sky-600/10 border-sky-200 text-sky-700"
  },
  {
    id: "جلي وتلميع الرخام والبلاط", label: "جلي وتلميع الرخام والبلاط", icon: Gem,
    desc: "جلي بالألماس وتلميع بالكريستال الإيطالي",
    color: "from-yellow-500/20 to-yellow-600/10 border-yellow-200 text-yellow-700"
  },
  {
    id: "تنظيف بعد البناء والتشطيب", label: "تنظيف بعد البناء والتشطيب", icon: HardHat,
    desc: "إزالة بقايا الإسمنت والدهانات والترويبة وتسليم العقار جاهزاً",
    color: "from-orange-500/20 to-orange-600/10 border-orange-200 text-orange-700"
  },
  {
    id: "تنظيف واجهات المباني والشركات", label: "تنظيف واجهات المباني والشركات", icon: Briefcase,
    desc: "غسيل الواجهات الزجاجية والكلادينج وعقود نظافة دورية",
    color: "from-indigo-500/20 to-indigo-600/10 border-indigo-200 text-indigo-700"
  },
  {
    id: "تنظيف المساجد والمدارس", label: "تنظيف المساجد والمدارس والمنشآت", icon: Factory,
    desc: "غسيل الموكيت والتطهير الصحي للمرافق التعليمية والمنشآت",
    color: "from-emerald-600/20 to-emerald-700/10 border-emerald-300 text-emerald-800"
  },
  {
    id: "إصدار شهادة سلامة للمنشآت", label: "خدمات السلامة والدفاع المدني", icon: ShieldCheck,
    desc: "معاينة وتجهيز ملف السلامة ومتابعة الملاحظات الفنية",
    color: "from-red-500/20 to-red-600/10 border-red-200 text-red-700"
  },
]

export const DEBRIS_CONTAINERS = [
  { id: "باقة التنظيف صغيرة 12 ياردة", name: "باقة التنظيف صغيرة (12 ياردة)", size: "12 ياردة", capacity: "10 م³", priceText: "400 ريال / للرد", icon: Box, best: "المشاريع الصغيرة والترميم", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "باقة التنظيف متوسطة 15 ياردة", name: "باقة التنظيف متوسطة (15 ياردة)", size: "15 ياردة", capacity: "12 م³", priceText: "450 ريال / للرد", icon: Box, best: "مشاريع الترميم والتوسعة", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "باقة التنظيف كبيرة 20 ياردة", name: "باقة التنظيف كبيرة (20 ياردة)", size: "20 ياردة", capacity: "16 م³", priceText: "500 ريال / للرد", icon: Box, best: "المشاريع الإنشائية والهدم", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "باقة التنظيف جامبو 30 ياردة", name: "باقة التنظيف جامبو (30 ياردة)", size: "30 ياردة", capacity: "22 م³", priceText: "700 ريال / للرد", icon: Box, best: "المشاريع الكبرى والهدم الشامل", color: "bg-amber-50 text-amber-700 border-amber-200" },
]

export const WASTE_CONTAINERS = [
  { id: "باقة التنظيف نفايات صغيرة 6 ياردة", name: "باقة التنظيف نفايات صغيرة (6 ياردة)", size: "6 ياردة", capacity: "6 م³", priceText: "عقد سنوي / حسب الموقع", icon: Truck, best: "المحلات والمطاعم الصغيرة", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "باقة التنظيف نفايات متوسطة 10 ياردة", name: "باقة التنظيف نفايات متوسطة (10 ياردة)", size: "10 ياردة", capacity: "8 م³", priceText: "عقد سنوي / حسب الموقع", icon: Truck, best: "المستودعات والمراكز التجارية", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "مكبس نفايات كهربائي 2 ياردة", name: "مكبس نفايات كهربائي (2 ياردة)", size: "2 ياردة", capacity: "4 م³", priceText: "عقد سنوي / حسب الموقع", icon: Layers, best: "المجمعات والفنادق والمطاعم", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
]
