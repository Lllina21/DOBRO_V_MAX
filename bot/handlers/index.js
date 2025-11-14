const botAPI = require('../api');
const keyboards = require('../keyboards');
const messages = require('../messages');
const db = require('../database');

async function handleUpdate(event) {
  console.log('📥 handleUpdate вызван с событием:', JSON.stringify(event, null, 2));
  const { update_type, message, user, chat_id, user_id, callback_query, message_callback } = event;

  switch (update_type) {
    case 'message_created':
      if (message) {
        const normalizedMessage = {
          chat: { id: message.recipient?.chat_id },
          from: message.sender,
          text: message.body?.text,
        };
        await handleMessage(normalizedMessage);
      }
      break;

    case 'message_callback':
    case 'callback_query':
      // Обработка нажатий на inline-кнопки
      if (callback_query || message_callback) {
        await handleCallbackQuery(callback_query || message_callback || event);
      }
      break;

    case 'bot_started':
      if (chat_id && user) {
        await handleStart(chat_id, user);
      }
      break;

    case 'bot_stopped':
      console.log('Пользователь остановил бота:', { chat_id, user });
      break;

    default:
      console.log('Неизвестный тип события:', JSON.stringify(event, null, 2));
  }
}

async function handleMessage(message) {
  console.log('💬 handleMessage вызван с сообщением:', JSON.stringify(message, null, 2));
  const chatId = message.chat?.id;
  const text = message.text || '';
  const userId = message.from?.user_id || message.from?.id;
  const from = message.from || {};

  if (!chatId || !userId) {
    console.error('Не удалось определить chatId или userId:', JSON.stringify(message, null, 2));
    return;
  }

  await db.saveUser({
    id: userId,
    firstName: from.first_name || from.firstName || '',
    lastName: from.last_name || from.lastName || '',
    username: from.username || ''
  });

  if (text.startsWith('/')) {
    const command = text.split(' ')[0].toLowerCase();

    switch (command) {
      case '/start':
        await handleStart(chatId, from);
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
}

async function handleCallbackQuery(callbackQuery) {
  console.log('🔘 handleCallbackQuery вызван:', JSON.stringify(callbackQuery, null, 2));
  
  // Извлекаем данные из разных возможных форматов MAX API
  const message = callbackQuery.message || callbackQuery;
  const chatId = message.chat?.id || message.chat_id || callbackQuery.chat_id || callbackQuery.chat?.id;
  const messageId = message.message_id || message.id || callbackQuery.message_id;
  const userId = callbackQuery.from?.id || callbackQuery.user_id || callbackQuery.user?.id || callbackQuery.from?.user_id;
  const data = callbackQuery.payload || callbackQuery.data || callbackQuery.callback_data || callbackQuery.button?.payload;
  const callbackId = callbackQuery.id || callbackQuery.callback_query_id;

  if (!chatId) {
    console.error('❌ Не удалось определить chatId из callback query:', JSON.stringify(callbackQuery, null, 2));
    return;
  }

  if (!data) {
    console.error('❌ Нет данных в callback query:', JSON.stringify(callbackQuery, null, 2));
    return;
  }

  console.log(`✅ Обработка callback: chatId=${chatId}, userId=${userId}, data=${data}`);

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
}

async function handleStart(chatId, user) {
  const firstName = user?.first_name || user?.firstName || 'друг';
  const userId = user?.id || user?.user_id;
  const welcomeText = messages.welcome(firstName);
  const keyboard = keyboards.mainMenu();

  await botAPI.sendMessageWithReplyKeyboard(chatId, welcomeText, keyboard);

  if (userId) {
    await db.clearUserState(userId);
  }
}

async function handleCatalog(chatId, page = 1) {
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
}

async function handleCreateRequest(chatId, userId) {
  await db.setUserState(userId, {
    action: 'creating_request',
    step: 'title',
    data: {}
  });

  const text = messages.createRequestStart();
  await botAPI.sendMessage(chatId, text);
}

async function handleRequestCreationStep(chatId, userId, text, state) {
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
}

async function handleViewRequest(chatId, requestId) {
  const request = await db.getRequest(requestId);

  if (!request) {
    await botAPI.sendMessage(chatId, 'Заявка не найдена.');
    return;
  }

  const text = messages.requestDetails(request);
  const keyboard = keyboards.requestDetails(requestId);
  await botAPI.sendMessageWithKeyboard(chatId, text, keyboard);
}

async function handleRespondToRequest(chatId, userId, requestId) {
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
}

async function handleProfile(chatId, userId) {
  const userRequests = await db.getUserRequests(userId);
  const userResponses = await db.getUserResponses(userId);

  const text = messages.profile(userRequests, userResponses);
  await botAPI.sendMessage(chatId, text);
}

async function handleHelp(chatId) {
  const text = messages.help();
  await botAPI.sendMessage(chatId, text);
}

async function handleUnknownCommand(chatId) {
  await botAPI.sendMessage(chatId, messages.unknownCommand());
  await handleStart(chatId, { first_name: 'Пользователь' });
}

async function handleCancel(chatId, userId) {
  await db.clearUserState(userId);
  await botAPI.sendMessage(chatId, 'Действие отменено.');
  await handleStart(chatId, { id: userId, first_name: 'Пользователь' });
}

async function handleFilter(chatId, filterType, filterValue) {
  await botAPI.sendMessage(chatId, `Фильтр: ${filterType} = ${filterValue}`);
}

async function handleCatalogPage(chatId, page) {
  await handleCatalog(chatId, page);
}

module.exports = {
  handleUpdate,
  handleMessage,
  handleCallbackQuery
};