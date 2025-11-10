import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMaxBridge } from '../contexts/MaxBridgeContext'
import { useApp } from '../contexts/AppContext'
import './RequestDetailPage.css'

const RequestDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, webApp } = useMaxBridge()
  const { requests, respondToRequest, getChatByRequestId } = useApp()
  const [request, setRequest] = useState(null)
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [responseData, setResponseData] = useState({
    message: '',
    contact: '',
    readyForFree: true
  })

  useEffect(() => {
    const foundRequest = requests.find(r => r.id === parseInt(id))
    setRequest(foundRequest)
  }, [id, requests])

  const handleResponse = (e) => {
    e.preventDefault()
    
    if (!request) return

    const result = respondToRequest(request.id, {
      message: responseData.message,
      contact: responseData.contact,
      readyForFree: responseData.readyForFree
    })

    if (result && result.chat) {
      if (webApp) {
        webApp.showAlert('Ваш отклик отправлен! Организация свяжется с вами.')
      } else {
        alert('Ваш отклик отправлен! Организация свяжется с вами.')
      }
      navigate(`/chat/${result.chat.id}`)
    }
  }

  if (!request) {
    return <div className="loading">Заявка не найдена</div>
  }

  return (
    <div className="request-detail-page">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Назад
      </button>

      <div className="request-detail">
        <div className="detail-header">
          <h2>{request.title}</h2>
          {request.verified && (
            <span className="verified-badge">✓ Проверено</span>
          )}
        </div>

        <div className="detail-org">
          <strong>Организация:</strong> {request.organization}
        </div>

        <div className="detail-section">
          <h3>Описание</h3>
          <p>{request.fullDescription || request.description}</p>
        </div>

        <div className="detail-info-grid">
          <div className="info-item">
            <span className="info-label">📍 Регион:</span>
            <span className="info-value">{request.region}</span>
          </div>
          <div className="info-item">
            <span className="info-label">🏷️ Категория:</span>
            <span className="info-value">{request.category}</span>
          </div>
          <div className="info-item">
            <span className="info-label">📅 Дата:</span>
            <span className="info-value">{request.date}</span>
          </div>
          <div className="info-item">
            <span className="info-label">⏰ Время:</span>
            <span className="info-value">{request.time || 'Уточняется'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">⏱️ Тип:</span>
            <span className="info-value">{request.type}</span>
          </div>
          <div className="info-item">
            <span className="info-label">💰 Вознаграждение:</span>
            <span className="info-value">{request.reward}</span>
          </div>
        </div>

        {request.location && (
          <div className="detail-section">
            <h3>Место проведения</h3>
            <p>{request.location}</p>
          </div>
        )}

        {request.requirements && (
          <div className="detail-section">
            <h3>Требования</h3>
            <p>{request.requirements}</p>
          </div>
        )}

        <div className="detail-actions">
          {!showResponseForm ? (
            <button
              onClick={() => setShowResponseForm(true)}
              className="response-button"
            >
              Откликнуться на заявку
            </button>
          ) : (
            <form onSubmit={handleResponse} className="response-form">
              <h3>Отклик на заявку</h3>
              <div className="form-group">
                <label>Ваше сообщение</label>
                <textarea
                  value={responseData.message}
                  onChange={(e) => setResponseData({ ...responseData, message: e.target.value })}
                  placeholder="Расскажите о себе и почему вы хотите помочь..."
                  rows="5"
                  required
                />
              </div>
              <div className="form-group">
                <label>Контактные данные</label>
                <input
                  type="text"
                  value={responseData.contact}
                  onChange={(e) => setResponseData({ ...responseData, contact: e.target.value })}
                  placeholder="Телефон или email"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={responseData.readyForFree}
                    onChange={(e) => setResponseData({ ...responseData, readyForFree: e.target.checked })}
                  />
                  Готов помочь бесплатно
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Отправить отклик
                </button>
                <button
                  type="button"
                  onClick={() => setShowResponseForm(false)}
                  className="cancel-button"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default RequestDetailPage

