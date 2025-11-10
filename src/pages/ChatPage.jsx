import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMaxBridge } from '../contexts/MaxBridgeContext'
import { useApp } from '../contexts/AppContext'
import './ChatPage.css'

const ChatPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useMaxBridge()
  const { chats, getChat, sendMessage } = useApp()
  const [chat, setChat] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const foundChat = getChat(parseInt(id))
    setChat(foundChat)
  }, [id, chats])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat?.messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !chat) return

    sendMessage(chat.id, newMessage)
    setNewMessage('')
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!chat) {
    return <div className="loading">Чат не найден</div>
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Назад
        </button>
        <div className="chat-info">
          <h3>{chat.organizationName || 'Чат с организацией'}</h3>
          <span className="chat-status">Онлайн</span>
        </div>
      </div>

      <div className="chat-messages">
        {!chat.messages || chat.messages.length === 0 ? (
          <div className="empty-chat">
            <p>Начните общение, отправив первое сообщение</p>
          </div>
        ) : (
          chat.messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'message-user' : 'message-other'}`}
            >
              <div className="message-header">
                <span className="message-name">{message.name}</span>
                <span className="message-time">{formatTime(message.timestamp || new Date())}</span>
              </div>
              <div className="message-text">{message.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение..."
          className="chat-input"
        />
        <button type="submit" className="send-button" disabled={!newMessage.trim()}>
          Отправить
        </button>
      </form>
    </div>
  )
}

export default ChatPage

