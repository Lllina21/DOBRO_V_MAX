import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useMaxBridge } from './MaxBridgeContext'

const AppContext = createContext(null)

export const AppProvider = ({ children }) => {
  let user = null
  try {
    const maxBridge = useMaxBridge()
    user = maxBridge.user
  } catch (error) {
    console.error('Ошибка получения MaxBridge:', error)
    user = { id: 'dev-user', firstName: 'Тестовый', lastName: 'Пользователь' }
  }
  const [requests, setRequests] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [chats, setChats] = useState([])
  const [userRequests, setUserRequests] = useState([])
  const [userResponses, setUserResponses] = useState([])

  // Загрузка данных из localStorage при монтировании
  useEffect(() => {
    console.log('Инициализация AppContext...')
    
    const savedRequests = localStorage.getItem('dobro_requests')
    const savedOrgs = localStorage.getItem('dobro_organizations')
    const savedChats = localStorage.getItem('dobro_chats')
    const savedUserRequests = localStorage.getItem('dobro_user_requests')
    const savedUserResponses = localStorage.getItem('dobro_user_responses')

    if (savedRequests && savedRequests !== '[]' && savedRequests !== 'null') {
      try {
        const parsed = JSON.parse(savedRequests)
        console.log('Загружены заявки из localStorage:', parsed)
        setRequests(parsed)
      } catch (e) {
        console.error('Ошибка парсинга заявок:', e)
      }
    } else {
      // Начальные моковые данные
      console.log('Создание начальных данных...')
      const initialRequests = [
        {
          id: 1,
          title: 'Помощь в организации благотворительного концерта',
          organization: 'Фонд "Добрые сердца"',
          organizationId: 1,
          region: 'Москва',
          category: 'Культура',
          type: 'разовая',
          description: 'Нужны волонтёры для помощи в организации концерта 15 декабря',
          fullDescription: 'Мы проводим благотворительный концерт для сбора средств на помощь детям. Нужны активные и ответственные волонтёры, готовые помочь в организации мероприятия. Работа будет проходить 15 декабря с 10:00 до 20:00.',
          date: '2024-12-15',
          time: '10:00 - 20:00',
          location: 'Москва, ул. Тверская, д. 10',
          reward: 'бесплатно',
          requirements: 'Опыт работы на мероприятиях приветствуется, но не обязателен. Важны ответственность и желание помочь.',
          verified: true,
          createdAt: new Date().toISOString(),
          responses: []
        },
        {
          id: 2,
          title: 'Регулярная помощь в приюте для животных',
          organization: 'Приют "Лапки"',
          organizationId: 2,
          region: 'Санкт-Петербург',
          category: 'Экология',
          type: 'долгосрочная',
          description: 'Ищем волонтёров для ухода за животными 3 раза в неделю',
          fullDescription: 'Наш приют нуждается в помощи волонтёров для ежедневного ухода за животными. Требуется помощь в кормлении, выгуле и уборке. Работа 3 раза в неделю по 4 часа.',
          date: '2024-12-10',
          time: 'Уточняется',
          location: 'Санкт-Петербург, ул. Зверинская, д. 5',
          reward: 'компенсация проезда',
          requirements: 'Любовь к животным, ответственность',
          verified: true,
          createdAt: new Date().toISOString(),
          responses: []
        },
        {
          id: 3,
          title: 'Помощь детям в детском доме',
          organization: 'Детский дом №5',
          organizationId: 3,
          region: 'Казань',
          category: 'Инклюзия',
          type: 'долгосрочная',
          description: 'Нужны наставники для детей, помощь в обучении',
          fullDescription: 'Ищем ответственных волонтёров для работы с детьми. Помощь в обучении, организации досуга, наставничество.',
          date: '2024-12-20',
          time: '15:00 - 18:00',
          location: 'Казань, ул. Ленина, д. 15',
          reward: 'бесплатно',
          requirements: 'Опыт работы с детьми приветствуется',
          verified: true,
          createdAt: new Date().toISOString(),
          responses: []
        }
      ]
      console.log('Установка начальных заявок:', initialRequests)
      setRequests(initialRequests)
      try {
        localStorage.setItem('dobro_requests', JSON.stringify(initialRequests))
        console.log('Начальные заявки сохранены в localStorage')
      } catch (e) {
        console.error('Ошибка сохранения заявок:', e)
      }
    }

    if (savedOrgs && savedOrgs !== '[]' && savedOrgs !== 'null') {
      try {
        setOrganizations(JSON.parse(savedOrgs))
      } catch (e) {
        console.error('Ошибка парсинга организаций:', e)
      }
    } else {
      const initialOrgs = [
        { id: 1, name: 'Фонд "Добрые сердца"', verified: true },
        { id: 2, name: 'Приют "Лапки"', verified: true },
        { id: 3, name: 'Детский дом №5', verified: true }
      ]
      setOrganizations(initialOrgs)
      try {
        localStorage.setItem('dobro_organizations', JSON.stringify(initialOrgs))
      } catch (e) {
        console.error('Ошибка сохранения организаций:', e)
      }
    }

    if (savedChats && savedChats !== '[]' && savedChats !== 'null') {
      try {
        setChats(JSON.parse(savedChats))
      } catch (e) {
        console.error('Ошибка парсинга чатов:', e)
      }
    }

    if (savedUserRequests && savedUserRequests !== '[]' && savedUserRequests !== 'null') {
      try {
        setUserRequests(JSON.parse(savedUserRequests))
      } catch (e) {
        console.error('Ошибка парсинга пользовательских заявок:', e)
      }
    }

    if (savedUserResponses && savedUserResponses !== '[]' && savedUserResponses !== 'null') {
      try {
        setUserResponses(JSON.parse(savedUserResponses))
      } catch (e) {
        console.error('Ошибка парсинга откликов:', e)
      }
    }
    
    console.log('Инициализация AppContext завершена')
  }, [])

  // Сохранение в localStorage при изменении
  useEffect(() => {
    if (requests && requests.length > 0) {
      try {
        localStorage.setItem('dobro_requests', JSON.stringify(requests))
        console.log('Заявки сохранены в localStorage:', requests.length, 'шт.')
      } catch (e) {
        console.error('Ошибка сохранения заявок:', e)
      }
    }
  }, [requests])

  useEffect(() => {
    localStorage.setItem('dobro_organizations', JSON.stringify(organizations))
  }, [organizations])

  useEffect(() => {
    localStorage.setItem('dobro_chats', JSON.stringify(chats))
  }, [chats])

  useEffect(() => {
    localStorage.setItem('dobro_user_requests', JSON.stringify(userRequests))
  }, [userRequests])

  useEffect(() => {
    localStorage.setItem('dobro_user_responses', JSON.stringify(userResponses))
  }, [userResponses])

  // Создание новой заявки
  const createRequest = (requestData) => {
    const newRequest = {
      id: Date.now(),
      ...requestData,
      organization: user?.firstName || 'Пользователь',
      organizationId: user?.id || 'user',
      verified: false,
      createdAt: new Date().toISOString(),
      responses: []
    }
    console.log('Создание заявки:', newRequest)
    setRequests(prev => {
      const updated = [newRequest, ...prev]
      console.log('Обновлённый список заявок:', updated)
      return updated
    })
    setUserRequests(prev => {
      const updated = [...prev, newRequest]
      console.log('Обновлённый список пользовательских заявок:', updated)
      return updated
    })
    return newRequest
  }

  // Отклик на заявку
  const respondToRequest = (requestId, responseData) => {
    const request = requests.find(r => r.id === requestId)
    if (!request) return null

    const response = {
      id: Date.now(),
      requestId,
      userId: user?.id || 'user',
      userName: `${user?.firstName || 'Пользователь'} ${user?.lastName || ''}`,
      ...responseData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }

    // Добавляем отклик к заявке
    const updatedRequests = requests.map(r => 
      r.id === requestId 
        ? { ...r, responses: [...r.responses, response] }
        : r
    )
    setRequests(updatedRequests)

    // Сохраняем в пользовательские отклики
    setUserResponses(prev => [...prev, response])

    // Создаём чат
    const chat = {
      id: Date.now(),
      requestId,
      requestTitle: request.title,
      organizationId: request.organizationId,
      organizationName: request.organization,
      userId: user?.id || 'user',
      userName: `${user?.firstName || 'Пользователь'} ${user?.lastName || ''}`,
      messages: [
        {
          id: 1,
          sender: 'organization',
          name: request.organization,
          text: `Здравствуйте! Спасибо за отклик на заявку "${request.title}".`,
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          sender: 'user',
          name: response.userName,
          text: responseData.message,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    }
    setChats(prev => [...prev, chat])

    return { response, chat }
  }

  // Регистрация организации
  const registerOrganization = (orgData) => {
    const newOrg = {
      id: Date.now(),
      ...orgData,
      verified: false, // Требует модерации
      createdAt: new Date().toISOString()
    }
    setOrganizations(prev => [newOrg, ...prev])
    return newOrg
  }

  // Отправка сообщения в чат
  const sendMessage = (chatId, text) => {
    const chat = chats.find(c => c.id === chatId)
    if (!chat) return null

    const message = {
      id: Date.now(),
      sender: 'user',
      name: user?.firstName || 'Вы',
      text,
      timestamp: new Date().toISOString()
    }

    const updatedChats = chats.map(c =>
      c.id === chatId
        ? { ...c, messages: [...c.messages, message] }
        : c
    )
    setChats(updatedChats)
    return message
  }

  // Получение чата по ID
  const getChat = useCallback((chatId) => {
    return chats.find(c => c.id === parseInt(chatId))
  }, [chats])

  // Получение чата по requestId
  const getChatByRequestId = useCallback((requestId) => {
    return chats.find(c => c.requestId === parseInt(requestId))
  }, [chats])

  const value = {
    requests,
    setRequests,
    organizations,
    setOrganizations,
    chats,
    setChats,
    userRequests,
    userResponses,
    createRequest,
    respondToRequest,
    registerOrganization,
    sendMessage,
    getChat,
    getChatByRequestId
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Экспорт хука отдельно для совместимости с Fast Refresh
function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export { useApp }

