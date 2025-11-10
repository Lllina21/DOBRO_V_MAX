import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// MAX UI компонент (заглушка, если библиотека недоступна)
// В реальном приложении замените на: import { MaxUI } from '@maxhub/max-ui'
// import '@maxhub/max-ui/dist/styles.css'
const MaxUI = ({ children }) => children

const Root = () => (
  <MaxUI>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <App />
    </BrowserRouter>
  </MaxUI>
)

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Элемент #root не найден!')
} else {
  console.log('Элемент #root найден, начинаем рендеринг')
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <Root />
      </React.StrictMode>
    )
    console.log('React приложение успешно отрендерено')
  } catch (error) {
    console.error('Ошибка при рендеринге React:', error)
    rootElement.innerHTML = `
      <div style="padding: 50px; text-align: center;">
        <h1 style="color: red;">Ошибка загрузки приложения</h1>
        <p>${error.message}</p>
        <pre>${error.stack}</pre>
      </div>
    `
  }
}

