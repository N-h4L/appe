const test = require("node:test");
const assert = require("node:assert/strict");

const { createServer } = require("../server");

let server;
let baseUrl;

test.before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("serves the home page", async () => {
  const response = await fetch(`${baseUrl}/`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /<title>Appe<\/title>/);
});

// # test("serves the health endpoint", async () => {
// #   const response = await fetch(`${baseUrl}/health`);
// #   const payload = await response.json();
// # 
// #   assert.equal(response.status, 200);
// #   assert.equal(payload.status, "ok");
// #   assert.equal(payload.service, "Appe");
// # });
// # 
// # test("serves the app info endpoint", async () => {
// #   const response = await fetch(`${baseUrl}/api/info`);
// #   const payload = await response.json();
// # 
// #   assert.equal(response.status, 200);
// #   assert.ok(payload.endpoints.includes("/health"));
// # });

test("blocks path traversal", async () => {
  const response = await fetch(`${baseUrl}/../README.md`);

  assert.equal(response.status, 404);
});
