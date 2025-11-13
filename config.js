require('dotenv').config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN || 'your-bot-token-here',
  WEBHOOK_URL: process.env.WEBHOOK_URL || 'https://your-domain.com',
  MAX_API_URL: process.env.MAX_API_URL || 'https://platform-api.max.ru',
  PORT: process.env.PORT || 3000,
  // База данных (можно использовать SQLite для простоты)
  DB_PATH: process.env.DB_PATH || './data/dobro.db'
};

