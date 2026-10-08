# BaridiMob Demo (واجهة تجريبية)

تطبيق Expo / React Native تجريبي بواجهة عربية RTL (أزرق وذهبي). كل البيانات وهمية.

## التثبيت على مشروع Expo جديد

1. أنشئ المشروع:
   npx create-expo-app@latest baridimob-app --template blank
2. فك ضغط هذا الملف داخل مجلد المشروع (يستبدل App.js ويضيف مجلد src).
3. ثبّت الحزم من داخل مجلد المشروع:
   npx expo install expo-linear-gradient expo-clipboard expo-camera react-native-svg @react-native-async-storage/async-storage expo-secure-store
   npm install react-native-qrcode-svg
4. شغّل:
   npx expo start -c
   (أو npx expo start --tunnel إن لم يتصل الهاتف)

## الهيكل

App.js              الحالة العامة والتنقل بين الشاشات
src/theme.js        الألوان
src/data.js         الاسم، RIP، الرصيد، العمليات، بيانات البطاقة، التبويبات
src/utils.js        تنسيق الأرقام وقراءة محتوى رمز QR
src/styles.js       الأنماط المشتركة
src/storage.js      الحفظ المحلي + رمز PIN (SecureStore)
src/components/     TxItem, SubHeader, BottomNav, SuccessCard, MyQrModal,
                    ScannerModal, PinPad, PinModal
src/screens/        Home, Transfer, Pay, Statement, Cards, Settings, Lock,
                    More, TopUp, Bills, Cardless, Requests, Templates, Info

## صيغة رمز الدفع التجريبي

BARIDI|RIP(20 رقماً)|المبلغ|اسم التاجر
مثال: BARIDI|00799999000987654321|2500|مخبزة الأمل
(المبلغ اختياري: اتركه فارغاً ليدخله المستخدم)

## خدمات قائمة المزيد (كلها تجريبية)

دفع الفواتير (سونلغاز، سيال، الجزائرية للمياه، اتصالات الجزائر) | شحن الهاتف (موبيليس، جيزي، أوريدو)
الدفع بالمسح | سحب بدون بطاقة | دفتر الشيكات | طلب/تجديد البطاقة الذهبية | نماذج العمليات
رمز QR الحساب | الموزعات الآلية ومكاتب البريد (تفتح تطبيق الخرائط) | معلومات مفيدة
