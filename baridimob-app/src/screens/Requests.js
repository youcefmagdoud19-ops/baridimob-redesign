import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { s } from '../styles';
import { BLUE, DARK, GRAY, GREEN } from '../theme';
import { OFFICES, CARD_FEE, REQUEST_STATUSES } from '../data';
import { fmt } from '../utils';
import SubHeader from '../components/SubHeader';
import PrimaryButton from '../components/PrimaryButton';
import ChoiceChips from '../components/ChoiceChips';

const CONFIG = {
  cheque: {
    title: 'دفتر الشيكات',
    fee: 0,
    kinds: null,
    single: 'طلب دفتر شيكات',
    note: 'تستلم الدفتر من مكتب البريد الذي تختاره.',
  },
  card: {
    title: 'البطاقة الذهبية',
    fee: CARD_FEE,
    kinds: [
      { key: 'new', label: 'طلب بطاقة جديدة' },
      { key: 'renew', label: 'تجديد البطاقة' },
      { key: 'lost', label: 'بطاقة ضائعة أو تالفة' },
    ],
    note: `تُقتطع رسوم ${CARD_FEE} د.ج من حسابك عند الطلب (حسب إعلان بريد الجزائر للبطاقة الكلاسيكية).`,
  },
};

export default function Requests({ type, requests, balance, onSubmit, onAdvance, onBack }) {
  const cfg = CONFIG[type];
  const [kind, setKind] = useState('new');
  const [office, setOffice] = useState(OFFICES[0].key);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const mine = requests.filter((r) => r.type === type);

  const submit = () => {
    if (cfg.fee > balance) return setError('الرصيد غير كافٍ');
    setError('');
    onSubmit(
      {
        id: Date.now(),
        type,
        title: cfg.kinds ? cfg.kinds.find((k) => k.key === kind).label : cfg.single,
        office: OFFICES.find((o) => o.key === office).name,
        date: new Date().toISOString().slice(0, 10),
        status: 0,
      },
      cfg.fee
    );
    setSent(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title={cfg.title} onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={s.formCard}>
          {cfg.kinds ? (
            <>
              <Text style={[s.fieldLabel, { marginTop: 0 }]}>نوع الطلب</Text>
              <ChoiceChips options={cfg.kinds} value={kind} onChange={setKind} />
            </>
          ) : null}

          <Text style={s.fieldLabel}>مكتب الاستلام</Text>
          <ChoiceChips
            options={OFFICES.map((o) => ({ key: o.key, label: o.name }))}
            value={office}
            onChange={setOffice}
          />

          <Text style={r.note}>{cfg.note}</Text>
          {cfg.fee > 0 ? <Text style={r.fee}>الرسوم: {fmt(cfg.fee)} د.ج</Text> : null}
          {sent ? <Text style={r.ok}>✓ تم إرسال الطلب (تجريبي)</Text> : null}
          {error ? <Text style={s.error}>{error}</Text> : null}

          <PrimaryButton label="إرسال الطلب" onPress={submit} />
        </View>

        <Text style={r.section}>طلباتي</Text>
        {mine.length === 0 ? (
          <Text style={s.empty}>لا توجد طلبات بعد</Text>
        ) : (
          mine.map((q) => (
            <View key={q.id} style={r.item}>
              <View style={{ flex: 1 }}>
                <Text style={r.itemTitle}>{q.title}</Text>
                <Text style={r.itemSub}>
                  {q.office} • {q.date}
                </Text>
                <Text style={[r.status, q.status === 2 && { color: GREEN }]}>
                  {REQUEST_STATUSES[q.status]}
                </Text>
              </View>
              {q.status < 2 ? (
                <TouchableOpacity onPress={() => onAdvance(q.id)} style={r.track}>
                  <Text style={r.trackText}>تتبّع</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const r = StyleSheet.create({
  note: { color: GRAY, fontSize: 12, textAlign: 'right', marginTop: 14 },
  fee: { color: BLUE, fontSize: 14, fontWeight: '700', textAlign: 'right', marginTop: 6 },
  ok: { color: GREEN, fontSize: 13, textAlign: 'right', marginTop: 10 },
  section: { color: DARK, fontSize: 17, fontWeight: '700', textAlign: 'right', paddingHorizontal: 16, marginTop: 4 },
  item: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
  },
  itemTitle: { color: DARK, fontSize: 15, fontWeight: '600', textAlign: 'right' },
  itemSub: { color: GRAY, fontSize: 12, textAlign: 'right', marginTop: 2 },
  status: { color: BLUE, fontSize: 13, fontWeight: '600', textAlign: 'right', marginTop: 4 },
  track: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#E6EEFA' },
  trackText: { color: BLUE, fontSize: 13, fontWeight: '600' },
});
