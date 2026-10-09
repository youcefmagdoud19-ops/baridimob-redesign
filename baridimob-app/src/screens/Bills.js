import { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s } from '../styles';
import { BLUE, DARK, GRAY, GOLD } from '../theme';
import { BILL_PROVIDERS } from '../data';
import { fmt } from '../utils';
import SubHeader from '../components/SubHeader';
import SuccessCard from '../components/SuccessCard';
import PrimaryButton from '../components/PrimaryButton';
import ChoiceChips from '../components/ChoiceChips';

export default function Bills({ balance, guard, onConfirm, onBack }) {
  const [provider, setProvider] = useState('sonelgaz');
  const [ref, setRef] = useState('');
  const [bill, setBill] = useState(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const p = BILL_PROVIDERS.find((x) => x.key === provider);

  const changeProvider = (key) => {
    setProvider(key);
    setBill(null);
    setError('');
  };

  // مبلغ تجريبي يُحسب من الرقم المدخل (ليس فاتورة حقيقية)
  const lookup = () => {
    const clean = ref.replace(/\s/g, '');
    if (!/^\d{8,16}$/.test(clean)) return setError('أدخل رقماً من 8 إلى 16 رقماً');
    const sum = clean.split('').reduce((a, d) => a + Number(d), 0);
    const amount = Math.round((800 + ((sum * 137) % 4200)) / 10) * 10;
    setBill({ ref: clean, amount });
    setError('');
  };

  const pay = () => {
    if (bill.amount > balance) return setError('الرصيد غير كافٍ');
    setError('');
    guard(
      {
        title: 'تأكيد دفع الفاتورة',
        amount: bill.amount,
        rows: [
          { label: 'الجهة', value: p.name },
          { label: 'المرجع', value: bill.ref },
        ],
      },
      () => {
        onConfirm(bill.amount, `فاتورة ${p.name}`);
        setDone(bill.amount);
      }
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="دفع الفواتير" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        {done ? (
          <SuccessCard
            amount={done}
            title="تم دفع الفاتورة"
            backLabel="العودة إلى المزيد"
            onBack={onBack}
          />
        ) : (
          <View style={s.formCard}>
            <Text style={s.hint}>الرصيد المتاح: {fmt(balance)} د.ج</Text>

            <Text style={s.fieldLabel}>الجهة</Text>
            <ChoiceChips
              options={BILL_PROVIDERS.map((x) => ({ key: x.key, label: x.name }))}
              value={provider}
              onChange={changeProvider}
            />
            <Text style={b.sub}>{p.sub}</Text>

            <Text style={s.fieldLabel}>{p.refLabel}</Text>
            <TextInput
              style={s.input}
              value={ref}
              onChangeText={(v) => {
                setRef(v);
                setBill(null);
              }}
              keyboardType="number-pad"
              maxLength={16}
              placeholder="أدخل الرقم"
              placeholderTextColor="#94A3B8"
            />

            {!bill ? (
              <PrimaryButton label="استعلام عن الفاتورة" onPress={lookup} />
            ) : (
              <>
                <View style={b.box}>
                  <Ionicons name={p.icon} size={28} color={GOLD} />
                  <Text style={b.boxName}>{p.name}</Text>
                  <Text style={b.boxRef}>{bill.ref}</Text>
                  <Text style={b.amount}>{fmt(bill.amount)} د.ج</Text>
                  <Text style={b.demo}>فاتورة تجريبية بمبلغ وهمي</Text>
                </View>
                <PrimaryButton label="دفع الفاتورة" onPress={pay} />
              </>
            )}

            {error ? <Text style={s.error}>{error}</Text> : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const b = StyleSheet.create({
  sub: { color: GRAY, fontSize: 12, textAlign: 'right', marginTop: 8 },
  box: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#E6EEFA',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.6)',
  },
  boxName: { color: DARK, fontSize: 16, fontWeight: '700', marginTop: 6 },
  boxRef: { color: GRAY, fontSize: 13, marginTop: 2 },
  amount: { color: BLUE, fontSize: 28, fontWeight: '800', marginTop: 8 },
  demo: { color: GRAY, fontSize: 11, marginTop: 4 },
});
