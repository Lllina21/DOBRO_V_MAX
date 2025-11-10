import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMaxBridge } from '../contexts/MaxBridgeContext'
import { useApp } from '../contexts/AppContext'
import './OrganizationRegisterPage.css'

const OrganizationRegisterPage = () => {
  const navigate = useNavigate()
  const { webApp } = useMaxBridge()
  const { registerOrganization } = useApp()
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    region: '',
    description: '',
    contact: '',
    website: '',
    license: '',
    documents: []
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData({ ...formData, documents: files })
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Название обязательно'
    if (!formData.type) newErrors.type = 'Тип организации обязателен'
    if (!formData.region) newErrors.region = 'Регион обязателен'
    if (!formData.description.trim()) newErrors.description = 'Описание обязательно'
    if (!formData.contact.trim()) newErrors.contact = 'Контактные данные обязательны'
    if (!formData.license.trim()) newErrors.license = 'Номер лицензии обязателен'
    if (formData.documents.length === 0) newErrors.documents = 'Необходимо загрузить документы'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    // Регистрация организации
    const orgData = {
      name: formData.name,
      type: formData.type,
      region: formData.region,
      description: formData.description,
      contact: formData.contact,
      website: formData.website || '',
      license: formData.license,
      documentsCount: formData.documents.length
    }

    registerOrganization(orgData)

    if (webApp) {
      webApp.showAlert('Заявка на регистрацию отправлена! После модерации вы получите уведомление.')
    } else {
      alert('Заявка на регистрацию отправлена! После модерации вы получите уведомление.')
    }
    
    navigate('/')
  }

  return (
    <div className="register-page">
      <h2>Регистрация организации</h2>
      <p className="page-description">
        Заполните форму для регистрации вашей НКО. После проверки документов 
        вы сможете публиковать заявки на помощь.
      </p>

      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-section">
          <h3>Основная информация</h3>
          
          <div className="form-group">
            <label>Название организации *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Например: Фонд 'Добрые сердца'"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Тип организации *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={errors.type ? 'error' : ''}
            >
              <option value="">Выберите тип</option>
              <option value="фонд">Благотворительный фонд</option>
              <option value="приют">Приют</option>
              <option value="детдом">Детский дом</option>
              <option value="нко">НКО</option>
              <option value="другое">Другое</option>
            </select>
            {errors.type && <span className="error-message">{errors.type}</span>}
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
            <label>Описание деятельности *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Расскажите о вашей организации и её деятельности..."
              rows="5"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>
        </div>

        <div className="form-section">
          <h3>Контактная информация</h3>
          
          <div className="form-group">
            <label>Контактные данные *</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Телефон или email"
              className={errors.contact ? 'error' : ''}
            />
            {errors.contact && <span className="error-message">{errors.contact}</span>}
          </div>

          <div className="form-group">
            <label>Веб-сайт (необязательно)</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Документы для верификации</h3>
          
          <div className="form-group">
            <label>Номер лицензии/свидетельства *</label>
            <input
              type="text"
              name="license"
              value={formData.license}
              onChange={handleChange}
              placeholder="Номер документа"
              className={errors.license ? 'error' : ''}
            />
            {errors.license && <span className="error-message">{errors.license}</span>}
          </div>

          <div className="form-group">
            <label>Загрузите документы *</label>
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              className={errors.documents ? 'error' : ''}
            />
            {errors.documents && <span className="error-message">{errors.documents}</span>}
            {formData.documents.length > 0 && (
              <div className="files-list">
                Загружено файлов: {formData.documents.length}
              </div>
            )}
            <small>Можно загрузить несколько файлов (PDF, JPG, PNG)</small>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Отправить на модерацию
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cancel-button"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}

export default OrganizationRegisterPage

