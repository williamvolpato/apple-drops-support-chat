"use client";

import { useEffect, useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<Record<string, { sender: string; text: string; timestamp: string }[]>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [input, setInput] = useState('')

  const fetchMessages = async () => {
    const res = await fetch('/api/messages')
    const data = await res.json()
    setMessages(data)
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || !selected) return
    await fetch('/api/send', {
      method: 'POST',
      body: JSON.stringify({ to: selected, message: input }),
      headers: { 'Content-Type': 'application/json' },
    })
    setMessages((prev) => ({
      ...prev,
      [selected]: [...(prev[selected] || []), { sender: 'Suporte', text: input, timestamp: new Date().toISOString() }],
    }))
    setInput('')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ width: 200, borderRight: '1px solid #ccc', padding: 10 }}>
        <strong>Clientes</strong>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {Object.keys(messages).map((phone) => (
            <li
              key={phone}
              style={{ cursor: 'pointer', margin: '5px 0', fontWeight: phone === selected ? 'bold' : 'normal' }}
              onClick={() => setSelected(phone)}
            >
              {phone}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, padding: 20 }}>
        <h2>Apple Drops - Suporte via SMS</h2>
        {selected ? (
          <>
            <p><strong>Conversa com:</strong> {selected}</p>
            <div>
              {(messages[selected] || []).map((msg, i) => (
                <p key={i}>
                  <strong>{msg.sender}:</strong> {msg.text} <span style={{ color: '#888', fontSize: '0.8em' }}>({new Date(msg.timestamp).toLocaleString()})</span>
                </p>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua resposta..."
                style={{ width: '70%', marginRight: 10 }}
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
