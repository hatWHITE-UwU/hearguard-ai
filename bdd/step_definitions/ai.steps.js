'use strict';

const { Given, When, Then } = require('@cucumber/cucumber');

// All AI service steps are marked pending.
// The Python Flask service (port 5001) is not available in this test process.
// Run the AI BDD tests separately with the AI service started.

const p = () => function () { return this.pending(); };

// ── Background ────────────────────────────────────────────────────────────────
Given(/^el servicio de IA está en ejecución en el puerto \d+$/, p());
Given(/^el modelo Random Forest está cargado desde el archivo "([^"]+)"$/, p());
Given(/^el R² del modelo en el conjunto de validación es mayor o igual a \d+\.\d+$/, p());
Given(/^el servicio de IA está disponible y respondiendo$/, p());
Given(/^el modelo retorna un riskScore de \d+$/, p());

// ── When ──────────────────────────────────────────────────────────────────────
When(/^envío POST a "([^"]+)" con cualquier combinación de parámetros$/, p());
When(/^envío POST a "([^"]+)" con cuerpo JSON vacío \{\}$/, p());
When(/^envío POST a "([^"]+)" con Content-Type "([^"]+)"$/, p());
When(/^envío POST a "([^"]+)" con un perfil de riesgo moderado$/, p());
When(/^envío POST a "([^"]+)" con riskLevel "([^"]+)"$/, p());
When(/^envío POST a "([^"]+)" con riskScore \d+$/, p());

// ── Then ──────────────────────────────────────────────────────────────────────
Then(/^el nivel de riesgo es "([^"]+)"$/, p());
Then(/^"([^"]+)" es menor que \d+$/, p());
Then(/^"([^"]+)" es mayor que \d+$/, p());
Then(/^"([^"]+)" es mayor o igual a \d+\.\d+$/, p());
Then(/^"([^"]+)" está en \["([^"]+)"(?:, "([^"]+)")*\]$/, p());
Then(/^"([^"]+)" es menor o igual a \d+$/, p());
Then(/^"([^"]+)" está en el rango 0.100$/, p());
Then(/^"([^"]+)" es una lista$/, p());
Then(/^el servicio no retorna código 500$/, p());
Then(/^"([^"]+)" es una lista con al menos \d+ elementos?$/, p());
Then(/^"([^"]+)" es un número entre 0 y 1$/, p());
Then(/^"([^"]+)" es uno de \[.+\]$/, p());
Then(/^"([^"]+)" contiene al menos \d+ recomendaci[oó]n$/, p());
Then(/^cada recomendación es una cadena de texto no vacía$/, p());
Then(/^"([^"]+)" contiene el nombre del algoritmo \("([^"]+)"\)$/, p());
// "data.features" es N    → handled by evaluations.steps.js "([^"]+)" es (\d+)
// "data.r2_holdout" …     → handled by line 30 above
// "([^"]+)" es "ok/loaded" → handled by evaluations.steps.js "([^"]+)" es "([^"]+)"
