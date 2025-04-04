"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Message {
  sender: string
  text: string
  timestamp: string
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

      const allMessages: Message[] = (Object.values(data.messages || {}) as Message[][]).flat()
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
    if (!newMessage.trim() || !selectedSender) return

    const response = await fetch("/api/send", {
      method: "POST",
      body: JSON.stringify({ to: selectedSender, message: newMessage }),
      headers: { "Content-Type": "application/json" },
    })

    const data = await response.json()
    console.log("Twilio response:", data)

    setMessages([
      ...messages,
      {
        sender: "Suporte",
        text: newMessage,
        timestamp: new Date().toISOString(),
      },
    ])
    setNewMessage("")
  }

  const uniqueSenders = Array.from(
    new Set(messages.map((m) => m.sender))
  ).filter((sender) => !resolvedSenders.includes(sender))

  const filteredMessages = selectedSender
    ? messages.filter(
        (m) => m.sender === selectedSender || m.sender === "Suporte"
      )
    : []

  return (
    <div className="flex h-screen">
      {/* Lado esquerdo: Lista de Clientes */}
      <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto border-r border-gray-300">
        <h2 className="text-lg font-bold mb-4">Clientes</h2>
        {uniqueSenders.map((sender) => (
          <div
            key={sender}
            onClick={() => {
              setSelectedSender(sender)
              setUnreadSenders((prev) => {
                const updated = new Set(prev)
                updated.delete(sender)
                return updated
              })
            }}
            className={`p-2 cursor-pointer rounded-lg mb-2 ${
              selectedSender === sender ? "bg-blue-300" : "hover:bg-blue-100"
            } ${unreadSenders.has(sender) ? "font-bold" : ""}`}
          >
            {sender}
          </div>
        ))}
      </div>

      {/* Lado direito: Mensagens */}
      <div className="w-2/3 flex flex-col p-4">
        {selectedSender && (
          <>
            <h2 className="text-lg font-semibold mb-2">
              Conversando com: <span className="font-bold">{selectedSender}</span>
            </h2>

            <div className="flex-1 overflow-y-auto mb-4">
              {filteredMessages.map((msg, idx) => (
                <Card key={idx} className="mb-2">
                  <CardContent className="p-2">
                    <p>
                      <strong>{msg.sender}</strong> —{" "}
                      <span className="text-sm text-gray-500">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
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
                onClick={() => setResolvedSenders([...resolvedSenders, selectedSender])}
              >
                Marcar como resolvido
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
