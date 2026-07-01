/*
  Bosqich 10 — Zilzila sensori
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish (SW-420 tebranish sensori):
    VCC -> 5V, GND -> GND, DO -> D3

  Protokol: "EVT:10:1" tebranish sezilganda (debounce bilan).
*/

const int VIBRATION_PIN = 3;
const unsigned long DEBOUNCE_MS = 800;

unsigned long lastTrigger = 0;

void setup() {
  Serial.begin(9600);
  pinMode(VIBRATION_PIN, INPUT);
}

void loop() {
  if (digitalRead(VIBRATION_PIN) == HIGH) {
    unsigned long now = millis();
    if (now - lastTrigger > DEBOUNCE_MS) {
      Serial.println("EVT:10:1");
      lastTrigger = now;
    }
  }
  delay(20);
}
