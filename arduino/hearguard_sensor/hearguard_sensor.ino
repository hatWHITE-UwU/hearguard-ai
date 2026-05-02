/**
 * HearGuard AI — lectura aproximada con KY-037 (analógico en A0).
 * Con ESP8266/ESP32: sustituir Serial por HTTP POST a tu backend con X-Device-Key.
 */
const int PIN_MIC = A0;
const int PIN_LED = LED_BUILTIN;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  int raw = analogRead(PIN_MIC);
  // Mapeo orientativo; calibrar según entorno
  int db = map(raw, 0, 1023, 35, 110);
  Serial.print("{\"dbLevel\":");
  Serial.print(db);
  Serial.print(",\"source\":\"iot\"}\n");
  digitalWrite(PIN_LED, db > 85 ? HIGH : LOW);
  delay(5000);
}
