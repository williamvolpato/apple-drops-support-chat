'use client'
import { useEffect, useState } from 'react'

type Message = {
  sender: string
  text: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch('/api/messages')
      const data = await res.json()
      setMessages(data)
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <main style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Apple Drops - Suporte via SMS</h1>
      {messages.map((msg, i) => (
        <p key={i}>
          <strong>{msg.sender === 'Suporte' ? 'Suporte' : 'Cliente'}</strong>: {msg.text}
        </p>
      ))}
    </main>
  )
}
