export const USER_NAME = 'يوسف';
export const RIP = '00799999000123456789';
export const RIP_FORMATTED = '0079 9999 0001 2345 6789';
export const INITIAL_BALANCE = 125000;

// بيانات بطاقة وهمية للتجربة فقط
export const CARD_NUMBER = '1234567890124821';
export const CARD_EXPIRY = '10/30';
export const CARD_CVV = '482';
export const CARD_LIMIT = 100000;

// ---- الخدمات (بيانات تجريبية) ----
export const OPERATORS = [
  { key: 'mobilis', name: 'موبيليس', prefix: '06' },
  { key: 'djezzy', name: 'جيزي', prefix: '07' },
  { key: 'ooredoo', name: 'أوريدو', prefix: '05' },
];
export const TOPUP_AMOUNTS = [100, 200, 500, 1000, 2000];

export const BILL_PROVIDERS = [
  { key: 'sonelgaz', name: 'سونلغاز', sub: 'الكهرباء والغاز', icon: 'flash-outline', refLabel: 'رقم مرجع الفاتورة' },
  { key: 'seaal', name: 'سيال', sub: 'المياه (الجزائر وتيبازة)', icon: 'water-outline', refLabel: 'رقم الاشتراك' },
  { key: 'ade', name: 'الجزائرية للمياه', sub: 'ADE', icon: 'water-outline', refLabel: 'رقم الاشتراك' },
  { key: 'at', name: 'اتصالات الجزائر', sub: 'الهاتف الثابت والإنترنت', icon: 'call-outline', refLabel: 'رقم الهاتف أو الاشتراك' },
];

export const CARDLESS_AMOUNTS = [2000, 5000, 10000, 20000, 40000];
export const CARDLESS_MAX = 50000; // حد تجريبي
export const CARD_FEE = 350; // رسوم إصدار البطاقة الكلاسيكية حسب إعلان بريد الجزائر

export const OFFICES = [
  { key: 'o1', name: 'مكتب البريد المركزي' },
  { key: 'o2', name: 'مكتب بريد وسط المدينة' },
  { key: 'o3', name: 'مكتب بريد الحي الجامعي' },
  { key: 'o4', name: 'مكتب بريد المحطة' },
];
export const REQUEST_STATUSES = ['قيد المعالجة', 'قيد التحضير', 'جاهز للاستلام'];

export const initialTx = [
  { id: 1, name: 'تحويل إلى أحمد', date: '2026-10-02', amount: -5000 },
  { id: 2, name: 'راتب شهري', date: '2026-10-01', amount: 45000 },
  { id: 3, name: 'دفع فاتورة الكهرباء', date: '2026-09-28', amount: -3200 },
  { id: 4, name: 'استلام من سمير', date: '2026-09-25', amount: 12000 },
  { id: 5, name: 'دفع فاتورة الماء', date: '2026-09-20', amount: -1800 },
];

export const tabs = [
  { icon: 'home', label: 'الرئيسية', screen: 'home' },
  { icon: 'wallet-outline', label: 'الحسابات', screen: 'statement' },
  { icon: 'swap-horizontal', label: 'تحويل', screen: 'transfer', center: true },
  { icon: 'card-outline', label: 'البطاقات', screen: 'cards' },
  { icon: 'settings-outline', label: 'الإعدادات', screen: 'settings' },
];
