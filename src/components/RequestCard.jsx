import { Link } from 'react-router-dom'
import './RequestCard.css'

const RequestCard = ({ request }) => {
  return (
    <Link to={`/request/${request.id}`} className="request-card">
      <div className="request-card-header">
        <h3>{request.title}</h3>
        {request.verified && (
          <span className="verified-badge">✓ Проверено</span>
        )}
      </div>
      
      <div className="request-card-org">
        <strong>{request.organization}</strong>
      </div>
      
      <p className="request-card-description">{request.description}</p>
      
      <div className="request-card-meta">
        <span className="meta-item">📍 {request.region}</span>
        <span className="meta-item">🏷️ {request.category}</span>
        <span className="meta-item">📅 {request.date}</span>
        <span className="meta-item">⏱️ {request.type}</span>
      </div>
      
      <div className="request-card-footer">
        <span className={`reward-badge ${request.reward === 'бесплатно' ? 'free' : 'paid'}`}>
          {request.reward === 'бесплатно' ? '🆓 Бесплатно' : `💰 ${request.reward}`}
        </span>
        <span className="view-link">Подробнее →</span>
      </div>
    </Link>
  )
}

export default RequestCard

