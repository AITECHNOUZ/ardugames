/*
  Bosqich 16 — Radar boshqaruvi
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish (Joystick modul, masalan KY-023):
    VCC -> 5V, GND -> GND, VRx -> A4

  Protokol: "EVT:16:<-90..90>" — radar burchagi (daraja).
*/

const int JOYSTICK_X_PIN = A4;

int lastAngle = -1000;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int raw = analogRead(JOYSTICK_X_PIN); // 0..1023, markaz ~512
  int angle = map(raw, 0, 1023, -90, 90);

  if (abs(angle - lastAngle) >= 3) {
    Serial.print("EVT:16:");
    Serial.println(angle);
    lastAngle = angle;
  }
  delay(80);
}
