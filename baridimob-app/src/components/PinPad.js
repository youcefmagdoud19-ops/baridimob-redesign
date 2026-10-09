import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BLUE, GOLD, DARK, GRAY, RED } from '../theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
const LENGTH = 4;

/*
  لوحة أرقام لإدخال PIN من 4 خانات.
  light = true للخلفيات الداكنة (شاشة القفل)
*/
export default function PinPad({ title, subtitle, error, onComplete, light, disabled }) {
  const [value, setValue] = useState('');
  const accent = light ? GOLD : BLUE;
  const textColor = light ? '#fff' : DARK;
  const keyBg = light ? 'rgba(255,255,255,0.14)' : '#E6EEFA';

  const press = (k) => {
    if (disabled) return;
    if (k === 'del') {
      setValue((v) => v.slice(0, -1));
      return;
    }
    if (value.length >= LENGTH) return;
    const next = value + k;
    if (next.length === LENGTH) {
      setValue('');
      onComplete(next);
    } else {
      setValue(next);
    }
  };

  return (
    <View style={[p.wrap, disabled && { opacity: 0.5 }]}>
      <Text style={[p.title, { color: textColor }]}>{title}</Text>
      {subtitle ? (
        <Text style={[p.sub, { color: light ? '#FFE08A' : GRAY }]}>{subtitle}</Text>
      ) : null}

      <View style={p.dots}>
        {Array.from({ length: LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[p.dot, { borderColor: accent }, i < value.length && { backgroundColor: accent }]}
          />
        ))}
      </View>

      <Text style={[p.error, { color: light ? '#FCA5A5' : RED }]}>{error || ' '}</Text>

      <View style={p.keys}>
        {KEYS.map((k, i) =>
          k === '' ? (
            <View key={i} style={p.keySpace} />
          ) : (
            <TouchableOpacity
              key={i}
              style={[p.key, { backgroundColor: keyBg }]}
              onPress={() => press(k)}
            >
              {k === 'del' ? (
                <Ionicons name="backspace-outline" size={26} color={textColor} />
              ) : (
                <Text style={[p.keyText, { color: textColor }]}>{k}</Text>
              )}
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
}

const p = StyleSheet.create({
  wrap: { alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  sub: { fontSize: 14, marginTop: 6, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 16, marginTop: 24 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  error: { fontSize: 14, marginTop: 12, marginBottom: 8, textAlign: 'center' },
  keys: { width: 264, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  key: { width: 72, height: 72, borderRadius: 36, margin: 8, alignItems: 'center', justifyContent: 'center' },
  keySpace: { width: 72, height: 72, margin: 8 },
  keyText: { fontSize: 26, fontWeight: '600' },
});
