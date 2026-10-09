import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';

const BLUE = '#0052CC';
const DEEP = '#002A7A';
const GOLD = '#FFB800';
const BG = '#F8FAFC';
const DARK = '#1E293B';
const GRAY = '#64748B';
const RED = '#DC2626';
const GREEN = '#16A34A';

const RIP = '00799999000123456789';
const RIP_FORMATTED = '0079 9999 0001 2345 6789';

const fmt = (n) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const groupRip = (digits) => digits.replace(/(\d{4})(?=\d)/g, '$1 ');

/*
  صيغ الرمز المدعومة:
  1) 20 رقماً فقط (رقم RIP)
  2) BARIDI|RIP|المبلغ|اسم التاجر   مثال:
     BARIDI|00799999000987654321|2500|مخبزة الأمل
*/
const parsePayload = (data) => {
  const text = String(data).trim();
  if (text.startsWith('BARIDI|')) {
    const [, rip, amount, name] = text.split('|');
    const clean = (rip || '').replace(/\s/g, '');
    if (!/^\d{20}$/.test(clean)) return null;
    const v = parseFloat(amount);
    return { rip: clean, amount: v > 0 ? v : null, name: (name || '').trim() };
  }
  const m = text.replace(/\s/g, '').match(/\d{20}/);
  return m ? { rip: m[0], amount: null, name: '' } : null;
};

const initialTx = [
  { id: 1, name: 'تحويل إلى أحمد', date: '2026-10-02', amount: -5000 },
  { id: 2, name: 'راتب شهري', date: '2026-10-01', amount: 45000 },
  { id: 3, name: 'دفع فاتورة الكهرباء', date: '2026-09-28', amount: -3200 },
  { id: 4, name: 'استلام من سمير', date: '2026-09-25', amount: 12000 },
  { id: 5, name: 'دفع فاتورة الماء', date: '2026-09-20', amount: -1800 },
];

const tabs = [
  { icon: 'home', label: 'الرئيسية', screen: 'home' },
  { icon: 'wallet-outline', label: 'الحسابات', screen: 'statement' },
  { icon: 'swap-horizontal', label: 'تحويل', screen: 'transfer', center: true },
  { icon: 'card-outline', label: 'البطاقات' },
  { icon: 'settings-outline', label: 'الإعدادات' },
];

/* ---------- عناصر مشتركة ---------- */

function TxItem({ t }) {
  const out = t.amount < 0;
  return (
    <View style={s.tx}>
      <View style={s.txIcon}>
        <Ionicons name={out ? 'arrow-up' : 'arrow-down'} size={18} color={out ? RED : GREEN} />
      </View>
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={s.txName}>{t.name}</Text>
        <Text style={s.txDate}>{t.date}</Text>
      </View>
      <Text style={[s.txAmount, { color: out ? RED : GREEN }]}>
        {out ? '-' : '+'}
        {Math.abs(t.amount).toLocaleString('en-US')} د.ج
      </Text>
    </View>
  );
}

function SubHeader({ title, onBack }) {
  return (
    <LinearGradient
      colors={[DEEP, BLUE, GOLD]}
      locations={[0, 0.7, 1.3]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={s.subHeader}
    >
      <View style={s.deco1} />
      <View style={s.subRow}>
        <TouchableOpacity onPress={onBack} style={s.circle}>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.subTitle}>{title}</Text>
      </View>
    </LinearGradient>
  );
}

function BottomNav({ active, go }) {
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

function SuccessCard({ amount, title, onBack }) {
  return (
    <View style={s.formCard}>
      <View style={s.successIcon}>
        <Ionicons name="checkmark" size={44} color="#fff" />
      </View>
      <Text style={s.successTitle}>{title}</Text>
      <Text style={s.successText}>(عملية تجريبية)</Text>
      <Text style={s.successAmount}>{fmt(amount)} د.ج</Text>
      <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }}>
        <LinearGradient colors={[BLUE, DEEP]} style={s.btn}>
          <Text style={s.btnText}>العودة للرئيسية</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- نافذة رمز QR الخاص بي ---------- */

function MyQrModal({ visible, onClose }) {
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

/* ---------- نافذة قراءة QR / الباركود ---------- */

function ScannerModal({ visible, onClose, onResult }) {
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

/* ---------- الشاشة الرئيسية ---------- */

function Home({ balance, transactions, go, onShowQr }) {
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyRip = async () => {
    await Clipboard.setStringAsync(RIP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const actions = [
    { icon: 'swap-horizontal', label: 'تحويل', screen: 'transfer' },
    { icon: 'document-text-outline', label: 'كشف الحساب', screen: 'statement' },
    { icon: 'qr-code-outline', label: 'دفع', screen: 'pay' },
    { icon: 'grid-outline', label: 'المزيد' },
  ];

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
      <LinearGradient
        colors={[DEEP, BLUE, GOLD]}
        locations={[0, 0.65, 1.15]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.header}
      >
        <View style={s.deco1} />
        <View style={s.deco2} />
        <View style={s.deco3} />
        <View style={s.topBar}>
          <View style={s.iconRow}>
            <View style={s.circle}>
              <Ionicons name="person-outline" size={20} color="#fff" />
            </View>
            <View style={s.circle}>
              <Ionicons name="notifications-outline" size={20} color={GOLD} />
            </View>
            <TouchableOpacity style={s.circleGold} onPress={onShowQr}>
              <Ionicons name="qr-code-outline" size={20} color={DEEP} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={s.greeting}>مرحبا يوسف</Text>
        <Text style={s.sub}>حسابك الجاري CCP</Text>
      </LinearGradient>

      <View style={s.card}>
        <Text style={s.label}>رقم الحساب الجاري (RIP) :</Text>
        <View style={s.accountRow}>
          <Text style={s.account}>{RIP_FORMATTED}</Text>
          <TouchableOpacity onPress={copyRip} style={s.copyBtn}>
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={18}
              color={copied ? GREEN : BLUE}
            />
            <Text style={[s.copyText, { color: copied ? GREEN : BLUE }]}>
              {copied ? 'تم النسخ' : 'نسخ'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={s.label}>الرصيد المتاح :</Text>
        <LinearGradient
          colors={[DEEP, BLUE]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.balanceBox}
        >
          <TouchableOpacity onPress={() => setHidden(!hidden)}>
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={24} color={GOLD} />
          </TouchableOpacity>
          <Text style={s.balance}>
            {hidden ? '••••••' : fmt(balance)}
            <Text style={s.currency}> د.ج</Text>
          </Text>
        </LinearGradient>
      </View>

      <View style={s.actions}>
        {actions.map((a) => (
          <TouchableOpacity
            key={a.label}
            style={s.action}
            onPress={() => a.screen && go(a.screen)}
          >
            <LinearGradient
              colors={[BLUE, DEEP]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.actionBox}
            >
              <Ionicons name={a.icon} size={26} color={GOLD} />
            </LinearGradient>
            <Text style={s.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>آخر العمليات</Text>
        <TouchableOpacity onPress={() => go('statement')}>
          <Text style={s.link}>عرض الكل</Text>
        </TouchableOpacity>
      </View>
      {transactions.slice(0, 3).map((t) => (
        <TxItem key={t.id} t={t} />
      ))}
    </ScrollView>
  );
}

/* ---------- شاشة التحويل ---------- */

function Transfer({ balance, onConfirm, onBack }) {
  const [rip, setRip] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanned, setScanned] = useState(false);

  const onScan = (p) => {
    setRip(groupRip(p.rip));
    if (p.amount) setAmount(String(p.amount));
    setScanned(true);
    setError('');
    setScanOpen(false);
  };

  const submit = () => {
    const clean = rip.replace(/\s/g, '');
    const value = parseFloat(amount.replace(',', '.'));
    if (!/^\d{20}$/.test(clean)) return setError('رقم الحساب (RIP) يجب أن يتكون من 20 رقماً');
    if (!value || value <= 0) return setError('أدخل مبلغاً صحيحاً');
    if (value > balance) return setError('الرصيد غير كافٍ');
    setError('');
    onConfirm(value, note.trim() || 'تحويل');
    setDone(value);
  };

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="تحويل أموال" onBack={onBack} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {done ? (
          <SuccessCard amount={done} title="تمت العملية بنجاح" onBack={onBack} />
        ) : (
          <View style={s.formCard}>
            <Text style={s.hint}>الرصيد المتاح: {fmt(balance)} د.ج</Text>

            <Text style={s.fieldLabel}>رقم حساب المستلم (RIP)</Text>
            <View style={s.ripRow}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                value={rip}
                onChangeText={(v) => {
                  setRip(v);
                  setScanned(false);
                }}
                keyboardType="number-pad"
                maxLength={24}
                placeholder="20 رقماً أو امسح الرمز"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity onPress={() => setScanOpen(true)}>
                <LinearGradient colors={[BLUE, DEEP]} style={s.scanBtn}>
                  <Ionicons name="scan" size={24} color={GOLD} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            {scanned ? <Text style={s.scanOk}>✓ تمت قراءة رقم الحساب من الرمز</Text> : null}

            <Text style={s.fieldLabel}>المبلغ (د.ج)</Text>
            <TextInput
              style={s.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
            />

            <Text style={s.fieldLabel}>ملاحظة (اختياري)</Text>
            <TextInput
              style={s.input}
              value={note}
              onChangeText={setNote}
              placeholder="مثال: إيجار"
              placeholderTextColor="#94A3B8"
            />

            {error ? <Text style={s.error}>{error}</Text> : null}

            <TouchableOpacity onPress={submit} style={{ marginTop: 16 }}>
              <LinearGradient colors={[BLUE, DEEP]} style={s.btn}>
                <Text style={s.btnText}>تأكيد التحويل</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <ScannerModal
        visible={scanOpen}
        onClose={() => setScanOpen(false)}
        onResult={onScan}
      />
    </View>
  );
}

/* ---------- شاشة الدفع بالمسح ---------- */

function Pay({ balance, onConfirm, onBack }) {
  const [scanOpen, setScanOpen] = useState(false);
  const [merchant, setMerchant] = useState(null);
  const [amount, setAmount] = useState('');
  const [fixed, setFixed] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const onScan = (p) => {
    setMerchant({ rip: p.rip, name: p.name || 'تاجر' });
    setAmount(p.amount ? String(p.amount) : '');
    setFixed(!!p.amount);
    setError('');
    setScanOpen(false);
  };

  const submit = () => {
    const value = parseFloat(amount.replace(',', '.'));
    if (!value || value <= 0) return setError('أدخل مبلغاً صحيحاً');
    if (value > balance) return setError('الرصيد غير كافٍ');
    setError('');
    onConfirm(value, `دفع إلى ${merchant.name}`);
    setDone(value);
  };

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="الدفع بالمسح" onBack={onBack} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {done ? (
          <SuccessCard amount={done} title="تم الدفع بنجاح" onBack={onBack} />
        ) : !merchant ? (
          <View style={s.formCard}>
            <View style={s.payIcon}>
              <Ionicons name="qr-code-outline" size={56} color={GOLD} />
            </View>
            <Text style={s.successTitle}>ادفع بمسح رمز التاجر</Text>
            <Text style={s.successText}>
              امسح رمز QR أو الباركود عند التاجر، ثم راجع المبلغ وأكّد الدفع
            </Text>
            <TouchableOpacity onPress={() => setScanOpen(true)} style={{ marginTop: 20 }}>
              <LinearGradient colors={[BLUE, DEEP]} style={s.btn}>
                <Text style={s.btnText}>مسح رمز الدفع</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.formCard}>
            <Text style={s.hint}>الرصيد المتاح: {fmt(balance)} د.ج</Text>

            <View style={s.merchantBox}>
              <View style={s.merchantIcon}>
                <Ionicons name="storefront-outline" size={26} color={GOLD} />
              </View>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={s.merchantName}>{merchant.name}</Text>
                <Text style={s.merchantRip}>{groupRip(merchant.rip)}</Text>
              </View>
            </View>

            <Text style={s.fieldLabel}>
              {fixed ? 'المبلغ المطلوب (د.ج)' : 'المبلغ (د.ج)'}
            </Text>
            <TextInput
              style={[s.input, fixed && { backgroundColor: '#E6EEFA' }]}
              value={amount}
              onChangeText={setAmount}
              editable={!fixed}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
            />

            {error ? <Text style={s.error}>{error}</Text> : null}

            <TouchableOpacity onPress={submit} style={{ marginTop: 16 }}>
              <LinearGradient colors={[BLUE, DEEP]} style={s.btn}>
                <Text style={s.btnText}>تأكيد الدفع</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setScanOpen(true)} style={{ marginTop: 14 }}>
              <Text style={[s.link, { textAlign: 'center' }]}>مسح رمز آخر</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <ScannerModal
        visible={scanOpen}
        onClose={() => setScanOpen(false)}
        onResult={onScan}
      />
    </View>
  );
}

/* ---------- شاشة كشف الحساب ---------- */

function Statement({ transactions, onBack }) {
  const [filter, setFilter] = useState('all');
  const list = transactions.filter((t) =>
    filter === 'all' ? true : filter === 'out' ? t.amount < 0 : t.amount > 0
  );
  const filters = [
    { key: 'all', label: 'الكل' },
    { key: 'out', label: 'المسحوبة' },
    { key: 'in', label: 'المستلمة' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <SubHeader title="كشف الحساب" onBack={onBack} />
      <View style={s.chips}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[s.chip, filter === f.key && s.chipActive]}
          >
            <Text style={[s.chipText, filter === f.key && { color: '#fff' }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {list.length === 0 ? (
          <Text style={s.empty}>لا توجد عمليات</Text>
        ) : (
          list.map((t) => <TxItem key={t.id} t={t} />)
        )}
      </ScrollView>
    </View>
  );
}

/* ---------- التطبيق ---------- */

export default function App() {
  const [screen, setScreen] = useState('home');
  const [balance, setBalance] = useState(125000);
  const [transactions, setTransactions] = useState(initialTx);
  const [showQr, setShowQr] = useState(false);

  const addOperation = (value, name) => {
    setBalance((b) => b - value);
    setTransactions((list) => [
      {
        id: Date.now(),
        name,
        date: new Date().toISOString().slice(0, 10),
        amount: -value,
      },
      ...list,
    ]);$
  };

  return (
    <View style={s.container}>
      <StatusBar style="light" />
      {screen === 'home' && (
        <Home
          balance={balance}
          transactions={transactions}
          go={setScreen}
          onShowQr={() => setShowQr(true)}
        />
      )}
      {screen === 'transfer' && (
        <Transfer
          balance={balance}
          onConfirm={addOperation}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'pay' && (
        <Pay balance={balance} onConfirm={addOperation} onBack={() => setScreen('home')} />
      )}
      {screen === 'statement' && (
        <Statement transactions={transactions} onBack={() => setScreen('home')} />
      )}
      <BottomNav active={screen} go={setScreen} />
      <MyQrModal visible={showQr} onClose={() => setShowQr(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header: { paddingTop: 56, paddingBottom: 56, paddingHorizontal: 16, overflow: 'hidden' },
  subHeader: { paddingTop: 52, paddingBottom: 28, paddingHorizontal: 16, overflow: 'hidden' },
  subRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  subTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  deco1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,184,0,0.16)', top: -70, left: -60 },
  deco2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.07)', top: 50, left: 110 },
  deco3: { position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,184,0,0.22)', bottom: -30, right: 40 },
  topBar: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 16 },
  iconRow: { flexDirection: 'row', gap: 8 },
  circle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,184,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  circleGold: { width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  greeting: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'right' },
  sub: { color: '#FFE08A', fontSize: 14, textAlign: 'right', marginTop: 4 },

  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: -32, borderRadius: 16, padding: 16, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, borderTopWidth: 3, borderTopColor: GOLD },
  label: { color: GRAY, fontSize: 14, textAlign: 'right', marginTop: 8 },
  accountRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  account: { color: DARK, fontSize: 18, fontWeight: '600', textAlign: 'right' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#E6EEFA' },
  copyText: { fontSize: 12, fontWeight: '600' },
  balanceBox: { marginTop: 8, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,184,0,0.65)' },
  balance: { color: '#fff', fontSize: 30, fontWeight: '800' },
  currency: { color: GOLD, fontSize: 18, fontWeight: '700' },

  actions: { flexDirection: 'row-reverse', justifyContent: 'space-around', marginTop: 24, paddingHorizontal: 8 },
  action: { alignItems: 'center', width: 76 },
  actionBox: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: GOLD, elevation: 4, shadowColor: BLUE, shadowOpacity: 0.3, shadowRadius: 6 },
  actionLabel: { color: DARK, fontSize: 12, marginTop: 8, textAlign: 'center', fontWeight: '600' },

  sectionHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 8, paddingHorizontal: 16 },
  sectionTitle: { color: DARK, fontSize: 18, fontWeight: '700' },
  link: { color: BLUE, fontSize: 14 },
  tx: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 8, padding: 12, borderRadius: 12 },
  txIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' },
  txName: { color: DARK, fontSize: 15, textAlign: 'right' },
  txDate: { color: GRAY, fontSize: 12, textAlign: 'right', marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700' },

  formCard: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, borderTopWidth: 3, borderTopColor: GOLD },
  hint: { color: BLUE, fontSize: 14, fontWeight: '600', textAlign: 'right' },
  fieldLabel: { color: GRAY, fontSize: 14, textAlign: 'right', marginTop: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: DARK, textAlign: 'right', backgroundColor: BG },
  ripRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  scanBtn: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: GOLD },
  scanOk: { color: GREEN, fontSize: 13, textAlign: 'right', marginTop: 6 },
  error: { color: RED, fontSize: 14, textAlign: 'right', marginTop: 12 },
  btn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: GOLD },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 8 },
  successTitle: { color: DARK, fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 16 },
  successText: { color: GRAY, fontSize: 13, textAlign: 'center', marginTop: 4 },
  successAmount: { color: BLUE, fontSize: 26, fontWeight: '800', textAlign: 'center', marginTop: 12 },

  payIcon: { width: 96, height: 96, borderRadius: 28, backgroundColor: DEEP, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 8, borderWidth: 2, borderColor: GOLD },
  merchantBox: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 16, padding: 12, borderRadius: 14, backgroundColor: '#E6EEFA', borderWidth: 1, borderColor: 'rgba(255,184,0,0.6)' },
  merchantIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: DEEP, alignItems: 'center', justifyContent: 'center' },
  merchantName: { color: DARK, fontSize: 17, fontWeight: '700', textAlign: 'right' },
  merchantRip: { color: GRAY, fontSize: 13, textAlign: 'right', marginTop: 2 },

  chips: { flexDirection: 'row-reverse', gap: 8, paddingHorizontal: 16, marginTop: 16, marginBottom: 4 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#E6EEFA' },
  chipActive: { backgroundColor: BLUE },
  chipText: { color: BLUE, fontSize: 14, fontWeight: '600' },
  empty: { color: GRAY, textAlign: 'center', marginTop: 40, fontSize: 15 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  qrCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', width: '100%', borderTopWidth: 4, borderTopColor: GOLD },
  qrTitle: { color: DARK, fontSize: 18, fontWeight: '700' },
  qrSub: { color: GRAY, fontSize: 13, textAlign: 'center', marginTop: 4 },
  qrBox: { marginTop: 16, padding: 14, borderRadius: 16, borderWidth: 2, borderColor: GOLD, backgroundColor: '#fff' },
  qrRip: { color: DARK, fontSize: 17, fontWeight: '600', marginTop: 14, marginBottom: 10 },

  permBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  permText: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 12 },
  scanOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  scanFrame: { width: 250, height: 250, borderRadius: 24, borderWidth: 3, borderColor: GOLD, backgroundColor: 'rgba(255,255,255,0.05)' },
  scanHint: { color: '#fff', fontSize: 15, marginTop: 20, textAlign: 'center' },
  scanError: { color: '#FCA5A5', fontSize: 14, marginTop: 10, textAlign: 'center', paddingHorizontal: 24 },
  scanClose: { position: 'absolute', top: 50, right: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },

  nav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#fff', flexDirection: 'row-reverse', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 12, elevation: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, borderTopWidth: 2, borderTopColor: GOLD },
  tab: { alignItems: 'center', width: 64 },
  tabLabel: { fontSize: 11, marginTop: 2 },
  activeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GOLD, marginTop: 3 },
  centerWrap: { marginTop: -28 },
  centerBtn: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: GOLD },
});