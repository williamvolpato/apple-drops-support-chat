'use client'

import { useEffect, useState } from 'react'

export default function SupportPanel() {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')

  // Buscar mensagens da API
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch('/api/messages')
      const data = await res.json()
      setMessages(data)
    }

    fetchMessages()
  }, [])

  // Enviar nova mensagem
  const sendMessage = async () => {
    if (newMessage.trim()) {
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sender: 'Suporte', text: newMessage }),
      })

      setMessages([...messages, { sender: 'Suporte', text: newMessage }])
      setNewMessage('')
    }
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Apple Drops - Suporte via SMS</h1>
      <div className="space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-xl max-w-[75%] shadow ${
              msg.sender === 'Suporte'
                ? 'bg-blue-100 ml-auto text-right'
                : 'bg-gray-200'
            }`}
          >
            <div className="text-xs text-gray-600">{msg.sender}</div>
            <div>{msg.text}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border px-3 py-2 rounded"
          placeholder="Digite uma resposta..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Enviar
        </button>
      </div>
    </main>
  )
}
 
