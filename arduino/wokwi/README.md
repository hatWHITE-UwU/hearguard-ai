# HearGuard en Wokwi

Simulación del ESP32 con un **potenciómetro deslizante** como sustituto de la salida **AO** del KY-037 (misma idea que en la [documentación del potenciómetro en Wokwi](https://docs.wokwi.com/parts/wokwi-potentiometer): pin **SIG** → entrada analógica).

## Contenido

| Archivo | Uso |
|--------|-----|
| `diagram.json` | Conexiones: **SIG → D34**, **VCC → 3V3**, **GND → GND** |
| `sketch.ino` | Firmware listo para Wokwi (WiFi `Wokwi-GUEST`) |
| `libraries.txt` | **ArduinoJson** 6.x para compilar en Wokwi |

El **LED de riesgo** en **GPIO2** ya está en la placa **ESP32 DevKit v1** simulada; no hace falta añadir un LED en el diagrama.

## Cómo abrirlo en Wokwi

Desde aquí **no se puede iniciar sesión ni pegar en tu navegador por ti**. Para no copiar a mano desde el editor, usa el script **`copy-for-wokwi.ps1`**: deja el contenido en el **portapapeles** y solo tienes que **Ctrl+V** en Wokwi.

En **PowerShell** (ruta de ejemplo; ajusta si tu repo está en otro sitio):

```powershell
cd c:\Proyectos\hearguard-ai\arduino\wokwi
.\copy-for-wokwi.ps1 all
```

Eso copia **sketch.ino**, luego (tras Enter) **diagram.json**, luego **libraries.txt**. También puedes uno a uno: `.\copy-for-wokwi.ps1 sketch` | `diagram` | `libraries`.

---

1. Entra en [https://wokwi.com](https://wokwi.com) y crea un proyecto **ESP32** (plantilla Arduino).
2. Sustituye el código pegando el portapapeles tras `.\copy-for-wokwi.ps1 sketch` (o el paso **all**).
3. Abre el archivo **`diagram.json`** del proyecto en Wokwi (o crea uno nuevo) y **pega** tras `.\copy-for-wokwi.ps1 diagram`, o importa los componentes a mano:
   - Placa **ESP32 DevKit v1**
   - **Slide potentiometer**: SIG → **D34**, VCC → **3V3**, GND → **GND**
4. Asegúrate de que exista **`libraries.txt`** con ArduinoJson (o añade la librería desde el gestor de librerías de Wokwi).
5. Inicia la simulación y abre el **monitor serie** (115200 baudios).
6. Haz clic en el potenciómetro y muévelo (o usa **← / →** con el foco en el componente) para cambiar la lectura de **GPIO34**.

## WiFi e Internet en el simulador

Wokwi expone la red **`Wokwi-GUEST`** (abierta). El `sketch.ino` ya usa esa SSID y `WiFi.begin(..., 6)` para conectar más rápido, según la [guía WiFi ESP32 de Wokwi](https://docs.wokwi.com/guides/esp32-wifi).

Para que el ESP32 simulado llegue a Internet hace falta la **pasarela IoT** de Wokwi (pública por defecto). Las peticiones **HTTPS** a tu API suelen funcionar; si ves **`[backend] FALLO`** o errores HTTP, revisa que **`DEVICE_KEY`** sea válida y que la URL sea correcta. El `sketch.ino` de esta carpeta usa **`INTERVAL_MS = 5000`** para ver lecturas seguidas en el simulador; para comportamiento tipo producción (30 s) cámbialo a **30000** como en el sketch de la placa. Para depurar solo el sensor puedes bajar aún más ese valor o comentar la llamada HTTP.

## Hardware real

Para cableado KY-037, LED y credenciales en tu red, usa el sketch canónico:

`arduino/hearguard_esp32/hearguard_esp32.ino`

y la tabla de conexiones en `arduino/README_arduino.md`.
