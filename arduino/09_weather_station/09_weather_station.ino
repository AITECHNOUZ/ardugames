/*
  Bosqich 09 — Ob-havo stansiyasi
  Nurshahar hikoyasi: Arduino Chrome O'yinlari

  Ulanish (DHT11):
    VCC -> 5V, GND -> GND, DATA -> D2 (+ 10kOhm pull-up DATA va 5V orasida)

  Kutubxona: Arduino IDE -> Tools -> Manage Libraries ->
             "DHT sensor library" by Adafruit (+ "Adafruit Unified Sensor")

  Protokol: "EVT:9:<harorat>" masalan "EVT:9:31.50"
*/

#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT11

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float temp = dht.readTemperature();
  if (!isnan(temp)) {
    Serial.print("EVT:9:");
    Serial.println(temp, 2);
  }
  delay(1500);
}
