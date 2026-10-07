export const USER_NAME = 'يوسف';
export const RIP = '00799999000123456789';
export const RIP_FORMATTED = '0079 9999 0001 2345 6789';
export const INITIAL_BALANCE = 125000;

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
  { icon: 'card-outline', label: 'البطاقات' },
  { icon: 'settings-outline', label: 'الإعدادات', screen: 'settings' },
];
