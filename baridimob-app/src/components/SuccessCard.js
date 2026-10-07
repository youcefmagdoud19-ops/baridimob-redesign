import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { s } from '../styles';
import { BLUE, DEEP } from '../theme';
import { fmt } from '../utils';

export default function SuccessCard({ amount, title, onBack }) {
  return (
    <View style={s.formCard}>
      <View style={s.successIcon}>
        <Ionicons name="checkmark" size={44} color="#fff" />
      </View>
      <Text style={s.successTitle}>{title}</Text>
      <Text style={s.successText}>(عملية تجريبية)</Text>
      <Text style={s.successAmount}>{fmt(amount)} د.ج</Text>
      <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }}>
        <LinearGradient colors={[BLUE, DEEP]} style={s.btn}>
          <Text style={s.btnText}>العودة للرئيسية</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
