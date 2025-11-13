/**
 * Генерация клавиатур для бота
 */

/**
 * Главное меню
 */
function mainMenu() {
  return [
    [
      { text: '📋 Каталог заявок' },
      { text: '➕ Создать заявку' }
    ],
    [
      { text: '👤 Мой профиль' },
      { text: '❓ Помощь' }
    ]
  ];
}

/**
 * Действия с заявкой
 */
function requestActions(requestId) {
  return [
    [
      { text: '👁️ Подробнее', callback_data: `view_request:${requestId}` },
      { text: '✋ Откликнуться', callback_data: `respond_request:${requestId}` }
    ]
  ];
}

/**
 * Детали заявки
 */
function requestDetails(requestId) {
  return [
    [
      { text: '✋ Откликнуться', callback_data: `respond_request:${requestId}` }
    ],
    [
      { text: '🔙 Назад к каталогу', callback_data: 'page:1' }
    ]
  ];
}

/**
 * Категории заявок
 */
function categories() {
  return [
    [
      { text: 'Инклюзия', callback_data: 'category:Инклюзия' },
      { text: 'Экология', callback_data: 'category:Экология' }
    ],
    [
      { text: 'Здоровье', callback_data: 'category:Здоровье' },
      { text: 'Культура', callback_data: 'category:Культура' }
    ],
    [
      { text: 'Образование', callback_data: 'category:Образование' },
      { text: 'Социальная помощь', callback_data: 'category:Социальная помощь' }
    ],
    [
      { text: 'Спорт', callback_data: 'category:Спорт' },
      { text: 'Животные', callback_data: 'category:Животные' }
    ],
    [
      { text: '❌ Отмена', callback_data: 'cancel' }
    ]
  ];
}

/**
 * Типы заявок
 */
function requestTypes() {
  return [
    [
      { text: 'Разовая', callback_data: 'type:разовая' },
      { text: 'Долгосрочная', callback_data: 'type:долгосрочная' }
    ],
    [
      { text: '❌ Отмена', callback_data: 'cancel' }
    ]
  ];
}

/**
 * Регионы
 */
function regions() {
  return [
    [
      { text: 'Москва', callback_data: 'region:Москва' },
      { text: 'СПб', callback_data: 'region:Санкт-Петербург' }
    ],
    [
      { text: 'Казань', callback_data: 'region:Казань' },
      { text: 'Новосибирск', callback_data: 'region:Новосибирск' }
    ],
    [
      { text: 'Екатеринбург', callback_data: 'region:Екатеринбург' },
      { text: 'Нижний Новгород', callback_data: 'region:Нижний Новгород' }
    ],
    [
      { text: 'Красноярск', callback_data: 'region:Красноярск' },
      { text: 'Челябинск', callback_data: 'region:Челябинск' }
    ],
    [
      { text: 'Ещё города...', callback_data: 'regions_more' }
    ],
    [
      { text: '❌ Отмена', callback_data: 'cancel' }
    ]
  ];
}

/**
 * Фильтры каталога
 */
function filters() {
  return [
    [
      { text: '🔍 По категории', callback_data: 'filter:category' },
      { text: '📍 По региону', callback_data: 'filter:region' }
    ],
    [
      { text: '📅 По типу', callback_data: 'filter:type' },
      { text: '🔄 Сбросить', callback_data: 'filter:reset' }
    ]
  ];
}

/**
 * Навигация по страницам каталога
 */
function catalogNavigation(currentPage, totalPages) {
  const buttons = [];
  
  if (currentPage > 1) {
    buttons.push({ text: '◀️ Назад', callback_data: `page:${currentPage - 1}` });
  }
  
  if (currentPage < totalPages) {
    buttons.push({ text: 'Вперёд ▶️', callback_data: `page:${currentPage + 1}` });
  }
  
  return [buttons];
}

/**
 * Подтверждение создания заявки
 */
function confirmRequest() {
  return [
    [
      { text: '✅ Подтвердить', callback_data: 'confirm:yes' },
      { text: '❌ Отмена', callback_data: 'cancel' }
    ]
  ];
}

module.exports = {
  mainMenu,
  requestActions,
  requestDetails,
  categories,
  requestTypes,
  regions,
  filters,
  catalogNavigation,
  confirmRequest
};

