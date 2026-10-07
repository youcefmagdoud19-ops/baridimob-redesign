export const fmt = (n) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const groupRip = (digits) => digits.replace(/(\d{4})(?=\d)/g, '$1 ');

/*
  صيغ الرمز المدعومة:
  1) 20 رقماً فقط (رقم RIP)
  2) BARIDI|RIP|المبلغ|اسم التاجر
     مثال: BARIDI|00799999000987654321|2500|مخبزة الأمل
*/
export const parsePayload = (data) => {
  const text = String(data).trim();
  if (text.startsWith('BARIDI|')) {
    const [, rip, amount, name] = text.split('|');
    const clean = (rip || '').replace(/\s/g, '');
    if (!/^\d{20}$/.test(clean)) return null;
    const v = parseFloat(amount);
    return { rip: clean, amount: v > 0 ? v : null, name: (name || '').trim() };
  }
  const m = text.replace(/\s/g, '').match(/\d{20}/);
  return m ? { rip: m[0], amount: null, name: '' } : null;
};
