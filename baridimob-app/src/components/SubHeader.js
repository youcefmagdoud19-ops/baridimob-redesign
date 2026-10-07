import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { s } from '../styles';
import { BLUE, DEEP, GOLD } from '../theme';

export default function SubHeader({ title, onBack }) {
  return (
    <LinearGradient
      colors={[DEEP, BLUE, GOLD]}
      locations={[0, 0.7, 1.3]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={s.subHeader}
    >
      <View style={s.deco1} />
      <View style={s.subRow}>
        <TouchableOpacity onPress={onBack} style={s.circle}>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.subTitle}>{title}</Text>
      </View>
    </LinearGradient>
  );
}
