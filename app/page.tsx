"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Message {
  sender: string
  text: string
  timestamp: string
  unread?: boolean
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedSender, setSelectedSender] = useState<string | null>(null)
  const [resolvedSenders, setResolvedSenders] = useState<string[]>([])

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch('/api/messages')
      const data = await res.json()
      setMessages(Object.values(data.messages).flat() as Message[])
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSender) return

    const response = await fetch('/api/send', {
      method: 'POST',
      body: JSON.stringify({ to: selectedSender, message: newMessage }),
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json()
    console.log('Twilio response:', data)

    setMessages([
      ...messages,
      { sender: 'Suporte', text: newMessage, timestamp: new Date().toISOString() },
    ])
    setNewMessage('')
  }

  const unreadMap: Record<string, boolean> = {}
  messages.forEach(msg => {
    if (msg.sender !== 'Suporte' && !resolvedSenders.includes(msg.sender)) {
      unreadMap[msg.sender] = true
    }
  })

  const uniqueSenders = Array.from(new Set(messages.map(m => m.sender)))
    .filter(sender => !resolvedSenders.includes(sender))

  const filteredMessages = selectedSender
    ? messages.filter(m => m.sender === selectedSender || m.sender === 'Suporte')
    : []

  return (
    <div className="flex h-screen font-sans">
      {/* Painel esquerdo - Lista de clientes */}
      <div className="w-1/4 bg-gray-100 p-4 border-r overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Clientes</h2>
        {uniqueSenders.length === 0 && (
          <p className="text-sm text-gray-500">Nenhuma conversa iniciada.</p>
        )}
        {uniqueSenders.map(sender => (
          <div
            key={sender}
            className={`p-3 rounded-md mb-2 cursor-pointer transition ${
              selectedSender === sender ? 'bg-blue-300' : 'hover:bg-blue-200'
            } ${unreadMap[sender] ? 'font-bold' : ''}`}
            onClick={() => setSelectedSender(sender)}
          >
            {sender}
          </div>
        ))}
      </div>

      {/* Painel direito - Conversa */}
      <div className="w-3/4 flex flex-col p-6">
        {selectedSender ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Conversando com: <span className="text-blue-600">{selectedSender}</span></h2>

            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
              {filteredMessages.map((msg, idx) => (
                <Card key={idx}>
                  <CardContent className="p-3">
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>{msg.sender}</strong> —{" "}
                      <span>{new Date(msg.timestamp).toLocaleString()}</span>
                    </p>
                    <p>{msg.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Input
                className="flex-1"
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage}>Enviar</Button>
              <Button variant="destructive" onClick={() => setResolvedSenders([...resolvedSenders, selectedSender])}>
                Marcar como resolvido
              </Button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Selecione um cliente à esquerda para visualizar a conversa.</p>
        )}
      </div>
    </div>
  )
}
