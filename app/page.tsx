"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Message {
  sender: string
  text: string
  timestamp: string
  unread?: boolean
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedSender, setSelectedSender] = useState<string | null>(null)
  const [resolvedSenders, setResolvedSenders] = useState<string[]>([])
  const [unreadSenders, setUnreadSenders] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch("/api/messages")
      const data = await res.json()
      const allMessages = Object.values(data.messages || {}).flat() as Message[]
      setMessages(allMessages)

      const unread = new Set<string>()
      allMessages.forEach((msg) => {
        if (msg.sender !== "Suporte" && !resolvedSenders.includes(msg.sender)) {
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
    if (!newMessage.trim()) return
    if (!selectedSender) return

    const response = await fetch("/api/send", {
      method: "POST",
      body: JSON.stringify({ to: selectedSender, message: newMessage }),
      headers: { "Content-Type": "application/json" },
    })

    const data = await response.json()
    console.log("Twilio response:", data)

    setMessages([
      ...messages,
      { sender: "Suporte", text: newMessage, timestamp: new Date().toISOString() },
    ])
    setNewMessage("")
  }

  const uniqueSenders = Array.from(new Set(messages.map((m) => m.sender))).filter(
    (sender) => !resolvedSenders.includes(sender)
  )
  const filteredMessages = selectedSender
    ? messages.filter((m) => m.sender === selectedSender || m.sender === "Suporte")
    : []

  return (
    <div className="flex h-screen font-sans">
      {/* Coluna esquerda: Lista de clientes */}
      <div className="w-1/4 bg-gray-100 p-4 border-r border-gray-300 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Clientes</h2>
        {uniqueSenders.map((sender) => (
          <div
            key={sender}
            className={`p-2 rounded cursor-pointer mb-1 ${
              selectedSender === sender
                ? "bg-blue-500 text-white"
                : "hover:bg-blue-100"
            } ${unreadSenders.has(sender) ? "font-bold" : ""}`}
            onClick={() => {
              setSelectedSender(sender)
              setUnreadSenders((prev) => {
                const copy = new Set(prev)
                copy.delete(sender)
                return copy
              })
            }}
          >
            {sender}
          </div>
        ))}
      </div>

      {/* Coluna direita: Conversa */}
      <div className="w-3/4 flex flex-col p-4">
        {selectedSender ? (
          <>
            <h2 className="text-lg font-bold mb-4">
              Conversando com: {selectedSender}
            </h2>
            <div className="flex-1 overflow-y-auto mb-4">
              {filteredMessages.map((msg, idx) => (
                <Card key={idx} className="mb-2">
                  <CardContent>
                    <p className="text-xs text-gray-600">
                      <strong>{msg.sender}</strong> —{" "}
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                    <p>{msg.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage}>Enviar</Button>
              <Button
                variant="destructive"
                onClick={() =>
                  setResolvedSenders([...resolvedSenders, selectedSender])
                }
              >
                Marcar como resolvido
              </Button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Selecione um cliente para iniciar a conversa.</p>
        )}
      </div>
    </div>
  )
}
