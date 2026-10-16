import { memo } from 'react'

// React.memo - chat bubbles don't need to re-render once rendered
const ChatMessage = memo(function ChatMessage({ message }) {
  return (
    <div className={`chat-msg ${message.sender === 'bot' ? 'bot' : 'user'}`}>
      {message.text}
    </div>
  )
})

export default ChatMessage
