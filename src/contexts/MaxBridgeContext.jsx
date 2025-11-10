import { createContext, useContext, useEffect, useState } from 'react'

const MaxBridgeContext = createContext(null)

export const MaxBridgeProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [webApp, setWebApp] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Инициализация MAX Bridge
    if (window.WebApp) {
      const app = window.WebApp
      setWebApp(app)
      
      // Получаем информацию о пользователе
      app.ready()
      app.expand()
      
      const userData = {
        id: app.initDataUnsafe?.user?.id || 'guest',
        firstName: app.initDataUnsafe?.user?.first_name || 'Гость',
        lastName: app.initDataUnsafe?.user?.last_name || '',
        username: app.initDataUnsafe?.user?.username || '',
        isPremium: app.initDataUnsafe?.user?.is_premium || false
      }
      
      setUser(userData)
      setLoading(false)
    } else {
      // Для разработки без MAX
      setUser({
        id: 'dev-user',
        firstName: 'Тестовый',
        lastName: 'Пользователь',
        username: 'test_user',
        isPremium: false
      })
      setWebApp({
        ready: () => {},
        expand: () => {},
        close: () => {},
        showAlert: (message) => alert(message),
        showConfirm: (message) => window.confirm(message)
      })
      setLoading(false)
    }
  }, [])

  const value = {
    user,
    webApp,
    loading
  }

  return (
    <MaxBridgeContext.Provider value={value}>
      {children}
    </MaxBridgeContext.Provider>
  )
}

export const useMaxBridge = () => {
  const context = useContext(MaxBridgeContext)
  if (!context) {
    throw new Error('useMaxBridge must be used within MaxBridgeProvider')
  }
  return context
}

