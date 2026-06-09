'use strict';

const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');

// ── Background no-ops ────────────────────────────────────────────────────────

Given(/^el servidor backend está en ejecución$/, function () {});
Given(/^la base de datos MongoDB está disponible$/, function () {});
Given(/^los endpoints de autenticación responden en "([^"]+)"$/, function () {});
Given(/^posee un "accessToken" válido en el header de autorización$/, function () {});
Given(/^posee un "accessToken" válido$/, function () {});
Given(/^el usuario completó la prueba auditiva con 12 frecuencias$/, function () {});
Given(/^se encuentra en la ruta "([^"]+)"$/, function () {});

// ── Auth removal ─────────────────────────────────────────────────────────────

Given(/^no incluyo el header de autorización$/, function () {
  this.skipAuth = true;
});

// ── Generic HTTP verbs ────────────────────────────────────────────────────────

When(/^envío GET a "([^"]+)"$/, async function (path) {
  await this.get(path);
});

When(/^el usuario A envía GET a "([^"]+)"$/, async function (path) {
  await this.get(path);
});

// ── HTTP status assertions ────────────────────────────────────────────────────

Then(/^el código de respuesta HTTP es (\d+)$/, function (code) {
  assert.strictEqual(
    this.response.status,
    Number(code),
    `Expected HTTP ${code} but got ${this.response.status}. Body: ${JSON.stringify(this.body)}`,
  );
});

Then(/^el código de respuesta HTTP no es (\d+)$/, function (code) {
  assert.notStrictEqual(
    this.response.status,
    Number(code),
    `Expected HTTP status != ${code} but got ${this.response.status}`,
  );
});

// ── Generic response assertions ───────────────────────────────────────────────

Then(/^la respuesta contiene "success" igual a (true|false)$/, function (val) {
  assert.strictEqual(this.body.success, val === 'true');
});

Then(/^la respuesta contiene "error" igual a "([^"]+)"$/, function (code) {
  assert.strictEqual(this.body.error, code, `Expected error="${code}" but got "${this.body.error}"`);
});

Then(/^el mensaje es "([^"]+)"$/, function (msg) {
  assert.strictEqual(this.body.message, msg);
});

Then(/^la respuesta no contiene "([^"]+)"$/, function (key) {
  const inRoot = this.body?.[key];
  const inData = this.body?.data?.[key];
  assert.ok(!inRoot && !inData, `Response unexpectedly contains "${key}"`);
});

// ── Field path assertions (search body.data + nested objects) ────────────────

Then(/^el campo "([^"]+)" es "([^"]+)"$/, function (path, expected) {
  const actual = this.resolveField(path);
  assert.strictEqual(actual, expected, `Field "${path}": expected "${expected}" but got "${actual}"`);
});

Then(/^el campo "([^"]+)" es (true|false)$/, function (path, val) {
  const actual = this.resolveField(path);
  assert.strictEqual(actual, val === 'true', `Field "${path}": expected ${val} but got ${actual}`);
});

// ── Data path count / numeric assertions ─────────────────────────────────────

Then(/^"([^"]+)" contiene exactamente (\d+) elementos?$/, function (path, count) {
  const arr = this.getPath(path);
  assert.ok(Array.isArray(arr), `"${path}" is not an array`);
  assert.strictEqual(arr.length, Number(count), `"${path}".length: expected ${count} but got ${arr.length}`);
});

Then(/^"([^"]+)" es mayor o igual a (\d+)$/, function (path, min) {
  const val = this.getPath(path);
  assert.ok(val >= Number(min), `"${path}": expected >= ${min} but got ${val}`);
});
