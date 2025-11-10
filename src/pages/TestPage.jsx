import React from 'react'

function TestPage() {
  console.log('TestPage функция вызвана!')
  
  const testClick = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    console.log('Тестовая кнопка нажата!')
    window.alert('Кнопка работает!')
    return false
  }

  console.log('TestPage: возвращаем JSX')

  const buttonStyle = {
    padding: '20px 40px',
    background: '#ff0000',
    color: 'white',
    border: '3px solid #000',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '20px',
    display: 'block',
    margin: '20px auto',
    zIndex: 9999,
    position: 'relative'
  }

  return (
    <div style={{padding: '50px', textAlign: 'center', backgroundColor: '#fff', minHeight: '400px', position: 'relative', zIndex: 1}}>
      <h1 style={{color: '#333', marginBottom: '30px'}}>Тестовая страница</h1>
      <div style={{marginBottom: '20px'}}>
        <button 
          onClick={testClick}
          onMouseDown={(e) => {
            console.log('MouseDown на кнопке')
            testClick(e)
          }}
          style={buttonStyle}
        >
          ТЕСТ КНОПКИ - НАЖМИ МЕНЯ!
        </button>
      </div>
      <p style={{marginTop: '20px', color: '#666'}}>Если эта кнопка работает, значит JavaScript работает</p>
      <div style={{marginTop: '30px', padding: '20px', background: '#f0f0f0', borderRadius: '8px'}}>
        <p>Если вы видите этот текст, значит страница рендерится</p>
        <p>Попробуйте кликнуть по красной кнопке выше</p>
      </div>
    </div>
  )
}

export default TestPage

