import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { s } from '../styles';
import { BLUE, DEEP, GOLD, DARK, GRAY, GREEN } from '../theme';
import { RIP, RIP_FORMATTED } from '../data';
import SubHeader from '../components/SubHeader';
import PrimaryButton from '../components/PrimaryButton';

export default function Profile({ userName, phone, onSavePhone, go, onBack }) {
  const [value, setValue] = useState(phone || '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const savePhone = () => {
    const clean = value.replace(/\s/g, '');
    if (clean && !/^0[567]\d{8}$/.test(clean)) return setError('أدخل رقماً جزائرياً صحيحاً من 10 أرقام');
    setError('');
    onSavePhone(clean);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copyRip = async () => {
    await Clipboard.setStringAsync(RIP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="الملف الشخصي" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <View style={p.top}>
          <LinearGradient colors={[BLUE, DEEP]} style={p.avatar}>
            <Text style={p.initial}>{userName.trim().charAt(0)}</Text>
          </LinearGradient>
          <Text style={p.name}>{userName}</Text>
          <Text style={p.sub}>الحساب الجاري CCP</Text>
        </View>

        <View style={s.formCard}>
          <Text style={[s.fieldLabel, { marginTop: 0 }]}>رقم الحساب (RIP)</Text>
          <View style={p.ripRow}>
            <TouchableOpacity onPress={copyRip} style={s.copyBtn}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={copied ? GREEN : BLUE} />
              <Text style={[s.copyText, { color: copied ? GREEN : BLUE }]}>{copied ? 'تم النسخ' : 'نسخ'}</Text>
            </TouchableOpacity>
            <Text style={p.rip}>{RIP_FORMATTED}</Text>
          </View>

          <Text style={s.fieldLabel}>رقم الهاتف المرتبط</Text>
          <TextInput
            style={s.input}
            value={value}
            onChangeText={setValue}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="مثال: 0612345678"
            placeholderTextColor="#94A3B8"
          />
          {error ? <Text style={s.error}>{error}</Text> : null}
          <PrimaryButton label={saved ? '✓ تم الحفظ' : 'حفظ الرقم'} onPress={savePhone} />
        </View>

        <View style={s.formCard}>
          <TouchableOpacity style={p.link} onPress={() => go('cards')}>
            <Ionicons name="chevron-back" size={18} color={GRAY} />
            <Text style={p.linkText}>بطاقتي الذهبية</Text>
            <Ionicons name="card-outline" size={20} color={BLUE} />
          </TouchableOpacity>
          <TouchableOpacity style={p.link} onPress={() => go('settings')}>
            <Ionicons name="chevron-back" size={18} color={GRAY} />
            <Text style={p.linkText}>الإعدادات والأمان</Text>
            <Ionicons name="settings-outline" size={20} color={BLUE} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const p = StyleSheet.create({
  top: { alignItems: 'center', marginTop: 20 },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: GOLD },
  initial: { color: '#fff', fontSize: 36, fontWeight: '800' },
  name: { color: DARK, fontSize: 20, fontWeight: '700', marginTop: 10 },
  sub: { color: GRAY, fontSize: 13, marginTop: 2 },
  ripRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rip: { color: DARK, fontSize: 17, fontWeight: '600' },
  link: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 12 },
  linkText: { flex: 1, color: DARK, fontSize: 15, textAlign: 'right', marginHorizontal: 12 },
});
