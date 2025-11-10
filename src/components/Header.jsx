import { Link } from 'react-router-dom'
import { useMaxBridge } from '../contexts/MaxBridgeContext'
import './Header.css'

const Header = () => {
  const { user } = useMaxBridge()

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <h1>Добро в MAX</h1>
        </Link>
        <div className="header-user">
          {user && (
            <Link to="/profile" className="header-user-info">
              <span>{user.firstName} {user.lastName}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

