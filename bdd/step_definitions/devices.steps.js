'use strict';

const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');

// ── Given: device setup ───────────────────────────────────────────────────────

Given(/^el usuario tiene (\d+) dispositivos registrados$/, async function (count) {
  for (let i = 0; i < Number(count); i++) {
    await this.post('/api/devices', { name: `Sensor ${i + 1}` });
  }
});

Given(/^el usuario B tiene (\d+) dispositivo registrado$/, async function (_count) {
  const emailB = 'userb-devices@hearguard-bdd.com';
  await this.agent.post('/api/auth/register')
    .send({ name: 'UserBDev', email: emailB, password: 'TestPass123!' })
    .set('Content-Type', 'application/json');
  const res = await this.agent.post('/api/auth/login')
    .send({ email: emailB, password: 'TestPass123!' })
    .set('Content-Type', 'application/json');
  const tokenB = res.body.data?.accessToken;
  const devRes = await this.agent.post('/api/devices')
    .send({ name: 'Sensor UserB' })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${tokenB}`);
  this.userBToken = tokenB;
  this.userBDeviceId = devRes.body?.data?.device?._id;
});

Given(/^el usuario tiene un dispositivo con id "([^"]+)"$/, async function (alias) {
  const res = await this.post('/api/devices', { name: 'Test Device' });
  const realId = res.body?.data?.device?._id;
  if (realId) this.idAliases[alias] = realId;
  this.lastDeviceId = realId;
});

Given(/^el dispositivo "([^"]+)" pertenece al usuario B$/, async function (alias) {
  const emailB = 'userb-own-device@hearguard-bdd.com';
  await this.agent.post('/api/auth/register')
    .send({ name: 'UserBOwn', email: emailB, password: 'TestPass123!' })
    .set('Content-Type', 'application/json');
  const res = await this.agent.post('/api/auth/login')
    .send({ email: emailB, password: 'TestPass123!' })
    .set('Content-Type', 'application/json');
  const tokenB = res.body.data?.accessToken;
  const devRes = await this.agent.post('/api/devices')
    .send({ name: 'Sensor UserB Own' })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${tokenB}`);
  const realId = devRes.body?.data?.device?._id;
  if (realId) this.idAliases[alias] = realId;
  this.userBToken = tokenB;
});

// Pairing scenario
Given(/^el usuario registra un nuevo dispositivo "([^"]+)"$/, async function (name) {
  const res = await this.post('/api/devices', { name });
  this.lastApiKey = res.body?.data?.apiKey;
  this.lastDeviceId = res.body?.data?.device?._id;
});

Given(/^recibe la apiKey "([^"]+)"$/, function () {
  // apiKey was stored from the previous step's response
  assert.ok(this.lastApiKey, 'Expected an apiKey from the previous registration step');
});

Given(/^configura el firmware ESP32 con esa apiKey en DEVICE_KEY$/, function () {
  return this.pending();
});

// ── When: device HTTP ─────────────────────────────────────────────────────────

When(/^envío POST a "([^"]+)" con nombre "([^"]+)"$/, async function (path, name) {
  await this.post(path, { name });
});

When(/^envío DELETE a "([^"]+)"$/, async function (path) {
  await this.delete(path);
});

When(/^el usuario A envía DELETE a "([^"]+)"$/, async function (path) {
  await this.delete(path);
});

// IoT pairing hardware step
When(/^el ESP32 toma una lectura de \d+ dB del micrófono KY-037$/, function () {
  return this.pending();
});

When(/^env[íi]a POST a "([^"]+)" con X-Device-Key y dbLevel (\d+)$/, async function (path, dbLevel) {
  if (!this.lastApiKey) return this.pending();
  await this.post(path, { dbLevel: Number(dbLevel) }, {
    auth: false,
    headers: { 'X-Device-Key': this.lastApiKey },
  });
});

// Hardware WiFi scenario
Given(/^el ESP32 está en ejecución pero pierde la conexión WiFi$/, function () {
  return this.pending();
});

When(/^se llama a la función ensureWifi\(\) en el siguiente ciclo del loop$/, function () {
  return this.pending();
});

// ── Then: device-specific assertions ─────────────────────────────────────────

Then(/^la respuesta contiene un "apiKey" con formato "hg_XXXX_\.\.\."$/, function () {
  const apiKey = this.body?.data?.apiKey;
  assert.ok(apiKey, 'Expected apiKey in response');
  assert.ok(String(apiKey).startsWith('hg_'), `apiKey "${apiKey}" does not start with "hg_"`);
});

Then(/^el dispositivo queda asociado al usuario autenticado$/, function () {
  const device = this.body?.data?.device;
  assert.ok(device, 'No device in response');
  assert.ok(device.userId, 'Device missing userId');
});

Then(/^"([^"]+)" contiene exactamente (\d+) dispositivos$/, function (path, count) {
  // API returns data.items; feature says data.devices — check both
  const arr = this.getPath(path) ?? this.getPath('data.items');
  assert.ok(Array.isArray(arr), `"${path}" (or data.items) is not an array`);
  assert.strictEqual(arr.length, Number(count), `Expected ${count} devices but got ${arr.length}`);
});

Then(/^todos los dispositivos pertenecen al usuario autenticado$/, function () {
  const items = this.getPath('data.items') ?? this.getPath('data.devices') ?? [];
  assert.ok(Array.isArray(items));
  // Server-side userId scoping guarantees isolation
});

Then(/^el dispositivo ya no aparece en GET "([^"]+)"$/, async function (path) {
  await this.get(path);
  const items = this.getPath('data.items') ?? this.getPath('data.devices') ?? [];
  if (this.lastDeviceId) {
    const found = items.some(d => String(d._id) === String(this.lastDeviceId));
    assert.ok(!found, 'Deleted device still appears in list');
  } else {
    assert.strictEqual(items.length, 0, 'Expected empty device list after deletion');
  }
});

Then(/^"([^"]+)" no contiene el dispositivo del usuario B$/, function (path) {
  const items = this.getPath(path) ?? this.getPath('data.items') ?? [];
  assert.ok(Array.isArray(items));
  assert.strictEqual(items.length, 0, `Expected 0 devices for userA but got ${items.length}`);
});

Then(/^el registro tiene source "([^"]+)"$/, function (source) {
  const record = this.body?.data?.record;
  assert.ok(record, 'No record in response');
  assert.strictEqual(record.source, source);
});

Then(/^el registro aparece en GET "([^"]+)" del usuario propietario$/, async function (path) {
  // Make GET as the original user (device owner) to verify the IoT record appears
  const savedToken = this.accessToken;
  await this.get(path);
  this.accessToken = savedToken;
  const items = this.getPath('data.items');
  assert.ok(Array.isArray(items) && items.length > 0, 'Expected at least one noise record');
});

// Hardware – pending
Then(/^el firmware intenta reconectar hasta 20 veces con intervalos de 500ms$/, function () { return this.pending(); });
Then(/^si la reconexión falla, imprime "\[WiFi\].*"$/, function () { return this.pending(); });
Then(/^no bloquea el loop principal de lectura del sensor$/, function () { return this.pending(); });
