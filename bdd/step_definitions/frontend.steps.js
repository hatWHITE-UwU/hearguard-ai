'use strict';

const { Given, When, Then } = require('@cucumber/cucumber');

// All frontend/Angular UI steps are marked pending.
// These require a running Angular app + browser automation (Playwright E2E).

const p = () => function () { return this.pending(); };

// ── Navigation ────────────────────────────────────────────────────────────────
Given(/^el usuario está en "([^"]+)"$/, p());
Given(/^el usuario navega directamente a "([^"]+)"$/, p());
Given(/^el campo habitData está vacío$/, p());
Given(/^el usuario completa el cuestionario de hábitos$/, p());
Given(/^el usuario está en el paso \d+ \(.+\)$/, p());
Given(/^el tono está reproduciéndose$/, p());
Given(/^el volumen actual es .+$/, p());
Given(/^el volumen está ajustado a .+$/, p());
Given(/^el usuario ha respondido los 12 pasos de la prueba$/, p());
Given(/^el usuario ha completado algunos pasos de la prueba$/, p());
Given(/^PUBLIC_DEMO está activado \(true\)$/, p());
Given(/^PUBLIC_DEMO está activo$/, p());
Given(/^el usuario no tiene sesión real$/, p());
Given(/^el micrófono del dispositivo captura audio en tiempo real$/, p());
Given(/^el monitor lleva más de 30 muestras registradas$/, p());
Given(/^el usuario acaba de completar el último paso de la prueba auditiva$/, p());
Given(/^el usuario obtuvo puntuaciones .+ en todas las frecuencias \(score \d+\)$/, p());
Given(/^el usuario tiene \d+ evaluaciones previas guardadas$/, p());
Given(/^el nivel de riesgo calculado es "([^"]+)"$/, p());
Given(/^el usuario envió \d+ scores válidos$/, p());
Given(/^el usuario envió solo \d+ scores \(interrumpió la prueba\)$/, p());

// ── When ──────────────────────────────────────────────────────────────────────
When(/^selecciona las siguientes opciones:$/, p());
When(/^hace clic en "([^"]+)"$/, p());
When(/^el usuario hace clic en "([^"]+)"$/, p());
When(/^hace clic de nuevo en el botón de reproducción$/, p());
When(/^hace clic en el botón de reproducción$/, p());
When(/^el usuario mueve el slider de volumen a .+$/, p());
When(/^inicia la prueba auditiva$/, p());
When(/^se registra el último paso$/, p());
When(/^se llama a resetFlow\(\)$/, p());
When(/^se llama a seedDemoSession\(\) con overallTarget=\d+$/, p());
When(/^se muestran los resultados$/, p());
When(/^navega a "([^"]+)"$/, p());
When(/^es redirigido automáticamente a "([^"]+)"$/, p());
When(/^el usuario ve sus resultados$/, p());
When(/^se guarda la evaluación en el backend$/, p());
When(/^se toma una nueva muestra$/, p());
When(/^el nivel medido es \d+ dB$/, p());

// ── Then ──────────────────────────────────────────────────────────────────────
Then(/^es redirigido a "([^"]+)"$/, p());
Then(/^el servicio HearingTestService tiene habitData con los valores seleccionados$/, p());
Then(/^ve el mensaje "([^"]+)"$/, p());
Then(/^aparece el botón "([^"]+)"$/, p());
Then(/^el test contiene 12 pasos en total$/, p());
Then(/^los primeros \d+ pasos corresponden al oído izquierdo$/, p());
Then(/^los últimos \d+ pasos corresponden al oído derecho$/, p());
Then(/^las frecuencias son 250, 500, 1000, 2000, 4000 y 8000 Hz en cada oído$/, p());
Then(/^se inicia el AudioContext y el oscilador con frecuencia \d+ Hz$/, p());
Then(/^el panner estéreo se posiciona en -\d+ \(izquierdo\)$/, p());
Then(/^el visualizador de barras comienza a animarse$/, p());
Then(/^el tono se detiene$/, p());
Then(/^el visualizador se resetea a altura mínima$/, p());
Then(/^el GainNode del AudioContext actualiza su valor a .+$/, p());
Then(/^el signal "volume" del servicio refleja el valor .+$/, p());
Then(/^se registra una fila con hz=\d+, ear="[^"]+", score=\d+$/, p());
Then(/^el paso avanza al paso \d+.*$/, p());
Then(/^el tono se detiene automáticamente$/, p());
Then(/^el score registrado es \d+$/, p());
Then(/^el usuario es redirigido automáticamente a "([^"]+)"$/, p());
Then(/^currentStepIndex vuelve a 0$/, p());
Then(/^el array de scores queda vacío$/, p());
Then(/^isComplete es false$/, p());
Then(/^isComplete es true$/, p());
Then(/^el array de scores contiene exactamente 12 filas$/, p());
Then(/^todos los scores están en el rango 0.10$/, p());
Then(/^habitData no es null$/, p());
Then(/^ve una pantalla de resultados con:$/, p());
Then(/^no ve errores en la pantalla$/, p());
Then(/^la puntuación global mostrada es \d+.*$/, p());
Then(/^el nivel de riesgo mostrado es .+$/, p());
Then(/^las recomendaciones incluyen orientación a especialista$/, p());
Then(/^ve las \d+ evaluaciones ordenadas por fecha descendente$/, p());
Then(/^cada evaluación muestra fecha, puntuación global y nivel de riesgo$/, p());
Then(/^la gráfica audiométrica muestra 6 puntos por oído.*$/, p());
Then(/^el oído izquierdo se muestra en color diferente al oído derecho$/, p());
Then(/^las recomendaciones mostradas son coherentes con ese nivel$/, p());
Then(/^hay al menos 1 recomendación visible$/, p());
Then(/^ve resultados de demostración con recomendaciones$/, p());
Then(/^no ve errores de autenticación$/, p());
Then(/^el clasificador muestra "([^"]+)" con color .+$/, p());
Then(/^el array "history" contiene exactamente 30 elementos \(FIFO\)$/, p());
Then(/^el elemento más antiguo fue eliminado$/, p());
