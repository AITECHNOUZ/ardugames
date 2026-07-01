/*
  Bosqich 15 — Xavfsiz eshik (Vault)
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish (Reed switch / magnit sensor):
    Bir oyoq -> D5, ikkinchi oyoq -> GND (INPUT_PULLUP ishlatiladi)
    Kichik magnit sensor yoniga yaqinlashtiriladi/uzoqlashtiriladi.

  Protokol: "EVT:15:1" eshik ochiq (magnit uzoqda), "EVT:15:0" yopiq (magnit yaqin).
*/

const int REED_PIN = 5;

int lastState = -1;

void setup() {
  Serial.begin(9600);
  pinMode(REED_PIN, INPUT_PULLUP);
}

void loop() {
  // Magnit yaqin bo'lsa pin LOW ga tortiladi (yopiq), uzoqda bo'lsa HIGH (ochiq).
  bool open = digitalRead(REED_PIN) == HIGH;

  int state = open ? 1 : 0;
  if (state != lastState) {
    Serial.print("EVT:15:");
    Serial.println(state);
    lastState = state;
  }
  delay(100);
}
