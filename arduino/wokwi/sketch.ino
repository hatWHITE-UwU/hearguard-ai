/**
 * HearGuard AI — Firmware ESP32 con WiFi + HTTP
 * (Copia para Wokwi; la fuente canónica es ../hearguard_esp32/hearguard_esp32.ino)
 *
 * Hardware:
 *   - ESP32 (DevKit v1 o similar)
 *   - Módulo micrófono KY-037 (analógico) o MAX9814 (más preciso)
 *     AO → GPIO34  |  VCC → 3.3V  |  GND → GND
 *   - LED indicador (opcional): GPIO2 (LED_BUILTIN en la mayoría de DevKits)
 *
 * Wokwi: el potenciómetro deslizante del diagrama sustituye la salida AO del KY-037.
 * El DevKit simulado ya lleva LED en GPIO2; no hace falta LED externo en el diagrama.
 *
 * Librerías requeridas (Gestor de librerías de Arduino IDE):
 *   - WiFi          (incluida en el core ESP32)
 *   - HTTPClient    (incluida en el core ESP32)
 *   - ArduinoJson   → buscar "ArduinoJson" de Benoit Blanchon ≥ 6.x
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ── Configuración — EDITAR ────────────────────────────────────────────────────
// Wokwi: red simulada "Wokwi-GUEST" (sin contraseña). En placa real, tu SSID/clave.
const char* WIFI_SSID     = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// URL de tu backend (producción o 192.168.x.x para desarrollo local)
const char* BACKEND_URL   = "https://hearguard-ai.onrender.com/api/noise/iot";

// API key obtenida al registrar el dispositivo en /app/devices
const char* DEVICE_KEY    = "hg_xxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

// Intervalo entre lecturas (ms). En Wokwi conviene poco para ver cambios al mover el pot;
// en placa real / producción usa 30000 como en ../hearguard_esp32/hearguard_esp32.ino
const unsigned long INTERVAL_MS = 5000;
// ─────────────────────────────────────────────────────────────────────────────

// Pin analógico del micrófono (GPIO34 es input-only, ideal para ADC)
const int PIN_MIC = 34;
const int PIN_LED = 2;  // LED_BUILTIN

// Cuántas muestras promediar por lectura
const int SAMPLES = 50;

// ── Función: leer nivel sonoro en dB aproximados ──────────────────────────────
float readDbLevel() {
  long sum = 0;
  int peak = 0;
  for (int i = 0; i < SAMPLES; i++) {
    int val = analogRead(PIN_MIC);
    sum += val;
    if (val > peak) peak = val;
    delayMicroseconds(200);
  }
  // El pico captura variaciones rápidas mejor que el promedio
  // ADC ESP32: 12 bits (0–4095), alimentado a 3.3V
  // Mapeo calibrado orientativo: 0–4095 → 30–110 dB
  // Para calibración precisa usa un sonómetro de referencia
  return map(peak, 0, 4095, 30, 110);
}

// ── Función: enviar lectura al backend ────────────────────────────────────────
bool postReading(float db) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", DEVICE_KEY);
  http.setTimeout(10000);

  StaticJsonDocument<128> doc;
  doc["dbLevel"] = (int)round(db);
  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  bool ok = (code == 200 || code == 201);

  if (!ok) {
    Serial.printf("[HTTP] error %d\n", code);
  }
  http.end();
  return ok;
}

// ── Función: conectar / reconectar WiFi ───────────────────────────────────────
void ensureWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.printf("[WiFi] conectando a %s", WIFI_SSID);
  // Wokwi: canal 6 evita el escaneo y ahorra ~4 s (ver guía ESP32 WiFi de Wokwi)
  if (strcmp(WIFI_SSID, "Wokwi-GUEST") == 0 && strlen(WIFI_PASSWORD) == 0) {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD, 6);
  } else {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print('.');
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WiFi] IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WiFi] sin conexión — se intentará en el próximo ciclo");
  }
}

// ── Setup ─────────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
  analogReadResolution(12);       // 12 bits = 0–4095
  analogSetAttenuation(ADC_11db); // rango 0–3.3V

  Serial.println("[HearGuard] iniciando...");
  WiFi.mode(WIFI_STA);
  ensureWifi();
}

// ── Loop ──────────────────────────────────────────────────────────────────────
static unsigned long lastSent = 0;

void loop() {
  unsigned long now = millis();
  if (now - lastSent >= INTERVAL_MS) {
    lastSent = now;

    float db = readDbLevel();
    bool highRisk = db > 85;
    digitalWrite(PIN_LED, highRisk ? HIGH : LOW);

    Serial.printf("[sensor] %.0f dB  riesgo: %s\n", db, highRisk ? "ALTO" : "normal");

    ensureWifi();
    bool sent = postReading(db);
    Serial.printf("[backend] %s\n", sent ? "OK" : "FALLO");
  }
}
