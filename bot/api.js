const axios = require('axios');
const config = require('../config');

/**
 * API клиент для взаимодействия с MAX Bot API
 */
class MaxBotAPI {
  constructor(token) {
    this.token = token;
    // Пробуем разные варианты baseURL
    this.baseURL = `${config.MAX_API_URL}/bot/v1`;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      // Отключаем проверку SSL для разработки (если нужно)
      // httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    });
  }
  
  /**
   * Попробовать альтернативные endpoint'ы
   */
  async tryAlternativeEndpoints() {
    const endpoints = [
      '/bot/v1/getMe',
      '/v1/bot/getMe',
      '/bot/getMe',
      '/api/bot/v1/getMe',
      '/getMe'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${config.MAX_API_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ Рабочий endpoint найден: ${endpoint}`);
        return { success: true, endpoint, data: response.data };
      } catch (error) {
        // Продолжаем пробовать
      }
    }
    return { success: false };
  }

  /**
   * Отправка текстового сообщения
   */
  async sendMessage(chatId, text, options = {}) {
    try {
      const response = await this.client.post('/sendMessage', {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: options.reply_markup || null,
        ...options
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Отправка сообщения с inline-клавиатурой
   */
  async sendMessageWithKeyboard(chatId, text, keyboard) {
    return this.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  }

  /**
   * Отправка сообщения с reply-клавиатурой
   */
  async sendMessageWithReplyKeyboard(chatId, text, keyboard) {
    return this.sendMessage(chatId, text, {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
        one_time_keyboard: false
      }
    });
  }

  /**
   * Редактирование сообщения
   */
  async editMessageText(chatId, messageId, text, options = {}) {
    try {
      const response = await this.client.post('/editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: options.reply_markup || null,
        ...options
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка редактирования сообщения:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Ответ на callback query
   */
  async answerCallbackQuery(callbackQueryId, text = '', showAlert = false) {
    try {
      const response = await this.client.post('/answerCallbackQuery', {
        callback_query_id: callbackQueryId,
        text: text,
        show_alert: showAlert
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка ответа на callback:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Установка webhook
   */
  async setWebhook(url) {
    try {
      const response = await this.client.post('/setWebhook', {
        url: url
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка установки webhook:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Получение информации о боте
   */
  async getMe() {
    try {
      // Пробуем стандартный endpoint
      const response = await this.client.get('/getMe');
      return response.data;
    } catch (error) {
      // Если 404, пробуем альтернативные endpoint'ы
      if (error.response?.status === 404) {
        console.log('⚠️  Стандартный endpoint не найден, пробуем альтернативные...');
        const result = await this.tryAlternativeEndpoints();
        if (result.success) {
          // Обновляем baseURL для будущих запросов
          this.baseURL = `${config.MAX_API_URL}${result.endpoint.replace('/getMe', '')}`;
          this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            }
          });
          return result.data;
        }
      }
      console.error('Ошибка получения информации о боте:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Создаем экземпляр API клиента
const botAPI = new MaxBotAPI(config.BOT_TOKEN);

module.exports = botAPI;

