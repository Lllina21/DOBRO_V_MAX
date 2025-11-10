import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMaxBridge } from '../contexts/MaxBridgeContext'
import { useApp } from '../contexts/AppContext'
import './CreateRequestPage.css'

const CreateRequestPage = () => {
  const navigate = useNavigate()
  const { webApp } = useMaxBridge()
  const appContext = useApp()
  const { createRequest } = appContext
  
  console.log('CreateRequestPage загружен, createRequest:', typeof createRequest, appContext)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    type: '',
    region: '',
    description: '',
    date: '',
    time: '',
    location: '',
    requirements: '',
    reward: 'бесплатно'
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) newErrors.title = 'Название обязательно'
    if (!formData.category) newErrors.category = 'Категория обязательна'
    if (!formData.type) newErrors.type = 'Тип заявки обязателен'
    if (!formData.region) newErrors.region = 'Регион обязателен'
    if (!formData.description.trim()) newErrors.description = 'Описание обязательно'
    if (!formData.date) newErrors.date = 'Дата обязательна'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('Форма отправлена!', formData)
    
    if (!validate()) {
      console.log('Валидация не прошла:', errors)
      return
    }

    // Создание заявки
    const requestData = {
      title: formData.title,
      category: formData.category,
      type: formData.type,
      region: formData.region,
      description: formData.description,
      fullDescription: formData.description,
      date: formData.date,
      time: formData.time || 'Уточняется',
      location: formData.location || '',
      requirements: formData.requirements || '',
      reward: formData.reward
    }

    console.log('Данные для создания заявки:', requestData)
    console.log('createRequest функция:', typeof createRequest)

    try {
      const newRequest = createRequest(requestData)
      console.log('Заявка создана:', newRequest)
      
      if (webApp) {
        webApp.showAlert('Заявка успешно создана!')
      } else {
        alert('Заявка успешно создана!')
      }
      
      navigate('/catalog')
    } catch (error) {
      console.error('Ошибка при создании заявки:', error)
      alert('Ошибка при создании заявки: ' + error.message)
    }
  }

  return (
    <div className="create-request-page">
      <h2>Создать заявку на помощь</h2>
      <p className="page-description">
        Заполните форму, чтобы создать заявку на поиск волонтёров или помощь.
      </p>

      <form onSubmit={handleSubmit} className="create-request-form">
        <div className="form-section">
          <h3>Основная информация</h3>
          
          <div className="form-group">
            <label>Название заявки *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Например: Помощь в организации мероприятия"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Категория *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? 'error' : ''}
              >
                <option value="">Выберите категорию</option>
                <option value="Инклюзия">Инклюзия</option>
                <option value="Экология">Экология</option>
                <option value="Здоровье">Здоровье</option>
                <option value="Культура">Культура</option>
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label>Тип заявки *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={errors.type ? 'error' : ''}
              >
                <option value="">Выберите тип</option>
                <option value="разовая">Разовая</option>
                <option value="долгосрочная">Долгосрочная</option>
              </select>
              {errors.type && <span className="error-message">{errors.type}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Регион *</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
              className={errors.region ? 'error' : ''}
            >
              <option value="">Выберите регион</option>
              <option value="Москва">Москва</option>
              <option value="Санкт-Петербург">Санкт-Петербург</option>
              <option value="Казань">Казань</option>
              <option value="Новосибирск">Новосибирск</option>
              <option value="Екатеринбург">Екатеринбург</option>
            </select>
            {errors.region && <span className="error-message">{errors.region}</span>}
          </div>

          <div className="form-group">
            <label>Описание *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Подробно опишите, какая помощь требуется..."
              rows="6"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>
        </div>

        <div className="form-section">
          <h3>Детали</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Дата *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label>Время (необязательно)</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Место проведения (необязательно)</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Адрес или место проведения"
            />
          </div>

          <div className="form-group">
            <label>Требования к волонтёрам (необязательно)</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Опыт, навыки, возраст и т.д."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Вознаграждение</label>
            <select
              name="reward"
              value={formData.reward}
              onChange={handleChange}
            >
              <option value="бесплатно">Бесплатно</option>
              <option value="компенсация проезда">Компенсация проезда</option>
              <option value="оплата">Оплата</option>
            </select>
          </div>
        </div>

        <div className="form-actions" style={{position: 'relative', zIndex: 10}}>
          <button 
            type="submit" 
            className="submit-button"
            onClick={(e) => {
              console.log('Клик по кнопке отправки формы')
              // handleSubmit вызовется автоматически через onSubmit формы
            }}
            onMouseDown={(e) => {
              console.log('MouseDown на кнопке отправки')
            }}
          >
            Создать заявку
          </button>
          <button
            type="button"
            onClick={(e) => {
              console.log('Клик по кнопке отмены')
              e.preventDefault()
              e.stopPropagation()
              navigate(-1)
            }}
            className="cancel-button"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Тестовая кнопка нажата!')
              alert('Кнопка работает!')
            }}
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
        </div>
      </form>
    </div>
  )
}

export default CreateRequestPage

