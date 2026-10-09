import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const KEY = 'baridimob:state:v1';
const PIN_KEY = 'baridimob_pin';
const FAIL_KEY = 'baridimob:pinfail:v1';

/* ---- البيانات العامة ---- */
export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function saveState(state) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    // تجاهل أخطاء الحفظ
  }
}

/* ---- رمز PIN (تخزين مشفّر عبر SecureStore) ---- */
export async function hasPin() {
  try {
    return !!(await SecureStore.getItemAsync(PIN_KEY));
  } catch (e) {
    return false;
  }
}

export async function clearFailures() {
  try {
    await AsyncStorage.removeItem(FAIL_KEY);
  } catch (e) {}
}

export async function setPin(pin) {
  await SecureStore.setItemAsync(PIN_KEY, pin);
  await clearFailures();
}

export async function verifyPin(pin) {
  try {
    const saved = await SecureStore.getItemAsync(PIN_KEY);
    return saved === pin;
  } catch (e) {
    return false;
  }
}

export async function removePin() {
  try {
    await SecureStore.deleteItemAsync(PIN_KEY);
  } catch (e) {}
  await clearFailures();
}

/* ---- حدّ المحاولات: كل 5 أخطاء تعطيل مؤقت (30 ث، ثم 60 ث، ثم 2 د ... حتى 15 د) ---- */
async function readFailures() {
  try {
    const raw = await AsyncStorage.getItem(FAIL_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { count: 0, until: 0 };
}

export async function getLockWait() {
  const info = await readFailures();
  return Math.max(0, Math.ceil((info.until - Date.now()) / 1000));
}

export async function checkPin(pin) {
  const info = await readFailures();
  const now = Date.now();
  if (info.until > now) {
    return { ok: false, locked: true, wait: Math.ceil((info.until - now) / 1000) };
  }
  if (await verifyPin(pin)) {
    await clearFailures();
    return { ok: true };
  }
  const count = (info.count || 0) + 1;
  let wait = 0;
  let until = 0;
  if (count % 5 === 0) {
    wait = Math.min(900, 30 * Math.pow(2, count / 5 - 1));
    until = now + wait * 1000;
  }
  try {
    await AsyncStorage.setItem(FAIL_KEY, JSON.stringify({ count, until }));
  } catch (e) {}
  return {
    ok: false,
    locked: wait > 0,
    wait,
    attemptsLeft: wait > 0 ? 0 : 5 - (count % 5),
  };
}
