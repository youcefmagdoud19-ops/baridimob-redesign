import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { s } from '../styles';
import SubHeader from '../components/SubHeader';
import TxItem from '../components/TxItem';

const filters = [
  { key: 'all', label: 'الكل' },
  { key: 'out', label: 'المسحوبة' },
  { key: 'in', label: 'المستلمة' },
];
const periods = [
  { key: 'all', label: 'كل الفترات' },
  { key: '7', label: 'آخر 7 أيام' },
  { key: '30', label: 'آخر 30 يوماً' },
];

export default function Statement({ transactions, onOpen, onBack }) {
  const [filter, setFilter] = useState('all');
  const [period, setPeriod] = useState('all');
  const [q, setQ] = useState('');

  const cutoff = period === 'all' ? 0 : Date.now() - Number(period) * 86400000;
  const query = q.trim();
  const list = transactions.filter(
    (t) =>
      (filter === 'all' ? true : filter === 'out' ? t.amount < 0 : t.amount > 0) &&
      (!cutoff || new Date(`${t.date}T00:00:00`).getTime() >= cutoff) &&
      (!query || t.name.includes(query))
  );

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="كشف الحساب" onBack={onBack} />

      <View style={st.searchWrap}>
        <TextInput
          style={s.input}
          value={q}
          onChangeText={setQ}
          placeholder="بحث في العمليات"
          placeholderTextColor="#94A3B8"
        />
      </View>

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
      <View style={[s.chips, { marginTop: 8 }]}>
        {periods.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setPeriod(f.key)}
            style={[s.chip, period === f.key && s.chipActive]}
          >
            <Text style={[s.chipText, period === f.key && { color: '#fff' }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} keyboardShouldPersistTaps="handled">
        {list.length === 0 ? (
          <Text style={s.empty}>لا توجد عمليات</Text>
        ) : (
          list.map((t) => <TxItem key={t.id} t={t} onPress={() => onOpen(t)} />)
        )}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  searchWrap: { paddingHorizontal: 16, marginTop: 14 },
});
