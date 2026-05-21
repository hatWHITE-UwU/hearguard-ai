'use strict';

/**
 * Sonar rule javascript:S2699 exige aserciones Jest; supertest `.expect(status)`
 * no las cuenta. Usar esta función en tests que solo validan el código HTTP.
 */
async function expectStatus(supertestPromise, status) {
  const res = await supertestPromise;
  expect(res.status).toBe(status);
  return res;
}

module.exports = { expectStatus };
