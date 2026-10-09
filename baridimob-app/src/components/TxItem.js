import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s } from '../styles';
import { RED, GREEN } from '../theme';

export default function TxItem({ t, onPress }) {
  const out = t.amount < 0;
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={s.tx} {...(onPress ? { onPress } : {})}>
      <View style={s.txIcon}>
        <Ionicons name={out ? 'arrow-up' : 'arrow-down'} size={18} color={out ? RED : GREEN} />
      </View>
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={s.txName}>{t.name}</Text>
        <Text style={s.txDate}>{t.date}</Text>
      </View>
      <Text style={[s.txAmount, { color: out ? RED : GREEN }]}>
        {out ? '-' : '+'}
        {Math.abs(t.amount).toLocaleString('en-US')} د.ج
      </Text>
    </Wrapper>
  );
}
