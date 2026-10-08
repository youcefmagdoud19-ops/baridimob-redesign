import { useState } from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import { s } from '../styles';
import { OPERATORS, TOPUP_AMOUNTS } from '../data';
import { fmt } from '../utils';
import SubHeader from '../components/SubHeader';
import SuccessCard from '../components/SuccessCard';
import PrimaryButton from '../components/PrimaryButton';
import ChoiceChips from '../components/ChoiceChips';

export default function TopUp({ balance, onConfirm, onBack }) {
  const [op, setOp] = useState('mobilis');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(500);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const submit = () => {
    const operator = OPERATORS.find((o) => o.key === op);
    const clean = phone.replace(/\s/g, '');
    if (!/^0[567]\d{8}$/.test(clean)) return setError('أدخل رقم هاتف جزائري صحيحاً من 10 أرقام');
    if (!clean.startsWith(operator.prefix))
      return setError(`الرقم لا يطابق المشغّل: أرقام ${operator.name} تبدأ بـ ${operator.prefix}`);
    if (amount > balance) return setError('الرصيد غير كافٍ');
    setError('');
    onConfirm(amount, `شحن ${operator.name} - ${clean}`);
    setDone(amount);
  };

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="شحن الهاتف" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        {done ? (
          <SuccessCard
            amount={done}
            title="تم شحن الرصيد"
            backLabel="العودة إلى المزيد"
            onBack={onBack}
          />
        ) : (
          <View style={s.formCard}>
            <Text style={s.hint}>الرصيد المتاح: {fmt(balance)} د.ج</Text>

            <Text style={s.fieldLabel}>المشغّل</Text>
            <ChoiceChips
              options={OPERATORS.map((o) => ({ key: o.key, label: o.name }))}
              value={op}
              onChange={setOp}
            />

            <Text style={s.fieldLabel}>رقم الهاتف</Text>
            <TextInput
              style={s.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="مثال: 0612345678"
              placeholderTextColor="#94A3B8"
            />

            <Text style={s.fieldLabel}>مبلغ الشحن</Text>
            <ChoiceChips
              options={TOPUP_AMOUNTS.map((a) => ({ key: a, label: `${a} د.ج` }))}
              value={amount}
              onChange={setAmount}
            />

            {error ? <Text style={s.error}>{error}</Text> : null}
            <PrimaryButton label="تأكيد الشحن" onPress={submit} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
