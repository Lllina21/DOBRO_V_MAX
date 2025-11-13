const botAPI = require('../bot/api');
const config = require('../config');
const axios = require('axios');

async function testBot() {
  console.log('🔍 Тестирование подключения к MAX Bot API...');
  console.log('Токен:', config.BOT_TOKEN.substring(0, 20) + '...');
  console.log('API URL:', config.MAX_API_URL);
  console.log('');
  
  try {
    // Проверяем информацию о боте
    console.log('1. Проверка информации о боте (GET /me)...');
    try {
      const botInfo = await botAPI.getMe();
      console.log('✅ Бот подключен успешно!');
      console.log('Информация о боте:', JSON.stringify(botInfo, null, 2));
      console.log('');
    } catch (getMeError) {
      // Если стандартный метод не работает, пробуем разные варианты Authorization
      console.log('⚠️  Стандартный метод не работает, пробуем варианты авторизации...');
      
      const authVariants = [
        { name: 'Authorization: <token>', header: config.BOT_TOKEN },
        { name: 'Authorization: Bearer <token>', header: `Bearer ${config.BOT_TOKEN}` }
      ];
      
      let found = false;
      for (const auth of authVariants) {
        try {
          const response = await axios.get(`${config.MAX_API_URL}/me`, {
            headers: {
              'Authorization': auth.header,
              'Content-Type': 'application/json'
            }
          });
          console.log(`✅ Рабочий вариант авторизации: ${auth.name}`);
          console.log('Ответ:', JSON.stringify(response.data, null, 2));
          found = true;
          break;
        } catch (e) {
          console.log(`❌ ${auth.name}: ${e.response?.status || e.message}`);
          if (e.response?.data) {
            console.log(`   Данные: ${JSON.stringify(e.response.data)}`);
          }
        }
      }
      
      if (!found) {
        throw getMeError;
      }
    }
    
    // Проверяем webhook
    console.log('2. Проверка webhook...');
    console.log('Webhook URL:', config.WEBHOOK_URL);
    console.log('Примечание: Webhook настраивается через панель управления MAX или через API');
    
    console.log('');
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
    console.log('');
    console.log('📖 Документация: https://dev.max.ru/docs/api');
  }
}

testBot();

