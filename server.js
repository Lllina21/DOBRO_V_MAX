const express = require('express');
const bodyParser = require('body-parser');
const handlers = require('./bot/handlers');
const config = require('./config');

const app = express();
app.use(bodyParser.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Webhook для получения обновлений от MAX
// Согласно документации MAX, webhook'и приходят как события разных типов
app.post(`/webhook/${config.BOT_TOKEN}`, async (req, res) => {
  try {
    const event = req.body;
    console.log('Получено событие от MAX:', JSON.stringify(event, null, 2));
    
    // Обработка обновления (асинхронно, чтобы быстро ответить MAX)
    handlers.handleUpdate(event).catch(error => {
      console.error('Ошибка обработки события:', error);
    });
    
    // Отвечаем MAX сразу, чтобы подтвердить получение
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Ошибка обработки webhook:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Проверка работоспособности
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'dobro-max-bot',
    timestamp: new Date().toISOString()
  });
});

// Корневой endpoint
app.get('/', (req, res) => {
  res.json({ 
    service: 'Добро в MAX Bot',
    version: '1.0.0',
    status: 'running'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 Бот "Добро в MAX" запущен на порту ${PORT}`);
  console.log(`📡 Webhook URL: ${config.WEBHOOK_URL}/webhook/${config.BOT_TOKEN}`);
  console.log(`🔗 Локальный webhook: http://localhost:${PORT}/webhook/${config.BOT_TOKEN}`);
  console.log(`✅ Проверьте подключение: npm run test-bot`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

