/*
  Bosqich 06 — Ko'prik darvozasi
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish:
    Servo signal simi -> D9, qizil -> 5V, jigarrang/qora -> GND
    (ixtiyoriy) Potentsiometr o'rta oyog'i -> A0, chekkalari 5V/GND

  Kutubxona: "Servo" (Arduino IDE bilan birga keladi)

  Protokol: "EVT:6:<0-180>" servo burchagi.
*/

#include <Servo.h>

const int SERVO_PIN = 9;
const int POT_PIN = A0;

Servo bridgeServo;
int lastAngle = -1;

void setup() {
  Serial.begin(9600);
  bridgeServo.attach(SERVO_PIN);
}

void loop() {
  int raw = analogRead(POT_PIN);
  int angle = map(raw, 0, 1023, 0, 180);
  bridgeServo.write(angle);

  if (abs(angle - lastAngle) >= 2) {
    Serial.print("EVT:6:");
    Serial.println(angle);
    lastAngle = angle;
  }
  delay(50);
}
