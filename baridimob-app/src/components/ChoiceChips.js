import { View, Text, TouchableOpacity } from 'react-native';
import { s } from '../styles';

export default function ChoiceChips({ options, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => (
        <TouchableOpacity
          key={String(o.key)}
          onPress={() => onChange(o.key)}
          style={[s.chip, value === o.key && s.chipActive]}
        >
          <Text style={[s.chipText, value === o.key && { color: '#fff' }]}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
