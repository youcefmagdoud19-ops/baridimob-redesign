import { useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CARD_GOLD_1, CARD_GOLD_2, CARD_GOLD_3, CARD_INK } from '../theme';
import { groupRip } from '../utils';

/*
  بطاقة ذهبية بوجهين (اضغط لقلبها)
  الأمام: شريحة + رقم البطاقة + الاسم + تاريخ الانتهاء
  الخلف : شريط مغناطيسي + التوقيع + الحساب الجاري المرتبط (RIP)
*/
export default function FlipCard({ userName, number, expiry, ripText, label, show, frozen }) {
  const { width } = useWindowDimensions();
  const w = width - 32;
  const h = Math.round(w / 1.586); // نسبة بطاقة قياسية
  const anim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const flip = () => {
    Animated.timing(anim, {
      toValue: flipped ? 0 : 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const rot = (from, to) => ({
    transform: [
      { perspective: 1200 },
      { rotateY: anim.interpolate({ inputRange: [0, 1], outputRange: [from, to] }) },
    ],
  });

  const masked = '•••• •••• •••• ' + number.slice(-4);
  const numberText = show ? groupRip(number) : masked;
  const numSize = Math.round(w * 0.058);

  const FrozenOverlay = () =>
    frozen ? (
      <View style={f.frozen}>
        <Ionicons name="lock-closed" size={34} color="#fff" />
        <Text style={f.frozenText}>البطاقة مجمّدة</Text>
      </View>
    ) : null;

  return (
    <TouchableWithoutFeedback onPress={flip}>
      <View style={{ width: w, height: h }}>
        {/* ---------- الوجه الأمامي ---------- */}
        <Animated.View style={[f.face, { width: w, height: h }, rot('0deg', '180deg')]}>
          <LinearGradient
            colors={[CARD_GOLD_1, CARD_GOLD_2, CARD_GOLD_3]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={f.fill}
          >
            <View style={f.shine} />

            <View style={f.topRow}>
              <Ionicons
                name="wifi"
                size={24}
                color={CARD_INK}
                style={{ transform: [{ rotate: '90deg' }] }}
              />
              {label ? <Text style={f.label}>{label}</Text> : <View />}
            </View>

            <View style={f.chip}>
              <View style={f.chipH} />
              <View style={f.chipV} />
            </View>

            <Text style={[f.number, { fontSize: numSize }]} numberOfLines={1}>
              {numberText}
            </Text>

            <View style={f.bottomRow}>
              <View>
                <Text style={f.small}>حامل البطاقة</Text>
                <Text style={f.value}>{userName}</Text>
              </View>
              <View>
                <Text style={[f.small, { textAlign: 'right' }]}>صالحة حتى</Text>
                <Text style={[f.value, { textAlign: 'right' }]}>{expiry}</Text>
              </View>
            </View>

            <FrozenOverlay />
          </LinearGradient>
        </Animated.View>

        {/* ---------- الوجه الخلفي ---------- */}
        <Animated.View style={[f.face, { width: w, height: h }, rot('180deg', '360deg')]}>
          <LinearGradient
            colors={[CARD_GOLD_1, CARD_GOLD_2, CARD_GOLD_3]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={f.fill}
          >
            <View style={[f.strip, { marginTop: h * 0.1 }]} />

            <View style={f.backBody}>
              <View style={f.sigBox}>
                <Text style={f.sigText} numberOfLines={1}>
                  {userName}
                </Text>
              </View>

              <View style={f.accountBox}>
                <Text style={f.accLabel}>الحساب الجاري المرتبط (RIP)</Text>
                <Text style={f.accValue} numberOfLines={1}>
                  {ripText}
                </Text>
              </View>

              <Text style={f.demo}>بطاقة تجريبية - لا ترتبط بأي حساب حقيقي</Text>
            </View>

            <FrozenOverlay />
          </LinearGradient>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const f = StyleSheet.create({
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 18,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59,42,5,0.25)',
  },
  fill: { flex: 1, padding: 18 },
  shine: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.22)',
    top: -90,
    right: -60,
  },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: CARD_INK, fontSize: 16, fontWeight: '800' },

  chip: {
    width: 46,
    height: 34,
    borderRadius: 7,
    backgroundColor: '#EBCB6A',
    borderWidth: 1,
    borderColor: 'rgba(59,42,5,0.5)',
    marginTop: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  chipH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(59,42,5,0.45)' },
  chipV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(59,42,5,0.45)' },

  number: {
    color: CARD_INK,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 14,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  bottomRow: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  small: { color: 'rgba(59,42,5,0.75)', fontSize: 10 },
  value: { color: CARD_INK, fontSize: 14, fontWeight: '700', marginTop: 2 },

  strip: { height: 38, backgroundColor: '#1F1A10', marginHorizontal: -18 },
  backBody: { flex: 1, paddingTop: 14 },
  sigBox: {
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  sigText: { color: '#1F1A10', fontSize: 15, fontStyle: 'italic', textAlign: 'right' },
  accountBox: { marginTop: 12 },
  accLabel: { color: 'rgba(59,42,5,0.8)', fontSize: 11, textAlign: 'right' },
  accValue: { color: CARD_INK, fontSize: 17, fontWeight: '700', marginTop: 2, textAlign: 'right' },
  demo: { position: 'absolute', bottom: 0, alignSelf: 'center', color: 'rgba(59,42,5,0.7)', fontSize: 10 },

  frozen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30,41,59,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frozenText: { color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 8 },
});
