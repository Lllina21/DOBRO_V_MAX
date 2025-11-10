import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import RequestCard from '../components/RequestCard'
import FilterPanel from '../components/FilterPanel'
import { useApp } from '../contexts/AppContext'
import './CatalogPage.css'

const CatalogPage = () => {
  let requests = []
  try {
    const appContext = useApp()
    requests = appContext.requests || []
    console.log('CatalogPage: получены заявки из контекста:', requests.length)
  } catch (error) {
    console.error('CatalogPage: ошибка получения контекста:', error)
    // Пытаемся загрузить из localStorage напрямую
    try {
      const saved = localStorage.getItem('dobro_requests')
      if (saved) {
        requests = JSON.parse(saved)
        console.log('CatalogPage: загружены заявки из localStorage:', requests.length)
      }
    } catch (e) {
      console.error('CatalogPage: ошибка загрузки из localStorage:', e)
    }
  }
  
  const [filteredRequests, setFilteredRequests] = useState([])
  const [filters, setFilters] = useState({
    region: '',
    category: '',
    type: '',
    reward: ''
  })

  useEffect(() => {
    // Фильтрация заявок
    if (!requests || requests.length === 0) {
      setFilteredRequests([])
      return
    }

    let filtered = [...requests]

    if (filters.region) {
      filtered = filtered.filter(r => r.region === filters.region)
    }
    if (filters.category) {
      filtered = filtered.filter(r => r.category === filters.category)
    }
    if (filters.type) {
      filtered = filtered.filter(r => r.type === filters.type)
    }
    if (filters.reward) {
      filtered = filtered.filter(r => r.reward === filters.reward)
    }

    setFilteredRequests(filtered)
  }, [filters, requests])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  console.log('CatalogPage - requests:', requests, 'filtered:', filteredRequests)

  const testClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Тестовая кнопка нажата!')
    alert('Кнопка работает!')
    return false
  }

  return (
    <div className="catalog-page" style={{position: 'relative', zIndex: 1}}>
      <div className="catalog-header">
        <h2>Каталог заявок</h2>
        <div style={{display: 'flex', gap: '10px', alignItems: 'center', position: 'relative', zIndex: 10}}>
          <button 
            onClick={testClick}
            onMouseDown={(e) => {
              e.preventDefault()
              console.log('MouseDown на тестовой кнопке')
            }}
            style={{
              padding: '12px 24px', 
              background: '#ff0000', 
              color: 'white', 
              border: '3px solid #000',
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              zIndex: 1000,
              position: 'relative'
            }}
          >
            ТЕСТ КНОПКИ
          </button>
          <Link 
            to="/create-request" 
            className="create-button" 
            onClick={(e) => {
              console.log('Клик по ссылке создания заявки')
            }}
            style={{position: 'relative', zIndex: 10}}
          >
            ➕ Создать заявку
          </Link>
        </div>
      </div>

      <div className="catalog-content">
        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        
        <div className="requests-list">
          {!requests || requests.length === 0 ? (
            <div className="empty-state">
              <p>Загрузка заявок...</p>
              <button onClick={() => {
                console.log('Принудительная перезагрузка данных')
                localStorage.clear()
                window.location.reload()
              }} style={{marginTop: '10px', padding: '10px'}}>
                Перезагрузить данные
              </button>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="empty-state">
              <p>Заявки не найдены. Попробуйте изменить фильтры.</p>
            </div>
          ) : (
            filteredRequests.map(request => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default CatalogPage

