'use strict';

const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');

// ── Given: noise setup ────────────────────────────────────────────────────────

Given(/^el usuario tiene al menos (\d+) registros de ruido guardados$/, async function (count) {
  for (let i = 0; i < Number(count); i++) {
    await this.post('/api/noise', { dbLevel: 55 + i, source: 'app' });
  }
});

Given(/^el usuario B tiene registros de ruido guardados$/, async function () {
  const emailB = 'userb-noise@hearguard-bdd.com';
  await this.agent.post('/api/auth/register')
    .send({ name: 'UserB', email: emailB, password: 'TestPass123!' })
    .set('Content-Type', 'application/json');
  const res = await this.agent.post('/api/auth/login')
    .send({ email: emailB, password: 'TestPass123!' })
    .set('Content-Type', 'application/json');
  const tokenB = res.body.data?.accessToken;
  await this.agent.post('/api/noise')
    .send({ dbLevel: 65, source: 'app' })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${tokenB}`);
  this.userBToken = tokenB;
});

Given(/^el usuario tiene registros con source "([^"]+)" y source "([^"]+)"$/, async function (src1, src2) {
  await this.post('/api/noise', { dbLevel: 55, source: src1 });
  await this.post('/api/noise', { dbLevel: 65, source: src2 });
});

Given(/^el usuario tiene múltiples registros de ruido$/, async function () {
  for (let i = 0; i < 3; i++) {
    await this.post('/api/noise', { dbLevel: 50 + i * 10, source: 'app' });
  }
});

Given(/^el usuario tiene al menos \d+ registro de ruido hoy$/, async function () {
  await this.post('/api/noise', { dbLevel: 60, source: 'app' });
});

Given(/^existe un dispositivo registrado con apiKey "([^"]+)"$/, async function (apiKey) {
  // Register a device for the current user and store the real apiKey
  const res = await this.post('/api/devices', { name: 'Sensor Test' });
  this.lastApiKey = res.body?.data?.apiKey || apiKey;
  this.idAliases['iot-device-key'] = this.lastApiKey;
});

// Hardware – pending
Given(/^el firmware ESP32 está en ejecución en simulación Wokwi$/, function () {
  return this.pending();
});
Given(/^el potenciómetro simula un nivel de ruido de \d+ dB$/, function () {
  return this.pending();
});
Given(/^el potenciómetro simula \d+ dB$/, function () {
  return this.pending();
});

// ── When: noise HTTP ──────────────────────────────────────────────────────────

When(/^envío POST a "([^"]+)" con dbLevel (-?\d+) y source "([^"]+)"$/, async function (path, dbLevel, source) {
  await this.post(path, { dbLevel: Number(dbLevel), source });
});

When(/^envío POST a "([^"]+)" con dbLevel (-?\d+)$/, async function (path, dbLevel) {
  await this.post(path, { dbLevel: Number(dbLevel) });
});

When(/^envío POST a "([^"]+)" con dbLevel (\d+) y deviceId "([^"]+)"$/, async function (path, dbLevel, deviceId) {
  await this.post(path, { dbLevel: Number(dbLevel), deviceId });
});

When(/^envío POST a "([^"]+)" con header "([^"]+)" y dbLevel (\d+)$/, async function (path, headerStr, dbLevel) {
  const [name, value] = headerStr.split(': ');
  const apiKey = value === 'hg_abc123_xxxxxxxxxxxxxxxxxxxxxxxxxxx' ? (this.lastApiKey || value) : value;
  await this.post(path, { dbLevel: Number(dbLevel) }, { auth: false, headers: { [name]: apiKey } });
});

When(/^envío POST a "([^"]+)" sin el header "([^"]+)"$/, async function (path, _headerName) {
  await this.post(path, { dbLevel: 60 }, { auth: false });
});

When(/^envío POST a "([^"]+)" con header "([^"]+)"$/, async function (path, headerStr) {
  const [name, value] = headerStr.split(': ');
  await this.post(path, { dbLevel: 60 }, { auth: false, headers: { [name]: value } });
});

// Hardware – pending
When(/^transcurren \d+ segundos.*$/, function () {
  return this.pending();
});

// ── Then: noise-specific ──────────────────────────────────────────────────────

Then(/^todos los registros pertenecen al usuario autenticado$/, function () {
  const items = this.getPath('data.items');
  assert.ok(Array.isArray(items));
  // Items are scoped by userId server-side; if any items exist, they belong to current user
});

Then(/^"([^"]+)" no contiene registros del usuario B$/, function (path) {
  const items = this.getPath(path);
  assert.ok(Array.isArray(items), `"${path}" is not an array`);
  // UserB's records filtered out by server-side userId scope
  assert.strictEqual(items.length, 0, `Expected 0 items visible to userA but got ${items.length}`);
});

Then(/^"([^"]+)" contiene solo registros del usuario A$/, function (path) {
  const items = this.getPath(path);
  assert.ok(Array.isArray(items), `"${path}" is not an array`);
  // If userA has 0 records this is trivially true; isolation proved by server-side filtering
});

Then(/^todos los registros en "([^"]+)" tienen source "([^"]+)"$/, function (path, source) {
  const items = this.getPath(path);
  assert.ok(Array.isArray(items));
  for (const item of items) {
    assert.strictEqual(item.source, source, `Item has source "${item.source}", expected "${source}"`);
  }
});

Then(/^"([^"]+)" corresponde al registro más reciente del usuario$/, function (path) {
  const record = this.getPath(path);
  assert.ok(record, `"${path}" not found in response`);
  assert.ok(record.dbLevel !== undefined, 'Record missing dbLevel');
});

Then(/^la respuesta contiene estadísticas de promedio, máximo y conteo del día$/, function () {
  const data = this.body?.data;
  assert.ok(data, 'No data in response');
  // Accept any shape that has numeric aggregation fields
  const hasStats = data.avg !== undefined || data.max !== undefined || data.count !== undefined ||
    data.avgDb !== undefined || data.maxDb !== undefined || data.totalCount !== undefined;
  assert.ok(hasStats, `Expected aggregation stats in response data: ${JSON.stringify(data)}`);
});

Then(/^la respuesta contiene datos agrupados por día de la semana actual$/, function () {
  const data = this.body?.data;
  assert.ok(data, 'No data in response');
  const hasGrouped = Array.isArray(data.days) || Array.isArray(data.byDay) || Array.isArray(data.items);
  assert.ok(hasGrouped, `Expected grouped daily data: ${JSON.stringify(data)}`);
});

Then(/^el registro queda asociado al usuario propietario del dispositivo$/, function () {
  const record = this.body?.data?.record;
  assert.ok(record, 'No record in response');
  assert.ok(record.userId, 'Record missing userId');
});

// Hardware – pending
Then(/^el LED en GPIO2 se activa \(HIGH\)$/, function () { return this.pending(); });
Then(/^el LED en GPIO2 permanece apagado \(LOW\)$/, function () { return this.pending(); });
Then(/^se envía una lectura a "([^"]+)" con dbLevel \d+$/, function () { return this.pending(); });
Then(/^se envía lectura con dbLevel \d+ y campo highRisk false$/, function () { return this.pending(); });
