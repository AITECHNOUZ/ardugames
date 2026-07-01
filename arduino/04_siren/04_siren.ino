/*
  Bosqich 04 — Ogohlantirish signali (sirena)
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish:
    Buzzer (passiv) -> D8 va GND
    Tugma -> D2 va GND orasida (INPUT_PULLUP)

  Protokol: "EVT:4:1" sirena yonganda, "EVT:4:0" o'chganda.
*/

const int BUTTON_PIN = 2;
const int BUZZER_PIN = 8;

int lastState = -1;

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  bool on = digitalRead(BUTTON_PIN) == LOW;

  if (on) {
    tone(BUZZER_PIN, 900 + 200 * sin(millis() / 100.0));
  } else {
    noTone(BUZZER_PIN);
  }

  int state = on ? 1 : 0;
  if (state != lastState) {
    Serial.print("EVT:4:");
    Serial.println(state);
    lastState = state;
  }
  delay(20);
}
