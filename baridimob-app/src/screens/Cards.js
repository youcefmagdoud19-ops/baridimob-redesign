import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s } from '../styles';
import { BLUE, DARK, GRAY, RED } from '../theme';
import { CARD_LIMIT, RIP_FORMATTED } from '../data';
import { fmt } from '../utils';
import SubHeader from '../components/SubHeader';
import EdahabiaCard from '../components/EdahabiaCard';

export default function Cards({ userName, frozen, onToggleFreeze, onBack }) {
  const [show, setShow] = useState(false);
  const [flipped, setFlipped] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="البطاقة الذهبية" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ marginTop: 18 }}>
          <EdahabiaCard
            userName={userName}
            showNumber={show}
            frozen={frozen}
            flipped={flipped}
            onPress={() => setFlipped(!flipped)}
          />
        </View>

        <View style={c.btnRow}>
          <TouchableOpacity onPress={() => setFlipped(!flipped)} style={c.pill}>
            <Ionicons name="sync-outline" size={18} color={BLUE} />
            <Text style={c.pillText}>{flipped ? 'عرض الوجه الأمامي' : 'عرض الوجه الخلفي'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShow(!show)} style={c.pill}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={BLUE} />
            <Text style={c.pillText}>{show ? 'إخفاء الرقم' : 'إظهار الرقم'}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.formCard}>
          <Text style={c.sectionTitle}>التحكم بالبطاقة</Text>

          <View style={c.row}>
            <Switch
              value={frozen}
              onValueChange={onToggleFreeze}
              trackColor={{ false: '#CBD5E1', true: RED }}
              thumbColor="#fff"
            />
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <Text style={c.rowTitle}>تجميد البطاقة</Text>
              <Text style={c.rowSub}>
                {frozen ? 'عمليات الدفع متوقفة حالياً' : 'أوقف الدفع مؤقتاً عند الحاجة'}
              </Text>
            </View>
            <View style={[c.rowIcon, frozen && { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="snow-outline" size={20} color={frozen ? RED : BLUE} />
            </View>
          </View>

          <View style={c.row}>
            <Text style={c.limit}>{fmt(CARD_LIMIT)} د.ج</Text>
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <Text style={c.rowTitle}>الحد اليومي</Text>
              <Text style={c.rowSub}>أقصى مبلغ للدفع في اليوم</Text>
            </View>
            <View style={c.rowIcon}>
              <Ionicons name="speedometer-outline" size={20} color={BLUE} />
            </View>
          </View>

          <View style={[c.row, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <Text style={c.rowTitle}>الحساب المرتبط</Text>
              <Text style={c.rowSub}>{RIP_FORMATTED}</Text>
            </View>
            <View style={c.rowIcon}>
              <Ionicons name="link-outline" size={20} color={BLUE} />
            </View>
          </View>
        </View>

        <Text style={c.note}>
          اضغط على البطاقة لقلبها، وزر إظهار الرقم يكشف رقم البطاقة وCVV. بطاقة وهمية للتجربة فقط.
        </Text>
      </ScrollView>
    </View>
  );
}

const c = StyleSheet.create({
  btnRow: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 10, marginTop: 14 },
  pill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#E6EEFA',
  },
  pillText: { color: BLUE, fontSize: 13, fontWeight: '600' },
  sectionTitle: { color: DARK, fontSize: 17, fontWeight: '700', textAlign: 'right', marginBottom: 4 },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E6EEFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { color: DARK, fontSize: 15, fontWeight: '600', textAlign: 'right' },
  rowSub: { color: GRAY, fontSize: 12, textAlign: 'right', marginTop: 2 },
  limit: { color: BLUE, fontSize: 13, fontWeight: '700' },
  note: { color: GRAY, fontSize: 12, textAlign: 'center', marginTop: 4, paddingHorizontal: 24 },
});
