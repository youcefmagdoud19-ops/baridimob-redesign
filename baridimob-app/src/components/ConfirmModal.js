import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s } from '../styles';
import { BLUE, DARK, GRAY } from '../theme';
import { fmt } from '../utils';
import { checkPin } from '../storage';
import { authenticate } from '../biometric';
import PinPad from './PinPad';
import PrimaryButton from './PrimaryButton';

/*
  شاشة مراجعة قبل تنفيذ أي عملية، وتطلب رمز PIN (أو البصمة) إن كان مفعّلاً.
  summary = { title, amount, rows: [{ label, value }] }
*/
export default function ConfirmModal({ summary, needPin, biometric, onCancel, onDone }) {
  const [step, setStep] = useState('review');
  const [error, setError] = useState('');

  const confirm = () => {
    if (needPin) setStep('pin');
    else onDone();
  };

  const checkCode = async (code) => {
    setError('');
    const r = await checkPin(code);
    if (r.ok) return onDone();
    setError(
      r.locked
        ? `تم تعطيل المحاولات مؤقتاً، حاول بعد ${r.wait} ثانية`
        : `الرمز غير صحيح، المحاولات المتبقية: ${r.attemptsLeft}`
    );
  };

  const bio = async () => {
    if (await authenticate('تأكيد العملية')) onDone();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.overlay}>
        <View style={s.qrCard}>
          {step === 'review' ? (
            <>
              <Text style={c.title}>{summary.title}</Text>
              <Text style={c.amount}>{fmt(summary.amount)} د.ج</Text>

              <View style={{ alignSelf: 'stretch', marginTop: 8 }}>
                {summary.rows.map((r) => (
                  <View key={r.label} style={c.line}>
                    <Text style={c.value} numberOfLines={1}>
                      {r.value}
                    </Text>
                    <Text style={c.label}>{r.label}</Text>
                  </View>
                ))}
              </View>

              <PrimaryButton
                label={needPin ? 'متابعة' : 'تأكيد'}
                onPress={confirm}
                style={{ alignSelf: 'stretch' }}
              />
              <TouchableOpacity onPress={onCancel} style={{ marginTop: 10, padding: 8 }}>
                <Text style={[s.link, { color: BLUE }]}>إلغاء</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <PinPad
                title="أدخل رمز PIN لتأكيد العملية"
                subtitle={`${fmt(summary.amount)} د.ج`}
                error={error}
                onComplete={checkCode}
              />
              {biometric ? (
                <TouchableOpacity onPress={bio} style={c.bio}>
                  <Ionicons name="finger-print" size={28} color={BLUE} />
                  <Text style={c.bioText}>التأكيد بالبصمة</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity onPress={onCancel} style={{ marginTop: 6, padding: 8 }}>
                <Text style={[s.link, { color: BLUE }]}>إلغاء</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const c = StyleSheet.create({
  title: { color: DARK, fontSize: 18, fontWeight: '700' },
  amount: { color: BLUE, fontSize: 30, fontWeight: '800', marginTop: 6 },
  line: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  label: { color: GRAY, fontSize: 14 },
  value: { color: DARK, fontSize: 14, fontWeight: '600', maxWidth: '65%' },
  bio: { alignItems: 'center', marginTop: 4 },
  bioText: { color: BLUE, fontSize: 12, marginTop: 2 },
});
