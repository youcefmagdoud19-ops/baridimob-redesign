import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { s } from '../styles';
import { BLUE, DEEP, GOLD, GRAY } from '../theme';
import { tabs } from '../data';

export default function BottomNav({ active, go }) {
  return (
    <View style={s.nav}>
      {tabs.map((t) =>
        t.center ? (
          <TouchableOpacity key={t.label} style={s.centerWrap} onPress={() => go(t.screen)}>
            <LinearGradient colors={[BLUE, DEEP]} style={s.centerBtn}>
              <Ionicons name={t.icon} size={28} color={GOLD} />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            key={t.label}
            style={s.tab}
            onPress={() => t.screen && go(t.screen)}
          >
            <Ionicons name={t.icon} size={22} color={active === t.screen ? BLUE : GRAY} />
            <Text style={[s.tabLabel, { color: active === t.screen ? BLUE : GRAY }]}>
              {t.label}
            </Text>
            {active === t.screen && <View style={s.activeDot} />}
          </TouchableOpacity>
        )
      )}
    </View>
  );
}
