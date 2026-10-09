import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { s } from '../styles';
import { BLUE, DARK, GRAY, GOLD, DEEP } from '../theme';
import { CARDLESS_AMOUNTS, CARDLESS_MAX } from '../data';
import { fmt, groupRip } from '../utils';
import SubHeader from '../components/SubHeader';
import SuccessCard from '../components/SuccessCard';
import PrimaryButton from '../components/PrimaryButton';
import ChoiceChips from '../components/ChoiceChips';

const mmss = (sec) =>
  `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

export default function Cardless({ balance, guard, onConfirm, onBack }) {
  const [amount, setAmount] = useState(5000);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null); // { code, amount, expires }
  const [remain, setRemain] = useState(0);
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (!session) return undefined;
    const tick = () => {
      const r = Math.max(0, Math.round((session.expires - Date.now()) / 1000));
      setRemain(r);
      if (r === 0) {
        setSession(null);
        setError('انتهت صلاحية الرمز، أنشئ رمزاً جديداً');
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  const generate = () => {
    if (amount > CARDLESS_MAX) return setError('المبلغ يتجاوز الحد الأقصى');
    if (amount > balance) return setError('الرصيد غير كافٍ');
    const code = String(Math.floor(10000000 + Math.random() * 90000000));
    setSession({ code, amount, expires: Date.now() + 10 * 60 * 1000 });
    setError('');
  };

  // لا يُخصم المبلغ إلا عند "السحب" الفعلي حتى لا يضيع رصيدك إن أُغلق التطبيق
  const simulateWithdraw = () => {
    if (session.amount > balance) return setError('الرصيد غير كافٍ');
    const amt = session.amount;
    guard(
      { title: 'تأكيد السحب', amount: amt, rows: [{ label: 'نوع العملية', value: 'سحب بدون بطاقة' }] },
      () => {
        onConfirm(amt, 'سحب بدون بطاقة');
        setDone(amt);
        setSession(null);
      }
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="سحب بدون بطاقة" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {done ? (
          <SuccessCard
            amount={done}
            title="تمت عملية السحب"
            backLabel="العودة إلى المزيد"
            onBack={onBack}
          />
        ) : session ? (
          <View style={s.formCard}>
            <Text style={s.hint}>رمز السحب لمبلغ {fmt(session.amount)} د.ج</Text>
            <View style={c.codeBox}>
              <Text style={c.code}>{groupRip(session.code)}</Text>
              <Text style={c.timer}>صالح لمدة {mmss(remain)}</Text>
            </View>
            <Text style={c.note}>رمز تجريبي، لا يعمل في أي موزع آلي حقيقي.</Text>
            <PrimaryButton label="محاكاة السحب من الموزع" onPress={simulateWithdraw} />
            <PrimaryButton
              label="إلغاء الرمز"
              onPress={() => setSession(null)}
              style={{ marginTop: 10 }}
            />
            {error ? <Text style={s.error}>{error}</Text> : null}
          </View>
        ) : (
          <View style={s.formCard}>
            <Text style={s.hint}>الرصيد المتاح: {fmt(balance)} د.ج</Text>
            <Text style={s.fieldLabel}>مبلغ السحب</Text>
            <ChoiceChips
              options={CARDLESS_AMOUNTS.map((a) => ({ key: a, label: `${fmt(a).replace('.00', '')} د.ج` }))}
              value={amount}
              onChange={setAmount}
            />
            <Text style={c.note}>الحد الأقصى التجريبي: {fmt(CARDLESS_MAX).replace('.00', '')} د.ج</Text>
            {error ? <Text style={s.error}>{error}</Text> : null}
            <PrimaryButton label="إنشاء رمز السحب" onPress={generate} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const c = StyleSheet.create({
  codeBox: {
    marginTop: 16,
    padding: 20,
    borderRadius: 14,
    backgroundColor: DEEP,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: GOLD,
  },
  code: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: 4 },
  timer: { color: GOLD, fontSize: 14, fontWeight: '600', marginTop: 8 },
  note: { color: GRAY, fontSize: 12, textAlign: 'right', marginTop: 12 },
});
