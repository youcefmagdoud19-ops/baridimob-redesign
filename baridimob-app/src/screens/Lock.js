import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DEEP, BLUE, GOLD } from '../theme';
import { verifyPin } from '../storage';
import PinPad from '../components/PinPad';

export default function Lock({ userName, onUnlock }) {
  const [error, setError] = useState('');

  const check = async (code) => {
    setError('');
    const ok = await verifyPin(code);
    if (ok) onUnlock();
    else setError('الرمز غير صحيح');
  };

  return (
    <LinearGradient
      colors={[DEEP, BLUE, GOLD]}
      locations={[0, 0.7, 1.5]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={l.container}
    >
      <View style={l.lockIcon}>
        <Ionicons name="lock-closed" size={30} color={DEEP} />
      </View>
      <PinPad
        light
        title={`مرحبا ${userName}`}
        subtitle="أدخل رمز PIN لفتح التطبيق"
        error={error}
        onComplete={check}
      />
    </LinearGradient>
  );
}

const l = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lockIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});
