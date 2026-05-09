# HearGuard — Firmware IoT

Dos variantes según el hardware disponible.

## Opción A — ESP32 (recomendada, WiFi directo)

**Sketch:** `hearguard_esp32/hearguard_esp32.ino`

**Simulación (Wokwi):** carpeta `wokwi/` (`diagram.json`, `sketch.ino` y `README.md`).

### Hardware
| Componente | Descripción |
|---|---|
| ESP32 DevKit v1 | MCU principal con WiFi integrado |
| KY-037 o MAX9814 | Módulo micrófono analógico |
| LED (opcional) | Indicador visual de riesgo |

### Conexión KY-037 → ESP32
```
KY-037 AO → GPIO34
KY-037 VCC → 3.3V
KY-037 GND → GND
LED (+) → GPIO2  (con resistencia 220Ω)
```

### Librerías (Arduino IDE → Gestor de librerías)
- **ArduinoJson** de Benoit Blanchon ≥ 6.x
- WiFi y HTTPClient vienen incluidas en el core ESP32

### Configuración
Editar las constantes al inicio del sketch:
```cpp
const char* WIFI_SSID     = "TU_RED_WIFI";
const char* WIFI_PASSWORD = "TU_CONTRASEÑA";
const char* BACKEND_URL   = "https://api.hearguard.onrender.com/api/noise/iot";
const char* DEVICE_KEY    = "hg_xxxx_...";   // Obtenida en /app/devices
const unsigned long INTERVAL_MS = 30000;      // Lectura cada 30 s
```

### Flujo
```
KY-037 → ADC (GPIO34) → promediar 50 muestras → mapear a dB
→ POST /api/noise/iot  con X-Device-Key
→ LED encendido si dB > 85
```

---

## Opción B — Arduino Uno/Nano (sin WiFi, modo puente)

**Sketch:** `hearguard_sensor/hearguard_sensor.ino`  
**Puente:** `serial_bridge.js` (se ejecuta en PC)

### Hardware
```
KY-037 AO → A0
KY-037 VCC → 5V
KY-037 GND → GND
```

### Pasos
1. Subir el sketch al Arduino.
2. En PC, instalar dependencias del puente:
   ```bash
   cd arduino
   npm install serialport node-fetch
   ```
3. Ejecutar el puente (reemplaza `COM3` con tu puerto y `hg_xxx` con tu API key):
   ```bash
   DEVICE_KEY=hg_xxx PORT=COM3 node serial_bridge.js
   # Linux: PORT=/dev/ttyUSB0 DEVICE_KEY=hg_xxx node serial_bridge.js
   ```

---

## Registrar el dispositivo

1. Inicia sesión en la app web (`/app/devices`).
2. Crea un dispositivo → guarda la **API key** (solo se muestra una vez).
3. Pégala en `DEVICE_KEY` del sketch ESP32 o en la variable de entorno del puente.

## Notas

- Los valores dB son aproximaciones; calibrar con sonómetro de referencia para mayor precisión.
- El backend clasifica automáticamente el nivel: `bajo` / `moderado` / `alto` / `muy_alto`.
- Lecturas > 85 dB activan `highRisk: true` en el registro.
