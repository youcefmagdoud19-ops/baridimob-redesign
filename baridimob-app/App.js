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
import Settings from './src/screens/Settings';
import Lock from './src/screens/Lock';
import BottomNav from './src/components/BottomNav';
import MyQrModal from './src/components/MyQrModal';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [userName, setUserName] = useState(USER_NAME);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [transactions, setTransactions] = useState(initialTx);
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
      }
      const pin = await hasPin();
      setPinEnabled(pin);
      setLocked(pin);
      setLoaded(true);
    })();
  }, []);

  // حفظ تلقائي عند أي تغيير (بعد انتهاء التحميل فقط)
  useEffect(() => {
    if (loaded) saveState({ userName, balance, transactions });
  }, [userName, balance, transactions, loaded]);

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
  };

  const goHome = () => setScreen('home');

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
          go={setScreen}
          onShowQr={() => setShowQr(true)}
        />
      )}
      {screen === 'transfer' && (
        <Transfer balance={balance} onConfirm={addOperation} onBack={goHome} />
      )}
      {screen === 'pay' && (
        <Pay balance={balance} onConfirm={addOperation} onBack={goHome} />
      )}
      {screen === 'statement' && (
        <Statement transactions={transactions} onBack={goHome} />
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
      <BottomNav active={screen} go={setScreen} />
      <MyQrModal visible={showQr} onClose={() => setShowQr(false)} />
    </View>
  );
}
