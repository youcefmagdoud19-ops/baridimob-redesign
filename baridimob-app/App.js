import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { s } from './src/styles';
import { USER_NAME, INITIAL_BALANCE, initialTx } from './src/data';
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
import BottomNav from './src/components/BottomNav';
import MyQrModal from './src/components/MyQrModal';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [userName, setUserName] = useState(USER_NAME);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [transactions, setTransactions] = useState(initialTx);
  const [cardFrozen, setCardFrozen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [requests, setRequests] = useState([]);
  const [prefill, setPrefill] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [locked, setLocked] = useState(false);

  // تحميل البيانات المحفوظة وحالة القفل عند فتح التطبيق
  useEffect(() => {
    (async () => {
      const saved = await loadState();
      if (saved) {
        if (typeof saved.userName === 'string' && saved.userName) setUserName(saved.userName);
        if (typeof saved.balance === 'number') setBalance(saved.balance);
        if (Array.isArray(saved.transactions)) setTransactions(saved.transactions);
        if (typeof saved.cardFrozen === 'boolean') setCardFrozen(saved.cardFrozen);
        if (Array.isArray(saved.templates)) setTemplates(saved.templates);
        if (Array.isArray(saved.requests)) setRequests(saved.requests);
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
      saveState({ userName, balance, transactions, cardFrozen, templates, requests });
  }, [userName, balance, transactions, cardFrozen, templates, requests, loaded]);

  // عملية خصم من الرصيد (قيمة سالبة = إضافة)
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
  };

  const resetData = () => {
    setUserName(USER_NAME);
    setBalance(INITIAL_BALANCE);
    setTransactions(initialTx);
    setCardFrozen(false);
    setTemplates([]);
    setRequests([]);
  };

  // التنقل
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
    if (fee > 0) addOperation(fee, 'رسوم البطاقة الذهبية');
  };
  const advanceRequest = (id) =>
    setRequests((l) =>
      l.map((r) => (r.id === id ? { ...r, status: Math.min(r.status + 1, 2) } : r))
    );

  if (!loaded) return <View style={s.container} />;
  if (locked) return <Lock userName={userName} onUnlock={() => setLocked(false)} />;

  return (
    <View style={s.container}>
      <StatusBar style="light" />

      {screen === 'home' && (
        <Home
          userName={userName}
          balance={balance}
          transactions={transactions}
          go={go}
          onShowQr={() => setShowQr(true)}
        />
      )}
      {screen === 'transfer' && (
        <Transfer
          balance={balance}
          prefill={prefill}
          onSaveTemplate={addTemplate}
          onConfirm={addOperation}
          onBack={goHome}
        />
      )}
      {screen === 'pay' && (
        <Pay balance={balance} cardFrozen={cardFrozen} onConfirm={addOperation} onBack={goHome} />
      )}
      {screen === 'statement' && <Statement transactions={transactions} onBack={goHome} />}
      {screen === 'cards' && (
        <Cards
          userName={userName}
          frozen={cardFrozen}
          onToggleFreeze={setCardFrozen}
          onBack={goHome}
        />
      )}
      {screen === 'settings' && (
        <Settings
          userName={userName}
          onSaveName={setUserName}
          pinEnabled={pinEnabled}
          onPinChange={setPinEnabled}
          onReset={resetData}
          onBack={goHome}
        />
      )}

      {/* المزيد وخدماته */}
      {screen === 'more' && (
        <More go={go} onShowQr={() => setShowQr(true)} onBack={goHome} />
      )}
      {screen === 'topup' && <TopUp balance={balance} onConfirm={addOperation} onBack={goMore} />}
      {screen === 'bills' && <Bills balance={balance} onConfirm={addOperation} onBack={goMore} />}
      {screen === 'cardless' && (
        <Cardless balance={balance} onConfirm={addOperation} onBack={goMore} />
      )}
      {screen === 'cheque' && (
        <Requests
          type="cheque"
          requests={requests}
          balance={balance}
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
      {screen === 'info' && <Info onBack={goHome} />}

      <BottomNav active={screen} go={go} />
      <MyQrModal visible={showQr} onClose={() => setShowQr(false)} />
    </View>
  );
}
