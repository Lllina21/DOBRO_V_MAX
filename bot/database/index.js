const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const config = require('../../config');
const fs = require('fs');

// Создаем директорию для БД, если её нет
const dbDir = path.dirname(config.DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;

/**
 * Инициализация базы данных
 */
async function initDB() {
  db = await open({
    filename: config.DB_PATH,
    driver: sqlite3.Database
  });
  
  // Создаем таблицы
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      username TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      title TEXT NOT NULL,
      category TEXT,
      type TEXT,
      region TEXT,
      description TEXT,
      full_description TEXT,
      date TEXT,
      time TEXT,
      location TEXT,
      requirements TEXT,
      reward TEXT,
      verified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER,
      user_id TEXT,
      message TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES requests(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE TABLE IF NOT EXISTS user_states (
      user_id TEXT PRIMARY KEY,
      state TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('База данных инициализирована');
}

/**
 * Сохранение пользователя
 */
async function saveUser(user) {
  await db.run(
    `INSERT OR REPLACE INTO users (id, first_name, last_name, username) 
     VALUES (?, ?, ?, ?)`,
    [user.id, user.firstName, user.lastName, user.username]
  );
}

/**
 * Получение пользователя
 */
async function getUser(userId) {
  return await db.get('SELECT * FROM users WHERE id = ?', [userId]);
}

/**
 * Сохранение состояния пользователя
 */
async function setUserState(userId, state) {
  await db.run(
    `INSERT OR REPLACE INTO user_states (user_id, state) 
     VALUES (?, ?)`,
    [userId, JSON.stringify(state)]
  );
}

/**
 * Получение состояния пользователя
 */
async function getUserState(userId) {
  const row = await db.get('SELECT state FROM user_states WHERE user_id = ?', [userId]);
  if (row && row.state) {
    return JSON.parse(row.state);
  }
  return null;
}

/**
 * Очистка состояния пользователя
 */
async function clearUserState(userId) {
  await db.run('DELETE FROM user_states WHERE user_id = ?', [userId]);
}

/**
 * Создание заявки
 */
async function createRequest(requestData) {
  const result = await db.run(
    `INSERT INTO requests (
      user_id, title, category, type, region, description, 
      full_description, date, time, location, requirements, reward, verified
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      requestData.userId,
      requestData.title,
      requestData.category,
      requestData.type,
      requestData.region,
      requestData.description,
      requestData.fullDescription || requestData.description,
      requestData.date,
      requestData.time || null,
      requestData.location || null,
      requestData.requirements || null,
      requestData.reward || 'бесплатно',
      requestData.verified ? 1 : 0
    ]
  );
  
  return await getRequest(result.lastID);
}

/**
 * Получение заявки
 */
async function getRequest(requestId) {
  const request = await db.get('SELECT * FROM requests WHERE id = ?', [requestId]);
  if (request) {
    request.verified = request.verified === 1;
    // Получаем отклики
    request.responses = await db.all(
      'SELECT * FROM responses WHERE request_id = ?',
      [requestId]
    );
  }
  return request;
}

/**
 * Получение списка заявок
 */
async function getRequests(options = {}) {
  let query = 'SELECT * FROM requests WHERE verified = 1';
  const params = [];
  
  if (options.region) {
    query += ' AND region = ?';
    params.push(options.region);
  }
  
  if (options.category) {
    query += ' AND category = ?';
    params.push(options.category);
  }
  
  query += ' ORDER BY created_at DESC';
  
  if (options.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }
  
  if (options.offset) {
    query += ' OFFSET ?';
    params.push(options.offset);
  }
  
  const requests = await db.all(query, params);
  return requests.map(r => ({ ...r, verified: r.verified === 1 }));
}

/**
 * Получение количества заявок
 */
async function getRequestsCount() {
  const result = await db.get('SELECT COUNT(*) as count FROM requests WHERE verified = 1');
  return result.count;
}

/**
 * Получение заявок пользователя
 */
async function getUserRequests(userId) {
  return await db.all('SELECT * FROM requests WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

/**
 * Создание отклика
 */
async function createResponse(responseData) {
  await db.run(
    `INSERT INTO responses (request_id, user_id, message, status) 
     VALUES (?, ?, ?, ?)`,
    [
      responseData.requestId,
      responseData.userId,
      responseData.message || '',
      responseData.status || 'pending'
    ]
  );
}

/**
 * Получение откликов пользователя
 */
async function getUserResponses(userId) {
  return await db.all('SELECT * FROM responses WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

// Инициализируем БД при загрузке модуля
initDB().catch(console.error);

module.exports = {
  saveUser,
  getUser,
  setUserState,
  getUserState,
  clearUserState,
  createRequest,
  getRequest,
  getRequests,
  getRequestsCount,
  getUserRequests,
  createResponse,
  getUserResponses
};



