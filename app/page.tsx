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
      try {
        const res = await fetch('/api/messages')
        const data = await res.json()
        console.log('Mensagens carregadas:', data)
        const allMessages = Object.entries(data.messages || {}).flatMap(([sender, msgs]) =>
          (msgs as Message[]).map(msg => ({ ...msg, sender }))
        )
        console.log('Mensagens formatadas:', allMessages)
        setMessages(allMessages)
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error)
      }
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

    setMessages([...messages, {
      sender: 'Suporte',
      text: newMessage,
      timestamp: new Date().toISOString()
    }])
    setNewMessage('')
  }

  const unreadMap: Record<string, boolean> = {}
  messages.forEach(msg => {
    if (msg.sender !== 'Suporte' && !resolvedSenders.includes(msg.sender)) {
      unreadMap[msg.sender] = true
    }
  })

  const uniqueSenders = Array.from(new Set(messages.map(m => m.sender)))
  // .filter(sender => !resolvedSenders.includes(sender)) // comentado temporariamente para debug

  const filteredMessages = selectedSender
    ? messages.filter(m => m.sender === selectedSender || m.sender === 'Suporte')
    : []

  return (
    <div className="flex h-screen">
      <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-2">Clientes</h2>
        {uniqueSenders.map(sender => (
          <div
            key={sender}
            className={`p-2 cursor-pointer rounded-lg ${selectedSender === sender ? 'bg-blue-300' : 'hover:bg-blue-100'} ${unreadMap[sender] ? 'font-bold' : ''}`}
            onClick={() => {
              setSelectedSender(sender)
              unreadMap[sender] = false
            }}
          >
            {sender}
          </div>
        ))}
      </div>

      <div className="w-2/3 flex flex-col p-4">
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.map((msg, idx) => (
            <Card key={idx} className="mb-2">
              <CardContent className="p-2">
                <p><strong>{msg.sender}</strong> <span className="text-sm text-gray-500">({new Date(msg.timestamp).toLocaleString()})</span></p>
                <p>{msg.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {selectedSender && (
          <div className="mt-4 flex gap-2">
            <Input
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
        )}
      </div>
    </div>
  )
}
