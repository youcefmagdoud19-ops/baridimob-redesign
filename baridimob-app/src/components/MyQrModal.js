import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { s } from '../styles';
import { BLUE, DEEP, GREEN } from '../theme';
import { RIP, RIP_FORMATTED } from '../data';

export default function MyQrModal({ visible, onClose }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await Clipboard.setStringAsync(RIP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.qrCard}>
          <Text style={s.qrTitle}>رمز QR الخاص بحسابي</Text>
          <Text style={s.qrSub}>يمسحه الطرف الآخر ليحصل على رقم RIP تلقائياً</Text>

          <View style={s.qrBox}>
            <QRCode value={RIP} size={200} color={DEEP} backgroundColor="#fff" />
          </View>

          <Text style={s.qrRip}>{RIP_FORMATTED}</Text>

          <TouchableOpacity onPress={copy} style={s.copyBtn}>
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={18}
              color={copied ? GREEN : BLUE}
            />
            <Text style={[s.copyText, { color: copied ? GREEN : BLUE }]}>
              {copied ? 'تم النسخ' : 'نسخ الرقم'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={{ marginTop: 16, alignSelf: 'stretch' }}>
            <LinearGradient colors={[BLUE, DEEP]} style={s.btn}>
              <Text style={s.btnText}>إغلاق</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
