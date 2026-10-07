import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const KEY = 'baridimob:state:v1';
const PIN_KEY = 'baridimob_pin';

/* ---- البيانات العامة (الرصيد، العمليات، الاسم) ---- */
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
    // تجاهل أخطاء الحفظ في هذه المرحلة
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

export async function setPin(pin) {
  await SecureStore.setItemAsync(PIN_KEY, pin);
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
}
