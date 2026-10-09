import * as LocalAuthentication from 'expo-local-authentication';

export async function biometricAvailable() {
  try {
    const hw = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return !!(hw && enrolled);
  } catch (e) {
    return false;
  }
}

export async function authenticate(message) {
  try {
    const r = await LocalAuthentication.authenticateAsync({
      promptMessage: message,
      cancelLabel: 'إلغاء',
      disableDeviceFallback: true,
    });
    return !!r.success;
  } catch (e) {
    return false;
  }
}
