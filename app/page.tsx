'use client'

import { useEffect, useState } from 'react'

type Message = {
  sender: string
  text: string
}

type ChatMap = {
  [phone: string]: Message[]
}

export default function Home() {
  const [chats, setChats] = useState<ChatMap>({})
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch('/api/messages')
      const data = await res.json()
      setChats(data)
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPhone) return

    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: selectedPhone, message: newMessage }),
    })

    const data = await res.json()
    if (data.success) {
      setChats((prev) => ({
        ...prev,
        [selectedPhone]: [...(prev[selectedPhone] || []), { sender: 'Suporte', text: newMessage }],
      }))
      setNewMessage('')
    }
  }

  const phones = Object.keys(chats).sort((a, b) => {
    const lastA = chats[a]?.at(-1)
    const lastB = chats[b]?.at(-1)
    return lastB?.text?.localeCompare(lastA?.text || '') || 0
  })

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px' }}>
        <h3>Clientes</h3>
        {phones.length === 0 && <p style={{ fontSize: '0.9em' }}>Nenhuma conversa iniciada.</p>}
        {phones.map((phone) => (
          <div
            key={phone}
            onClick={() => setSelectedPhone(phone)}
            style={{
              cursor: 'pointer',
              padding: '5px',
              background: phone === selectedPhone ? '#eee' : 'transparent',
              fontWeight: phone === selectedPhone ? 'bold' : 'normal',
              borderRadius: '4px',
              marginBottom: '4px',
            }}
          >
            {phone}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '20px' }}>
        <h2>Apple Drops - Suporte via SMS</h2>
        {selectedPhone ? (
          <>
            <div style={{ marginBottom: '15px', fontSize: '0.9em' }}>
              Conversa com: <strong>{selectedPhone}</strong>
            </div>
            <div style={{ marginBottom: '20px' }}>
              {chats[selectedPhone]?.map((msg, i) => (
                <div key={i}>
                  <strong>{msg.sender === 'Suporte' ? 'Suporte' : 'Cliente'}:</strong> {msg.text}
                </div>
              ))}
            </div>
            <div>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua resposta..."
                style={{ padding: '6px', width: '70%' }}
              />
              <button onClick={sendMessage} style={{ padding: '6px 12px', marginLeft: '10px' }}>
                Enviar
              </button>
            </div>
          </>
        ) : (
          <p>Selecione um número para visualizar a conversa.</p>
        )}
      </div>
    </div>
  )
}
