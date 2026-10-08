import { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import Svg, { Polygon, Path, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CARD_NUMBER, CARD_EXPIRY, CARD_CVV } from '../data';

const W = Math.round(Dimensions.get('window').width - 32);
const H = Math.round(W / 1.586); // نسبة بطاقة بنكية قياسية
const VB_W = 320;
const VB_H = 202;

const BLUES = ['#2748A8', '#3A66CA', '#1F3D93'];
const BAND = ['#F5C518', '#F8FAFF', '#7FA0EA']; // أصفر، أبيض، أزرق فاتح

const spaced = (digits) => digits.replace(/(\d{4})(?=\d)/g, '$1  ');

/* نجمة ثمانية (زخرفة الزليج) */
const star = (cx, cy, ro, ri) => {
  const pts = [];
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2;
    const r = i % 2 === 0 ? ro : ri;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
};

function Stars({ points }) {
  return (
    <>
      {points.map(([x, y, i]) => (
        <Polygon
          key={`${x}-${y}`}
          points={star(x, y, 10, 6.2)}
          fill={BAND[i % 3]}
          stroke="#1E3A8A"
          strokeWidth="0.8"
        />
      ))}
    </>
  );
}

/* شريط زليج عمودي على الحافة اليمنى (الوجه الأمامي) */
const frontBand = () => {
  const pts = [];
  for (let col = 0; col < 2; col++) {
    const x = VB_W - 8 - col * 17;
    let k = 0;
    for (let y = col ? 15 : 5; y < VB_H + 10; y += 19) {
      pts.push([x, y, k + col]);
      k++;
    }
  }
  return pts;
};

/* شريط زليج أفقي في أسفل الوجه الخلفي */
const backBand = () => {
  const pts = [];
  for (let row = 0; row < 2; row++) {
    const y = VB_H - 8 - row * 17;
    let k = 0;
    for (let x = row ? 18 : 8; x < VB_W + 10; x += 19) {
      pts.push([x, y, k + row]);
      k++;
    }
  }
  return pts;
};

/* معالم مبسّطة بلون فاتح شفاف: ضريح موريتانيا، مقام الشهيد، مئذنة جامع الجزائر */
function Skyline() {
  const fill = 'rgba(255,255,255,0.1)';
  return (
    <>
      <Polygon
        fill={fill}
        points="14,202 14,188 24,188 24,176 34,176 34,164 44,164 44,152 52,152 52,164 62,164 62,176 72,176 72,188 82,188 82,202"
      />
      <Polygon fill={fill} points="44,152 48,132 52,152" />
      <Path fill={fill} d="M118 202 Q114 150 130 118 Q140 150 136 202 Z" />
      <Path fill={fill} d="M138 202 Q140 138 152 104 Q164 138 160 202 Z" />
      <Path fill={fill} d="M162 202 Q158 150 174 118 Q184 150 180 202 Z" />
      <Rect x="200" y="176" width="70" height="26" fill={fill} />
      <Rect x="226" y="86" width="9" height="96" fill={fill} />
      <Rect x="223" y="100" width="15" height="4" fill={fill} />
      <Polygon fill={fill} points="224,86 237,86 230.5,68" />
    </>
  );
}

function Art({ children }) {
  return (
    <Svg
      width={W}
      height={H}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {children}
    </Svg>
  );
}

/*
  وجه البطاقة: View بحجم ثابت، والتدرجات عناصر شقيقة (ليست حاوية)
  حتى لا يختفي المحتوى.
*/
function Face({ children }) {
  return (
    <View style={{ width: W, height: H, backgroundColor: '#2F57BC' }}>
      <LinearGradient
        colors={BLUES}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.7, y: 0.8 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

function Chip() {
  return (
    <View style={e.chip}>
      <View style={[e.chipLine, { top: 10, left: 0, right: 0, height: 1 }]} />
      <View style={[e.chipLine, { top: 21, left: 0, right: 0, height: 1 }]} />
      <View style={[e.chipLine, { left: 14, top: 0, bottom: 0, width: 1 }]} />
      <View style={[e.chipLine, { left: 28, top: 0, bottom: 0, width: 1 }]} />
    </View>
  );
}

function FrozenOverlay() {
  return (
    <View style={e.frozen}>
      <Ionicons name="lock-closed" size={34} color="#fff" />
      <Text style={e.frozenText}>البطاقة مجمّدة</Text>
    </View>
  );
}

function Front({ userName, showNumber, frozen }) {
  const number = showNumber
    ? spaced(CARD_NUMBER)
    : '••••  ••••  ••••  ' + CARD_NUMBER.slice(-4);
  const exp = CARD_EXPIRY.replace('/', ' / ');

  return (
    <Face>
      <Art>
        <Skyline />
        <Stars points={frontBand()} />
      </Art>

      <View style={e.titleBox}>
        <Text style={e.ar}>الذهبية</Text>
        <Text style={e.classic}>CLASSIC</Text>
      </View>

      <View style={e.logoBox}>
        <Text style={e.logoAr}>بريد الجزائر</Text>
        <Text style={e.logoFr}>ALGÉRIE POSTE</Text>
      </View>

      <View style={{ position: 'absolute', left: 26, top: H * 0.33 }}>
        <Chip />
      </View>

      <Text style={[e.number, { top: H * 0.55 }]}>{number}</Text>

      <View style={[e.expBox, { top: H * 0.65 }]}>
        <Text style={e.expLabel}>EXP DATE</Text>
        <Text style={e.expValue}>{exp}</Text>
      </View>

      <Text style={[e.name, { top: H * 0.8 }]}>{userName}</Text>

      {frozen ? <FrozenOverlay /> : null}
    </Face>
  );
}

function Back({ showNumber, frozen }) {
  return (
    <Face>
      <Art>
        <Stars points={backBand()} />
      </Art>

      <View style={[e.stripe, { top: H * 0.08, height: H * 0.17 }]} />

      <View style={[e.panel, { top: H * 0.3, height: H * 0.14 }]}>
        <Text style={e.cvv}>{showNumber ? CARD_CVV : '•••'}</Text>
      </View>

      <View style={[e.fine, { top: H * 0.5 }]}>
        <Text style={e.fineAr}>
          هام : هذه البطاقة شخصية ولا يجوز التنازل عنها أو إعارتها. عند العثور عليها يُرجى
          إيداعها في أقرب مكتب بريد.
        </Text>
        <Text style={e.fineFr}>
          IMPORTANT : Carte strictement personnelle. En cas de découverte, la déposer au
          bureau de poste le plus proche.
        </Text>
        <Text style={e.site}>www.poste.dz</Text>
      </View>

      {frozen ? <FrozenOverlay /> : null}
    </Face>
  );
}

export default function EdahabiaCard({ userName, showNumber, frozen, flipped, onPress }) {
  // وجه واحد فقط يُرسم في كل مرة، والقلب بتصغير العرض ثم تبديل الوجه ثم تكبيره
  const scale = useRef(new Animated.Value(1)).current;
  const [face, setFace] = useState(flipped ? 'back' : 'front');
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    Animated.timing(scale, { toValue: 0.02, duration: 200, useNativeDriver: true }).start(() => {
      setFace(flipped ? 'back' : 'front');
      Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }, [flipped]);

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View style={[e.side, { transform: [{ scaleX: scale }] }]}>
        {face === 'front' ? (
          <Front userName={userName} showNumber={showNumber} frozen={frozen} />
        ) : (
          <Back showNumber={showNumber} frozen={frozen} />
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const e = StyleSheet.create({
  side: {
    width: W,
    height: H,
    alignSelf: 'center',
    borderRadius: 18,
    overflow: 'hidden',
  },

  /* الوجه الأمامي */
  titleBox: { position: 'absolute', top: 14, left: 20 },
  ar: { color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 38 },
  classic: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 0.5, marginTop: -2 },
  logoBox: { position: 'absolute', top: 16, right: 46, alignItems: 'flex-end' },
  logoAr: { color: '#fff', fontSize: 13, fontWeight: '800' },
  logoFr: { color: 'rgba(255,255,255,0.85)', fontSize: 7, fontWeight: '700', letterSpacing: 0.5, marginTop: 1 },

  chip: {
    width: 42,
    height: 32,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#B58B4A',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  chipLine: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.28)' },

  number: {
    position: 'absolute',
    left: 22,
    color: '#fff',
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'left',
  },
  expBox: { position: 'absolute', left: W * 0.58 },
  expLabel: { color: '#fff', fontSize: 7, fontWeight: '700' },
  expValue: { color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 1 },
  name: {
    position: 'absolute',
    left: 22,
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  /* الوجه الخلفي */
  stripe: { position: 'absolute', left: 0, right: 0, backgroundColor: '#0B0B0B' },
  panel: {
    position: 'absolute',
    left: 22,
    right: 56,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
  },
  cvv: { color: '#000', fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  fine: { position: 'absolute', left: 22, right: 22 },
  fineAr: { color: '#fff', fontSize: 8, textAlign: 'right', lineHeight: 12 },
  fineFr: { color: '#fff', fontSize: 8, textAlign: 'left', lineHeight: 11, marginTop: 6 },
  site: { color: 'rgba(255,255,255,0.85)', fontSize: 8, marginTop: 8, textAlign: 'left' },

  frozen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30,41,59,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frozenText: { color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 8 },
});
