'use client'

import { useEffect, useState } from "react"
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function SupportPanel() {
  const [messages, setMessages] = useState([
    { sender: "Cliente", text: "Hi, I received a message and I’m interested." },
    { sender: "Suporte", text: "Hi! I can help you complete your order." },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { sender: "Suporte", text: newMessage }]);
      setNewMessage("");
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Apple Drops - Suporte via SMS</h1>
      <Card className="h-[400px] overflow-y-scroll bg-gray-50">
        <CardContent className="space-y-2 p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-xl p-2 max-w-[75%] text-sm shadow-sm ${
                msg.sender === "Suporte"
                  ? "bg-blue-100 ml-auto text-right"
                  : "bg-gray-200"
              }`}
            >
              <p className="font-semibold text-xs mb-1">{msg.sender}</p>
              <p>{msg.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="mt-4 flex gap-2">
        <Input
          placeholder="Digite uma resposta..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button onClick={sendMessage}>Enviar</Button>
      </div>
    </main>
  );
}
