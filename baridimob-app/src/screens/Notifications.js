import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s } from '../styles';
import { BLUE, DARK, GRAY, GOLD } from '../theme';
import SubHeader from '../components/SubHeader';

const p2 = (n) => String(n).padStart(2, '0');
const fmtTime = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
};

export default function Notifications({ notifications, onRead, onReadAll, onClear, onBack }) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="الإشعارات" onBack={onBack} />
      <View style={n.actions}>
        <TouchableOpacity onPress={onClear} disabled={notifications.length === 0}>
          <Text style={[n.action, notifications.length === 0 && { opacity: 0.4 }]}>مسح الكل</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onReadAll} disabled={unread === 0}>
          <Text style={[n.action, unread === 0 && { opacity: 0.4 }]}>قراءة الكل ({unread})</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {notifications.length === 0 ? (
          <Text style={s.empty}>لا توجد إشعارات</Text>
        ) : (
          notifications.map((x) => (
            <TouchableOpacity key={x.id} style={n.item} onPress={() => onRead(x.id)}>
              <View style={n.icon}>
                <Ionicons name="notifications-outline" size={20} color={BLUE} />
              </View>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={[n.title, !x.read && { fontWeight: '800' }]}>{x.title}</Text>
                <Text style={n.body}>{x.body}</Text>
                <Text style={n.time}>{fmtTime(x.time)}</Text>
              </View>
              {!x.read ? <View style={n.dot} /> : null}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const n = StyleSheet.create({
  actions: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 14 },
  action: { color: BLUE, fontSize: 14, fontWeight: '600' },
  item: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 8, padding: 12, borderRadius: 12 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E6EEFA', alignItems: 'center', justifyContent: 'center' },
  title: { color: DARK, fontSize: 15, fontWeight: '600', textAlign: 'right' },
  body: { color: GRAY, fontSize: 13, textAlign: 'right', marginTop: 2 },
  time: { color: GRAY, fontSize: 11, textAlign: 'right', marginTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: GOLD },
});
