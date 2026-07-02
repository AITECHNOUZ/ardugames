// The 20-stage story registry: "Nurshahar" (City of Light).
// Each stage = one real Arduino circuit. When it fires the correct serial
// event, the matching part of the virtual city reacts. Everything here is
// pure data + small pure functions so main.js / city.js stay simple.

export const STORY_TITLE = "Nurshahar: So'nggi Yorug'lik";

export const STORY_INTRO = `Osmondan meteor yomg'iri yog'ildi. Nurshahar — barcha tizimlari avtomatik
ishlaydigan aqlli shahar — quvvatsiz qoldi. Sen — yosh muhandis — Arduino orqali
shahar tizimlarini birma-bir tiklaysan. Har bir sxemani to'g'ri yig'ib, signalni
ishga tushirganingda, o'sha signal USB orqali shu yerdagi virtual shaharga yetib boradi
va shaharning mos qismi jonlanadi. 20-bosqichda esa shahar yakuniy meteor
hujumiga qarshi turadi.`;

export const STAGES = [
  {
    id: 1,
    key: 'control_key',
    icon: '💡',
    focus: { x: 150, y: 380, zoom: 2.1 },
    title: 'Markaziy nazorat kaliti',
    subtitle: "Tugma bosilganda LED yonadi — shahar boshqaruv markazi qayta ishga tushadi.",
    dashboard: { type: 'boolean', onLabel: 'YONIQ', offLabel: "O'CHIQ" },
    components: ['Arduino Uno', '1x Push-button', '1x LED (sariq)', '1x 220Ω rezistor', 'Simlar'],
    wiring: [
      'LED anodini (uzun oyoq) 220Ω rezistor orqali 8-pinga ulang, katodni GND ga.',
      'Tugmani 2-pin va GND orasiga ulang (INPUT_PULLUP ishlatiladi).',
      'Arduino ni USB orqali kompyuterga ulang.',
    ],
    story: {
      intro: 'Boshqaruv markazi qorong\'i turibdi. Tugmani bos — birinchi chiroqni yoq.',
      complete: 'Boshqaruv markazi jonlandi! Turar-joy mavzesida birinchi derazalar yondi.',
    },
    parse(payload, city) {
      const on = payload === '1';
      city.state.controlKeyOn = on;
      return on;
    },
    isComplete: (s) => s.controlKeyOn === true,
  },
  {
    id: 2,
    key: 'light_dimmer',
    icon: '🔆',
    focus: { x: 500, y: 400, zoom: 1.4 },
    title: "Yorug'lik boshqaruvi",
    subtitle: 'Potentsiometr bilan LED yorqinligini boshqar — mavze yorug\'ligi shunga mos o\'zgaradi.',
    dashboard: { type: 'analog', min: 0, max: 255, unit: '', label: 'Yorqinlik' },
    components: ['Arduino Uno', '1x Potentsiometr (10k)', '1x LED', '1x 220Ω rezistor'],
    wiring: [
      'Potentsiometr chekka oyoqlarini 5V va GND ga, o\'rta oyoqni A0 ga ulang.',
      'LED ni 220Ω orqali 9-pinga (PWM) ulang.',
      'Kodni yuklab, potentsiometrni burab ko\'r.',
    ],
    story: {
      intro: 'Quvvat past. Dimmer bilan mavze yorug\'ligini asta-sekin ko\'tar.',
      complete: 'Mavze to\'liq yoritildi — energiya tarmog\'i barqaror ishlayapti.',
    },
    parse(payload, city) {
      const v = clampNum(Number(payload), 0, 255);
      city.state.brightness = v / 255;
      return v > 200;
    },
    isComplete: (s) => s.brightness > 0.78,
  },
  {
    id: 3,
    key: 'auto_streetlamp',
    icon: '🌙',
    focus: { x: 350, y: 450, zoom: 1.8 },
    title: "Avtomatik ko'cha chirog'i",
    subtitle: "Fotorezistor (LDR) qorong'ilikni sezib, ko'cha chiroqlarini avtomatik yoqadi.",
    dashboard: { type: 'boolean', onLabel: "QORONG'I — YONDI", offLabel: 'YORUG\'' },
    components: ['Arduino Uno', '1x LDR (fotorezistor)', '1x 10k rezistor', '1x LED'],
    wiring: [
      'LDR va 10kΩ rezistorni kuchlanish bo\'luvchi (voltage divider) sifatida A1 ga ulang.',
      'LED ni 220Ω orqali 10-pinga ulang.',
      'LDR ustini qo\'l bilan yopib qorong\'i qilib ko\'r.',
    ],
    story: {
      intro: 'Kech tushmoqda. LDR ustini yoping — ko\'cha chiroqlari o\'zi yonishi kerak.',
      complete: "Ko'cha yoritish tizimi avtomatik rejimga o'tdi. Yo'llar endi xavfsiz.",
    },
    parse(payload, city) {
      const dark = payload === '1';
      city.state.autoLampsOn = dark;
      return dark;
    },
    isComplete: (s) => s.autoLampsOn === true,
  },
  {
    id: 4,
    key: 'siren',
    icon: '🚨',
    focus: { x: 300, y: 220, zoom: 2.3 },
    title: 'Ogohlantirish signali',
    subtitle: "Buzzer orqali shahar sirenasini yoq — meteor yaqinlashayotgani haqida ogohlantirish.",
    dashboard: { type: 'boolean', onLabel: 'SIRENA FAOL', offLabel: 'JIM' },
    components: ['Arduino Uno', '1x Passiv buzzer', '1x Push-button'],
    wiring: [
      'Buzzer bir oyog\'ini 8-pinga, ikkinchisini GND ga ulang.',
      'Tugmani 2-pin va GND orasiga ulang (INPUT_PULLUP).',
      'Tugmani bosib turganda sirena ovoz chiqarishi kerak.',
    ],
    story: {
      intro: 'Radar meteor to\'dasini payqadi. Sirenani ishga tushir!',
      complete: 'Sirena butun shaharga signal berdi — aholi tayyorgarlik ko\'rmoqda.',
    },
    parse(payload, city) {
      const on = payload === '1';
      city.state.sirenOn = on;
      return on;
    },
    isComplete: (s) => s.sirenOn === true,
  },
  {
    id: 5,
    key: 'traffic_light',
    icon: '🚦',
    focus: { x: 340, y: 460, zoom: 2.1 },
    title: 'Svetofor tizimi',
    subtitle: "RGB LED qizil-sariq-yashil tartibida yonib, yo'l harakatini boshqaradi.",
    dashboard: { type: 'enum', labels: ['Qizil', 'Sariq', 'Yashil'], colors: ['#ff4d4d', '#ffd23f', '#3fff7a'] },
    components: ['Arduino Uno', '1x RGB LED (umumiy katod)', '3x 220Ω rezistor'],
    wiring: [
      'RGB LED ning R,G,B oyoqlarini 220Ω orqali 9,10,11-pinlarga ulang.',
      'Umumiy katodni GND ga ulang.',
      'Kod avtomatik ravishda qizil→sariq→yashil aylanadi.',
    ],
    story: {
      intro: 'Yo\'llar tartibsiz. Svetoforni ishga tushirib mashinalar harakatini tartibga sol.',
      complete: "Svetofor tizimi ishga tushdi — ko'chalarda tartib qaror topdi.",
    },
    parse(payload, city) {
      const phase = clampNum(Number(payload), 0, 2);
      city.state.trafficOn = true;
      city.state.trafficPhase = phase;
      return true;
    },
    isComplete: (s) => s.trafficOn === true,
  },
  {
    id: 6,
    key: 'bridge_gate',
    icon: '🌉',
    focus: { x: 800, y: 480, zoom: 1.8 },
    title: "Ko'prik darvozasi",
    subtitle: 'Servo motor ko\'prik darvozasini ochadi — kemalar o\'tishi mumkin.',
    dashboard: { type: 'analog', min: 0, max: 180, unit: '°', label: 'Servo burchagi' },
    components: ['Arduino Uno', '1x Servo motor (SG90)', '1x Potentsiometr (ixtiyoriy)'],
    wiring: [
      'Servo signal simini 9-pinga, quvvat va GND ni mos ulang.',
      'Ixtiyoriy: potentsiometrni A0 ga ulab burchakni qo\'lda boshqaring.',
      'Servo 0° dan 180° gacha aylanishi darvoza ochilishini bildiradi.',
    ],
    story: {
      intro: "Ko'prik yopiq. Servo bilan darvozani asta oching.",
      complete: "Ko'prik to'liq ochildi — yordam kemalari shaharga kira oladi.",
    },
    parse(payload, city) {
      const angle = clampNum(Number(payload), 0, 180);
      city.state.bridgeOpen = angle / 180;
      return angle > 150;
    },
    isComplete: (s) => s.bridgeOpen > 0.85,
  },
  {
    id: 7,
    key: 'shield_wall',
    icon: '🛡️',
    focus: { x: 520, y: 300, zoom: 1.5 },
    title: 'Himoya devori (Shield)',
    subtitle: 'Ultratovush sensor (HC-SR04) masofani o\'lchab, meteor yaqinlashganda himoya maydonini yoqadi.',
    dashboard: { type: 'analog', min: 0, max: 200, unit: 'sm', label: 'Masofa', dangerZone: (v) => v < 15 },
    components: ['Arduino Uno', '1x HC-SR04 ultratovush sensor'],
    wiring: [
      'VCC→5V, GND→GND, TRIG→7-pin, ECHO→6-pin.',
      'Sensor oldiga qo\'lingizni tutib, asta yaqinlashtiring.',
      '15 sm dan yaqinlashganda himoya maydoni faollashadi.',
    ],
    story: {
      intro: "Meteor yaqinlashmoqda — masofani kuzatib, kritik nuqtada himoya maydonini yoq.",
      complete: 'Himoya maydoni faollashdi! Markaziy minora meteordan himoyalandi.',
    },
    parse(payload, city) {
      const cm = clampNum(Number(payload), 0, 200);
      city.state.asteroidDistance = clampNum(cm / 120, 0, 1);
      const shield = cm < 15;
      city.state.shieldOn = shield;
      return shield;
    },
    isComplete: (s) => s.shieldOn === true,
  },
  {
    id: 8,
    key: 'security_watch',
    icon: '🎥',
    focus: { x: 150, y: 180, zoom: 2.1 },
    title: 'Xavfsizlik nazorati',
    subtitle: 'PIR harakat sensori odam/harakatni sezganda qo\'riqlash minorasi yoriti sochib boshlaydi.',
    dashboard: { type: 'boolean', onLabel: 'HARAKAT BOR', offLabel: 'TINCH' },
    components: ['Arduino Uno', '1x PIR harakat sensori (HC-SR501)'],
    wiring: [
      'PIR VCC→5V, GND→GND, OUT→4-pin.',
      'Sensor oldida qo\'lingizni harakatlantiring.',
      'Harakat sezilsa, LED/serial signal yoqiladi.',
    ],
    story: {
      intro: "Notanish harakat qayd etilmoqda. Kuzatuv minorasini faollashtir.",
      complete: 'Kuzatuv tizimi ishga tushdi — shahar butun perimetri nazoratda.',
    },
    parse(payload, city) {
      const on = payload === '1';
      city.state.securityOn = on;
      return on;
    },
    isComplete: (s) => s.securityOn === true,
  },
  {
    id: 9,
    key: 'weather_station',
    icon: '⛈️',
    focus: { x: 670, y: 150, zoom: 1.8 },
    title: 'Ob-havo stansiyasi',
    subtitle: 'DHT11 harorat sensori orqali atmosfera holatini kuzatib, chaqmoq bo\'ronini bashorat qil.',
    dashboard: { type: 'analog', min: 0, max: 50, unit: '°C', label: 'Harorat', decimals: 1, dangerZone: (v) => v > 30 },
    components: ['Arduino Uno', '1x DHT11 harorat/namlik sensori'],
    wiring: [
      'DHT11 VCC→5V, GND→GND, DATA→2-pin (10kΩ pull-up bilan).',
      'Sensorni qo\'l bilan isitib (nafas bilan) haroratni oshiring.',
      '30°C dan yuqori bo\'lsa bo\'ron signali yuboriladi.',
    ],
    story: {
      intro: "Atmosfera beqaror. Harorat sensori orqali bo'ronni kuzat.",
      complete: "Ob-havo stansiyasi ma'lumot bermoqda — bo'ron oldindan bashorat qilindi.",
    },
    parse(payload, city) {
      const temp = Number(payload);
      city.state.weatherTemp = temp;
      if (temp > 30) city.triggerLightning();
      return temp > 30;
    },
    isComplete: (s) => s.weatherTemp !== null && s.weatherTemp > 30,
  },
  {
    id: 10,
    key: 'quake_sensor',
    icon: '🌍',
    focus: { x: 500, y: 470, zoom: 1.15 },
    title: 'Zilzila sensori',
    subtitle: 'Tebranish sensori (SW-420) zarba/tebranishni sezib, yer qimirlashini aniqlaydi.',
    dashboard: { type: 'event', label: 'Tebranish kutilmoqda...' },
    components: ['Arduino Uno', '1x SW-420 tebranish (vibration) sensori'],
    wiring: [
      'VCC→5V, GND→GND, DO→3-pin.',
      'Sensorni yengil silkiting yoki stolga uring.',
      'Tebranish sezilsa signal yuboriladi.',
    ],
    story: {
      intro: 'Meteor zarbasi tuproqni tebratmoqda. Sensor buni tasdiqlashi kerak.',
      complete: "Zilzila o'tdi — muhandislik xizmatlari yoriqlarni tezda ta'mirladi.",
    },
    parse(payload, city) {
      if (payload === '1') {
        city.triggerQuake();
        city.state._quakeSeen = true;
        return true;
      }
      return false;
    },
    isComplete: (s) => s._quakeSeen === true,
  },
  {
    id: 11,
    key: 'fire_alarm',
    icon: '🔥',
    focus: { x: 608, y: 360, zoom: 1.8 },
    title: 'Yong\'in signalizatsiyasi',
    subtitle: "Alanga (flame) sensori yong'inni aniqlaydi — o'chirilgach bino xavfsiz bo'ladi.",
    dashboard: { type: 'boolean', onLabel: 'ALANGA BOR', offLabel: 'XAVFSIZ', dangerWhenOn: true },
    components: ['Arduino Uno', '1x Flame/IR alanga sensori', '1x LED (qizil)'],
    wiring: [
      'Sensor VCC→5V, GND→GND, DO→5-pin.',
      'Yong\'in manbai (masalan, yoqilgan gugurt yoki qizil LED) sensorga yaqinlashtiring.',
      'Alanga yo\'qolganda (masofani uzoqlashtirganda) signal 0 ga tushadi.',
    ],
    story: {
      intro: 'Markaziy bino alanga sensori signalini bermoqda — yong\'in xavfi bor.',
      complete: "Yong'in o'chirildi. Bino butunlay xavfsiz holatga qaytdi.",
    },
    parse(payload, city) {
      const flame = payload === '1';
      city.state.fireLevel = flame ? 1 : 0;
      return !flame;
    },
    isComplete: (s) => s.fireLevel <= 0.02,
  },
  {
    id: 12,
    key: 'gas_leak',
    icon: '🏭',
    focus: { x: 765, y: 390, zoom: 1.8 },
    title: 'Gaz oqishi nazorati',
    subtitle: 'MQ-2 gaz/tutun sensori zavod hududidagi gaz oqishini nazorat qiladi va shamollatish tizimini yoqadi.',
    dashboard: { type: 'analog', min: 0, max: 1023, unit: '', label: 'Gaz darajasi', dangerZone: (v) => v > 300 },
    components: ['Arduino Uno', '1x MQ-2 gaz sensori'],
    wiring: [
      'MQ-2 VCC→5V, GND→GND, AOUT→A2.',
      'Sensor yonida gugurt tutunini yoki spirtli salfetka hidini keltiring.',
      'Qiymat 300 dan pastga tushganda "toza havo" deb hisoblanadi.',
    ],
    story: {
      intro: 'Zavodda gaz hidi sezildi. Sensorni tekshirib, shamollatishni yoq.',
      complete: 'Havo tozalandi — zavod xavfsiz rejimga qaytdi.',
    },
    parse(payload, city) {
      const v = Number(payload);
      const clear = v < 300;
      city.state.gasClear = clear;
      return clear;
    },
    isComplete: (s) => s.gasClear === true,
  },
  {
    id: 13,
    key: 'clap_fountain',
    icon: '⛲',
    focus: { x: 200, y: 396, zoom: 2.0 },
    title: 'Ovozli boshqaruv (favvora)',
    subtitle: 'Ovoz sensori qarsakni eshitib, bog\'dagi favvorani yoqadi.',
    dashboard: { type: 'event', label: 'Qarsak signali' },
    components: ['Arduino Uno', '1x Ovoz/mikrofon sensori (KY-038 va h.k.)'],
    wiring: [
      'Sensor VCC→5V, GND→GND, DO→4-pin.',
      'Qo\'l bilan qarsak chal.',
      'Qarsak eshitilganda favvora yoqiladi (yoki o\'chiriladi — toggle).',
    ],
    story: {
      intro: 'Bog\' hodimlari qo\'lda boshqarish imkoniyatini yo\'qotdi. Ovoz bilan favvorani boshqar.',
      complete: 'Favvora jonlandi — bog\' aholiga tinchlik baxsh etmoqda.',
    },
    parse(payload, city) {
      if (payload === '1') {
        city.state.fountainOn = !city.state.fountainOn;
      }
      return city.state.fountainOn;
    },
    isComplete: (s) => s.fountainOn === true,
  },
  {
    id: 14,
    key: 'rain_guard',
    icon: '🌧️',
    focus: { x: 430, y: 360, zoom: 1.8 },
    title: "Yomg'ir nazorati",
    subtitle: "Yomg'ir sensori suv tomchisini his qilib, stadion tomini yopadi.",
    dashboard: { type: 'boolean', onLabel: "YOMG'IR BOR", offLabel: 'QURUQ' },
    components: ['Arduino Uno', '1x Yomg\'ir (rain) sensori'],
    wiring: [
      'Sensor VCC→5V, GND→GND, AOUT/DO→A3.',
      'Sensor ustiga bir tomchi suv tomizing.',
      'Namlik sezilganda stadion tomi avtomatik yopiladi.',
    ],
    story: {
      intro: "Yomg'ir boshlanmoqda. Stadion tomini vaqtida yop.",
      complete: 'Stadion tomi yopildi — tomoshabinlar yomg\'irdan himoyalandi.',
    },
    parse(payload, city) {
      const wet = payload === '1';
      city.state.rainOn = wet;
      city.state.stadiumClosed = wet;
      return wet;
    },
    isComplete: (s) => s.stadiumClosed === true,
  },
  {
    id: 15,
    key: 'vault_door',
    icon: '🔐',
    focus: { x: 445, y: 445, zoom: 2.0 },
    title: 'Xavfsiz eshik (Vault)',
    subtitle: 'Magnit (reed) sensor yordamida markaziy quvvat omboriga eshikni ochasan.',
    dashboard: { type: 'boolean', onLabel: 'OCHIQ', offLabel: 'YOPIQ' },
    components: ['Arduino Uno', '1x Reed switch (magnit sensor)', '1x kichik magnit'],
    wiring: [
      'Reed switch ning bir oyog\'ini 5-pinga, ikkinchisini GND ga ulang (INPUT_PULLUP).',
      'Magnitni sensorga yaqinlashtirib/uzoqlashtirib eshik holatini almashtiring.',
      'Magnit uzoqlashsa — eshik "ochiq" deb hisoblanadi.',
    ],
    story: {
      intro: "Quvvat ombori qulflangan. Reed sensor orqali eshikni och.",
      complete: 'Ombor eshigi ochildi — yadro reaktoriga yo\'l bor.',
    },
    parse(payload, city) {
      const open = payload === '1';
      city.state.vaultOpen = open;
      return open;
    },
    isComplete: (s) => s.vaultOpen === true,
  },
  {
    id: 16,
    key: 'radar_control',
    icon: '📡',
    focus: { x: 860, y: 280, zoom: 1.6 },
    title: 'Radar boshqaruvi',
    subtitle: 'Joystick modul yordamida radar antennasini aylantirib, osmondagi meteorlarni qidir.',
    dashboard: { type: 'analog', min: -90, max: 90, unit: '°', label: 'Radar burchagi' },
    components: ['Arduino Uno', '1x Joystick modul (KY-023)'],
    wiring: [
      'VRx→A4, VRy→A5 (ixtiyoriy), VCC→5V, GND→GND.',
      'Joystickni chapga/o\'ngga suring — radar shunga qarab aylanadi.',
      'Radarni chekka burchakka olib boring — u meteorni "topadi".',
    ],
    story: {
      intro: "Radar meteor yo'lini kuzatishi kerak. Joystick bilan uni aylantir.",
      complete: 'Radar meteor yo\'nalishini aniqladi — endi shahar tayyorgarlik ko\'ra oladi.',
    },
    parse(payload, city) {
      const deg = clampNum(Number(payload), -90, 90);
      city.state.radarAngle = (deg * Math.PI) / 180;
      return Math.abs(deg) > 55;
    },
    isComplete: (s) => Math.abs(s.radarAngle) > (55 * Math.PI) / 180,
  },
  {
    id: 17,
    key: 'launch_countdown',
    icon: '🚀',
    focus: { x: 520, y: 190, zoom: 2.0 },
    title: 'Uchirish (countdown) taymeri',
    subtitle: "7-segment displey orqali himoya sun'iy yo'ldoshi uchirilishi uchun teskari sanoq boshlanadi.",
    dashboard: { type: 'event', label: 'Countdown' },
    components: ['Arduino Uno', '1x 7-segment displey (yoki 4ta LED raqam o\'rnida)', '1x Push-button'],
    wiring: [
      'Tugmani 2-pinga ulang — bosilganda teskari sanoq boshlanadi.',
      '7-segment (yoki LEDlar) 3-9 pinlarga mos ulanadi.',
      '9 dan 0 gacha sanaladi, 0 da "uchirish" signali yuboriladi.',
    ],
    story: {
      intro: "Himoya yo'ldoshini uchirish vaqti keldi. Tugmani bosib teskari sanoqni boshla.",
      complete: "Yo'ldosh uchirildi! Endi u meteor yo'lini kuzatib boradi.",
    },
    parse(payload, city) {
      if (payload === 'LAUNCH') {
        city.state.countdown = 0;
        city.state.launched = true;
        city.triggerFireworks();
        return true;
      }
      const n = clampNum(Number(payload), 0, 9);
      city.state.countdown = n;
      city.state.launched = false;
      return false;
    },
    isComplete: (s) => s.launched === true,
  },
  {
    id: 18,
    key: 'remote_center',
    icon: '🎛️',
    focus: { x: 520, y: 300, zoom: 1.2 },
    title: 'Masofadan boshqaruv markazi',
    subtitle: 'IR pult yordamida bir nechta shahar tizimini masofadan boshqar.',
    dashboard: { type: 'event', label: 'IR signal' },
    components: ['Arduino Uno', '1x IR qabul qiluvchi (VS1838B)', '1x IR pult'],
    wiring: [
      'IR qabul qiluvchi VCC→5V, GND→GND, OUT→11-pin.',
      'Pultdagi istalgan tugmani bos.',
      'Har bir signal shahar markazida qisqa "impuls" chaqiradi.',
    ],
    story: {
      intro: "Markaziy boshqaruv pulti sinab ko'rilmoqda. Istalgan tugmani bos.",
      complete: 'Masofadan boshqaruv markazi ishga tushdi — butun shahar bir joydan nazorat qilinadi.',
    },
    parse(payload, city) {
      city.triggerRemoteBlink();
      city.state._remoteUsed = true;
      return true;
    },
    isComplete: (s) => s._remoteUsed === true,
  },
  {
    id: 19,
    key: 'dual_key_core',
    icon: '🔑',
    focus: { x: 520, y: 430, zoom: 2.0 },
    title: 'Yadro reaktori — ikki kalitli xavfsizlik',
    subtitle: "Ikkita tugma bir vaqtda bosilgandagina reaktor eshigi ochiladi (ikki kishilik xavfsizlik qoidasi).",
    dashboard: { type: 'event', label: 'Kalit holati (A / B)' },
    components: ['Arduino Uno', '2x Push-button', '2x LED'],
    wiring: [
      'Birinchi tugma 2-pin, ikkinchi tugma 3-pin (ikkalasi ham INPUT_PULLUP + GND).',
      'Har biriga mos LED qo\'yish mumkin (holatni ko\'rsatish uchun).',
      'Reaktor faqat ikkala tugma BIR VAQTDA bosilganda ochiladi.',
    ],
    story: {
      intro: "Yadro reaktori ikki kishilik kalit tizimi bilan himoyalangan. Ikkala tugmani bir vaqtda bos.",
      complete: "Reaktor xavfsiz tarzda ochildi — shahar yadrosi to'liq quvvatga ega bo'ldi.",
    },
    parse(payload, city) {
      if (payload === 'A1') city.state.coreKeyA = true;
      if (payload === 'A0') city.state.coreKeyA = false;
      if (payload === 'B1') city.state.coreKeyB = true;
      if (payload === 'B0') city.state.coreKeyB = false;
      city.state.reactorOpen = city.state.coreKeyA && city.state.coreKeyB;
      return city.state.reactorOpen;
    },
    isComplete: (s) => s.reactorOpen === true,
  },
  {
    id: 20,
    key: 'final_defense',
    icon: '☄️',
    focus: { x: 600, y: 280, zoom: 1.3 },
    title: 'Yakuniy himoya — Shahar yadrosi',
    subtitle: "Barcha sensorlar birlashadi: LDR (meteor yorqinligi), tugma (himoya), buzzer (sirena), servo (himoya darvozasi), RGB (signal) — meteor hujumini birgalikda qaytaring.",
    dashboard: { type: 'event', label: 'Yakuniy ketma-ketlik' },
    components: ['Arduino Uno', '1x LDR', '1x Push-button', '1x Buzzer', '1x Servo', '1x RGB LED', 'Avvalgi barcha qismlar'],
    wiring: [
      "1-19 bosqichlarda yig'ilgan barcha sxemani bitta katta boardga birlashtiring (yoki mavjud ulanishlarni saqlab qoling).",
      'LDR meteorning yorqin yonib kelishini his qiladi (ALERT).',
      'Tugma bosilsa himoya devori (shield) ko\'tariladi (SHIELD).',
      'Buzzer sirena chaladi (SIREN), servo himoya darvozasini yopadi (GATE).',
      'Barchasi bir vaqtda faol bo\'lsa — meteor yo\'q qilinadi (VICTORY).',
    ],
    story: {
      intro: "So'nggi va eng katta meteor to'dasi yaqinlashmoqda. Barcha tizimlarni bir vaqtda ishga tushir!",
      complete: 'SHAHAR QUTQARILDI! Nurshahar barcha tizimlari bilan meteor hujumini muvaffaqiyatli qaytardi.',
    },
    parse(payload, city) {
      const s = city.state;
      if (payload === 'ALERT') { s.asteroidDistance = 0.15; return false; }
      if (payload === 'SHIELD') { s.shieldOn = true; return false; }
      if (payload === 'SIREN') { s.sirenOn = true; return false; }
      if (payload === 'GATE') { s.bridgeOpen = 1; return false; }
      if (payload === 'VICTORY') {
        s.finalVictory = true;
        s.shieldOn = true;
        s.brightness = 1;
        city.triggerFireworks();
        return true;
      }
      return false;
    },
    isComplete: (s) => s.finalVictory === true,
  },
];

function clampNum(v, lo, hi) {
  if (Number.isNaN(v)) return lo;
  return Math.max(lo, Math.min(hi, v));
}

export function getStage(id) {
  return STAGES.find((s) => s.id === id);
}
