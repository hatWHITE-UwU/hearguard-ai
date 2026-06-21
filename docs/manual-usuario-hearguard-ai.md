# MANUAL DE USUARIO
## HearGuard AI v1.0
### Sistema Inteligente para la Prevención y Predicción de la Pérdida Auditiva

---

**Institución:** Universidad Continental
**Autores:** Terreros Hinojosa, Luis Francisco / Rondinel Aquino, Hardy Eduardo
**Asesor:** Maglioni Arana Caparachín
**Versión del manual:** 1.0
**Fecha:** Junio 2026

---

## Tabla de Contenido

1. [Introducción](#1-introducción)
2. [Requisitos del Sistema](#2-requisitos-del-sistema)
3. [Acceso a la Plataforma](#3-acceso-a-la-plataforma)
4. [Registro de Cuenta](#4-registro-de-cuenta)
5. [Inicio de Sesión](#5-inicio-de-sesión)
6. [Dashboard Principal](#6-dashboard-principal)
7. [Monitoreo de Ruido en Tiempo Real](#7-monitoreo-de-ruido-en-tiempo-real)
8. [Evaluación Auditiva](#8-evaluación-auditiva)
9. [Resultados y Nivel de Riesgo](#9-resultados-y-nivel-de-riesgo)
10. [Recomendaciones Preventivas](#10-recomendaciones-preventivas)
11. [Historial de Evaluaciones](#11-historial-de-evaluaciones)
12. [Gestión de Dispositivos IoT](#12-gestión-de-dispositivos-iot)
13. [Perfil de Usuario](#13-perfil-de-usuario)
14. [Aplicación Móvil Flutter](#14-aplicación-móvil-flutter)
15. [Cierre de Sesión](#15-cierre-de-sesión)
16. [Preguntas Frecuentes](#16-preguntas-frecuentes)
17. [Glosario](#17-glosario)

---

## 1. Introducción

**HearGuard AI** es una plataforma digital de salud auditiva preventiva que permite al usuario monitorear su exposición al ruido ambiental, evaluar su estado auditivo mediante un cuestionario digital y conocer su nivel de riesgo de pérdida auditiva calculado por inteligencia artificial.

El sistema integra tres funciones principales en una sola plataforma:

| Función | Descripción |
|---|---|
| **Monitoreo de ruido** | Mide el nivel de sonido en decibelios (dB) usando el micrófono del dispositivo o un sensor IoT ESP32 |
| **Evaluación auditiva** | Cuestionario de 12 pasos que evalúa la percepción auditiva del usuario en seis frecuencias estándar |
| **Predicción de riesgo** | Modelo de inteligencia artificial (Random Forest) que calcula el nivel de riesgo auditivo en cuatro niveles: Bajo, Moderado, Alto o Muy Alto |

> **Aviso importante:** HearGuard AI es una herramienta de prevención e información. Los resultados no constituyen un diagnóstico médico. Ante cualquier síntoma auditivo, consulte a un médico audiólogo.

---

## 2. Requisitos del Sistema

### 2.1 Aplicación Web

| Requisito | Mínimo |
|---|---|
| Navegador | Google Chrome 110+, Mozilla Firefox 110+, Microsoft Edge 110+ |
| Conexión a internet | Banda ancha (≥ 5 Mbps recomendado) |
| Micrófono | Integrado o externo (para monitoreo de ruido desde el navegador) |
| Resolución de pantalla | 1280 × 720 px mínimo |
| JavaScript | Habilitado |

### 2.2 Aplicación Móvil (Flutter)

| Requisito | Detalle |
|---|---|
| Sistema operativo Android | Android 8.0 (API 26) o superior |
| Sistema operativo iOS | iOS 13.0 o superior |
| Espacio disponible | 50 MB mínimo |
| Micrófono | Requerido para el monitoreo de ruido |
| Conexión a internet | Wi-Fi o datos móviles |

### 2.3 Dispositivo IoT (opcional)

| Componente | Especificación |
|---|---|
| Microcontrolador | ESP32 (cualquier variante con Wi-Fi) |
| Sensor de sonido | KY-037 |
| Cable USB | Para conexión al puente serial Node.js |

---

## 3. Acceso a la Plataforma

La plataforma web está disponible en:

**URL:** `https://frontend-tau-tan-95.vercel.app`

Al ingresar a la URL, el sistema presenta la pantalla de inicio (*splash screen*) con el logo de HearGuard AI y redirige automáticamente a la pantalla de autenticación.

---

## 4. Registro de Cuenta

### 4.1 Pasos para crear una cuenta nueva

1. En la pantalla de inicio, haga clic en **"Crear cuenta"** o **"Registrarse"**.
2. Complete el formulario con los siguientes datos:

| Campo | Descripción | Ejemplo |
|---|---|---|
| **Nombre completo** | Su nombre y apellidos | Luis Terreros |
| **Correo electrónico** | Dirección de email válida | usuario@email.com |
| **Contraseña** | Mínimo 8 caracteres | ••••••••••• |
| **Edad** | Su edad en años (18–75) | 25 |

3. Haga clic en **"Registrarse"**.
4. Si el registro es exitoso, el sistema lo redirige automáticamente al dashboard principal.

### 4.2 Reglas de la contraseña

- Mínimo 8 caracteres
- Se recomienda combinar letras, números y símbolos
- No comparta su contraseña con nadie

### 4.3 Errores frecuentes en el registro

| Error mostrado | Causa | Solución |
|---|---|---|
| "El correo ya está registrado" | El email ya tiene una cuenta | Use otro email o inicie sesión |
| "Contraseña demasiado corta" | Menos de 8 caracteres | Amplíe la contraseña |
| "Correo inválido" | Formato de email incorrecto | Verifique el formato (usuario@dominio.com) |

---

## 5. Inicio de Sesión

### 5.1 Pasos para iniciar sesión

1. Ingrese su **correo electrónico** registrado.
2. Ingrese su **contraseña**.
3. Haga clic en **"Iniciar sesión"**.
4. El sistema lo redirige al dashboard principal.

### 5.2 Sesión automática

El sistema mantiene la sesión activa mediante tokens de seguridad. El *access token* tiene una duración de **15 minutos** y se renueva automáticamente en segundo plano. No es necesario iniciar sesión de nuevo mientras use la plataforma activamente.

### 5.3 Errores frecuentes en el inicio de sesión

| Error mostrado | Causa | Solución |
|---|---|---|
| "Credenciales inválidas" | Email o contraseña incorrectos | Verifique sus datos de acceso |
| "Sesión expirada" | Inactividad prolongada | Inicie sesión nuevamente |

---

## 6. Dashboard Principal

El dashboard es la pantalla central del sistema. Muestra un resumen completo del estado de salud auditiva del usuario.

### 6.1 Elementos del dashboard

| Elemento | Descripción |
|---|---|
| **Gauge de riesgo** | Indicador circular animado que muestra el nivel de riesgo auditivo actual (0–100) |
| **Badge de nivel** | Etiqueta con color que indica el nivel: Bajo (verde), Moderado (amarillo), Alto (naranja) o Muy Alto (rojo) |
| **Exposición semanal** | Gráfico de barras con el promedio de decibelios registrados cada día de la semana |
| **Última evaluación** | Fecha y resultado de la evaluación auditiva más reciente |
| **Recomendaciones activas** | Lista de las recomendaciones preventivas vigentes |
| **Dispositivos activos** | Número de sensores IoT vinculados a la cuenta |

### 6.2 Interpretación del gauge de riesgo

| Rango (0–100) | Nivel | Color | Significado |
|:---:|---|:---:|---|
| 0 – 25 | **Bajo** | 🟢 Verde | Exposición auditiva dentro de rangos saludables |
| 26 – 50 | **Moderado** | 🟡 Amarillo | Exposición que requiere atención y cambios de hábitos |
| 51 – 75 | **Alto** | 🟠 Naranja | Riesgo significativo; se recomienda uso de protección auditiva |
| 76 – 100 | **Muy Alto** | 🔴 Rojo | Riesgo crítico; consulte a un audiólogo |

---

## 7. Monitoreo de Ruido en Tiempo Real

Esta función permite medir el nivel de ruido ambiental usando el micrófono del dispositivo.

### 7.1 Activar el monitor de ruido (web)

1. En el menú lateral, haga clic en **"Monitor"** o **"Monitoreo de ruido"**.
2. El navegador solicitará permiso para acceder al micrófono. Haga clic en **"Permitir"**.

   > Si deniega el permiso, el monitor no podrá funcionar. Para habilitarlo vaya a Configuración del navegador → Privacidad y seguridad → Permisos del sitio → Micrófono.

3. El gauge comenzará a mostrar el nivel de ruido en decibelios (dB) en tiempo real.
4. Para **guardar la lectura** actual en su historial, haga clic en **"Registrar lectura"**.
5. Para **detener** el monitor, haga clic en **"Detener"**.

### 7.2 Clasificación del nivel de ruido

| Nivel (dB) | Clasificación | Ejemplos de referencia |
|:---:|---|---|
| < 55 dB | **Bajo** | Conversación en voz baja, biblioteca |
| 55 – 75 dB | **Moderado** | Conversación normal, oficina ruidosa |
| 75 – 90 dB | **Alto** | Tráfico intenso, maquinaria ligera |
| > 90 dB | **Muy Alto** | Conciertos, maquinaria industrial, taladros |

### 7.3 Historial de lecturas

- Acceda a **"Historial"** → **"Lecturas de ruido"** para ver todas las mediciones guardadas.
- Las estadísticas del **día actual** y de la **semana** se calculan automáticamente.

### 7.4 Recomendaciones según el nivel medido

| Nivel | Acción recomendada |
|---|---|
| Bajo | Continúe con sus hábitos actuales |
| Moderado | Reduzca el tiempo de exposición si es continua |
| Alto | Use tapones o protectores auditivos |
| Muy Alto | Abandone el entorno o use protección certificada inmediatamente |

---

## 8. Evaluación Auditiva

La evaluación auditiva es un cuestionario de **12 pasos** que mide la percepción del usuario en las seis frecuencias estándar del espectro auditivo, tanto para el oído izquierdo como para el derecho.

### 8.1 Iniciar la evaluación

1. En el menú lateral, haga clic en **"Prueba auditiva"** o **"Evaluación auditiva"**.
2. Lea las instrucciones previas que se muestran en pantalla.
3. Haga clic en **"Iniciar evaluación"**.

### 8.2 Completar los 12 pasos

El sistema presenta 12 pasos en el siguiente orden:

| Paso | Frecuencia | Oído |
|:---:|:---:|:---:|
| 1 | 250 Hz | Izquierdo |
| 2 | 250 Hz | Derecho |
| 3 | 500 Hz | Izquierdo |
| 4 | 500 Hz | Derecho |
| 5 | 1 000 Hz | Izquierdo |
| 6 | 1 000 Hz | Derecho |
| 7 | 2 000 Hz | Izquierdo |
| 8 | 2 000 Hz | Derecho |
| 9 | 4 000 Hz | Izquierdo |
| 10 | 4 000 Hz | Derecho |
| 11 | 8 000 Hz | Izquierdo |
| 12 | 8 000 Hz | Derecho |

En cada paso:
- Lea la pregunta presentada sobre su percepción auditiva en esa frecuencia.
- Asigne un **puntaje del 0 al 10** según su percepción:
  - **0** = No escucho nada / percepción muy deficiente
  - **5** = Percepción regular
  - **10** = Escucho perfectamente / sin dificultad
- Haga clic en **"Siguiente"** para avanzar al paso siguiente.

### 8.3 Finalizar la evaluación

Al completar los 12 pasos:
1. El sistema calcula automáticamente:
   - **Puntaje promedio global** (promedio de los 12 puntajes)
   - **Puntaje en frecuencias bajas** (promedio de 250 Hz y 500 Hz)
2. Se construye el vector de características para el modelo de IA.
3. El sistema envía los datos al microservicio de inteligencia artificial.
4. En segundos, aparece la pantalla de **Resultados** con el nivel de riesgo calculado.

### 8.4 Recomendaciones para una evaluación precisa

- Realice la evaluación en un ambiente silencioso (< 40 dB).
- Use auriculares si está disponible esta opción.
- Responda con honestidad; los resultados dependen de la veracidad de sus respuestas.
- Realice la evaluación con regularidad (mensual o trimestral) para seguir la evolución de su riesgo.

---

## 9. Resultados y Nivel de Riesgo

Al finalizar la evaluación auditiva, el sistema presenta los resultados del modelo predictivo de inteligencia artificial.

### 9.1 Elementos de la pantalla de resultados

| Elemento | Descripción |
|---|---|
| **Nivel de riesgo** | Clasificación cualitativa: Bajo / Moderado / Alto / Muy Alto |
| **Puntaje de riesgo** | Valor numérico entre 0 y 100 |
| **Años de exposición estimados** | Equivalente en años de exposición continua al nivel actual |
| **Factores de riesgo principales** | Los 3 factores que más influyen en su nivel de riesgo |
| **Recomendaciones** | Acciones preventivas adaptadas a su perfil |

### 9.2 Factores que influyen en el cálculo

El modelo de IA considera los siguientes 8 factores para calcular su nivel de riesgo:

| Factor | Descripción |
|---|---|
| Edad | A mayor edad, mayor susceptibilidad al daño auditivo acumulado |
| Horas de auriculares al día | Tiempo diario de uso de auriculares o audífonos |
| Nivel de volumen habitual | Volumen promedio al que escucha música o contenido |
| Exposición ocupacional al ruido | Nivel de ruido en su entorno de trabajo |
| Riesgo de la ocupación | Tipo de trabajo según exposición acústica |
| Tabaquismo | El tabaco reduce el flujo sanguíneo al oído interno |
| Puntaje auditivo promedio | Resultado promedio de los 12 pasos del cuestionario |
| Puntaje en frecuencias bajas | Percepción en 250 Hz y 500 Hz (indicador temprano de daño) |

### 9.3 Interpretación de los factores de riesgo principales

Los tres factores con mayor peso en su resultado se muestran resaltados. Son los aspectos de su perfil que, si mejora, podrían reducir su nivel de riesgo en futuras evaluaciones.

---

## 10. Recomendaciones Preventivas

### 10.1 Recomendaciones por nivel de riesgo

**Nivel Bajo:**
- Mantenga sus hábitos actuales de cuidado auditivo.
- Realice una evaluación auditiva cada 6 meses para seguimiento.
- Use el volumen al 60 % o menos en auriculares (regla 60/60).

**Nivel Moderado:**
- Reduzca el tiempo de uso de auriculares a menos de 2 horas continuas.
- Baje el volumen al 50 % o menos.
- Tome descansos de 10 minutos por cada hora de exposición sonora.
- Evite ambientes con ruido > 75 dB por períodos prolongados.

**Nivel Alto:**
- Use tapones o protectores auditivos certificados en entornos ruidosos.
- Limite el uso de auriculares a 1 hora diaria.
- Realice una evaluación médica preventiva con un audiólogo.
- Evite la exposición a ruidos superiores a 85 dB sin protección.

**Nivel Muy Alto:**
- Consulte a un médico audiólogo a la brevedad posible.
- Suspenda el uso de auriculares hasta recibir orientación médica.
- Use protección auditiva certificada (NRR 25 dB o superior) en todo momento en entornos ruidosos.
- Evite conciertos, discotecas y cualquier entorno con ruido > 90 dB.

---

## 11. Historial de Evaluaciones

### 11.1 Acceder al historial

1. En el menú lateral, haga clic en **"Historial"**.
2. El sistema muestra todas sus evaluaciones anteriores ordenadas por fecha (más reciente primero).

### 11.2 Información disponible por evaluación

| Dato | Descripción |
|---|---|
| Fecha y hora | Momento en que realizó la evaluación |
| Nivel de riesgo | Bajo / Moderado / Alto / Muy Alto |
| Puntaje de riesgo | Valor numérico (0–100) |
| Puntaje promedio auditivo | Promedio de sus 12 respuestas |

### 11.3 Evolución del riesgo

El gráfico de evolución permite visualizar cómo ha cambiado su nivel de riesgo a lo largo del tiempo. Si el puntaje disminuye entre evaluaciones, indica que sus cambios de hábitos están teniendo efecto positivo.

---

## 12. Gestión de Dispositivos IoT

Esta sección aplica únicamente si dispone de un dispositivo **ESP32 + KY-037** para monitoreo físico de ruido.

### 12.1 Registrar un nuevo dispositivo

1. En el menú lateral, haga clic en **"Dispositivos"**.
2. Haga clic en **"Agregar dispositivo"**.
3. Ingrese un nombre descriptivo para el dispositivo (por ejemplo: "Sensor Laboratorio 1").
4. Haga clic en **"Crear"**.
5. El sistema genera una **clave de dispositivo** (`deviceKey`).

   > ⚠️ **Importante:** La clave del dispositivo solo se muestra una vez. Cópiela y guárdela en un lugar seguro antes de cerrar la ventana. Si la pierde, deberá registrar un nuevo dispositivo.

### 12.2 Configurar el ESP32

1. Copie la `deviceKey` generada.
2. Abra el archivo de configuración del firmware (`config.h` en el código Arduino).
3. Pegue la clave en el campo correspondiente:
   ```cpp
   #define DEVICE_KEY "su_clave_aqui"
   #define API_URL    "https://backend-hearguard.onrender.com"
   ```
4. Compile y cargue el firmware al ESP32 con el IDE de Arduino.
5. Conecte el cable USB del ESP32 al computador que ejecuta el puente serial (`node serial_bridge.js`).

### 12.3 Verificar que el dispositivo está enviando datos

1. Vaya a **"Dispositivos"** en el menú lateral.
2. El dispositivo registrado mostrará el campo **"Última conexión"** con la fecha y hora de la lectura más reciente.
3. Las lecturas del ESP32 aparecerán automáticamente en **"Historial"** → **"Lecturas de ruido"** con la fuente indicada como **IoT**.

### 12.4 Desactivar un dispositivo

1. En la lista de dispositivos, localice el dispositivo que desea desactivar.
2. Haga clic en **"Desactivar"**.
3. El dispositivo deja de aceptar nuevas lecturas pero su historial se conserva.

---

## 13. Perfil de Usuario

### 13.1 Acceder al perfil

1. Haga clic en su nombre o en el ícono de perfil en la esquina superior derecha.
2. Seleccione **"Mi perfil"**.

### 13.2 Datos editables

| Campo | Descripción |
|---|---|
| Nombre completo | Su nombre visible en la plataforma |
| Edad | Actualícela si cambia (afecta el cálculo de riesgo) |
| Ocupación | Su actividad laboral principal |

### 13.3 Actualizar el perfil

1. Modifique los campos que desee cambiar.
2. Haga clic en **"Guardar cambios"**.
3. El sistema confirma la actualización con un mensaje de éxito.

> **Nota:** La edad es un factor directo en el cálculo del riesgo auditivo. Manténgala actualizada para obtener resultados más precisos.

---

## 14. Aplicación Móvil Flutter

La aplicación móvil ofrece las mismas funciones principales que la versión web, optimizadas para dispositivos Android e iOS.

### 14.1 Instalación

**Android:**
1. Descargue el archivo `hearguard-ai.apk` desde el enlace proporcionado por su institución.
2. En su dispositivo, vaya a **Configuración → Seguridad → Instalar apps de fuentes desconocidas** y habilite la opción.
3. Abra el archivo APK descargado y siga los pasos de instalación.

**iOS:**
1. Instale la aplicación desde TestFlight con el enlace de invitación proporcionado.

### 14.2 Primer acceso

1. Abra la aplicación HearGuard AI en su dispositivo.
2. En la pantalla de inicio, elija **"Iniciar sesión"** si ya tiene cuenta, o **"Crear cuenta"** si es la primera vez.
3. Siga los mismos pasos descritos en las secciones 4 y 5.

### 14.3 Funciones disponibles en la app móvil

| Función | Disponible |
|---|:---:|
| Inicio de sesión / Registro | ✅ |
| Dashboard de salud auditiva | ✅ |
| Monitor de ruido (micrófono del celular) | ✅ |
| Evaluación auditiva (12 pasos) | ✅ |
| Resultados y nivel de riesgo | ✅ |
| Recomendaciones preventivas | ✅ |
| Historial de evaluaciones | ✅ |
| Gestión de dispositivos IoT | ✅ |
| Perfil de usuario | ✅ |

### 14.4 Permisos requeridos

| Permiso | Motivo |
|---|---|
| Micrófono | Captura del nivel de ruido en tiempo real |
| Internet | Comunicación con el servidor |
| Almacenamiento | Caché de datos de sesión |

---

## 15. Cierre de Sesión

### 15.1 Cerrar sesión de forma segura

1. Haga clic en su nombre o ícono de perfil (esquina superior derecha).
2. Seleccione **"Cerrar sesión"**.
3. El sistema revoca el token de seguridad y lo redirige a la pantalla de inicio de sesión.

> Siempre cierre sesión cuando use la plataforma en un dispositivo compartido o público.

---

## 16. Preguntas Frecuentes

**¿Mis datos de salud están seguros?**
Sí. Todos los datos se almacenan cifrados en MongoDB Atlas con TLS. Las contraseñas nunca se almacenan en texto plano (se usan técnicas de cifrado bcrypt). Ningún dato personal se comparte con terceros.

**¿Puedo usar la plataforma sin micrófono?**
Puede acceder a la evaluación auditiva, al historial y al dashboard sin micrófono. El módulo de monitoreo de ruido en tiempo real requiere micrófono.

**¿Con qué frecuencia debo realizar la evaluación auditiva?**
Se recomienda realizarla una vez al mes si su nivel de riesgo es Moderado o superior, y cada 3 meses si su nivel es Bajo.

**¿El resultado de la IA es un diagnóstico médico?**
No. Es una estimación preventiva basada en sus datos auto-reportados. Consulte siempre a un audiólogo certificado para un diagnóstico clínico formal.

**¿Qué pasa si el nivel de riesgo aumenta entre evaluaciones?**
Revise los factores de riesgo principales mostrados en los resultados. Identifique cuál cambió (más horas de auriculares, mayor volumen, nueva exposición laboral) y tome las medidas preventivas indicadas.

**¿Puedo tener más de un dispositivo IoT registrado?**
Sí. Puede registrar múltiples dispositivos ESP32 en una sola cuenta. Cada uno enviará lecturas que se almacenan en su historial identificadas por el nombre del dispositivo.

**¿Qué hago si olvidé mi contraseña?**
En la versión 1.0, contacte al administrador del sistema. La recuperación de contraseña por correo electrónico está planificada para una versión futura.

**¿Funciona sin conexión a internet?**
No. La plataforma requiere conexión a internet para comunicarse con el servidor, la base de datos y el microservicio de inteligencia artificial.

---

## 17. Glosario

| Término | Definición |
|---|---|
| **dB (decibelio)** | Unidad de medida del nivel de presión sonora. Un incremento de 10 dB representa el doble de la percepción de intensidad del sonido. |
| **Frecuencia (Hz)** | Medida de la velocidad de vibración del sonido. Las frecuencias bajas (250–500 Hz) corresponden a sonidos graves; las altas (4 000–8 000 Hz) a sonidos agudos. |
| **PAIR** | Pérdida Auditiva Inducida por Ruido. Daño irreversible en las células ciliadas del oído interno por exposición acumulada a sonidos de alta intensidad. |
| **Random Forest** | Algoritmo de aprendizaje automático utilizado por HearGuard AI para calcular el nivel de riesgo auditivo del usuario. |
| **JWT** | JSON Web Token. Mecanismo de seguridad que protege la sesión del usuario sin almacenar datos en el servidor. |
| **IoT** | Internet de las Cosas. Dispositivos físicos con conectividad a internet. En HearGuard AI, el ESP32 + KY-037 es el dispositivo IoT. |
| **ESP32** | Microcontrolador con Wi-Fi y Bluetooth, usado como nodo de monitoreo de ruido en HearGuard AI. |
| **KY-037** | Sensor de sonido de grado educativo conectado al ESP32 para capturar el nivel de ruido ambiental. |
| **Dashboard** | Pantalla principal del sistema que resume el estado de salud auditiva del usuario. |
| **Nivel de riesgo** | Clasificación del riesgo auditivo en cuatro niveles: Bajo, Moderado, Alto y Muy Alto. |

---

*HearGuard AI v1.0 · Universidad Continental · Escuela Académico Profesional de Ingeniería de Sistemas e Informática · 2026*

*Para soporte técnico o consultas académicas, contacte a: luisterreroshinojosa@gmail.com*
