const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('../server');

test('tourist registration stores privacy-safe metadata', async () => {
  const server = startServer(0);

  await new Promise((resolve) => server.once('listening', resolve));

  const port = server.address().port;
  const response = await fetch(`http://127.0.0.1:${port}/api/tourists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Asha',
      age: '28',
      phone: '9999999999',
      emergencyContact: '7777777777',
      destination: 'Goa',
      medicalInfo: 'Asthma'
    })
  });

  assert.equal(response.status, 201);
  const tourist = await response.json();
  assert.equal(tourist.phone, undefined);
  assert.equal(tourist.emergencyContact, undefined);
  assert.equal(tourist.medicalInfo, undefined);
  assert.equal(tourist.privacy?.storedLocally, true);
  assert.ok(tourist.privacy?.sensitiveDataHash);
  assert.match(tourist.privacy?.note, /stored locally/i);

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});
