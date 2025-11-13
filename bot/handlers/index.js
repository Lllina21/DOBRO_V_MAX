const botAPI = require('../api');
const keyboards = require('../keyboards');
const messages = require('../messages');
const db = require('../database');

/**
 * Главный обработчик обновлений от MAX
 * Согласно документации MAX, события приходят в формате:
 * { type: 'message' | 'message_callback' | ..., ...data }
 */
async function handleUpdate(event) {
  try {
    const eventType = event.type || event.event_type;
    
    // Обработка текстового сообщения
    if (eventType === 'message' || event.message) {
      await handleMessage(event.message || event);
    }
    
    // Обработка callback query (нажатие на inline-кнопку)
    // В MAX это событие типа message_callback
    if (eventType === 'message_callback' || event.callback_query || event.message_callback) {
      const callbackData = event.message_callback || event.callback_query || event;
      await handleCallbackQuery(callbackData);
    }
    
    // Обработка других типов событий
    if (eventType === 'edited_message' || event.edited_message) {
      // Игнорируем редактированные сообщения
      console.log('Игнорируем редактированное сообщение');
    }
    
    // Если тип события не определен, пробуем обработать как сообщение
    if (!eventType && !event.message && !event.callback_query && !event.message_callback) {
      console.log('Неизвестный формат события:', JSON.stringify(event, null, 2));
    }
  } catch (error) {
    console.error('Ошибка обработки обновления:', error);
    console.error('Событие:', JSON.stringify(event, null, 2));
  }
}

/**
 * Обработка текстовых сообщений
 * Поддержка разных форматов событий MAX
 */
async function handleMessage(message) {
  // Поддержка разных форматов сообщений MAX
  const chatId = message.chat?.id || message.chat_id;
  const text = message.text || message.message?.text || '';
  const userId = message.from?.id || message.user_id || message.user?.id;
  const from = message.from || message.user || {};
  
  if (!chatId || !userId) {
    console.error('Не удалось определить chatId или userId:', JSON.stringify(message, null, 2));
    return;
  }
  
  // Сохраняем пользователя в БД
  await db.saveUser({
    id: userId,
    firstName: from.first_name || from.firstName || '',
    lastName: from.last_name || from.lastName || '',
    username: from.username || ''
  });
  
  // Обработка команд
  if (text.startsWith('/')) {
    const command = text.split(' ')[0].toLowerCase();
    
    switch (command) {
      case '/start':
        const from = message.from || message.user || { id: userId };
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
    // Обработка обычных сообщений (для создания заявки)
    const userState = await db.getUserState(userId);
    
    if (userState && userState.action === 'creating_request') {
      await handleRequestCreationStep(chatId, userId, text, userState);
    } else {
      // Отправляем главное меню
      const from = message.from || message.user || { id: userId };
      await handleStart(chatId, from);
    }
  }
}

/**
 * Обработка callback query (нажатие на inline-кнопку)
 * В MAX это событие message_callback
 */
async function handleCallbackQuery(callbackQuery) {
  // Поддержка разных форматов событий MAX
  const message = callbackQuery.message || callbackQuery;
  const chatId = message.chat?.id || message.chat_id;
  const messageId = message.message_id || message.id;
  const userId = callbackQuery.from?.id || callbackQuery.user_id || callbackQuery.user?.id;
  const data = callbackQuery.payload || callbackQuery.data || callbackQuery.callback_data;
  const callbackId = callbackQuery.id || callbackQuery.callback_query_id;
  
  if (!data) {
    console.error('Нет данных в callback query:', JSON.stringify(callbackQuery, null, 2));
    return;
  }
  
  // Отвечаем на callback
  if (callbackId) {
    await botAPI.answerCallbackQuery(callbackId);
  }
  
  // Парсим данные callback
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

/**
 * Обработка команды /start
 */
async function handleStart(chatId, user) {
  const firstName = user?.first_name || user?.firstName || 'друг';
  const userId = user?.id || user?.user_id;
  const welcomeText = messages.welcome(firstName);
  const keyboard = keyboards.mainMenu();
  
  await botAPI.sendMessageWithReplyKeyboard(chatId, welcomeText, keyboard);
  
  // Сбрасываем состояние пользователя
  if (userId) {
    await db.clearUserState(userId);
  }
}

/**
 * Обработка команды /catalog
 */
async function handleCatalog(chatId, page = 1) {
  const requests = await db.getRequests({ limit: 5, offset: (page - 1) * 5 });
  
  if (requests.length === 0) {
    await botAPI.sendMessage(chatId, messages.noRequests());
    return;
  }
  
  // Отправляем список заявок
  for (const request of requests) {
    const text = messages.requestCard(request);
    const keyboard = keyboards.requestActions(request.id);
    await botAPI.sendMessageWithKeyboard(chatId, text, keyboard);
  }
  
  // Кнопки навигации
  const totalPages = Math.ceil(await db.getRequestsCount() / 5);
  if (totalPages > 1) {
    const navKeyboard = keyboards.catalogNavigation(page, totalPages);
    await botAPI.sendMessageWithKeyboard(chatId, `Страница ${page} из ${totalPages}`, navKeyboard);
  }
  
  // Кнопки фильтров
  const filterKeyboard = keyboards.filters();
  await botAPI.sendMessageWithKeyboard(chatId, 'Фильтры:', filterKeyboard);
}

/**
 * Обработка команды /create
 */
async function handleCreateRequest(chatId, userId) {
  await db.setUserState(userId, {
    action: 'creating_request',
    step: 'title',
    data: {}
  });
  
  const text = messages.createRequestStart();
  await botAPI.sendMessage(chatId, text);
}

/**
 * Обработка шагов создания заявки
 */
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
      
    case 'confirm':
      // Этот шаг обрабатывается через callback query
      break;
  }
}

/**
 * Просмотр деталей заявки
 */
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

/**
 * Отклик на заявку
 */
async function handleRespondToRequest(chatId, userId, requestId) {
  const request = await db.getRequest(requestId);
  
  if (!request) {
    await botAPI.sendMessage(chatId, 'Заявка не найдена.');
    return;
  }
  
  // Создаем отклик
  await db.createResponse({
    requestId: requestId,
    userId: userId,
    createdAt: new Date().toISOString()
  });
  
  await botAPI.sendMessage(chatId, messages.responseCreated(request));
}

/**
 * Обработка команды /profile
 */
async function handleProfile(chatId, userId) {
  const userRequests = await db.getUserRequests(userId);
  const userResponses = await db.getUserResponses(userId);
  
  const text = messages.profile(userRequests, userResponses);
  await botAPI.sendMessage(chatId, text);
}

/**
 * Обработка команды /help
 */
async function handleHelp(chatId) {
  const text = messages.help();
  await botAPI.sendMessage(chatId, text);
}

/**
 * Обработка неизвестной команды
 */
async function handleUnknownCommand(chatId) {
  await botAPI.sendMessage(chatId, messages.unknownCommand());
  await handleStart(chatId, { first_name: 'Пользователь' });
}

/**
 * Отмена действия
 */
async function handleCancel(chatId, userId) {
  await db.clearUserState(userId);
  await botAPI.sendMessage(chatId, 'Действие отменено.');
  await handleStart(chatId, { id: userId, first_name: 'Пользователь' });
}

/**
 * Обработка фильтров
 */
async function handleFilter(chatId, filterType, filterValue) {
  // Реализация фильтрации
  await botAPI.sendMessage(chatId, `Фильтр: ${filterType} = ${filterValue}`);
}

/**
 * Обработка пагинации каталога
 */
async function handleCatalogPage(chatId, page) {
  await handleCatalog(chatId, page);
}

module.exports = {
  handleUpdate,
  handleMessage,
  handleCallbackQuery
};

