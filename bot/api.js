const axios = require('axios');
const config = require('../config');

class MaxBotAPI {
  constructor(token) {
    this.token = token;
    this.baseURL = config.MAX_API_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
  }

  async getMe() {
    try {
      const response = await this.client.get('/me');
      return response.data;
    } catch (error) {
      console.error('Ошибка получения информации о боте:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendMessage(chatId, text, options = {}) {
    if (!chatId || !text) {
      console.error('Ошибка: chatId или text не указаны', { chatId, text: text?.substring(0, 50) });
      return null;
    }

    const recipientChatId = options.recipientChatId || null;
    const endpoints = ['/messages', '/bot/messages'];
    let lastError = null;

    for (const endpoint of endpoints) {
      const formats = recipientChatId ? [
        { recipient: { user_id: chatId, chat_id: recipientChatId } },
        { recipient: { user_id: chatId } },
        { recipient: { chat_id: recipientChatId } },
        { recipient: { chat_id: chatId } },
        { user_id: chatId },
        { chat_id: recipientChatId },
        { chat_id: chatId }
      ] : [
        { recipient: { user_id: chatId } },
        { recipient: { chat_id: chatId } },
        { user_id: chatId },
        { chat_id: chatId }
      ];

      for (const format of formats) {
        try {
          const messageBody = {
            ...format,
            text: text
          };

          if (options.format) {
            messageBody.format = options.format;
          }

          if (options.attachments) {
            messageBody.attachments = options.attachments;
          }

          const response = await this.client.post(endpoint, messageBody);
          console.log(`✅ Сообщение отправлено через ${endpoint}`);
          return response.data;
        } catch (error) {
          lastError = error;
          
          if (error.response?.status === 400) {
            const errorMsg = error.response?.data?.message || '';
            if (errorMsg.includes('Unknown recipient') || errorMsg.includes('proto.payload')) {
              continue;
            }
          }
          
          if (error.response?.status === 404) {
            break;
          }
          
          if (error.response?.status !== 400 && error.response?.status !== 404) {
            console.error(`Ошибка отправки через ${endpoint}:`, {
              status: error.response?.status,
              data: error.response?.data
            });
            
            if (error.response?.status === 401) {
              console.error('Ошибка авторизации. Проверьте BOT_TOKEN в .env');
            }
            
            throw error;
          }
        }
      }
    }

    if (lastError) {
      console.error('Все форматы и endpoint не подошли. Последняя ошибка:', {
        status: lastError.response?.status,
        data: lastError.response?.data,
        message: lastError.message
      });
      throw lastError;
    }

    return null;
  }

  async sendMessageWithKeyboard(chatId, text, keyboard, options = {}) {
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

  async sendMessageWithReplyKeyboard(chatId, text, keyboard) {
    const buttons = keyboard.map(row => 
      row.map(button => ({
        type: 'message',
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

  async answerCallbackQuery(callbackQueryId, text = '', showAlert = false) {
    console.log(`Callback query answered: ${callbackQueryId}`);
    return { ok: true };
  }

  async setWebhook(url) {
    console.log(`Webhook URL: ${url}`);
    return { ok: true, webhookUrl: url };
  }
}

const botAPI = new MaxBotAPI(config.BOT_TOKEN);

module.exports = botAPI;
