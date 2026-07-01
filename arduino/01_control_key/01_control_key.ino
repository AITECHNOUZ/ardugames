/*
  Bosqich 01 — Markaziy nazorat kaliti
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish:
    LED  anod (uzun oyoq) -> 220R -> D8,  katod -> GND
    Tugma -> D2 va GND orasida (INPUT_PULLUP ishlatiladi)

  Protokol: "EVT:1:1" tugma bosilganda, "EVT:1:0" qo'yib yuborilganda.
*/

const int BUTTON_PIN = 2;
const int LED_PIN = 8;

int lastState = -1;

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  bool pressed = digitalRead(BUTTON_PIN) == LOW;
  digitalWrite(LED_PIN, pressed ? HIGH : LOW);

  int state = pressed ? 1 : 0;
  if (state != lastState) {
    Serial.print("EVT:1:");
    Serial.println(state);
    lastState = state;
  }
  delay(20);
}
