import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';
import sqlite3pkg from 'sqlite3';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiPath = path.join(__dirname, '..', 'index.js');
const port = 3051;
let proc;
const nodeBin = process.execPath;
const sqlite3 = sqlite3pkg.verbose();
const dbFile = path.join(__dirname, '..', 'log.sqlite');

function createUser(email, name, password) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbFile);
    const hash = bcrypt.hashSync(password, 12);
    db.run(
      `INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)`,
      [name, email, hash],
      () => {
        db.close();
        resolve();
      }
    );
  });
}

function startServer(done) {
  createUser('bob@example.com', 'Bob', 'bob').then(() => {
    proc = spawn(nodeBin, [apiPath], {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        API_PORT: String(port),
        NODE_ENV: 'development',
        DISABLE_AUTH: 'false',
        SESSION_SECRET: 'test',
        SAML_ENTRY_POINT: 'http://localhost/saml',
        SAML_ISSUER: 'cueit',
        SAML_CALLBACK_URL: 'http://localhost/callback',
        SAML_CERT: 'dummy',
        JWT_SECRET: 'rbactest',
      },
    });
    proc.stdout.on('data', (d) => {
      if (d.toString().includes('CueIT API running')) done();
    });
  });
}

function stopServer() {
  if (proc) proc.kill();
}

describe('RBAC permissions', function () {
  this.timeout(5000);
  before((done) => startServer(done));
  after(stopServer);

  it('denies access without permission', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bob@example.com', password: 'bob' }),
    });
    const data = await res.json();
    const res2 = await fetch(`http://localhost:${port}/api/v1/users`, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    assert.strictEqual(res2.status, 403);
  });

  it('allows admin user', async () => {
    const res = await fetch(`http://localhost:${port}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin' }),
    });
    const data = await res.json();
    const res2 = await fetch(`http://localhost:${port}/api/users`, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    assert.strictEqual(res2.status, 200);
  });
});
