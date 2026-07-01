/*
  Bosqich 08 — Xavfsizlik nazorati
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish (PIR HC-SR501):
    VCC -> 5V, GND -> GND, OUT -> D4

  Eslatma: PIR sensor yoqilgandan keyin barqarorlashishi uchun
  ~30-60 soniya kerak bo'lishi mumkin.

  Protokol: "EVT:8:1" harakat sezilganda, "EVT:8:0" tinch bo'lganda.
*/

const int PIR_PIN = 4;

int lastState = -1;

void setup() {
  Serial.begin(9600);
  pinMode(PIR_PIN, INPUT);
}

void loop() {
  int state = digitalRead(PIR_PIN) == HIGH ? 1 : 0;
  if (state != lastState) {
    Serial.print("EVT:8:");
    Serial.println(state);
    lastState = state;
  }
  delay(100);
}
