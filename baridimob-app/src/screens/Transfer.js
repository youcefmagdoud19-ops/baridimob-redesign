import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { s } from '../styles';
import { BLUE, DEEP, GOLD } from '../theme';
import { fmt, groupRip } from '../utils';
import SubHeader from '../components/SubHeader';
import SuccessCard from '../components/SuccessCard';
import ScannerModal from '../components/ScannerModal';

export default function Transfer({ balance, onConfirm, onBack }) {
  const [rip, setRip] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanned, setScanned] = useState(false);

  const onScan = (p) => {
    setRip(groupRip(p.rip));
    if (p.amount) setAmount(String(p.amount));
    setScanned(true);
    setError('');
    setScanOpen(false);
  };

  const submit = () => {
    const clean = rip.replace(/\s/g, '');
    const value = parseFloat(amount.replace(',', '.'));
    if (!/^\d{20}$/.test(clean)) return setError('رقم الحساب (RIP) يجب أن يتكون من 20 رقماً');
    if (!value || value <= 0) return setError('أدخل مبلغاً صحيحاً');
    if (value > balance) return setError('الرصيد غير كافٍ');
    setError('');
    onConfirm(value, note.trim() || 'تحويل');
    setDone(value);
  };

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="تحويل أموال" onBack={onBack} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {done ? (
          <SuccessCard amount={done} title="تمت العملية بنجاح" onBack={onBack} />
        ) : (
          <View style={s.formCard}>
            <Text style={s.hint}>الرصيد المتاح: {fmt(balance)} د.ج</Text>

            <Text style={s.fieldLabel}>رقم حساب المستلم (RIP)</Text>
            <View style={s.ripRow}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                value={rip}
                onChangeText={(v) => {
                  setRip(v);
                  setScanned(false);
                }}
                keyboardType="number-pad"
                maxLength={24}
                placeholder="20 رقماً أو امسح الرمز"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity onPress={() => setScanOpen(true)}>
                <LinearGradient colors={[BLUE, DEEP]} style={s.scanBtn}>
                  <Ionicons name="scan" size={24} color={GOLD} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            {scanned ? <Text style={s.scanOk}>✓ تمت قراءة رقم الحساب من الرمز</Text> : null}

            <Text style={s.fieldLabel}>المبلغ (د.ج)</Text>
            <TextInput
              style={s.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
            />

            <Text style={s.fieldLabel}>ملاحظة (اختياري)</Text>
            <TextInput
              style={s.input}
              value={note}
              onChangeText={setNote}
              placeholder="مثال: إيجار"
              placeholderTextColor="#94A3B8"
            />

            {error ? <Text style={s.error}>{error}</Text> : null}

            <TouchableOpacity onPress={submit} style={{ marginTop: 16 }}>
              <LinearGradient colors={[BLUE, DEEP]} style={s.btn}>
                <Text style={s.btnText}>تأكيد التحويل</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <ScannerModal
        visible={scanOpen}
        onClose={() => setScanOpen(false)}
        onResult={onScan}
      />
    </View>
  );
}
