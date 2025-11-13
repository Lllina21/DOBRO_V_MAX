const express = require('express');
const bodyParser = require('body-parser');
const handlers = require('./bot/handlers');
const config = require('./config');

const app = express();
app.use(bodyParser.json());

// Webhook для получения обновлений от MAX
app.post(`/webhook/${config.BOT_TOKEN}`, (req, res) => {
  const update = req.body;
  console.log('Получено обновление:', JSON.stringify(update, null, 2));
  
  // Обработка обновления
  handlers.handleUpdate(update);
  
  res.status(200).send('OK');
});

// Проверка работоспособности
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'dobro-max-bot' });
});

// Установка webhook (вызывается один раз при деплое)
app.get(`/set-webhook/${config.BOT_TOKEN}`, async (req, res) => {
  try {
    const webhookUrl = `${config.WEBHOOK_URL}/webhook/${config.BOT_TOKEN}`;
    // Здесь должен быть вызов MAX API для установки webhook
    // await maxBotAPI.setWebhook(webhookUrl);
    res.json({ success: true, webhookUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 Бот "Добро в MAX" запущен на порту ${PORT}`);
  console.log(`📡 Webhook URL: ${config.WEBHOOK_URL}/webhook/${config.BOT_TOKEN}`);
  console.log(`🔗 Локальный webhook: http://localhost:${PORT}/webhook/${config.BOT_TOKEN}`);
  console.log(`✅ Проверьте подключение: npm run test-bot`);
});

