/*
  Bosqich 14 — Yomg'ir nazorati
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish (Yomg'ir/namlik sensori taxtachasi):
    VCC -> 5V, GND -> GND, AOUT -> A3

  Eslatma: quruq holatda qiymat baland, ho'l holatda past bo'ladi
  (ko'pchilik rain-sensor modullarida). Kerak bo'lsa WET_THRESHOLD ni sozlang.

  Protokol: "EVT:14:1" yomg'ir/suv sezilganda, "EVT:14:0" quruq bo'lganda.
*/

const int RAIN_PIN = A3;
const int WET_THRESHOLD = 600;

int lastState = -1;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int value = analogRead(RAIN_PIN);
  bool wet = value < WET_THRESHOLD;

  int state = wet ? 1 : 0;
  if (state != lastState) {
    Serial.print("EVT:14:");
    Serial.println(state);
    lastState = state;
  }
  delay(200);
}
