const axios = require('axios');
const config = require('../config');

/**
 * API клиент для взаимодействия с MAX Bot API
 * Документация: https://dev.max.ru/docs/api
 */
class MaxBotAPI {
  constructor(token) {
    this.token = token;
    this.baseURL = config.MAX_API_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': token, // Без "Bearer" согласно документации MAX
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Получение информации о боте
   * GET /me
   */
  async getMe() {
    try {
      const response = await this.client.get('/me');
      return response.data;
    } catch (error) {
      console.error('Ошибка получения информации о боте:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Отправка текстового сообщения
   * POST /messages
   * 
   * @param {string|number} chatId - ID чата
   * @param {string} text - Текст сообщения
   * @param {object} options - Дополнительные опции (attachments, format и т.д.)
   */
  async sendMessage(chatId, text, options = {}) {
    try {
      const messageBody = {
        chat_id: chatId,
        text: text,
        ...options
      };

      // Если указан формат, добавляем его
      if (options.format) {
        messageBody.format = options.format; // 'html' или 'markdown'
      }

      // Если есть attachments (например, inline-клавиатура)
      if (options.attachments) {
        messageBody.attachments = options.attachments;
      }

      const response = await this.client.post('/messages', messageBody);
      return response.data;
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Отправка сообщения с inline-клавиатурой
   * Формат клавиатуры согласно документации MAX
   */
  async sendMessageWithKeyboard(chatId, text, keyboard, options = {}) {
    // Преобразуем клавиатуру в формат MAX API
    const buttons = keyboard.map(row => 
      row.map(button => ({
        type: 'callback',
        text: button.text,
        payload: button.callback_data || button.payload || ''
      }))
    );

    const attachments = [{
      type: 'inline_keyboard',
      payload: {
        buttons: buttons
      }
    }];

    return this.sendMessage(chatId, text, {
      attachments: attachments,
      format: options.format || 'html',
      ...options
    });
  }

  /**
   * Отправка сообщения с reply-клавиатурой
   * (Reply-клавиатура в MAX может отличаться, используем inline для совместимости)
   */
  async sendMessageWithReplyKeyboard(chatId, text, keyboard) {
    // В MAX reply-клавиатура может быть реализована через inline-клавиатуру
    // или через специальный тип attachment
    const buttons = keyboard.map(row => 
      row.map(button => ({
        type: 'message', // Тип кнопки, которая отправляет сообщение
        text: button.text
      }))
    );

    const attachments = [{
      type: 'inline_keyboard',
      payload: {
        buttons: buttons
      }
    }];

    return this.sendMessage(chatId, text, {
      attachments: attachments,
      format: 'html'
    });
  }

  /**
   * Редактирование сообщения
   * PATCH /messages/{messageId}
   */
  async editMessageText(chatId, messageId, text, options = {}) {
    try {
      const messageBody = {
        chat_id: chatId,
        text: text,
        ...options
      };

      if (options.format) {
        messageBody.format = options.format;
      }

      if (options.attachments) {
        messageBody.attachments = options.attachments;
      }

      const response = await this.client.patch(`/messages/${messageId}`, messageBody);
      return response.data;
    } catch (error) {
      console.error('Ошибка редактирования сообщения:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Ответ на callback query (нажатие на inline-кнопку)
   * Обрабатывается через webhook как message_callback
   * Здесь можно добавить логику для подтверждения нажатия
   */
  async answerCallbackQuery(callbackQueryId, text = '', showAlert = false) {
    // В MAX callback обрабатывается автоматически через webhook
    // Эта функция может быть использована для логирования
    console.log(`Callback query answered: ${callbackQueryId}`);
    return { ok: true };
  }

  /**
   * Установка webhook
   * POST /webhooks (если такой endpoint существует)
   * Или через другой метод согласно документации MAX
   */
  async setWebhook(url) {
    try {
      // Проверяем, есть ли endpoint для установки webhook
      // Если нет, webhook может настраиваться через панель управления
      console.log(`Webhook URL: ${url}`);
      console.log('Примечание: Webhook может настраиваться через панель управления MAX');
      return { ok: true, webhookUrl: url };
    } catch (error) {
      console.error('Ошибка установки webhook:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Создаем экземпляр API клиента
const botAPI = new MaxBotAPI(config.BOT_TOKEN);

module.exports = botAPI;
