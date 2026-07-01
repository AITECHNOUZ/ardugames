/*
  Bosqich 19 — Yadro reaktori: ikki kalitli xavfsizlik
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish:
    Tugma A -> D2 va GND orasida (INPUT_PULLUP)
    Tugma B -> D3 va GND orasida (INPUT_PULLUP)
    (ixtiyoriy) LED A -> D8, LED B -> D9 — holatni ko'rsatish uchun

  Protokol: "EVT:19:A1"/"EVT:19:A0" — A tugmasi holati
            "EVT:19:B1"/"EVT:19:B0" — B tugmasi holati
  Reaktor faqat ikkalasi HAM bosilganda ochiladi (web tomonida hisoblanadi).
*/

const int BUTTON_A_PIN = 2;
const int BUTTON_B_PIN = 3;
const int LED_A_PIN = 8;
const int LED_B_PIN = 9;

int lastA = -1;
int lastB = -1;

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_A_PIN, INPUT_PULLUP);
  pinMode(BUTTON_B_PIN, INPUT_PULLUP);
  pinMode(LED_A_PIN, OUTPUT);
  pinMode(LED_B_PIN, OUTPUT);
}

void loop() {
  bool a = digitalRead(BUTTON_A_PIN) == LOW;
  bool b = digitalRead(BUTTON_B_PIN) == LOW;
  digitalWrite(LED_A_PIN, a ? HIGH : LOW);
  digitalWrite(LED_B_PIN, b ? HIGH : LOW);

  int stateA = a ? 1 : 0;
  int stateB = b ? 1 : 0;

  if (stateA != lastA) {
    Serial.println(stateA ? "EVT:19:A1" : "EVT:19:A0");
    lastA = stateA;
  }
  if (stateB != lastB) {
    Serial.println(stateB ? "EVT:19:B1" : "EVT:19:B0");
    lastB = stateB;
  }
  delay(20);
}
