const express = require('express');
const bodyParser = require('body-parser');
const handlers = require('./bot/handlers');
const config = require('./config');

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.post(`/webhook/${config.BOT_TOKEN}`, async (req, res) => {
  try {
    const event = req.body;
    console.log('Получено событие от MAX:', event.update_type || 'неизвестно');
    
    handlers.handleUpdate(event).catch(error => {
      console.error('Ошибка обработки события:', error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    });
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Ошибка обработки webhook:', error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'dobro-max-bot',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    service: 'Добро в MAX Bot',
    version: '1.0.0',
    status: 'running'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Бот запущен на порту ${PORT}`);
  console.log(`Webhook URL: ${config.WEBHOOK_URL}/webhook/${config.BOT_TOKEN.substring(0, 20)}...`);
  
  if (config.WEBHOOK_URL.includes('localhost') || config.WEBHOOK_URL.includes('127.0.0.1')) {
    console.log('');
    console.log('ВНИМАНИЕ: Webhook URL указывает на localhost!');
    console.log('MAX не сможет отправлять события на localhost.');
    console.log('Для локальной разработки используйте ngrok:');
    console.log('1. Установите ngrok: https://ngrok.com');
    console.log('2. Запустите: ngrok http 3000');
    console.log('3. Обновите WEBHOOK_URL в .env на полученный HTTPS URL');
    console.log('');
  }
  
  console.log(`Проверьте подключение: npm run test-bot`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
