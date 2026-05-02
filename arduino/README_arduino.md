# HearGuard — sensor de ruido (Arduino)

## Componentes

- Placa Arduino Uno/Nano o ESP32
- Módulo KY-037 o micrófono MAX4466
- Cables Dupont

## Conexión KY-037

- `A0` → entrada analógica del sensor
- `5V` / `GND` → alimentación del módulo

## Firmware

1. Abre `hearguard_sensor.ino` en Arduino IDE.
2. Selecciona la placa y el puerto COM.
3. Sube el sketch.

## Backend

1. Inicia sesión en la app y registra un dispositivo (`POST /api/devices`) para obtener `apiKey`.
2. En ESP con WiFi, envía `POST /api/noise/iot` con cabecera `X-Device-Key: <apiKey>` y cuerpo JSON `{"dbLevel":72}`.
3. En Uno sin red, usa el monitor serie como puente o un script en PC que reenvíe al API.

## Nota

Los valores dB son aproximados y deben calibrarse; no constituyen medición clínica.
