'use strict';

const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');

// ── Given: user setup ─────────────────────────────────────────────────────────

Given(/^no existe ningún usuario registrado con el email "([^"]+)"$/, function () {
  // DB is cleaned before each scenario by hooks.js
});

Given(/^existe un usuario registrado con el email "([^"]+)"$/, async function (email) {
  await this.registerAndLogin(email);
});

Given(/^existe un usuario registrado con email "([^"]+)" y password "([^"]+)"$/, async function (email, password) {
  await this.registerAndLogin(email, password);
});

Given(/^el usuario "([^"]+)" tiene sesión iniciada$/, async function (email) {
  await this.registerAndLogin(email);
});

Given(/^posee un "refreshToken" válido$/, function () {
  // Token was stored by the previous Given step
});

Given(/^el usuario "([^"]+)" tiene un "accessToken" válido$/, async function (email) {
  await this.registerAndLogin(email);
});

Given(/^el usuario "([^"]+)" está autenticado$/, async function (email) {
  await this.registerAndLogin(email);
});

// ── Given: shared across features ────────────────────────────────────────────

Given(/^el usuario está autenticado en la aplicación web$/, async function () {
  await this.registerAndLogin('testuser@hearguard-bdd.com');
});

// ── When: POST variants ───────────────────────────────────────────────────────

When(/^envío POST a "([^"]+)" con:$/, async function (path, dataTable) {
  const raw = dataTable.rowsHash();
  const body = {};
  for (const [k, v] of Object.entries(raw)) {
    // Attempt to parse JSON values (arrays, numbers); fall back to string
    try {
      body[k] = JSON.parse(v);
    } catch {
      body[k] = v;
    }
  }
  await this.post(path, body, { auth: false });
});

When(/^envío POST a "([^"]+)" con el mismo email$/, async function (path) {
  await this.post(path, { name: 'Otro', email: this.lastEmail, password: 'OtroPass1!' });
});

When(/^envío POST a "([^"]+)" con password "([^"]+)"$/, async function (path, password) {
  await this.post(path, { email: this.lastEmail, password }, { auth: false });
});

When(/^envío POST a "([^"]+)" con email "([^"]+)"$/, async function (path, email) {
  await this.post(path, { email, password: 'TestPass123!' }, { auth: false });
});

When(/^envío POST a "([^"]+)" sin el campo "([^"]+)"$/, async function (path, field) {
  const body = { name: 'Test', email: 'x@hearguard-test.com', password: 'TestPass123!', dbLevel: 60, source: 'app', riskLevel: 'Bajo' };
  delete body[field];
  const opts = field === 'password' || path.includes('auth') ? { auth: false } : {};
  await this.post(path, body, opts);
});

When(/^envío POST a "([^"]+)" con el refreshToken$/, async function (path) {
  await this.post(path, { refreshToken: this.refreshToken }, { auth: false });
});

When(/^envío POST a "([^"]+)" con un token aleatorio "([^"]+)"$/, async function (path, token) {
  await this.post(path, { refreshToken: token }, { auth: false });
});

// ── When: GET variants ────────────────────────────────────────────────────────

When(/^envío GET a "([^"]+)" con el header "Authorization: Bearer <accessToken>"$/, async function (path) {
  await this.get(path);
});

When(/^envío GET a "([^"]+)" sin header de autorización$/, async function (path) {
  await this.get(path, { auth: false });
});

When(/^envío GET a "([^"]+)" con un JWT con firma alterada$/, async function (path) {
  const jwt = require('jsonwebtoken');
  const fakeToken = jwt.sign({ id: 'fake', email: 'x@test.com' }, 'wrong-secret-for-bdd');
  await this.get(path, { auth: false, headers: { Authorization: `Bearer ${fakeToken}` } });
});

When(/^envío GET a "([^"]+)" con un JWT usando algoritmo "([^"]+)"$/, async function (path, alg) {
  // Construct a none-algorithm token manually
  const header = Buffer.from(JSON.stringify({ alg, typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ id: 'fake', iat: Math.floor(Date.now() / 1000) })).toString('base64url');
  const noneToken = `${header}.${payload}.`;
  await this.get(path, { auth: false, headers: { Authorization: `Bearer ${noneToken}` } });
});

// NoSQL injection
When(/^envío POST a "([^"]+)" con email igual a '([^']+)' y password "([^"]+)"$/, async function (path, emailJson, password) {
  let emailVal;
  try { emailVal = JSON.parse(emailJson); } catch { emailVal = emailJson; }
  await this.post(path, { email: emailVal, password }, { auth: false });
});

When(/^envío POST a "([^"]+)" con password igual a '([^']+)'$/, async function (path, passwordJson) {
  let pwVal;
  try { pwVal = JSON.parse(passwordJson); } catch { pwVal = passwordJson; }
  await this.post(path, { email: this.lastEmail || 'x@test.com', password: pwVal }, { auth: false });
});

// ── Then: auth-specific assertions ───────────────────────────────────────────

Then(/^la respuesta contiene un "([^"]+)" no vacío$/, function (key) {
  const val = this.body?.data?.[key] || this.body?.[key];
  assert.ok(val, `Expected a non-empty "${key}" in response`);
});

Then(/^la respuesta contiene un "([^"]+)" válido firmado con JWT$/, function (key) {
  const val = this.body?.data?.[key] || this.body?.[key];
  assert.ok(val, `Expected a "${key}" in response`);
  const parts = String(val).split('.');
  assert.strictEqual(parts.length, 3, `"${key}" does not look like a JWT (expected 3 parts)`);
});

Then(/^el campo "([^"]+)" no aparece en la respuesta$/, function (path) {
  const parts = path.split('.');
  let obj = this.body;
  // Navigate data envelope if needed
  if (obj?.data) {
    // Try under data first
    const inData = parts.reduce((acc, k) => acc?.[k], obj.data);
    if (inData !== undefined) {
      assert.fail(`Field "${path}" unexpectedly found in response.data`);
    }
  }
  const inRoot = parts.reduce((acc, k) => acc?.[k], obj);
  assert.strictEqual(inRoot, undefined, `Field "${path}" unexpectedly found in response`);
});

Then(/^el usuario queda almacenado en la base de datos con la contraseña hasheada$/, async function () {
  const User = require('../../backend/src/models/User');
  const email = this.lastEmail || this.body?.data?.user?.email;
  const user = await User.findOne({ email }).select('+password');
  assert.ok(user, 'User not found in DB');
  assert.ok(user.password, 'Password not stored');
  assert.notStrictEqual(user.password, this.lastPassword, 'Password should be hashed, not plain text');
});

Then(/^la respuesta contiene el email "([^"]+)"$/, function (email) {
  const bodyStr = JSON.stringify(this.body);
  assert.ok(bodyStr.includes(email), `Expected email "${email}" in response`);
});

Then(/^la respuesta contiene un nuevo "accessToken"$/, function () {
  const val = this.body?.data?.accessToken || this.body?.accessToken;
  assert.ok(val, 'Expected a new accessToken in response');
});
