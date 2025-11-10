import Header from './Header'
import Navigation from './Navigation'
import './Layout.css'

const Layout = ({ children }) => {
  console.log('Layout компонент рендерится, children:', children)
  
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Navigation />
    </div>
  )
}

export default Layout

