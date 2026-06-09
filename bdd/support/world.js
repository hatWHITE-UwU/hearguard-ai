'use strict';

const { setWorldConstructor, World } = require('@cucumber/cucumber');
const supertest = require('supertest');
const { app } = require('../../backend/server');

/** Resolves a dot-separated path inside an object. */
function getPath(obj, path) {
  return path.split('.').reduce((acc, k) => acc?.[k], obj);
}

/**
 * Searches for a field in the response body, trying:
 *   1. body[path]
 *   2. body.data[path]
 *   3. body.data.<first-nested-object>[path]
 */
function resolveField(body, path) {
  let val = getPath(body, path);
  if (val !== undefined) return val;
  val = getPath(body.data, path);
  if (val !== undefined) return val;
  for (const nested of Object.values(body.data || {})) {
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      val = getPath(nested, path);
      if (val !== undefined) return val;
    }
  }
  return undefined;
}

class HearGuardWorld extends World {
  constructor(options) {
    super(options);
    this.agent = supertest(app);
    this.response = null;
    this.body = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.lastEmail = null;
    this.lastPassword = null;
    this.userBToken = null;
    this.lastDeviceId = null;
    this.lastApiKey = null;
    this.idAliases = {};
    this.skipAuth = false;
    this._scoreCount = 0;
    this._scoreValue = 8;
  }

  /** Resolves placeholder IDs (e.g. "abc123") to real MongoDB IDs stored during setup. */
  resolvePath(urlPath) {
    return urlPath.replace(/\/([^/]+)/g, (match, segment) =>
      this.idAliases[segment] ? `/${this.idAliases[segment]}` : match,
    );
  }

  /** Returns value at dot-path inside this.body. */
  getPath(path) {
    return getPath(this.body, path);
  }

  /** Returns value at path searching body + body.data + body.data.*. */
  resolveField(path) {
    return resolveField(this.body, path);
  }

  async post(urlPath, body, opts = {}) {
    let req = this.agent.post(urlPath).send(body).set('Content-Type', 'application/json');
    if (!this.skipAuth && opts.auth !== false && this.accessToken) {
      req = req.set('Authorization', `Bearer ${this.accessToken}`);
    }
    if (opts.headers) {
      for (const [k, v] of Object.entries(opts.headers)) req = req.set(k, v);
    }
    this.response = await req;
    this.body = this.response.body;
    return this.response;
  }

  async get(urlPath, opts = {}) {
    const resolved = this.resolvePath(urlPath);
    let req = this.agent.get(resolved);
    if (!this.skipAuth && opts.auth !== false && this.accessToken) {
      req = req.set('Authorization', `Bearer ${this.accessToken}`);
    }
    if (opts.headers) {
      for (const [k, v] of Object.entries(opts.headers)) req = req.set(k, v);
    }
    this.response = await req;
    this.body = this.response.body;
    return this.response;
  }

  async delete(urlPath, opts = {}) {
    const resolved = this.resolvePath(urlPath);
    let req = this.agent.delete(resolved);
    if (!this.skipAuth && opts.auth !== false && this.accessToken) {
      req = req.set('Authorization', `Bearer ${this.accessToken}`);
    }
    this.response = await req;
    this.body = this.response.body;
    return this.response;
  }

  async registerAndLogin(email, password = 'TestPass123!') {
    const name = email.split('@')[0];
    await this.agent.post('/api/auth/register')
      .send({ name, email, password })
      .set('Content-Type', 'application/json');
    const res = await this.agent.post('/api/auth/login')
      .send({ email, password })
      .set('Content-Type', 'application/json');
    if (res.body?.data) {
      this.accessToken = res.body.data.accessToken;
      this.refreshToken = res.body.data.refreshToken;
    }
    this.lastEmail = email;
    this.lastPassword = password;
    return res;
  }

  buildFrequencyScores(count, scoreValue) {
    const freqs = [250, 500, 1000, 2000, 4000, 8000];
    const scores = [];
    const ears = ['left', 'right'];
    let added = 0;
    for (const ear of ears) {
      for (const hz of freqs) {
        if (added >= count) break;
        scores.push({ hz, score: scoreValue, ear });
        added++;
      }
      if (added >= count) break;
    }
    return scores;
  }
}

setWorldConstructor(HearGuardWorld);
module.exports = { getPath, resolveField };
