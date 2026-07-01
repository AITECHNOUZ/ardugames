/*
  Bosqich 11 — Yong'in signalizatsiyasi
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish (Flame/IR alanga sensori):
    VCC -> 5V, GND -> GND, DO -> D5

  Eslatma: ko'p flame modullarida alanga sezilganda DO = LOW bo'ladi.
  Agar sizning modulingiz teskari ishlasa, pastdagi FLAME_ACTIVE_LOW
  qiymatini false ga o'zgartiring.

  Protokol: "EVT:11:1" alanga bor, "EVT:11:0" alanga yo'q (o'chirilgan).
*/

const int FLAME_PIN = 5;
const bool FLAME_ACTIVE_LOW = true;

int lastState = -1;

void setup() {
  Serial.begin(9600);
  pinMode(FLAME_PIN, INPUT);
}

void loop() {
  int raw = digitalRead(FLAME_PIN);
  bool flame = FLAME_ACTIVE_LOW ? (raw == LOW) : (raw == HIGH);

  int state = flame ? 1 : 0;
  if (state != lastState) {
    Serial.print("EVT:11:");
    Serial.println(state);
    lastState = state;
  }
  delay(150);
}
