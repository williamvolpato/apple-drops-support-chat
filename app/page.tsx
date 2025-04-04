"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  sender: string
  text: string
  timestamp: string
}

export default function Home() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedSender, setSelectedSender] = useState<string | null>(null)
  const [resolvedSenders, setResolvedSenders] = useState<string[]>([])
  const [unreadSenders, setUnreadSenders] = useState<Set<string>>(new Set())

  useEffect(() => {
    const session = localStorage.getItem('authEmail')
    if (session !== 'sms@happierpd.com') {
      router.push('/login')
      return
    }

    const storedResolved = localStorage.getItem('resolvedSenders')
    const storedRead = localStorage.getItem('readSenders')

    if (storedResolved) setResolvedSenders(JSON.parse(storedResolved))
    if (storedRead) setUnreadSenders(new Set(JSON.parse(storedRead)))
  }, [router])

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch('/api/messages')
      const data = await res.json()
      const allMessages = Object.values(data.messages || {}).flat() as Message[]
      setMessages(allMessages)

      const storedRead = localStorage.getItem('readSenders')
      const readSet = storedRead ? new Set(JSON.parse(storedRead)) : new Set()

      const unread = new Set<string>()
      allMessages.forEach(msg => {
        if (
          msg.sender !== 'Suporte' &&
          !resolvedSenders.includes(msg.sender) &&
          !readSet.has(msg.sender)
        ) {
          unread.add(msg.sender)
        }
      })
      setUnreadSenders(unread)
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [resolvedSenders])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSender) return

    await fetch('/api/send', {
      method: 'POST',
      body: JSON.stringify({ to: selectedSender, message: newMessage }),
      headers: { 'Content-Type': 'application/json' },
    })

    setMessages([
      ...messages,
      { sender: 'Suporte', text: newMessage, timestamp: new Date().toISOString() },
    ])
    setNewMessage('')
  }

  const markAsResolved = () => {
    if (!selectedSender) return
    const updated = [...resolvedSenders, selectedSender]
    setResolvedSenders(updated)
    localStorage.setItem('resolvedSenders', JSON.stringify(updated))
    setSelectedSender(null)
  }

  const clearConversation = () => {
    if (!selectedSender) return
    const storedRead = localStorage.getItem('readSenders')
    const readSet = storedRead ? new Set(JSON.parse(storedRead)) : new Set()
    readSet.add(selectedSender)
    localStorage.setItem('readSenders', JSON.stringify(Array.from(readSet)))
    setUnreadSenders(prev => {
      const updated = new Set(prev)
      updated.delete(selectedSender)
      return updated
    })
    setSelectedSender(null)
  }

  const uniqueSenders = Array.from(new Set(
    messages.filter(m => m.sender !== 'Suporte').map(m => m.sender)
  )).filter(sender => !resolvedSenders.includes(sender))

  const filteredMessages = selectedSender
    ? messages.filter(m => m.sender === selectedSender || m.sender === 'Suporte')
    : []

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{
        width: '25%',
        backgroundColor: '#f3f3f3',
        borderRight: '1px solid #ccc',
        padding: '1rem',
        overflowY: 'auto'
      }}>
        <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Clientes</h2>
        {uniqueSenders.map(sender => (
          <div
            key={sender}
            onClick={() => {
              setSelectedSender(sender)
              const storedRead = localStorage.getItem('readSenders')
              const readSet = storedRead ? new Set(JSON.parse(storedRead)) : new Set()
              readSet.add(sender)
              localStorage.setItem('readSenders', JSON.stringify(Array.from(readSet)))
              setUnreadSenders(prev => {
                const copy = new Set(prev)
                copy.delete(sender)
                return copy
              })
            }}
            style={{
              padding: '0.5rem',
              marginBottom: '0.5rem',
              cursor: 'pointer',
              backgroundColor: selectedSender === sender ? '#007bff' : '#fff',
              color: selectedSender === sender ? '#fff' : '#000',
              fontWeight: unreadSenders.has(sender) ? 'bold' : 'normal',
              borderRadius: '6px'
            }}
          >
            {sender}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        {selectedSender ? (
          <>
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
              Conversando com: {selectedSender}
            </h2>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
              {filteredMessages.map((msg, idx) => (
                <div key={idx} style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  backgroundColor: '#fff'
                }}>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                    <strong>{msg.sender}</strong> — {new Date(msg.timestamp).toLocaleString()}
                  </p>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                style={{ flex: 1, padding: '0.5rem' }}
              />
              <button onClick={sendMessage} style={{ padding: '0.5rem 1rem' }}>
                Enviar
              </button>
              <button
                onClick={markAsResolved}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none'
                }}
              >
                Marcar como resolvido
              </button>
              <button
                onClick={clearConversation}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none'
                }}
              >
                Limpar conversa
              </button>
            </div>
          </>
        ) : (
          <p>Selecione um cliente para visualizar a conversa.</p>
        )}
      </div>
    </div>
  )
}
