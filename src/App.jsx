import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import OrganizationRegisterPage from './pages/OrganizationRegisterPage'
import CreateRequestPage from './pages/CreateRequestPage'
import RequestDetailPage from './pages/RequestDetailPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import TestPage from './pages/TestPage'
import { MaxBridgeProvider } from './contexts/MaxBridgeContext'
import { AppProvider } from './contexts/AppContext'

function App() {
  console.log('App компонент рендерится')
  
  try {
    return (
      <ErrorBoundary>
        <MaxBridgeProvider>
          <AppProvider>
            <Routes>
              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/catalog" element={<Layout><CatalogPage /></Layout>} />
              <Route path="/register-org" element={<Layout><OrganizationRegisterPage /></Layout>} />
              <Route path="/create-request" element={<Layout><CreateRequestPage /></Layout>} />
              <Route path="/request/:id" element={<Layout><RequestDetailPage /></Layout>} />
              <Route path="/chat/:id" element={<Layout><ChatPage /></Layout>} />
              <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
              <Route path="/test" element={<Layout><TestPage /></Layout>} />
            </Routes>
          </AppProvider>
        </MaxBridgeProvider>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('Ошибка в App:', error)
    return (
      <div style={{padding: '50px', textAlign: 'center'}}>
        <h1 style={{color: 'red'}}>Ошибка в App компоненте</h1>
        <p>{error.message}</p>
        <pre>{error.stack}</pre>
      </div>
    )
  }
}

export default App

