'use client'

import { useEffect, useState } from 'react'

type Message = {
  sender: string
  text: string
  timestamp?: string
}

export default function Home() {
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [unreadClients, setUnreadClients] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch('/api/messages')
      const data = await res.json()

      // Detecta mensagens novas
      for (const phone in data) {
        if (!messages[phone]) {
          setUnreadClients((prev) => new Set(prev).add(phone))
        } else if (data[phone].length > messages[phone]?.length) {
          setUnreadClients((prev) => new Set(prev).add(phone))
        }
      }

      setMessages(data)
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selected) return

    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: selected, message: newMessage }),
    })

    if (res.ok) {
      const updated = { ...messages }
      updated[selected] = [
        ...(updated[selected] || []),
        {
          sender: 'Suporte',
          text: newMessage,
          timestamp: new Date().toISOString(),
        },
      ]
      setMessages(updated)
      setNewMessage('')
    }
  }

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleSelectClient = (phone: string) => {
    setSelected(phone)
    setUnreadClients((prev) => {
      const updated = new Set(prev)
      updated.delete(phone)
      return updated
    })
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: 250, borderRight: '1px solid #ccc', padding: 10 }}>
        <h3>Clientes</h3>
        {Object.keys(messages).length === 0 ? (
          <p>Nenhuma conversa iniciada.</p>
        ) : (
          Object.keys(messages).map((phone) => (
            <div
              key={phone}
              onClick={() => handleSelectClient(phone)}
              style={{
                padding: 5,
                cursor: 'pointer',
                backgroundColor: selected === phone ? '#eee' : 'transparent',
                fontWeight: unreadClients.has(phone) ? 'bold' : 'normal',
              }}
            >
              {phone}
              {unreadClients.has(phone) && ' (nova)'}
            </div>
          ))
        )}
      </div>
      <div style={{ flex: 1, padding: 20 }}>
        <h2>Apple Drops - Suporte via SMS</h2>
        {selected ? (
          <>
            <p><strong>Conversa com:</strong> {selected}</p>
            {messages[selected]?.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: 10 }}>
                <strong>{msg.sender}:</strong> {msg.text}
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', marginTop: 10 }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua resposta..."
                style={{ flex: 1, marginRight: 10 }}
              />
              <button onClick={sendMessage}>Enviar</button>
            </div>
          </>
        ) : (
          <p>Selecione um número para visualizar a conversa.</p>
        )}
      </div>
    </div>
  )
}
