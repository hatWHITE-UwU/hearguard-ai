/**
 * HearGuard AI — Arduino Uno/Nano, modo puente serial
 *
 * Emite JSON por puerto serie cada 5 s.
 * Un script en PC (ej. Node.js) lee el puerto y reenvía al backend.
 * Para WiFi directo: ver arduino/hearguard_esp32/hearguard_esp32.ino
 *
 * Conexión KY-037:
 *   AO → A0  |  VCC → 5V  |  GND → GND
 */

const int PIN_MIC = A0;
const int PIN_LED = LED_BUILTIN;
const int SAMPLES = 30;

int readDbLevel() {
  int peak = 0;
  for (int i = 0; i < SAMPLES; i++) {
    int v = analogRead(PIN_MIC);
    if (v > peak) peak = v;
    delayMicroseconds(500);
  }
  // ADC Uno: 10 bits (0–1023)
  return map(peak, 0, 1023, 35, 110);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  int db = readDbLevel();
  // Formato JSON listo para ser parseado por el script puente
  Serial.print("{\"dbLevel\":");
  Serial.print(db);
  Serial.print(",\"source\":\"iot\"}\n");
  digitalWrite(PIN_LED, db > 85 ? HIGH : LOW);
  delay(5000);
}
