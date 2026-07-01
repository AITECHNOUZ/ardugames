/*
  Bosqich 13 — Ovozli boshqaruv (favvora)
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish (Ovoz/mikrofon sensori, masalan KY-038):
    VCC -> 5V, GND -> GND, DO -> D4

  Protokol: "EVT:13:1" — har bir qarsak (impuls) uchun bir marta yuboriladi.
*/

const int SOUND_PIN = 4;
const unsigned long DEBOUNCE_MS = 400;

int lastRaw = LOW;
unsigned long lastTrigger = 0;

void setup() {
  Serial.begin(9600);
  pinMode(SOUND_PIN, INPUT);
}

void loop() {
  int raw = digitalRead(SOUND_PIN);
  unsigned long now = millis();

  if (raw == HIGH && lastRaw == LOW && (now - lastTrigger) > DEBOUNCE_MS) {
    Serial.println("EVT:13:1");
    lastTrigger = now;
  }
  lastRaw = raw;
  delay(10);
}
