# Nurshahar — Arduino orqali shaharni qutqar

Arduino’da haqiqiy elektron sxema yig’ib, uni USB orqali Google Chrome’ga
ulaysiz. Har bir sxema — o‘z signalini beradi — va o‘sha signal ekrandagi
**Nurshahar** nomli virtual shaharning mos qismini jonlantiradi: chiroq
yonadi, ko‘prik ochiladi, svetofor ishga tushadi, sirena chaladi...

20 ta mustaqil sxema — bitta uzluksiz hikoyada bog‘langan. Meteor yomg‘iri
shaharni quvvatsiz qoldirgan; siz — yosh muhandis — tizimlarni birma-bir
tiklaysiz va oxirida shaharni yakuniy meteor hujumidan qutqarasiz.

## Qanday ishlaydi

```
[Arduino sxemasi] --USB(Serial, 9600 baud)--> [Chrome, Web Serial API] --> [Canvas shahar animatsiyasi]
```

Arduino har bir bosqichda oddiy matnli signal yuboradi:

```
EVT:<bosqich_raqami>:<qiymat>
```

Masalan `EVT:1:1` — 1-bosqich tugmasi bosilgani, `EVT:9:32.50` — 9-bosqich
harorat sensori 32.5°C o‘qigani. Brauzer tomonidagi kod (`web/src/stages.js`)
shu signalni tegishli shahar animatsiyasiga aylantiradi va progressni saqlaydi.

**Web Serial faqat Google Chrome yoki Microsoft Edge’da ishlaydi** (Firefox/Safari
qo‘llamaydi) va `https://` yoki `http://localhost` kabi “xavfsiz kontekst”da
ochilishi kerak.

## Ishga tushirish

Alohida build vositasi (Vite/webpack) kerak emas — oddiy statik sahifa:

```bash
cd web
python3 -m http.server 8080
# yoki: npx serve .
```

So‘ng brauzerda **http://localhost:8080** ochiladi. “Arduino ni ulash”
tugmasini bosib, mos USB portni tanlang.

### Arduino ulanmasdan sinash

Har bir bosqich panelida **“Simulyatsiya”** tugmasi bor — u haqiqiy Arduino
signalini taqlid qiladi, shuning uchun hikoyani hardware ulanmasdan turib
ham tekshirish mumkin.

## Loyiha tuzilishi

```
arduino/                20 ta mustaqil Arduino sketch (.ino), bosqichlar bo'yicha papkalarga bo'lingan
web/
  index.html             Sahifa skeleti
  styles.css              Premium tungi/neon dizayn
  src/city.js             Canvas asosidagi "Nurshahar" render dvigateli
  src/stages.js           20 bosqichning hikoyasi, sxema/ulash ko'rsatmalari va signal ishlov beruvchilari
  src/serial.js            Web Serial ulanishi va protokolni parslash
  src/story.js             Progress: qaysi bosqich ochiq/tugallangan (localStorage)
  src/main.js              Hammasini bog'lovchi UI kodi
```

## 20 bosqich

| # | Nomi | Asosiy komponent | Arduino pin(lar) | Shaharda nima bo'ladi |
|---|------|------------------|-------------------|------------------------|
| 1 | Markaziy nazorat kaliti | Tugma + LED | D2 (tugma), D8 (LED) | Boshqaruv markazi va birinchi derazalar yonadi |
| 2 | Yorug'lik boshqaruvi | Potentsiometr + LED (PWM) | A0, D9 | Mavze yorug'ligi asta kuchayadi |
| 3 | Avtomatik ko'cha chirog'i | LDR (fotorezistor) + LED | A1, D10 | Ko'cha chiroqlari qorong'ida o'zi yonadi |
| 4 | Ogohlantirish signali | Buzzer + tugma | D8, D2 | Sirena minorasi ishga tushadi |
| 5 | Svetofor tizimi | RGB LED | D9/D10/D11 | Yo'l svetofori va mashinalar harakati |
| 6 | Ko'prik darvozasi | Servo motor | D9 | Ko'prik darvozasi ochiladi |
| 7 | Himoya devori (Shield) | HC-SR04 ultratovush | D6/D7 | Meteor yaqinlashsa himoya maydoni yonadi |
| 8 | Xavfsizlik nazorati | PIR harakat sensori | D4 | Qo'riqlash minorasi prujektori yonadi |
| 9 | Ob-havo stansiyasi | DHT11 harorat sensori | D2 | Bulut va chaqmoq effekti |
| 10 | Zilzila sensori | SW-420 tebranish sensori | D3 | Shahar silkinadi, keyin tuzatiladi |
| 11 | Yong'in signalizatsiyasi | Flame/IR sensor | D5 | Bino yong'ini o'chadi |
| 12 | Gaz oqishi nazorati | MQ-2 gaz sensori | A2 | Zavod shamollatish tizimi yoqiladi |
| 13 | Ovozli boshqaruv (favvora) | Ovoz/mikrofon sensori | D4 | Bog' favvorasi yonadi |
| 14 | Yomg'ir nazorati | Yomg'ir sensori | A3 | Stadion tomi yopiladi |
| 15 | Xavfsiz eshik (Vault) | Reed switch (magnit) | D5 | Quvvat ombori eshigi ochiladi |
| 16 | Radar boshqaruvi | Joystick modul | A4 | Radar antennasi aylanadi |
| 17 | Uchirish (countdown) | Tugma + 7-segment | D2 | Himoya yo'ldoshi uchiriladi |
| 18 | Masofadan boshqaruv markazi | IR qabul qiluvchi + pult | D11 | Markazdan boshqaruv signali |
| 19 | Yadro reaktori (2 kalit) | 2x Tugma | D2, D3 | Ikkalasi bosilsagina reaktor ochiladi |
| 20 | Yakuniy himoya — Shahar yadrosi | LDR+tugma+buzzer+servo+RGB | A1,D2,D8,D9,D10-12 | Yakuniy meteor hujumi qaytariladi, shahar qutqariladi |

Har bir bosqichning to'liq ulash ko'rsatmasi ilova ichida (web sahifaning
o'ng panelida) va tegishli `arduino/NN_.../*.ino` faylining boshidagi
izohda keltirilgan.

## Arduino tomoni: umumiy qoidalar

- Har bir sketch `Serial.begin(9600);` bilan boshlanadi — brauzer tomoni ham
  9600 baud kutadi.
- Signal faqat holat **o'zgarganda** yuboriladi (keraksiz oqimni oldini olish uchun).
- Ba'zi sensorlar (flame, rain) modulga qarab teskari logikada ishlashi mumkin —
  shunday holat uchun sketch ichida moslash uchun bitta o'zgaruvchi bor (masalan
  `FLAME_ACTIVE_LOW`).
- 9-bosqich `DHT sensor library` (Adafruit), 18-bosqich `IRremote` kutubxonasini
  talab qiladi — ikkalasi ham Arduino IDE Library Manager orqali o'rnatiladi.

## Kengaytirish

Yangi bosqich qo'shish uchun:
1. `web/src/stages.js` ga yangi obyekt qo'shing (`id`, `title`, `wiring`, `parse`, `isComplete`).
2. `web/src/city.js` da tegishli chizish funksiyasini yozing va `state` ga kerakli maydonlarni qo'shing.
3. `arduino/` ostida mos `.ino` sketch yarating va `EVT:<id>:<qiymat>` formatida signal yuboring.
