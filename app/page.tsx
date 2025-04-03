'use client'

import { useEffect, useState } from 'react'

interface Message {
  author: string
  body: string
  index: number
}

export default function SupportPanel() {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    async function fetchMessages() {
      const res = await fetch('/api/messages') // será nosso endpoint mock por enquanto
      const data = await res.json()
      setMessages(data.messages)
    }

    fetchMessages()
  }, [])

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Apple Drops - Suporte via SMS</h1>
      <div className="space-y-2 bg-gray-100 p-4 rounded-md">
        {messages.map((msg) => (
          <div
            key={msg.index}
            className={`p-2 rounded-md text-sm shadow-sm ${
              msg.author === 'support'
                ? 'bg-blue-100 ml-auto text-right w-fit'
                : 'bg-gray-200 w-fit'
            }`}
          >
            <strong>{msg.author === 'support' ? 'Suporte' : 'Cliente'}</strong>
            <p>{msg.body}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
