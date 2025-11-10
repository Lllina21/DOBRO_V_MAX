import { useState } from 'react'
import './FilterPanel.css'

const FilterPanel = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const regions = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург']
  const categories = ['Инклюзия', 'Экология', 'Здоровье', 'Культура']
  const types = ['разовая', 'долгосрочная']
  const rewards = ['бесплатно', 'компенсация проезда', 'оплата']

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const cleared = { region: '', category: '', type: '', reward: '' }
    setLocalFilters(cleared)
    onFilterChange(cleared)
  }

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Фильтры</h3>
        <button onClick={clearFilters} className="clear-filters">
          Сбросить
        </button>
      </div>

      <div className="filter-group">
        <label>Регион</label>
        <select
          value={localFilters.region}
          onChange={(e) => handleChange('region', e.target.value)}
          className="filter-select"
        >
          <option value="">Все регионы</option>
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Категория</label>
        <select
          value={localFilters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="filter-select"
        >
          <option value="">Все категории</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Тип заявки</label>
        <select
          value={localFilters.type}
          onChange={(e) => handleChange('type', e.target.value)}
          className="filter-select"
        >
          <option value="">Все типы</option>
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Вознаграждение</label>
        <select
          value={localFilters.reward}
          onChange={(e) => handleChange('reward', e.target.value)}
          className="filter-select"
        >
          <option value="">Любое</option>
          {rewards.map(reward => (
            <option key={reward} value={reward}>{reward}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default FilterPanel

