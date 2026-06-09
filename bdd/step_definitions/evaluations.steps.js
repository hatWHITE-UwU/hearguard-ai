'use strict';

const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');

// ── Given: evaluation context ─────────────────────────────────────────────────

Given(/^el usuario completó la prueba con (\d+) scores de valor (\d+)$/, function (count, value) {
  this._scoreCount = Number(count);
  this._scoreValue = Number(value);
});

Given(/^el usuario B tiene evaluaciones guardadas$/, async function () {
  const emailB = 'userb-eval@hearguard-bdd.com';
  await this.agent.post('/api/auth/register')
    .send({ name: 'UserBEval', email: emailB, password: 'TestPass123!' })
    .set('Content-Type', 'application/json');
  const res = await this.agent.post('/api/auth/login')
    .send({ email: emailB, password: 'TestPass123!' })
    .set('Content-Type', 'application/json');
  const tokenB = res.body.data?.accessToken;
  const scores = this.buildFrequencyScores(12, 7);
  await this.agent.post('/api/evaluations')
    .send({ frequencyScores: scores, habitData: {} })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${tokenB}`);
  this.userBToken = tokenB;
});

// ── When: evaluation HTTP ─────────────────────────────────────────────────────

When(/^envío POST a "([^"]+)" con los 12 scores y habitData$/, async function (path) {
  const count = this._scoreCount || 12;
  const value = this._scoreValue || 8;
  const scores = this.buildFrequencyScores(count, value);
  await this.post(path, { frequencyScores: scores, habitData: {} });
});

When(/^envío POST a "([^"]+)" con solo (\d+) scores$/, async function (path, count) {
  const scores = this.buildFrequencyScores(Number(count), 7);
  await this.post(path, { frequencyScores: scores, habitData: {} });
});

When(/^envío POST a "([^"]+)" con un score de valor (\d+)$/, async function (path, scoreVal) {
  const scores = [{ hz: 250, score: Number(scoreVal), ear: 'left' }];
  await this.post(path, { frequencyScores: scores, habitData: {} });
});

When(/^envío POST a "([^"]+)" con scores válidos$/, async function (path) {
  const scores = this.buildFrequencyScores(12, 7);
  await this.post(path, { frequencyScores: scores, habitData: {} });
});

// ── Then: evaluation assertions ───────────────────────────────────────────────

Then(/^"([^"]+)" es (\d+)$/, function (path, expected) {
  const actual = this.getPath(path);
  assert.strictEqual(actual, Number(expected), `"${path}": expected ${expected} but got ${actual}`);
});

Then(/^"([^"]+)" es "([^"]+)"$/, function (path, expected) {
  const actual = this.getPath(path);
  assert.strictEqual(actual, expected, `"${path}": expected "${expected}" but got "${actual}"`);
});

Then(/^"([^"]+)" no contiene evaluaciones del usuario B$/, function (path) {
  const items = this.getPath(path);
  assert.ok(Array.isArray(items), `"${path}" is not an array`);
  // Server-side scoping ensures userA only sees their own evaluations
  assert.strictEqual(items.length, 0, `Expected 0 evaluations for userA but got ${items.length}`);
});
