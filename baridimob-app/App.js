import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { View, AppState } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';
import { s } from './src/styles';
import { USER_NAME, INITIAL_BALANCE, initialTx, REQUEST_STATUSES } from './src/data';
import { fmt } from './src/utils';
import { loadState, saveState, hasPin } from './src/storage';
import Home from './src/screens/Home';
import Transfer from './src/screens/Transfer';
import Pay from './src/screens/Pay';
import Statement from './src/screens/Statement';
import Cards from './src/screens/Cards';
import Settings from './src/screens/Settings';
import Lock from './src/screens/Lock';
import More from './src/screens/More';
import TopUp from './src/screens/TopUp';
import Bills from './src/screens/Bills';
import Cardless from './src/screens/Cardless';
import Requests from './src/screens/Requests';
import Templates from './src/screens/Templates';
import Info from './src/screens/Info';
import Notifications from './src/screens/Notifications';
import Profile from './src/screens/Profile';
import BottomNav from './src/components/BottomNav';
import MyQrModal from './src/components/MyQrModal';
import TxDetailModal from './src/components/TxDetailModal';
import ConfirmModal from './src/components/ConfirmModal';

const seedNotifications = () => [
  {
    id: 'welcome',
    title: 'مرحباً بك',
    body: 'هذه واجهة تجريبية لتطبيق بريدي موب، وكل البيانات وهمية.',
    time: new Date().toISOString(),
    read: false,
  },
];

export default function App() {
  const [screen, setScreen] = useState('home');
  const [userName, setUserName] = useState(USER_NAME);
  const [phone, setPhone] = useState('');
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [transactions, setTransactions] = useState(initialTx);
  const [cardFrozen, setCardFrozen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [prefill, setPrefill] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // الأمان
  const [pinEnabled, setPinEnabled] = useState(false);
  const [locked, setLocked] = useState(false);
  const [autoLockSec, setAutoLockSec] = useState(30);
  const [biometric, setBiometric] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [confirmWithPin, setConfirmWithPin] = useState(true);
  const [pending, setPending] = useState(null);
  const leftAt = useRef(null);

  // تحميل البيانات المحفوظة وحالة القفل عند فتح التطبيق
  useEffect(() => {
    (async () => {
      const saved = await loadState();
      if (saved) {
        if (typeof saved.userName === 'string' && saved.userName) setUserName(saved.userName);
        if (typeof saved.phone === 'string') setPhone(saved.phone);
        if (typeof saved.balance === 'number') setBalance(saved.balance);
        if (Array.isArray(saved.transactions)) setTransactions(saved.transactions);
        if (typeof saved.cardFrozen === 'boolean') setCardFrozen(saved.cardFrozen);
        if (Array.isArray(saved.templates)) setTemplates(saved.templates);
        if (Array.isArray(saved.requests)) setRequests(saved.requests);
        if (typeof saved.autoLockSec === 'number') setAutoLockSec(saved.autoLockSec);
        if (typeof saved.biometric === 'boolean') setBiometric(saved.biometric);
        if (typeof saved.privacy === 'boolean') setPrivacy(saved.privacy);
        if (typeof saved.confirmWithPin === 'boolean') setConfirmWithPin(saved.confirmWithPin);
        setNotifications(Array.isArray(saved.notifications) ? saved.notifications : seedNotifications());
      } else {
        setNotifications(seedNotifications());
      }
      const pin = await hasPin();
      setPinEnabled(pin);
      setLocked(pin);
      setLoaded(true);
    })();
  }, []);

  // حفظ تلقائي عند أي تغيير (بعد انتهاء التحميل فقط)
  useEffect(() => {
    if (loaded)
      saveState({
        userName,
        phone,
        balance,
        transactions,
        cardFrozen,
        templates,
        requests,
        notifications,
        autoLockSec,
        biometric,
        privacy,
        confirmWithPin,
      });
  }, [
    userName,
    phone,
    balance,
    transactions,
    cardFrozen,
    templates,
    requests,
    notifications,
    autoLockSec,
    biometric,
    privacy,
    confirmWithPin,
    loaded,
  ]);

  // قفل التطبيق عند العودة من الخلفية بعد المدة المحددة
  useEffect(() => {
    if (!pinEnabled) return undefined;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        leftAt.current = Date.now();
      } else if (state === 'active') {
        if (leftAt.current && (Date.now() - leftAt.current) / 1000 >= autoLockSec) setLocked(true);
        leftAt.current = null;
      }
    });
    return () => sub.remove();
  }, [pinEnabled, autoLockSec]);

  // منع لقطات الشاشة وإخفاء المحتوى في التطبيقات الأخيرة
  useEffect(() => {
    if (!loaded) return;
    const call = privacy
      ? ScreenCapture.preventScreenCaptureAsync()
      : ScreenCapture.allowScreenCaptureAsync();
    Promise.resolve(call).catch(() => {});
  }, [privacy, loaded]);

  // ---- الإشعارات ----
  const notify = (title, body) =>
    setNotifications((l) =>
      [
        {
          id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title,
          body,
          time: new Date().toISOString(),
          read: false,
        },
        ...l,
      ].slice(0, 50)
    );
  const readNotif = (id) =>
    setNotifications((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const readAll = () => setNotifications((l) => l.map((n) => ({ ...n, read: true })));
  const clearNotifs = () => setNotifications([]);
  const unread = notifications.filter((n) => !n.read).length;

  // ---- العمليات ----
  // خصم من الرصيد (قيمة سالبة = إضافة)
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
    ]);
    notify(value >= 0 ? 'عملية خصم' : 'عملية إيداع', `${name} • ${fmt(Math.abs(value))} د.ج`);
  };

  const resetData = () => {
    setUserName(USER_NAME);
    setPhone('');
    setBalance(INITIAL_BALANCE);
    setTransactions(initialTx);
    setCardFrozen(false);
    setTemplates([]);
    setRequests([]);
    setNotifications(seedNotifications());
  };

  // مراجعة العملية قبل التنفيذ (مع PIN إن كان مفعّلاً)
  const guard = (summary, action) => setPending({ id: Date.now(), summary, action });

  // ---- التنقل ----
  const go = (sc) => {
    setPrefill(null);
    setScreen(sc);
  };
  const goHome = () => go('home');
  const goMore = () => go('more');

  // نماذج العمليات
  const addTemplate = (t) => setTemplates((l) => [t, ...l]);
  const deleteTemplate = (id) => setTemplates((l) => l.filter((t) => t.id !== id));
  const useTemplate = (t) => {
    setPrefill(t);
    setScreen('transfer');
  };

  // طلبات دفتر الشيكات والبطاقة
  const submitRequest = (req, fee) => {
    setRequests((l) => [req, ...l]);
    notify('تم إرسال الطلب', req.title);
    if (fee > 0) addOperation(fee, 'رسوم البطاقة الذهبية');
  };
  const advanceRequest = (id) => {
    const r = requests.find((x) => x.id === id);
    if (!r || r.status >= 2) return;
    setRequests((l) => l.map((x) => (x.id === id ? { ...x, status: x.status + 1 } : x)));
    notify('تحديث الطلب', `${r.title}: ${REQUEST_STATUSES[r.status + 1]}`);
  };

  // أمان وبطاقة
  const handlePinChange = (enabled) => {
    setPinEnabled(enabled);
    if (!enabled) setBiometric(false);
    notify(enabled ? 'تم تفعيل رمز PIN' : 'تم إيقاف رمز PIN', 'تغيير في إعدادات الأمان');
  };
  const handleFreeze = (v) => {
    setCardFrozen(v);
    notify(v ? 'تم تجميد البطاقة' : 'تم إلغاء تجميد البطاقة', 'البطاقة الذهبية');
  };

  if (!loaded) return <View style={s.container} />;
  if (locked)
    return <Lock userName={userName} biometric={biometric} onUnlock={() => setLocked(false)} />;

  return (
    <View style={s.container}>
      <StatusBar style="light" />

      {screen === 'home' && (
        <Home
          userName={userName}
          balance={balance}
          transactions={transactions}
          unread={unread}
          go={go}
          onShowQr={() => setShowQr(true)}
          onOpenTx={setSelectedTx}
        />
      )}
      {screen === 'transfer' && (
        <Transfer
          balance={balance}
          prefill={prefill}
          guard={guard}
          onSaveTemplate={addTemplate}
          onConfirm={addOperation}
          onBack={goHome}
        />
      )}
      {screen === 'pay' && (
        <Pay
          balance={balance}
          cardFrozen={cardFrozen}
          guard={guard}
          onConfirm={addOperation}
          onBack={goHome}
        />
      )}
      {screen === 'statement' && (
        <Statement transactions={transactions} onOpen={setSelectedTx} onBack={goHome} />
      )}
      {screen === 'cards' && (
        <Cards userName={userName} frozen={cardFrozen} onToggleFreeze={handleFreeze} onBack={goHome} />
      )}
      {screen === 'settings' && (
        <Settings
          userName={userName}
          onSaveName={setUserName}
          pinEnabled={pinEnabled}
          onPinChange={handlePinChange}
          autoLockSec={autoLockSec}
          onAutoLock={setAutoLockSec}
          biometric={biometric}
          onBiometric={setBiometric}
          confirmWithPin={confirmWithPin}
          onConfirmWithPin={setConfirmWithPin}
          privacy={privacy}
          onPrivacy={setPrivacy}
          onReset={resetData}
          onBack={goHome}
        />
      )}
      {screen === 'notifications' && (
        <Notifications
          notifications={notifications}
          onRead={readNotif}
          onReadAll={readAll}
          onClear={clearNotifs}
          onBack={goHome}
        />
      )}
      {screen === 'profile' && (
        <Profile userName={userName} phone={phone} onSavePhone={setPhone} go={go} onBack={goHome} />
      )}

      {/* المزيد وخدماته */}
      {screen === 'more' && <More go={go} onShowQr={() => setShowQr(true)} onBack={goHome} />}
      {screen === 'topup' && (
        <TopUp balance={balance} guard={guard} onConfirm={addOperation} onBack={goMore} />
      )}
      {screen === 'bills' && (
        <Bills balance={balance} guard={guard} onConfirm={addOperation} onBack={goMore} />
      )}
      {screen === 'cardless' && (
        <Cardless balance={balance} guard={guard} onConfirm={addOperation} onBack={goMore} />
      )}
      {screen === 'cheque' && (
        <Requests
          type="cheque"
          requests={requests}
          balance={balance}
          guard={guard}
          onSubmit={submitRequest}
          onAdvance={advanceRequest}
          onBack={goMore}
        />
      )}
      {screen === 'cardreq' && (
        <Requests
          type="card"
          requests={requests}
          balance={balance}
          guard={guard}
          onSubmit={submitRequest}
          onAdvance={advanceRequest}
          onBack={goMore}
        />
      )}
      {screen === 'templates' && (
        <Templates
          templates={templates}
          onAdd={addTemplate}
          onDelete={deleteTemplate}
          onUse={useTemplate}
          onBack={goMore}
        />
      )}
      {screen === 'info' && <Info onBack={goMore} />}

      <BottomNav active={screen} go={go} />
      <MyQrModal visible={showQr} onClose={() => setShowQr(false)} />
      <TxDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      {pending ? (
        <ConfirmModal
          key={pending.id}
          summary={pending.summary}
          needPin={pinEnabled && confirmWithPin}
          biometric={biometric}
          onCancel={() => setPending(null)}
          onDone={() => {
            const action = pending.action;
            setPending(null);
            action();
          }}
        />
      ) : null}
    </View>
  );
}
