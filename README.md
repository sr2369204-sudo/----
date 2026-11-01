# مصحف

تطبيق React Native وExpo عربي لقراءة القرآن. يبدأ المشروع بقاعدة موثوقة ومحتوى مصدره خادم موثق؛ لا يحتوي حاليًا على نص قرآني أو تلاوات افتراضية.

## التشغيل

```bash
npm install
npx expo start
```

لإنشاء حزمة Android للتطوير:

```bash
npx expo run:android
```

يلزم Android SDK وADB للبناء المحلي على جهاز أو محاكي. لم تكن أدوات Android متاحة في بيئة التهيئة الحالية.

## إعداد مصدر المحتوى لأول مرة

1. أنشئ تطبيقًا من نوع **Backend/server app** في [Quran Foundation Developer Console](https://dev-console.quran.foundation/projects/new) واحصل على بيانات pre-live.
2. انسخ `backend/.env.example` إلى `backend/.env` وأضف بيانات الاعتماد. في PowerShell:

```powershell
Copy-Item backend\.env.example backend\.env
```

3. ثبّت اعتماد الخادم مرة واحدة وشغّله في طرفية:

   ```bash
   npm --prefix backend install
   npm run backend
   ```

4. في طرفية ثانية، انسخ `.env.example` إلى `.env` في جذر المشروع، ثم شغّل Expo من جديد:

   ```powershell
   Copy-Item .env.example .env
   npx expo start --web
   ```

أضف `QF_CLIENT_ID` و`QF_CLIENT_SECRET` إلى `backend/.env` بعد الحصول عليهما. الخادم المحلي يستخدم SDK الرسمي، وبيانات الاعتماد محفوظة في `backend/.env` فقط. لا تشاركها ولا تضعها في متغيرات `EXPO_PUBLIC_*`. بيئة pre-live مخصصة للتطوير، والمحتوى المتاح فيها الفاتحة والبقرة فقط؛ المحتوى الكامل يحتاج موافقة وصول production. الإصدار الظاهر في التطبيق هو إصدار API (v4)، وليس checksum أو إصدارًا مستقلًا للقرآن.

لمزيد من التفاصيل راجع [docs/api-integrations.md](./docs/api-integrations.md)؛ يُظهر التطبيق رسالة إعداد واضحة حتى يُضبط الخادم بدل اختلاق قائمة للسور.

## التحقق

```bash
npx tsc --noEmit
npm run lint
npm test
npm run backend:test
```

راجع [حالة التنفيذ](./docs/implementation-status.md) و[مصادر البيانات](./docs/data-sources.md) و[الترخيص](./docs/licensing.md) قبل إضافة محتوى أو نشر التطبيق.
