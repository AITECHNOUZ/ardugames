/*
  Bosqich 17 — Uchirish (countdown) taymeri
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish:
    Tugma -> D2 va GND orasida (INPUT_PULLUP)
    7-segment displey (yoki 4ta LED) -> D3..D9 (ixtiyoriy, faqat vizual uchun)

  Protokol: "EVT:17:<9..0>" har bir sanoq qadamida,
            "EVT:17:LAUNCH" nol raqamda uchirishda.
*/

const int BUTTON_PIN = 2;

bool wasPressed = false;

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
}

void loop() {
  bool pressed = digitalRead(BUTTON_PIN) == LOW;

  if (pressed && !wasPressed) {
    for (int n = 9; n >= 0; n--) {
      Serial.print("EVT:17:");
      Serial.println(n);
      delay(700);
    }
    Serial.println("EVT:17:LAUNCH");
    delay(500);
  }

  wasPressed = pressed;
  delay(20);
}
