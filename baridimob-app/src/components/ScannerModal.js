import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { s } from '../styles';
import { BLUE, DEEP, GOLD } from '../theme';
import { parsePayload } from '../utils';

export default function ScannerModal({ visible, onClose, onResult }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (visible) {
      setLocked(false);
      setMsg('');
    }
  }, [visible]);

  const handle = ({ data }) => {
    if (locked) return;
    setLocked(true);
    const parsed = parsePayload(data);
    if (!parsed) {
      setMsg('الرمز لا يحتوي على رقم RIP صالح (20 رقماً)');
      setTimeout(() => {
        setMsg('');
        setLocked(false);
      }, 2000);
      return;
    }
    onResult(parsed);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {permission && permission.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'code128', 'code39', 'ean13', 'ean8'],
            }}
            onBarcodeScanned={locked ? undefined : handle}
          />
        ) : (
          <View style={s.permBox}>
            <Ionicons name="camera-outline" size={56} color={GOLD} />
            <Text style={s.permText}>نحتاج إذن الكاميرا لقراءة الرمز</Text>
            <TouchableOpacity onPress={requestPermission} style={{ marginTop: 16 }}>
              <LinearGradient colors={[BLUE, DEEP]} style={[s.btn, { paddingHorizontal: 32 }]}>
                <Text style={s.btnText}>السماح بالكاميرا</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {permission && permission.granted && (
          <View style={s.scanOverlay} pointerEvents="none">
            <View style={s.scanFrame} />
            <Text style={s.scanHint}>وجّه الكاميرا نحو رمز QR أو الباركود</Text>
            {msg ? <Text style={s.scanError}>{msg}</Text> : null}
          </View>
        )}

        <TouchableOpacity onPress={onClose} style={s.scanClose}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
