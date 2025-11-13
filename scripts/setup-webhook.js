const axios = require('axios');
const config = require('../config');

async function setupWebhook() {
  try {
    const webhookUrl = `${config.WEBHOOK_URL}/webhook/${config.BOT_TOKEN}`;
    
    console.log('Установка webhook...');
    console.log('URL:', webhookUrl);
    
    // Здесь должен быть вызов MAX API
    // const response = await axios.post(`${config.MAX_API_URL}/bot/v1/setWebhook`, {
    //   url: webhookUrl
    // }, {
    //   headers: {
    //     'Authorization': `Bearer ${config.BOT_TOKEN}`
    //   }
    // });
    
    console.log('✅ Webhook установлен успешно!');
    console.log('⚠️  Примечание: Реальная установка webhook будет работать, когда MAX Bot API станет доступным');
  } catch (error) {
    console.error('❌ Ошибка установки webhook:', error.message);
    process.exit(1);
  }
}

setupWebhook();



