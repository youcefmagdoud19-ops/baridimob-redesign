import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { s } from '../styles';
import { BLUE, DEEP, GOLD, DARK, GRAY, RED, GREEN } from '../theme';
import SubHeader from '../components/SubHeader';
import PinModal from '../components/PinModal';

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

export default function Settings({
  userName,
  onSaveName,
  pinEnabled,
  onPinChange,
  onReset,
  onBack,
}) {
  const [name, setName] = useState(userName);
  const [saved, setSaved] = useState(false);
  const [pinMode, setPinMode] = useState(null);

  const saveName = () => {
    const clean = name.trim();
    if (!clean) return;
    onSaveName(clean);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const confirmReset = () => {
    Alert.alert(
      'إعادة ضبط البيانات',
      'سيعود الرصيد والعمليات والاسم إلى القيم التجريبية الأصلية.',
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
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
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
              <Row
                icon="lock-closed-outline"
                label="تغيير رمز PIN"
                status="مفعّل"
                onPress={() => setPinMode('change')}
              />
              <Row
                icon="lock-open-outline"
                label="إيقاف رمز PIN"
                onPress={() => setPinMode('disable')}
              />
            </>
          ) : (
            <Row
              icon="lock-closed-outline"
              label="تفعيل رمز PIN عند فتح التطبيق"
              status="غير مفعّل"
              onPress={() => setPinMode('create')}
            />
          )}
        </View>

        {/* البيانات */}
        <View style={s.formCard}>
          <Text style={l.sectionTitle}>البيانات التجريبية</Text>
          <Row
            icon="refresh-outline"
            label="إعادة ضبط الرصيد والعمليات"
            color={RED}
            onPress={confirmReset}
          />
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
});
