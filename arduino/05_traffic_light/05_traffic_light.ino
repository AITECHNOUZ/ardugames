/*
  Bosqich 05 — Svetofor tizimi
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish (umumiy katodli RGB LED):
    R -> 220R -> D9
    G -> 220R -> D10
    B -> D11 (bu bosqichda ishlatilmaydi)
    Umumiy katod -> GND

  Protokol: "EVT:5:<phase>" — 0=qizil, 1=sariq, 2=yashil
*/

const int RED_PIN = 9;
const int GREEN_PIN = 10;
const int BLUE_PIN = 11;

void setColor(bool r, bool g, bool b) {
  digitalWrite(RED_PIN, r ? HIGH : LOW);
  digitalWrite(GREEN_PIN, g ? HIGH : LOW);
  digitalWrite(BLUE_PIN, b ? HIGH : LOW);
}

void sendPhase(int phase) {
  Serial.print("EVT:5:");
  Serial.println(phase);
}

void setup() {
  Serial.begin(9600);
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
}

void loop() {
  setColor(true, false, false);   // qizil
  sendPhase(0);
  delay(2000);

  setColor(false, true, false);   // yashil
  sendPhase(2);
  delay(2000);

  setColor(true, true, false);    // sariq (qizil+yashil taxminiy)
  sendPhase(1);
  delay(500);
}
