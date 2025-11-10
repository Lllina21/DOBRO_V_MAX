import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

const Navigation = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Главная', icon: '🏠' },
    { path: '/catalog', label: 'Каталог', icon: '📋' },
    { path: '/create-request', label: 'Создать', icon: '➕' },
    { path: '/profile', label: 'Профиль', icon: '👤' }
  ]

  return (
    <nav className="navigation">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export default Navigation

