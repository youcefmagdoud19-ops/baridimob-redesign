import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { s } from '../styles';
import SubHeader from '../components/SubHeader';
import TxItem from '../components/TxItem';

const filters = [
  { key: 'all', label: 'الكل' },
  { key: 'out', label: 'المسحوبة' },
  { key: 'in', label: 'المستلمة' },
];

export default function Statement({ transactions, onBack }) {
  const [filter, setFilter] = useState('all');
  const list = transactions.filter((t) =>
    filter === 'all' ? true : filter === 'out' ? t.amount < 0 : t.amount > 0
  );

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="كشف الحساب" onBack={onBack} />
      <View style={s.chips}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[s.chip, filter === f.key && s.chipActive]}
          >
            <Text style={[s.chipText, filter === f.key && { color: '#fff' }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {list.length === 0 ? (
          <Text style={s.empty}>لا توجد عمليات</Text>
        ) : (
          list.map((t) => <TxItem key={t.id} t={t} />)
        )}
      </ScrollView>
    </View>
  );
}
