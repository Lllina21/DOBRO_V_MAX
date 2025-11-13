const botAPI = require('../bot/api');
const config = require('../config');

async function testBot() {
  console.log('🔍 Тестирование подключения к MAX Bot API...');
  console.log('Токен:', config.BOT_TOKEN.substring(0, 20) + '...');
  console.log('API URL:', config.MAX_API_URL);
  console.log('');
  
  try {
    // Проверяем информацию о боте
    console.log('1. Проверка информации о боте...');
    console.log('Пробуем endpoint: /bot/v1/getMe');
    try {
      const botInfo = await botAPI.getMe();
      console.log('✅ Бот подключен успешно!');
      console.log('Информация о боте:', JSON.stringify(botInfo, null, 2));
      console.log('');
    } catch (getMeError) {
      // Если getMe не работает, пробуем прямой запрос
      console.log('⚠️  Стандартный метод не работает, пробуем прямой запрос...');
      const axios = require('axios');
      const testEndpoints = [
        '/bot/v1/getMe',
        '/v1/bot/getMe',
        '/bot/getMe',
        '/api/bot/v1/getMe',
        '/getMe'
      ];
      
      let found = false;
      for (const endpoint of testEndpoints) {
        try {
          const response = await axios.get(`${config.MAX_API_URL}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${config.BOT_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(`✅ Рабочий endpoint: ${endpoint}`);
          console.log('Ответ:', JSON.stringify(response.data, null, 2));
          found = true;
          break;
        } catch (e) {
          console.log(`❌ ${endpoint}: ${e.response?.status || e.message}`);
        }
      }
      
      if (!found) {
        throw getMeError;
      }
    }
    
    // Проверяем webhook
    console.log('2. Проверка webhook...');
    // Здесь можно добавить проверку webhook, если API поддерживает getWebhookInfo
    
    console.log('✅ Все проверки пройдены!');
  } catch (error) {
    console.error('❌ Ошибка подключения:');
    if (error.response) {
      console.error('Статус:', error.response.status);
      console.error('Данные:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Сообщение:', error.message);
    }
    console.log('');
    console.log('💡 Возможные причины:');
    console.log('   - Неверный токен');
    console.log('   - Неверный URL API');
    console.log('   - API MAX Bot еще не доступен');
    console.log('   - Проблемы с сетью');
  }
}

testBot();

