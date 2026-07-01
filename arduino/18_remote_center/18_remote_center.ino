/*
  Bosqich 18 — Masofadan boshqaruv markazi
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish (IR qabul qiluvchi, masalan VS1838B):
    VCC -> 5V, GND -> GND, OUT -> D11

  Kutubxona: Arduino IDE -> Tools -> Manage Libraries -> "IRremote" (by shirriff/Armin Joachimsmeyer)

  Protokol: "EVT:18:<kod>" — pultdagi istalgan tugma bosilganda.
*/

#include <IRremote.hpp>

const int IR_RECEIVE_PIN = 11;

void setup() {
  Serial.begin(9600);
  IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);
}

void loop() {
  if (IrReceiver.decode()) {
    Serial.print("EVT:18:");
    Serial.println(IrReceiver.decodedIRData.command);
    IrReceiver.resume();
  }
  delay(10);
}
