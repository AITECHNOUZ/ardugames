/*
  Bosqich 03 — Avtomatik ko'cha chirog'i
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish:
    LDR va 10kOhm rezistor kuchlanish bo'luvchisi -> A1
      (5V -- LDR -- A1 -- 10k -- GND)
    LED anod -> 220R -> D10, katod -> GND

  Protokol: "EVT:3:1" qorong'i bo'lganda, "EVT:3:0" yorug' bo'lganda.
*/

const int LDR_PIN = A1;
const int LED_PIN = 10;
const int DARK_THRESHOLD = 400; // sxemangizga qarab sozlang

int lastState = -1;

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int light = analogRead(LDR_PIN);
  bool dark = light < DARK_THRESHOLD;
  digitalWrite(LED_PIN, dark ? HIGH : LOW);

  int state = dark ? 1 : 0;
  if (state != lastState) {
    Serial.print("EVT:3:");
    Serial.println(state);
    lastState = state;
  }
  delay(150);
}
