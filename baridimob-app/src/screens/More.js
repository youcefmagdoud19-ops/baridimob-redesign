import { View, Text, ScrollView, TouchableOpacity, Linking, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { s } from '../styles';
import { BLUE, DEEP, GOLD, DARK } from '../theme';
import SubHeader from '../components/SubHeader';

const SECTIONS = [
  {
    title: 'الدفع والشحن',
    items: [
      { icon: 'receipt-outline', label: 'دفع الفواتير', screen: 'bills' },
      { icon: 'phone-portrait-outline', label: 'شحن الهاتف', screen: 'topup' },
      { icon: 'qr-code-outline', label: 'الدفع بالمسح', screen: 'pay' },
    ],
  },
  {
    title: 'الحساب والبطاقة',
    items: [
      { icon: 'cash-outline', label: 'سحب بدون بطاقة', screen: 'cardless' },
      { icon: 'book-outline', label: 'دفتر الشيكات', screen: 'cheque' },
      { icon: 'card-outline', label: 'طلب البطاقة الذهبية', screen: 'cardreq' },
      { icon: 'bookmark-outline', label: 'نماذج العمليات', screen: 'templates' },
      { icon: 'qr-code-outline', label: 'رمز QR حسابي', action: 'qr' },
    ],
  },
  {
    title: 'الخدمات والمعلومات',
    items: [
      { icon: 'locate-outline', label: 'الموزعات الآلية', action: 'atm' },
      { icon: 'business-outline', label: 'مكاتب البريد', action: 'post' },
      { icon: 'information-circle-outline', label: 'معلومات مفيدة', screen: 'info' },
    ],
  },
];

// يفتح تطبيق الخرائط للبحث قرب موقعك الحالي
const openMaps = async (query) => {
  const q = encodeURIComponent(query);
  const native = Platform.OS === 'ios' ? `maps:0,0?q=${q}` : `geo:0,0?q=${q}`;
  try {
    await Linking.openURL(native);
  } catch (e) {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => {});
  }
};

export default function More({ go, onShowQr, onBack }) {
  const press = (item) => {
    if (item.screen) return go(item.screen);
    if (item.action === 'qr') return onShowQr();
    if (item.action === 'atm') return openMaps('Algérie Poste DAB');
    if (item.action === 'post') return openMaps('Algérie Poste bureau de poste');
  };

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="المزيد" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {SECTIONS.map((sec) => (
          <View key={sec.title} style={{ marginTop: 20 }}>
            <Text style={m.title}>{sec.title}</Text>
            <View style={m.grid}>
              {sec.items.map((item) => (
                <TouchableOpacity key={item.label} style={m.tile} onPress={() => press(item)}>
                  <LinearGradient
                    colors={[BLUE, DEEP]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.actionBox}
                  >
                    <Ionicons name={item.icon} size={26} color={GOLD} />
                  </LinearGradient>
                  <Text style={s.actionLabel} numberOfLines={2}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const m = StyleSheet.create({
  title: { color: DARK, fontSize: 17, fontWeight: '700', textAlign: 'right', paddingHorizontal: 16 },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', paddingHorizontal: 8 },
  tile: { width: '33.33%', alignItems: 'center', marginTop: 14, paddingHorizontal: 4 },
});
