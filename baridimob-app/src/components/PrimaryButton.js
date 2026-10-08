import { Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { s } from '../styles';
import { BLUE, DEEP } from '../theme';

export default function PrimaryButton({ label, onPress, style, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[{ marginTop: 16 }, style, disabled && { opacity: 0.5 }]}
    >
      <LinearGradient colors={[BLUE, DEEP]} style={s.btn}>
        <Text style={s.btnText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
