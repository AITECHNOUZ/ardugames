/*
  Bosqich 20 — Yakuniy himoya: Shahar yadrosi (final)
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Bu bosqich 1-19 bosqichlarda o'rgangan barcha g'oyalarni birlashtiradi:
  LDR (meteor yorqinligini sezish), tugma (himoyani faollashtirish),
  buzzer (sirena), servo (himoya darvozasi) va RGB LED (holat ko'rsatkichi).

  Ulanish:
    LDR + 10kOhm bo'luvchi -> A1  (5V--LDR--A1--10k--GND)
    Tugma -> D2 va GND orasida (INPUT_PULLUP)
    Buzzer -> D8 va GND
    Servo signal -> D9
    RGB LED: R->D10, G->D11, B->D12 (umumiy katod -> GND)

  Ketma-ketlik: LDR "meteor yorqinligi"ni sezganida (ALERT) va tugma
  bosilganda, himoya ketma-ket faollashadi: SHIELD -> SIREN -> GATE,
  va agar hammasi vaqtida yig'ilsa -> VICTORY.

  Protokol: "EVT:20:ALERT" / "EVT:20:SHIELD" / "EVT:20:SIREN" /
            "EVT:20:GATE" / "EVT:20:VICTORY"
*/

#include <Servo.h>

const int LDR_PIN = A1;
const int BUTTON_PIN = 2;
const int BUZZER_PIN = 8;
const int SERVO_PIN = 9;
const int RED_PIN = 10;
const int GREEN_PIN = 11;
const int BLUE_PIN = 12;

const int METEOR_FLASH_THRESHOLD = 700; // yorqin yorug'lik -> meteor chaqnashi

Servo gateServo;
bool victoryDone = false;

void setColor(bool r, bool g, bool b) {
  digitalWrite(RED_PIN, r ? HIGH : LOW);
  digitalWrite(GREEN_PIN, g ? HIGH : LOW);
  digitalWrite(BLUE_PIN, b ? HIGH : LOW);
}

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
  gateServo.attach(SERVO_PIN);
  gateServo.write(0);
}

void loop() {
  if (victoryDone) {
    setColor(false, true, false); // doimiy yashil — shahar xavfsiz
    delay(200);
    return;
  }

  int light = analogRead(LDR_PIN);
  bool alert = light > METEOR_FLASH_THRESHOLD;
  bool button = digitalRead(BUTTON_PIN) == LOW;

  if (alert) {
    Serial.println("EVT:20:ALERT");
    setColor(true, false, false);
  }

  if (alert && button) {
    // Himoya ketma-ketligi boshlandi
    Serial.println("EVT:20:SHIELD");
    setColor(true, true, false);
    delay(400);

    tone(BUZZER_PIN, 1200);
    Serial.println("EVT:20:SIREN");
    delay(400);

    gateServo.write(180);
    Serial.println("EVT:20:GATE");
    delay(400);

    noTone(BUZZER_PIN);

    // Meteor va tugma hali ham faolmi? bo'lsa — g'alaba!
    int lightNow = analogRead(LDR_PIN);
    bool stillAlert = lightNow > METEOR_FLASH_THRESHOLD;
    bool stillButton = digitalRead(BUTTON_PIN) == LOW;
    if (stillAlert && stillButton) {
      Serial.println("EVT:20:VICTORY");
      victoryDone = true;
    } else {
      gateServo.write(0);
    }
  }

  delay(100);
}
