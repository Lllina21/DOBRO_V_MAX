const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const config = require('../../config');
const fs = require('fs');

const dbDir = path.dirname(config.DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;

async function initDB() {
  db = await open({
    filename: config.DB_PATH,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      username TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      region TEXT,
      docs_urls TEXT,
      is_verified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      region TEXT NOT NULL,
      description TEXT NOT NULL,
      full_description TEXT,
      is_paid INTEGER DEFAULT 0,
      compensation TEXT,
      verified INTEGER DEFAULT 0,
      verified_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES requests(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS user_states (
      user_id TEXT PRIMARY KEY,
      state TEXT,
      data TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try { await db.run("ALTER TABLE requests ADD COLUMN is_paid INTEGER DEFAULT 0"); } catch (e) {}
  try { await db.run("ALTER TABLE requests ADD COLUMN compensation TEXT"); } catch (e) {}
  try { await db.run("ALTER TABLE requests ADD COLUMN verified_by TEXT"); } catch (e) {}

  console.log('✅ БД инициализирована');
}

// --- Пользователи ---
async function saveUser(user) {
  await db.run(`INSERT OR REPLACE INTO users (id, first_name, last_name, username) VALUES (?, ?, ?, ?)`,
    [user.id, user.firstName, user.lastName, user.username]
  );
}
async function getUser(userId) { return await db.get('SELECT * FROM users WHERE id = ?', [userId]); }

// --- Организации ---
async function registerOrganization(userId, data) {
  const result = await db.run(
    `INSERT INTO organizations (user_id, name, description, region, docs_urls) VALUES (?, ?, ?, ?, ?)`,
    [userId, data.name, data.description, data.region, JSON.stringify(data.docsUrls || [])]
  );
  return result.lastID;
}
async function getOrganizationByUserId(userId) { return await db.get('SELECT * FROM organizations WHERE user_id = ?', [userId]); }
async function verifyOrganization(userId) {
  await db.run(`UPDATE organizations SET is_verified = 1 WHERE user_id = ?`, [userId]);
  await db.run(`UPDATE requests SET verified = 1, verified_by = ? WHERE user_id = ? AND verified = 0`, [`org:${userId}`, userId]);
}
async function isOrganizationVerified(userId) {
  const org = await db.get('SELECT is_verified FROM organizations WHERE user_id = ?', [userId]);
  return org && org.is_verified === 1;
}

// --- Заявки ---
async function createRequest(requestData) {
  const isOrg = await isOrganizationVerified(requestData.userId);
  const verified = isOrg ? 1 : 0;
  const verifiedBy = isOrg ? `org:${requestData.userId}` : null;

  const result = await db.run(
    `INSERT INTO requests (user_id, title, category, type, region, description, full_description, is_paid, compensation, verified, verified_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [requestData.userId, requestData.title, requestData.category, requestData.type, requestData.region, requestData.description, requestData.fullDescription || requestData.description, requestData.isPaid ? 1 : 0, requestData.compensation || '', verified, verifiedBy]
  );
  return await getRequest(result.lastID);
}

async function getRequest(requestId) {
  const req = await db.get('SELECT * FROM requests WHERE id = ?', [requestId]);
  if (!req) return null;
  req.is_paid = req.is_paid === 1;
  req.verified = req.verified === 1;
  req.responses = await db.all('SELECT * FROM responses WHERE request_id = ?', [requestId]);
  return req;
}

async function getRequests(options = {}) {
  let query = `SELECT * FROM requests WHERE verified = 1`;
  const params = [];
  if (options.category) { query += ' AND category = ?'; params.push(options.category); }
  if (options.region)   { query += ' AND region = ?';   params.push(options.region); }
  if (options.type)     { query += ' AND type = ?';     params.push(options.type); }
  if (options.isPaid !== undefined) { query += ' AND is_paid = ?'; params.push(options.isPaid ? 1 : 0); }
  query += ' ORDER BY created_at DESC';
  if (options.limit)  { query += ' LIMIT ?'; params.push(options.limit); }
  if (options.offset) { query += ' OFFSET ?'; params.push(options.offset); }
  const rows = await db.all(query, params);
  return rows.map(r => ({ ...r, is_paid: r.is_paid === 1, verified: r.verified === 1 }));
}

async function verifyRequest(requestId) {
  await db.run(`UPDATE requests SET verified = 1, verified_by = 'admin' WHERE id = ?`, [requestId]);
}

// --- Отклики ---
async function createResponse(responseData) {
  await db.run(`INSERT INTO responses (request_id, user_id, message, status) VALUES (?, ?, ?, ?)`,
    [responseData.requestId, responseData.userId, responseData.message || '', responseData.status || 'pending']
  );
}

// --- Состояния ---
async function setUserState(userId, state, data = {}) {
  await db.run(`INSERT OR REPLACE INTO user_states (user_id, state, data) VALUES (?, ?, ?)`,
    [userId, state, JSON.stringify(data)]
  );
}
async function getUserState(userId) {
  const row = await db.get('SELECT state, data FROM user_states WHERE user_id = ?', [userId]);
  return row ? { state: row.state, data: JSON.parse(row.data || '{}') } : null;
}
async function clearUserState(userId) { await db.run('DELETE FROM user_states WHERE user_id = ?', [userId]); }

// --- Профиль ---
async function getUserRequests(userId) { return await db.all('SELECT * FROM requests WHERE user_id = ? ORDER BY created_at DESC', [userId]); }
async function getUserResponses(userId) { return await db.all('SELECT * FROM responses WHERE user_id = ? ORDER BY created_at DESC', [userId]); }

initDB().catch(console.error);

module.exports = {
  saveUser, getUser, registerOrganization, getOrganizationByUserId, verifyOrganization,
  isOrganizationVerified, createRequest, getRequest, getRequests, verifyRequest,
  createResponse, setUserState, getUserState, clearUserState, getUserRequests, getUserResponses
};