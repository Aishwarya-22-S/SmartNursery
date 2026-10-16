import { useState, useRef, useCallback, useEffect, useContext } from 'react'
import ChatMessage from '../components/ChatMessage.jsx'
import { AppContext } from '../context/AppContext.jsx'

function Chatbot() {
  // useContext - reads the translation helper from AppContext
  const { t } = useContext(AppContext)

  const initialMessages = [
    { id: 1, sender: 'bot', text: t('botGreeting') },
    { id: 2, sender: 'user', text: t('userQ1') },
    { id: 3, sender: 'bot', text: t('botA1') },
  ]

  // useState - stores chat messages and current input text
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')

  // useRef - references chat input and the scrollable chat body for auto-scroll
  const chatInputRef = useRef(null)
  const chatBodyRef = useRef(null)

  useEffect(() => {
    chatBodyRef.current?.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // useCallback - memoized send message handler
  const sendMessage = useCallback((text) => {
    if (!text.trim()) return
    const userMsg = { id: Date.now(), sender: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTimeout(() => {
      const botMsg = { id: Date.now() + 1, sender: 'bot', text: t('botThanks') }
      setMessages((prev) => [...prev, botMsg])
    }, 900)
  }, [t])

  return (
      <div className="page-content" style={{ maxWidth: 640 }}>
        <div className="chat-window">
          <div className="chat-header">
            <div className="avatar" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700 }}>{t('greenleafBot')}</div>
              <div style={{ fontSize: 'calc(12px * var(--font-scale, 1))', opacity: .8 }}>{t('aiAssistantSub')}</div>
            </div>
          </div>
          <div className="chat-body" ref={chatBodyRef}>
            {messages.map((m) => <ChatMessage key={m.id} message={m} />)}
            <div className="flex-gap">
              <button className="btn btn-outline btn-sm" onClick={() => sendMessage(t('yesPlease'))}>{t('yesPlease')}</button>
              <button className="btn btn-ghost btn-sm" onClick={() => sendMessage(t('noThanks'))}>{t('noThanks')}</button>
            </div>
          </div>
          <div className="chat-input-row">
            <input
              ref={chatInputRef}
              value={input}
              placeholder={t('typeMessage')}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            />
            <button className="btn btn-primary" onClick={() => sendMessage(input)}>➤</button>
          </div>
        </div>
    </div>
  )
}

export default Chatbot
