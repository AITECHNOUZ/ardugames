/*
  Bosqich 07 — Himoya devori (Shield)
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish (HC-SR04):
    VCC -> 5V, GND -> GND, TRIG -> D7, ECHO -> D6

  Protokol: "EVT:7:<masofa_sm>" — har ~200ms yuboriladi (0-200 sm).
*/

const int TRIG_PIN = 7;
const int ECHO_PIN = 6;

long readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 25000); // timeout 25ms (~4m)
  if (duration == 0) return 200; // signal qaytmadi -> "uzoq" deb hisoblaymiz
  return duration * 0.0343 / 2;
}

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  long cm = readDistanceCm();
  if (cm > 200) cm = 200;

  Serial.print("EVT:7:");
  Serial.println(cm);
  delay(200);
}
