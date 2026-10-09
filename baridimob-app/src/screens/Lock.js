import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DEEP, BLUE, GOLD } from '../theme';
import { checkPin, getLockWait } from '../storage';
import { authenticate } from '../biometric';
import PinPad from '../components/PinPad';

const mmss = (sec) =>
  `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

export default function Lock({ userName, biometric, onUnlock }) {
  const [error, setError] = useState('');
  const [wait, setWait] = useState(0);

  const tryBio = async () => {
    const ok = await authenticate('افتح التطبيق بالبصمة');
    if (ok) onUnlock();
  };

  useEffect(() => {
    (async () => {
      const w = await getLockWait();
      if (w > 0) setWait(w);
      else if (biometric) tryBio();
    })();
  }, []);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const id = setInterval(() => {
      setWait((w) => {
        if (w <= 1) {
          clearInterval(id);
          return 0;
        }
        return w - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [wait > 0]);

  const check = async (code) => {
    setError('');
    const r = await checkPin(code);
    if (r.ok) return onUnlock();
    if (r.locked) return setWait(r.wait);
    setError(`الرمز غير صحيح، المحاولات المتبقية: ${r.attemptsLeft}`);
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
        error={wait > 0 ? `تم تعطيل الإدخال، حاول بعد ${mmss(wait)}` : error}
        disabled={wait > 0}
        onComplete={check}
      />
      {biometric ? (
        <TouchableOpacity onPress={tryBio} style={l.bio}>
          <Ionicons name="finger-print" size={30} color="#fff" />
          <Text style={l.bioText}>استخدام البصمة</Text>
        </TouchableOpacity>
      ) : null}
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
  bio: { alignItems: 'center', marginTop: 8 },
  bioText: { color: '#fff', fontSize: 13, marginTop: 4 },
});
