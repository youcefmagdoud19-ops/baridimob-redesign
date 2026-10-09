import { View, Text, TouchableOpacity, Modal, Share, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s } from '../styles';
import { BLUE, DARK, GRAY, RED, GREEN } from '../theme';
import { fmt } from '../utils';
import PrimaryButton from './PrimaryButton';

function Line({ label, value }) {
  return (
    <View style={d.line}>
      <Text style={d.value}>{value}</Text>
      <Text style={d.label}>{label}</Text>
    </View>
  );
}

export default function TxDetailModal({ tx, onClose }) {
  if (!tx) return null;
  const out = tx.amount < 0;
  const ref = String(tx.id).slice(-8);

  const share = () =>
    Share.share({
      message:
        `وصل عملية (تجريبي)\n${tx.name}\n` +
        `المبلغ: ${fmt(Math.abs(tx.amount))} د.ج\n` +
        `التاريخ: ${tx.date}\nالمرجع: ${ref}`,
    }).catch(() => {});

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.qrCard}>
          <View style={[d.icon, { backgroundColor: out ? '#FEE2E2' : '#DCFCE7' }]}>
            <Ionicons name={out ? 'arrow-up' : 'arrow-down'} size={26} color={out ? RED : GREEN} />
          </View>
          <Text style={[d.amount, { color: out ? RED : GREEN }]}>
            {out ? '-' : '+'}
            {fmt(Math.abs(tx.amount))} د.ج
          </Text>
          <Text style={d.name}>{tx.name}</Text>

          <View style={{ alignSelf: 'stretch', marginTop: 12 }}>
            <Line label="التاريخ" value={tx.date} />
            <Line label="المرجع" value={ref} />
            <Line label="الحالة" value="مكتملة" />
          </View>
          <Text style={d.demo}>عملية تجريبية</Text>

          <PrimaryButton label="مشاركة الوصل" onPress={share} style={{ alignSelf: 'stretch' }} />
          <TouchableOpacity onPress={onClose} style={{ marginTop: 10, padding: 8 }}>
            <Text style={[s.link, { color: BLUE }]}>إغلاق</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const d = StyleSheet.create({
  icon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  amount: { fontSize: 28, fontWeight: '800', marginTop: 10 },
  name: { color: DARK, fontSize: 16, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  line: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  label: { color: GRAY, fontSize: 14 },
  value: { color: DARK, fontSize: 14, fontWeight: '600' },
  demo: { color: GRAY, fontSize: 11, marginTop: 8 },
});
