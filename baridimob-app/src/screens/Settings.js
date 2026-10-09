import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { s } from '../styles';
import { BLUE, DEEP, DARK, GRAY, RED } from '../theme';
import { biometricAvailable, authenticate } from '../biometric';
import SubHeader from '../components/SubHeader';
import PinModal from '../components/PinModal';
import ChoiceChips from '../components/ChoiceChips';

const LOCK_OPTIONS = [
  { key: 0, label: 'فوراً' },
  { key: 30, label: '30 ثانية' },
  { key: 60, label: 'دقيقة' },
  { key: 300, label: '5 دقائق' },
];

function Row({ icon, label, status, color, onPress }) {
  return (
    <TouchableOpacity style={l.row} onPress={onPress}>
      <View style={l.rowIcon}>
        <Ionicons name={icon} size={20} color={color || BLUE} />
      </View>
      <Text style={[l.rowText, color && { color }]}>{label}</Text>
      {status ? <Text style={l.status}>{status}</Text> : null}
      <Ionicons name="chevron-back" size={18} color={GRAY} />
    </TouchableOpacity>
  );
}

function SwitchRow({ icon, label, sub, value, onChange, disabled }) {
  return (
    <View style={[l.row, disabled && { opacity: 0.5 }]}>
      <Switch value={value} onValueChange={onChange} disabled={disabled} trackColor={{ false: '#CBD5E1', true: BLUE }} thumbColor="#fff" />
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={l.switchTitle}>{label}</Text>
        {sub ? <Text style={l.switchSub}>{sub}</Text> : null}
      </View>
      <View style={l.rowIcon}>
        <Ionicons name={icon} size={20} color={BLUE} />
      </View>
    </View>
  );
}

export default function Settings({
  userName,
  onSaveName,
  pinEnabled,
  onPinChange,
  autoLockSec,
  onAutoLock,
  biometric,
  onBiometric,
  confirmWithPin,
  onConfirmWithPin,
  privacy,
  onPrivacy,
  onReset,
  onBack,
}) {
  const [name, setName] = useState(userName);
  const [saved, setSaved] = useState(false);
  const [pinMode, setPinMode] = useState(null);
  const [bioOk, setBioOk] = useState(false);

  useEffect(() => {
    biometricAvailable().then(setBioOk);
  }, []);

  const saveName = () => {
    const clean = name.trim();
    if (!clean) return;
    onSaveName(clean);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleBio = async (v) => {
    if (v) {
      const ok = await authenticate('تأكيد تفعيل البصمة');
      if (!ok) return;
    }
    onBiometric(v);
  };

  const confirmReset = () => {
    Alert.alert(
      'إعادة ضبط البيانات',
      'سيعود الرصيد والعمليات والاسم والإشعارات والطلبات والنماذج إلى القيم التجريبية الأصلية.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إعادة ضبط',
          style: 'destructive',
          onPress: () => {
            onReset();
            setName('');
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="الإعدادات" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        {/* الحساب */}
        <View style={s.formCard}>
          <Text style={l.sectionTitle}>الحساب</Text>
          <Text style={s.fieldLabel}>الاسم الظاهر في الواجهة</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="اكتب اسمك"
            placeholderTextColor="#94A3B8"
            maxLength={20}
          />
          <TouchableOpacity onPress={saveName} style={{ marginTop: 14 }}>
            <LinearGradient colors={[BLUE, DEEP]} style={s.btn}>
              <Text style={s.btnText}>{saved ? '✓ تم الحفظ' : 'حفظ الاسم'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* الأمان */}
        <View style={s.formCard}>
          <Text style={l.sectionTitle}>الأمان</Text>
          {pinEnabled ? (
            <>
              <Row icon="lock-closed-outline" label="تغيير رمز PIN" status="مفعّل" onPress={() => setPinMode('change')} />
              <Row icon="lock-open-outline" label="إيقاف رمز PIN" onPress={() => setPinMode('disable')} />

              <Text style={s.fieldLabel}>القفل التلقائي عند مغادرة التطبيق</Text>
              <ChoiceChips options={LOCK_OPTIONS} value={autoLockSec} onChange={onAutoLock} />

              <SwitchRow
                icon="finger-print"
                label="فتح التطبيق بالبصمة"
                sub={bioOk ? 'بديل عن إدخال الرمز' : 'غير متاح أو لا توجد بصمة مسجّلة على الجهاز'}
                value={biometric}
                onChange={toggleBio}
                disabled={!bioOk}
              />

              <SwitchRow
                icon="shield-checkmark-outline"
                label="طلب الرمز لتأكيد العمليات"
                sub="التحويل والدفع والشحن والسحب والفواتير"
                value={confirmWithPin}
                onChange={onConfirmWithPin}
              />
            </>
          ) : (
            <Row icon="lock-closed-outline" label="تفعيل رمز PIN عند فتح التطبيق" status="غير مفعّل" onPress={() => setPinMode('create')} />
          )}

          <SwitchRow
            icon="eye-off-outline"
            label="إخفاء المحتوى ومنع لقطات الشاشة"
            sub="يخفي التطبيق في قائمة التطبيقات الأخيرة"
            value={privacy}
            onChange={onPrivacy}
          />
        </View>

        {/* البيانات */}
        <View style={s.formCard}>
          <Text style={l.sectionTitle}>البيانات التجريبية</Text>
          <Row icon="refresh-outline" label="إعادة ضبط كل البيانات" color={RED} onPress={confirmReset} />
        </View>
      </ScrollView>

      {pinMode && (
        <PinModal
          mode={pinMode}
          onClose={() => setPinMode(null)}
          onDone={(enabled) => {
            onPinChange(enabled);
            setPinMode(null);
          }}
        />
      )}
    </View>
  );
}

const l = StyleSheet.create({
  sectionTitle: { color: DARK, fontSize: 17, fontWeight: '700', textAlign: 'right' },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E6EEFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, marginHorizontal: 12, color: DARK, fontSize: 15, textAlign: 'right' },
  status: { color: GRAY, fontSize: 12, marginHorizontal: 8 },
  switchTitle: { color: DARK, fontSize: 15, fontWeight: '600', textAlign: 'right' },
  switchSub: { color: GRAY, fontSize: 12, textAlign: 'right', marginTop: 2 },
});
