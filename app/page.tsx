'use client'

import { useEffect, useState } from 'react'

export default function SupportPanel() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([])
  const [newMessage, setNewMessage] = useState('')

  // Carrega mensagens da API ao iniciar
  useEffect(() => {
    fetch('/api/messages')
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error('Erro ao carregar mensagens:', err))
  }, [])

  const sendMessage = () => {
    if (newMessage.trim()) {
      const updatedMessages = [...messages, { sender: 'Suporte', text: newMessage }]
      setMessages(updatedMessages)
      setNewMessage('')
      // (Opcional) enviar nova mensagem para uma API no futuro
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Apple Drops - Suporte via SMS</h1>
      <div style={{ backgroundColor: '#f1f1f1', padding: '1rem', borderRadius: 8 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.sender === 'Suporte' ? 'right' : 'left',
              margin: '0.5rem 0',
              backgroundColor: msg.sender === 'Suporte' ? '#daf1ff' : '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: 10,
              display: 'inline-block',
              maxWidth: '80%',
            }}
          >
            <strong>{msg.sender}</strong>: {msg.text}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: 8 }}>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite uma resposta..."
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button onClick={sendMessage} style={{ padding: '0.5rem 1rem' }}>
          Enviar
        </button>
      </div>
    </main>
  )
}
