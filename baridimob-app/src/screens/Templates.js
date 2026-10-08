import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s } from '../styles';
import { BLUE, DARK, GRAY, RED } from '../theme';
import { fmt, groupRip } from '../utils';
import SubHeader from '../components/SubHeader';
import PrimaryButton from '../components/PrimaryButton';

export default function Templates({ templates, onAdd, onDelete, onUse, onBack }) {
  const [name, setName] = useState('');
  const [rip, setRip] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const add = () => {
    const clean = rip.replace(/\s/g, '');
    if (!name.trim()) return setError('أدخل اسماً للنموذج');
    if (!/^\d{20}$/.test(clean)) return setError('رقم الحساب (RIP) يجب أن يتكون من 20 رقماً');
    const v = amount ? parseFloat(amount.replace(',', '.')) : null;
    if (amount && (!v || v <= 0)) return setError('المبلغ غير صحيح');
    onAdd({ id: Date.now(), name: name.trim(), rip: clean, amount: v });
    setName('');
    setRip('');
    setAmount('');
    setError('');
  };

  const confirmDelete = (t) =>
    Alert.alert('حذف النموذج', `هل تريد حذف "${t.name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => onDelete(t.id) },
    ]);

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="نماذج العمليات" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <View style={s.formCard}>
          <Text style={[s.fieldLabel, { marginTop: 0 }]}>اسم النموذج</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="مثال: إيجار الشقة"
            placeholderTextColor="#94A3B8"
            maxLength={30}
          />
          <Text style={s.fieldLabel}>رقم الحساب (RIP)</Text>
          <TextInput
            style={s.input}
            value={rip}
            onChangeText={setRip}
            keyboardType="number-pad"
            maxLength={24}
            placeholder="20 رقماً"
            placeholderTextColor="#94A3B8"
          />
          <Text style={s.fieldLabel}>المبلغ (اختياري)</Text>
          <TextInput
            style={s.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#94A3B8"
          />
          {error ? <Text style={s.error}>{error}</Text> : null}
          <PrimaryButton label="حفظ النموذج" onPress={add} />
        </View>

        <Text style={t.section}>النماذج المحفوظة</Text>
        {templates.length === 0 ? (
          <Text style={s.empty}>لا توجد نماذج بعد</Text>
        ) : (
          templates.map((x) => (
            <View key={x.id} style={t.item}>
              <TouchableOpacity onPress={() => confirmDelete(x)} style={t.iconBtn}>
                <Ionicons name="trash-outline" size={18} color={RED} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onUse(x)} style={t.iconBtn}>
                <Ionicons name="swap-horizontal" size={18} color={BLUE} />
              </TouchableOpacity>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={t.name}>{x.name}</Text>
                <Text style={t.sub}>{groupRip(x.rip)}</Text>
                {x.amount ? <Text style={t.amount}>{fmt(x.amount)} د.ج</Text> : null}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const t = StyleSheet.create({
  section: { color: DARK, fontSize: 17, fontWeight: '700', textAlign: 'right', paddingHorizontal: 16, marginTop: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E6EEFA', alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  name: { color: DARK, fontSize: 15, fontWeight: '600', textAlign: 'right' },
  sub: { color: GRAY, fontSize: 12, textAlign: 'right', marginTop: 2 },
  amount: { color: BLUE, fontSize: 13, fontWeight: '700', textAlign: 'right', marginTop: 2 },
});
