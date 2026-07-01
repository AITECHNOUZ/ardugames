/*
  Bosqich 12 — Gaz oqishi nazorati
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish (MQ-2 gaz/tutun sensori):
    VCC -> 5V, GND -> GND, AOUT -> A2

  Eslatma: MQ-2 sensori yoqilgandan keyin bir necha daqiqa isishi kerak
  (qiymatlar shu vaqt ichida beqaror bo'lishi mumkin).

  Protokol: "EVT:12:<0-1023>" — havodagi gaz konsentratsiyasi (xom qiymat).
*/

const int GAS_PIN = A2;

int lastSent = -1;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int value = analogRead(GAS_PIN);

  if (abs(value - lastSent) >= 10) {
    Serial.print("EVT:12:");
    Serial.println(value);
    lastSent = value;
  }
  delay(200);
}
