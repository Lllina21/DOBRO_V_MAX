import { Link } from 'react-router-dom'
import { useMaxBridge } from '../contexts/MaxBridgeContext'
import './HomePage.css'

const HomePage = () => {
  const { user } = useMaxBridge()

  return (
    <div className="home-page">
      <div className="hero-section">
        <h2>Добро пожаловать в Добро в MAX!</h2>
        <p className="hero-subtitle">
          Платформа для объединения волонтёров и социальных организаций
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🏢</div>
          <h3>Для организаций</h3>
          <p>Зарегистрируйте вашу НКО и находите волонтёров для ваших проектов</p>
          <Link to="/register-org" className="feature-link">
            Зарегистрироваться →
          </Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon">👥</div>
          <h3>Для волонтёров</h3>
          <p>Найдите подходящие возможности помочь и станьте частью движения</p>
          <Link to="/catalog" className="feature-link">
            Посмотреть заявки →
          </Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon">💬</div>
          <h3>Безопасное общение</h3>
          <p>Общайтесь с организациями и волонтёрами прямо в приложении</p>
          <Link to="/catalog" className="feature-link">
            Начать →
          </Link>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Быстрые действия</h3>
        <div className="actions-grid">
          <Link to="/catalog" className="action-button primary">
            📋 Просмотреть каталог заявок
          </Link>
          <Link to="/create-request" className="action-button secondary">
            ➕ Создать заявку на помощь
          </Link>
          {user && (
            <Link to="/profile" className="action-button outline">
              👤 Мой профиль
            </Link>
          )}
        </div>
      </div>

      <div className="stats-section">
        <h3>Статистика платформы</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">150+</div>
            <div className="stat-label">Организаций</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Активных заявок</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">2000+</div>
            <div className="stat-label">Волонтёров</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage

