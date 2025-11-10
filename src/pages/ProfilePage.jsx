import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMaxBridge } from '../contexts/MaxBridgeContext'
import { useApp } from '../contexts/AppContext'
import './ProfilePage.css'

const ProfilePage = () => {
  const { user } = useMaxBridge()
  const { userRequests, userResponses, chats } = useApp()
  const [activeTab, setActiveTab] = useState('info')

  // Форматирование статуса заявки
  const getRequestStatus = (request) => {
    if (request.verified) return 'активна'
    return 'на модерации'
  }

  // Форматирование статуса отклика
  const getResponseStatus = (response) => {
    return response.status === 'pending' ? 'ожидает ответа' : response.status
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <span>{user?.firstName?.[0] || 'U'}</span>
        </div>
        <div className="profile-info">
          <h2>{user?.firstName} {user?.lastName}</h2>
          <p className="profile-username">@{user?.username || 'user'}</p>
          {user?.isPremium && (
            <span className="premium-badge">⭐ Premium</span>
          )}
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Информация
        </button>
        <button
          className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Мои заявки
        </button>
        <button
          className={`tab-button ${activeTab === 'responses' ? 'active' : ''}`}
          onClick={() => setActiveTab('responses')}
        >
          Мои отклики
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'info' && (
          <div className="info-section">
            <div className="info-card">
              <h3>Личная информация</h3>
              <div className="info-item">
                <span className="info-label">Имя:</span>
                <span className="info-value">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">ID пользователя:</span>
                <span className="info-value">{user?.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Статус:</span>
                <span className="info-value">Волонтёр</span>
              </div>
            </div>

            <div className="info-card">
              <h3>Быстрые действия</h3>
              <div className="quick-actions-list">
                <Link to="/create-request" className="action-link">
                  ➕ Создать заявку
                </Link>
                <Link to="/register-org" className="action-link">
                  🏢 Зарегистрировать организацию
                </Link>
                <Link to="/catalog" className="action-link">
                  📋 Просмотреть каталог
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="requests-section">
            <div className="section-header">
              <h3>Мои заявки</h3>
              <Link to="/create-request" className="create-link">
                + Создать новую
              </Link>
            </div>
            {userRequests.length === 0 ? (
              <div className="empty-state">
                <p>У вас пока нет созданных заявок</p>
                <Link to="/create-request" className="create-button">
                  Создать первую заявку
                </Link>
              </div>
            ) : (
              <div className="requests-list">
                {userRequests.map(request => {
                  const status = getRequestStatus(request)
                  return (
                    <div key={request.id} className="request-item">
                      <div className="request-item-header">
                        <h4>{request.title}</h4>
                        <span className={`status-badge status-${status}`}>
                          {status}
                        </span>
                      </div>
                      <div className="request-item-meta">
                        <span>📅 {request.date}</span>
                        {request.responses && request.responses.length > 0 && (
                          <span>👥 {request.responses.length} откликов</span>
                        )}
                      </div>
                      <Link to={`/request/${request.id}`} className="view-link">
                        Подробнее →
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'responses' && (
          <div className="responses-section">
            <div className="section-header">
              <h3>Мои отклики</h3>
            </div>
            {userResponses.length === 0 ? (
              <div className="empty-state">
                <p>Вы ещё не откликались на заявки</p>
                <Link to="/catalog" className="create-button">
                  Посмотреть каталог
                </Link>
              </div>
            ) : (
              <div className="responses-list">
                {userResponses.map(response => {
                  const chat = chats.find(c => c.requestId === response.requestId)
                  const status = getResponseStatus(response)
                  return (
                    <div key={response.id} className="response-item">
                      <div className="response-item-header">
                        <h4>{response.requestTitle || 'Заявка'}</h4>
                        <span className={`status-badge status-${status}`}>
                          {status}
                        </span>
                      </div>
                      <div className="response-item-org">
                        Организация: {response.organizationName || 'Организация'}
                      </div>
                      {chat && (
                        <Link to={`/chat/${chat.id}`} className="chat-link">
                          💬 Открыть чат
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage

