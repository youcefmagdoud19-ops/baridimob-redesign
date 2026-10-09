import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { s } from '../styles';
import { BLUE } from '../theme';
import { checkPin, setPin, removePin } from '../storage';
import PinPad from './PinPad';

/*
  mode:
   'create'  -> إنشاء رمز جديد (إدخال ثم تأكيد)
   'change'  -> الرمز الحالي ثم رمز جديد ثم تأكيد
   'disable' -> الرمز الحالي ثم إيقاف القفل
*/
const TITLES = {
  old: 'أدخل رمز PIN الحالي',
  new: 'أدخل رمز PIN جديداً',
  confirm: 'أعد إدخال الرمز للتأكيد',
};

export default function PinModal({ mode, onClose, onDone }) {
  const [step, setStep] = useState(mode === 'create' ? 'new' : 'old');
  const [first, setFirst] = useState('');
  const [error, setError] = useState('');

  const handle = async (code) => {
    setError('');

    if (step === 'old') {
      const r = await checkPin(code);
      if (!r.ok) {
        return setError(
          r.locked
            ? `تم تعطيل المحاولات مؤقتاً، حاول بعد ${r.wait} ثانية`
            : `الرمز غير صحيح، المحاولات المتبقية: ${r.attemptsLeft}`
        );
      }
      if (mode === 'disable') {
        await removePin();
        onDone(false);
        return;
      }
      setStep('new');
      return;
    }

    if (step === 'new') {
      setFirst(code);
      setStep('confirm');
      return;
    }

    if (step === 'confirm') {
      if (code !== first) {
        setError('الرمزان غير متطابقين، أعد المحاولة');
        setFirst('');
        setStep('new');
        return;
      }
      await setPin(code);
      onDone(true);
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.qrCard}>
          <PinPad
            key={step}
            title={TITLES[step]}
            subtitle={step === 'new' ? '4 أرقام' : undefined}
            error={error}
            onComplete={handle}
          />
          <TouchableOpacity onPress={onClose} style={{ marginTop: 8, padding: 8 }}>
            <Text style={[s.link, { color: BLUE }]}>إلغاء</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
