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
    console.log('');
    console.log('📨 ===== ПОЛУЧЕНО СОБЫТИЕ ОТ MAX =====');
    console.log('Тип события:', event.update_type || 'не указан');
    console.log('Полные данные:', JSON.stringify(event, null, 2));
    console.log('========================================');
    console.log('');
    
    // Обработка обновления (асинхронно, чтобы быстро ответить MAX)
    handlers.handleUpdate(event).catch(error => {
      console.error('❌ Ошибка обработки события:', error);
      console.error('Stack trace:', error.stack);
    });
    
    // Отвечаем MAX сразу, чтобы подтвердить получение
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('❌ Ошибка обработки webhook:', error);
    console.error('Stack trace:', error.stack);
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
  
  // Предупреждение о localhost
  if (config.WEBHOOK_URL.includes('localhost') || config.WEBHOOK_URL.includes('127.0.0.1')) {
    console.log('');
    console.log('⚠️  ВНИМАНИЕ: Webhook URL указывает на localhost!');
    console.log('   MAX не сможет отправлять события на localhost.');
    console.log('   Для локальной разработки используйте ngrok:');
    console.log('   1. Установите ngrok: https://ngrok.com');
    console.log('   2. Запустите: ngrok http 3000');
    console.log('   3. Обновите WEBHOOK_URL в .env на полученный HTTPS URL');
    console.log('');
  }
  
  console.log(`✅ Проверьте подключение: npm run test-bot`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

