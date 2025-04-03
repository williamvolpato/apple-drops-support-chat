'use client';

import { useEffect, useState } from 'react';

interface Message {
  sender: string;
  text: string;
}

export default function SupportPage() {
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [newMessages, setNewMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setMessages(data);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // atualiza a cada 5s

    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (phone: string) => {
    const text = newMessages[phone]?.trim();
    if (!text) return;

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, text }),
    });

    setNewMessages((prev) => ({ ...prev, [phone]: '' }));
  };

  return (
    <main style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Apple Drops - Suporte via SMS</h1>
      {Object.entries(messages).map(([phone, msgs]) => (
        <div key={phone} style={{ marginBottom: 40 }}>
          <h3>Cliente: {phone}</h3>
          <div
            style={{
              backgroundColor: '#f4f4f4',
              padding: 10,
              borderRadius: 8,
              maxWidth: 500,
            }}
          >
            {msgs.map((msg, i) => (
              <p key={i}>
                <strong>{msg.sender === 'Suporte' ? 'Suporte' : 'Cliente'}:</strong>{' '}
                {msg.text}
              </p>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <input
              type="text"
              placeholder="Digite uma resposta..."
              value={newMessages[phone] || ''}
              onChange={(e) =>
                setNewMessages((prev) => ({ ...prev, [phone]: e.target.value }))
              }
              style={{ padding: 6, width: '70%' }}
            />
            <button
              onClick={() => sendMessage(phone)}
              style={{ marginLeft: 8, padding: '6px 12px' }}
            >
              Enviar
            </button>
          </div>
        </div>
      ))}
    </main>
  );
}
