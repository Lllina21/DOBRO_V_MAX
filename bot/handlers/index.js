const botAPI = require('../api');
const keyboards = require('../keyboards');
const messages = require('../messages');
const db = require('../database');

async function handleUpdate(event) {
  try {
    const { update_type, message, user, chat_id, user_id, callback_query, message_callback } = event;

    switch (update_type) {
      case 'message_created':
        if (message) {
          const recipientUserId = message.recipient?.user_id;
          const sender = message.sender;
          const senderUserId = sender?.user_id;
          const chatId = message.recipient?.chat_id;
          const text = message.body?.text || '';
          
          console.log('=== Обработка message_created ===');
          console.log('recipient.user_id:', recipientUserId);
          console.log('sender.user_id:', senderUserId);
          console.log('chat_id:', chatId);
          console.log('text:', text);
          
          if (!senderUserId) {
            console.error('ОШИБКА: sender.user_id не найден');
            console.error('sender:', JSON.stringify(sender, null, 2));
            return;
          }

          const normalizedMessage = {
            chat: { id: senderUserId },
            from: sender,
            text: text,
            recipientUserId: recipientUserId,
            originalChatId: chatId,
            recipientChatId: chatId
          };
          
          console.log('Нормализованное сообщение:', JSON.stringify(normalizedMessage, null, 2));
          
          await handleMessage(normalizedMessage).catch(err => {
            console.error('Ошибка в handleMessage:', err.message);
            console.error(err.stack);
          });
        } else {
          console.error('message отсутствует в событии');
        }
        break;

      case 'message_callback':
      case 'callback_query':
        if (callback_query || message_callback) {
          await handleCallbackQuery(callback_query || message_callback || event).catch(err => {
            console.error('Ошибка в handleCallbackQuery:', err);
          });
        }
        break;

      case 'bot_started':
        if (chat_id && user) {
          await handleStart(chat_id, user).catch(err => {
            console.error('Ошибка в handleStart:', err);
          });
        }
        break;

      case 'bot_stopped':
        console.log('Пользователь остановил бота:', { chat_id, user });
        break;

      default:
        console.log('Неизвестный тип события:', update_type);
    }
  } catch (error) {
    console.error('Критическая ошибка в handleUpdate:', error);
  }
}

async function handleMessage(message) {
  try {
    const chatId = message.chat?.id;
    const text = message.text || '';
    const userId = message.from?.user_id || message.from?.id;
    const from = message.from || {};
    const recipientChatId = message.recipientChatId;

    if (!chatId) {
      console.error('ОШИБКА: chatId не найден в handleMessage');
      return;
    }
    
    if (!userId) {
      console.error('ОШИБКА: userId не найден в handleMessage');
      return;
    }
    
    console.log('Начинаю сохранение пользователя в БД...');

    await db.saveUser({
      id: userId,
      firstName: from.first_name || from.firstName || '',
      lastName: from.last_name || from.lastName || '',
      username: from.username || ''
    });
    
    console.log('Пользователь сохранен в БД');

    if (text.startsWith('/')) {
      const command = text.split(' ')[0].toLowerCase();
      console.log('Обработка команды:', command);

      switch (command) {
        case '/start':
          console.log('Вызов handleStart...');
          await handleStart(chatId, from, recipientChatId);
          console.log('handleStart завершен');
          break;
        case '/catalog':
        case '/каталог':
          await handleCatalog(chatId);
          break;
        case '/create':
        case '/создать':
          await handleCreateRequest(chatId, userId);
          break;
        case '/profile':
        case '/профиль':
          await handleProfile(chatId, userId);
          break;
        case '/help':
        case '/помощь':
          await handleHelp(chatId);
          break;
        default:
          await handleUnknownCommand(chatId);
      }
    } else if (text === '📋 Каталог заявок' || text === 'Каталог заявок') {
      await handleCatalog(chatId);
    } else if (text === '➕ Создать заявку' || text === 'Создать заявку') {
      await handleCreateRequest(chatId, userId);
    } else if (text === '👤 Мой профиль' || text === 'Мой профиль') {
      await handleProfile(chatId, userId);
    } else if (text === '❓ Помощь' || text === 'Помощь') {
      await handleHelp(chatId);
    } else {
      const userState = await db.getUserState(userId);

      if (userState && userState.action === 'creating_request') {
        await handleRequestCreationStep(chatId, userId, text, userState);
      } else {
        await handleStart(chatId, { first_name: 'Пользователь' });
      }
    }
  } catch (error) {
    console.error('Ошибка в handleMessage:', error);
  }
}

async function handleCallbackQuery(callbackQuery) {
  try {
    const message = callbackQuery.message || callbackQuery;
    const chatId = message.chat?.id || message.chat_id || callbackQuery.chat_id || callbackQuery.chat?.id;
    const messageId = message.message_id || message.id || callbackQuery.message_id;
    const userId = callbackQuery.from?.id || callbackQuery.user_id || callbackQuery.user?.id || callbackQuery.from?.user_id;
    const data = callbackQuery.payload || callbackQuery.data || callbackQuery.callback_data || callbackQuery.button?.payload;
    const callbackId = callbackQuery.id || callbackQuery.callback_query_id;

    if (!chatId) {
      console.error('Не удалось определить chatId из callback query');
      return;
    }

    if (!data) {
      console.error('Нет данных в callback query');
      return;
    }

    if (callbackId) {
      await botAPI.answerCallbackQuery(callbackId);
    }

    const [action, ...params] = data.split(':');

    switch (action) {
      case 'view_request':
        const requestId = parseInt(params[0]);
        await handleViewRequest(chatId, requestId);
        break;
      case 'respond_request':
        const reqId = parseInt(params[0]);
        await handleRespondToRequest(chatId, userId, reqId);
        break;
      case 'filter':
        const filterType = params[0];
        const filterValue = params[1];
        await handleFilter(chatId, filterType, filterValue);
        break;
      case 'page':
        const page = parseInt(params[0]);
        await handleCatalogPage(chatId, page);
        break;
      case 'cancel':
        await handleCancel(chatId, userId);
        break;
      case 'confirm':
        if (params[0] === 'yes') {
          const userState = await db.getUserState(userId);
          if (userState && userState.action === 'creating_request' && userState.data) {
            const request = await db.createRequest({
              ...userState.data,
              userId: userId,
              createdAt: new Date().toISOString()
            });

            await db.clearUserState(userId);
            await botAPI.sendMessage(chatId, messages.requestCreated(request));
            await handleStart(chatId, { id: userId, first_name: 'Пользователь' });
          }
        } else {
          await handleCancel(chatId, userId);
        }
        break;
      case 'category':
        const category = params[0];
        const userState = await db.getUserState(userId);
        if (userState && userState.action === 'creating_request') {
          userState.data.category = category;
          await db.setUserState(userId, { ...userState, step: 'type' });
          await botAPI.sendMessageWithKeyboard(chatId, 'Выберите тип заявки:', keyboards.requestTypes());
        }
        break;
      case 'type':
        const type = params[0];
        const userState2 = await db.getUserState(userId);
        if (userState2 && userState2.action === 'creating_request') {
          userState2.data.type = type;
          await db.setUserState(userId, { ...userState2, step: 'region' });
          await botAPI.sendMessageWithKeyboard(chatId, 'Выберите регион:', keyboards.regions());
        }
        break;
      case 'region':
        const region = params[0];
        const userState3 = await db.getUserState(userId);
        if (userState3 && userState3.action === 'creating_request') {
          userState3.data.region = region;
          await db.setUserState(userId, { ...userState3, step: 'description' });
          await botAPI.sendMessage(chatId, 'Опишите подробно, какая помощь требуется:');
        }
        break;
      default:
        console.log('Неизвестный callback:', data);
    }
  } catch (error) {
    console.error('Ошибка в handleCallbackQuery:', error);
  }
}

async function handleStart(chatId, user, recipientChatId = null) {
  try {
    const firstName = user?.first_name || user?.firstName || 'друг';
    const userId = user?.id || user?.user_id;
    const welcomeText = messages.welcome(firstName);
    const keyboard = keyboards.mainMenu();

    const result = await botAPI.sendMessageWithReplyKeyboard(chatId, welcomeText, keyboard, {
      recipientChatId: recipientChatId
    });
    
    if (result) {
      console.log('✅ Сообщение успешно отправлено');
    } else {
      console.error('❌ Не удалось отправить сообщение');
    }

    if (userId) {
      await db.clearUserState(userId);
    }
    
    console.log('handleStart завершен успешно');
  } catch (error) {
    console.error('ОШИБКА в handleStart:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

async function handleCatalog(chatId, page = 1) {
  try {
    const requests = await db.getRequests({ limit: 5, offset: (page - 1) * 5 });

    if (requests.length === 0) {
      await botAPI.sendMessage(chatId, messages.noRequests());
      return;
    }

    for (const request of requests) {
      const text = messages.requestCard(request);
      const keyboard = keyboards.requestActions(request.id);
      await botAPI.sendMessageWithKeyboard(chatId, text, keyboard);
    }

    const totalPages = Math.ceil(await db.getRequestsCount() / 5);
    if (totalPages > 1) {
      const navKeyboard = keyboards.catalogNavigation(page, totalPages);
      await botAPI.sendMessageWithKeyboard(chatId, `Страница ${page} из ${totalPages}`, navKeyboard);
    }

    const filterKeyboard = keyboards.filters();
    await botAPI.sendMessageWithKeyboard(chatId, 'Фильтры:', filterKeyboard);
  } catch (error) {
    console.error('Ошибка в handleCatalog:', error);
  }
}

async function handleCreateRequest(chatId, userId) {
  try {
    await db.setUserState(userId, {
      action: 'creating_request',
      step: 'title',
      data: {}
    });

    const text = messages.createRequestStart();
    await botAPI.sendMessage(chatId, text);
  } catch (error) {
    console.error('Ошибка в handleCreateRequest:', error);
  }
}

async function handleRequestCreationStep(chatId, userId, text, state) {
  try {
    const step = state.step;
    const data = state.data || {};

    switch (step) {
      case 'title':
        data.title = text;
        await db.setUserState(userId, { ...state, step: 'category', data });
        await botAPI.sendMessageWithKeyboard(chatId, 'Выберите категорию:', keyboards.categories());
        break;
      case 'description':
        data.description = text;
        await db.setUserState(userId, { ...state, step: 'date', data });
        await botAPI.sendMessage(chatId, 'Укажите дату (формат: ДД.ММ.ГГГГ):');
        break;
      case 'date':
        data.date = text;
        await db.setUserState(userId, { ...state, step: 'confirm', data });
        const confirmText = messages.requestPreview(data);
        const confirmKeyboard = keyboards.confirmRequest();
        await botAPI.sendMessageWithKeyboard(chatId, confirmText, confirmKeyboard);
        break;
    }
  } catch (error) {
    console.error('Ошибка в handleRequestCreationStep:', error);
  }
}

async function handleViewRequest(chatId, requestId) {
  try {
    const request = await db.getRequest(requestId);

    if (!request) {
      await botAPI.sendMessage(chatId, 'Заявка не найдена.');
      return;
    }

    const text = messages.requestDetails(request);
    const keyboard = keyboards.requestDetails(requestId);
    await botAPI.sendMessageWithKeyboard(chatId, text, keyboard);
  } catch (error) {
    console.error('Ошибка в handleViewRequest:', error);
  }
}

async function handleRespondToRequest(chatId, userId, requestId) {
  try {
    const request = await db.getRequest(requestId);

    if (!request) {
      await botAPI.sendMessage(chatId, 'Заявка не найдена.');
      return;
    }

    await db.createResponse({
      requestId: requestId,
      userId: userId,
      createdAt: new Date().toISOString()
    });

    await botAPI.sendMessage(chatId, messages.responseCreated(request));
  } catch (error) {
    console.error('Ошибка в handleRespondToRequest:', error);
  }
}

async function handleProfile(chatId, userId) {
  try {
    const userRequests = await db.getUserRequests(userId);
    const userResponses = await db.getUserResponses(userId);

    const text = messages.profile(userRequests, userResponses);
    await botAPI.sendMessage(chatId, text);
  } catch (error) {
    console.error('Ошибка в handleProfile:', error);
  }
}

async function handleHelp(chatId) {
  try {
    const text = messages.help();
    await botAPI.sendMessage(chatId, text);
  } catch (error) {
    console.error('Ошибка в handleHelp:', error);
  }
}

async function handleUnknownCommand(chatId) {
  try {
    await botAPI.sendMessage(chatId, messages.unknownCommand());
    await handleStart(chatId, { first_name: 'Пользователь' });
  } catch (error) {
    console.error('Ошибка в handleUnknownCommand:', error);
  }
}

async function handleCancel(chatId, userId) {
  try {
    await db.clearUserState(userId);
    await botAPI.sendMessage(chatId, 'Действие отменено.');
    await handleStart(chatId, { id: userId, first_name: 'Пользователь' });
  } catch (error) {
    console.error('Ошибка в handleCancel:', error);
  }
}

async function handleFilter(chatId, filterType, filterValue) {
  try {
    await botAPI.sendMessage(chatId, `Фильтр: ${filterType} = ${filterValue}`);
  } catch (error) {
    console.error('Ошибка в handleFilter:', error);
  }
}

async function handleCatalogPage(chatId, page) {
  try {
    await handleCatalog(chatId, page);
  } catch (error) {
    console.error('Ошибка в handleCatalogPage:', error);
  }
}

module.exports = {
  handleUpdate,
  handleMessage,
  handleCallbackQuery
};
