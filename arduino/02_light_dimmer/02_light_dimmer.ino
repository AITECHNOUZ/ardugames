/*
  Bosqich 02 — Yorug'lik boshqaruvi
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish:
    Potentsiometr chekka oyoqlari -> 5V va GND, o'rta oyoq -> A0
    LED anod -> 220R -> D9 (PWM), katod -> GND

  Protokol: "EVT:2:<0-255>" — o'zgarganda yuboriladi.
*/

const int POT_PIN = A0;
const int LED_PIN = 9;

int lastSent = -1;

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int raw = analogRead(POT_PIN);        // 0..1023
  int level = map(raw, 0, 1023, 0, 255); // 0..255
  analogWrite(LED_PIN, level);

  if (abs(level - lastSent) >= 3) {
    Serial.print("EVT:2:");
    Serial.println(level);
    lastSent = level;
  }
  delay(60);
}
