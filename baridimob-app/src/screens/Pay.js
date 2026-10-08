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

export default function Pay({ balance, cardFrozen, onConfirm, onBack }) {
  const [scanOpen, setScanOpen] = useState(false);
  const [merchant, setMerchant] = useState(null);
  const [amount, setAmount] = useState('');
  const [fixed, setFixed] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const onScan = (p) => {
    setMerchant({ rip: p.rip, name: p.name || 'تاجر' });
    setAmount(p.amount ? String(p.amount) : '');
    setFixed(!!p.amount);
    setError('');
    setScanOpen(false);
  };

  const submit = () => {
    if (cardFrozen) return setError('البطاقة مجمّدة، فعّلها من شاشة البطاقات');
    const value = parseFloat(amount.replace(',', '.'));
    if (!value || value <= 0) return setError('أدخل مبلغاً صحيحاً');
    if (value > balance) return setError('الرصيد غير كافٍ');
    setError('');
    onConfirm(value, `دفع إلى ${merchant.name}`);
    setDone(value);
  };

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="الدفع بالمسح" onBack={onBack} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {done ? (
          <SuccessCard amount={done} title="تم الدفع بنجاح" onBack={onBack} />
        ) : !merchant ? (
          <View style={s.formCard}>
            <View style={s.payIcon}>
              <Ionicons name="qr-code-outline" size={56} color={GOLD} />
            </View>
            <Text style={s.successTitle}>ادفع بمسح رمز التاجر</Text>
            <Text style={s.successText}>
              امسح رمز QR أو الباركود عند التاجر، ثم راجع المبلغ وأكّد الدفع
            </Text>
            <TouchableOpacity onPress={() => setScanOpen(true)} style={{ marginTop: 20 }}>
              <LinearGradient colors={[BLUE, DEEP]} style={s.btn}>
                <Text style={s.btnText}>مسح رمز الدفع</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.formCard}>
            <Text style={s.hint}>الرصيد المتاح: {fmt(balance)} د.ج</Text>

            <View style={s.merchantBox}>
              <View style={s.merchantIcon}>
                <Ionicons name="storefront-outline" size={26} color={GOLD} />
              </View>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={s.merchantName}>{merchant.name}</Text>
                <Text style={s.merchantRip}>{groupRip(merchant.rip)}</Text>
              </View>
            </View>

            <Text style={s.fieldLabel}>
              {fixed ? 'المبلغ المطلوب (د.ج)' : 'المبلغ (د.ج)'}
            </Text>
            <TextInput
              style={[s.input, fixed && { backgroundColor: '#E6EEFA' }]}
              value={amount}
              onChangeText={setAmount}
              editable={!fixed}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
            />

            {error ? <Text style={s.error}>{error}</Text> : null}

            <TouchableOpacity onPress={submit} style={{ marginTop: 16 }}>
              <LinearGradient colors={[BLUE, DEEP]} style={s.btn}>
                <Text style={s.btnText}>تأكيد الدفع</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setScanOpen(true)} style={{ marginTop: 14 }}>
              <Text style={[s.link, { textAlign: 'center' }]}>مسح رمز آخر</Text>
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
