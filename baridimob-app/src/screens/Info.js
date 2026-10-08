import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s } from '../styles';
import { BLUE, DARK, GRAY, GOLD } from '../theme';
import SubHeader from '../components/SubHeader';

const ITEMS = [
  {
    icon: 'shield-checkmark-outline',
    title: 'نصائح أمان',
    text: 'لا تشارك رمز PIN أو رمز CVV مع أي شخص. تطبيق BaridiMob هو التطبيق الرسمي الوحيد لبريد الجزائر على المتجر، فاحذر التطبيقات المقلّدة.',
  },
  {
    icon: 'card-outline',
    title: 'صلاحية البطاقة ورسومها',
    text: 'الذهبية الكلاسيكية الجديدة صالحة لمدة 4 سنوات، وتُقتطع رسوم 350 د.ج عند إصدارها (حسب إعلان بريد الجزائر في جويلية 2025).',
  },
  {
    icon: 'wallet-outline',
    title: 'خدمات هذا التطبيق التجريبي',
    text: 'استعلام الرصيد، كشف العمليات، التحويل، الدفع بالمسح، شحن الهاتف، دفع الفواتير، السحب بدون بطاقة، دفتر الشيكات، طلب البطاقة، ونماذج العمليات.',
  },
  {
    icon: 'information-circle-outline',
    title: 'تنبيه',
    text: 'هذه واجهة تجريبية: كل الأرقام والفواتير والرموز وهمية ولا ترتبط بأي نظام أو حساب حقيقي.',
  },
];

export default function Info({ onBack }) {
  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="معلومات مفيدة" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {ITEMS.map((x) => (
          <View key={x.title} style={[s.formCard, i.card]}>
            <View style={i.icon}>
              <Ionicons name={x.icon} size={22} color={BLUE} />
            </View>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={i.title}>{x.title}</Text>
              <Text style={i.text}>{x.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const i = StyleSheet.create({
  card: { flexDirection: 'row-reverse', alignItems: 'flex-start', marginBottom: 0 },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#E6EEFA', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: GOLD },
  title: { color: DARK, fontSize: 16, fontWeight: '700', textAlign: 'right' },
  text: { color: GRAY, fontSize: 13, textAlign: 'right', marginTop: 4, lineHeight: 20 },
});
