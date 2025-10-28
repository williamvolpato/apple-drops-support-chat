"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Message {
  sender: string;   // "Suporte" (agente) ou <phone> (cliente, após normalização)
  text: string;
  timestamp: string;
}

export default function Home() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Estado de mensagens já normalizadas:
  // - mensagens de cliente ficam com sender = <phone>
  // - mensagens do agente ficam com sender = "Suporte"
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedSender, setSelectedSender] = useState<string | null>(null);

  const [resolvedSenders, setResolvedSenders] = useState<string[]>([]);
  const [unreadSenders, setUnreadSenders] = useState<Set<string>>(new Set());

  // ---------------------------
  // Helpers
  // ---------------------------

  // Transforma { [phone]: Message[] } -> Message[] com sender normalizado
  function flattenMessages(data: any): Message[] {
    const entries = Object.entries(data.messages || {}) as [string, Message[]][];
    const flat = entries.flatMap(([phone, msgs]) =>
      (msgs || []).map((m) => ({
        ...m,
        sender: m.sender === "client" ? phone : "Suporte",
      }))
    );
    return flat;
  }

  // ---------------------------
  // Autenticação simples
  // ---------------------------
  useEffect(() => {
    const session = localStorage.getItem("authEmail");
    const loginDate = localStorage.getItem("loginDate");
    const now = new Date().getTime();
    const limit = 24 * 60 * 60 * 1000;

    if (
      session !== "sms@happierpd.com" ||
      !loginDate ||
      now - parseInt(loginDate) > limit
    ) {
      localStorage.removeItem("authEmail");
      localStorage.removeItem("loginDate");
      router.push("/login");
      return;
    }

    setIsAuthenticated(true);

    // Estado inicial (listas resolved/read)
    const fetchInitialState = async () => {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setResolvedSenders(data.resolvedSenders || []);
      setUnreadSenders(new Set(data.readSenders || [])); // mantemos compatibilidade
    };

    fetchInitialState();
  }, [router]);

  // ---------------------------
  // Polling das mensagens
  // ---------------------------
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch("/api/messages");
      const data = await res.json();

      // 1) Normaliza mensagens
      const allMessages = flattenMessages(data);
      setMessages(allMessages);

      // 2) Recalcula "não lidos"
      const unread = new Set<string>();
      allMessages.forEach((msg) => {
        if (
          msg.sender !== "Suporte" && // é cliente
          !resolvedSenders.includes(msg.sender) && // não resolvido
          !(data.readSenders || []).includes(msg.sender) // não marcado como lido
        ) {
          unread.add(msg.sender);
        }
      });
      setUnreadSenders(unread);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [resolvedSenders]);

  // ---------------------------
  // Ações da UI
  // ---------------------------

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSender) return;

    await fetch("/api/send", {
      method: "POST",
      body: JSON.stringify({ to: selectedSender, message: newMessage }),
      headers: { "Content-Type": "application/json" },
    });

    // Otimista: adiciona na conversa local
    setMessages([
      ...messages,
      { sender: "Suporte", text: newMessage, timestamp: new Date().toISOString() },
    ]);
    setNewMessage("");
  };

  const logout = () => {
    localStorage.removeItem("authEmail");
    localStorage.removeItem("loginDate");
    router.push("/login");
  };

  // Reset total usando o endpoint unificado (action: "reset")
  const resetChatData = async () => {
    const confirmReset = window.confirm(
      "Tem certeza que deseja resetar todas as conversas, resolvidos e lidos?"
    );
    if (!confirmReset) return;

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });

    // Zera estados locais
    setMessages([]);
    setResolvedSenders([]);
    setUnreadSenders(new Set());
    setSelectedSender(null);
  };

  // Marca o contato selecionado como resolvido
  const markAsResolved = async () => {
    if (!selectedSender) return;

    const updated = [...resolvedSenders, selectedSender];
    setResolvedSenders(updated);

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateResolved", list: updated }),
    });

    setSelectedSender(null);
  };

  // “Limpar conversa” aqui mantém o significado anterior: marcar como lido
  const clearConversation = async () => {
    if (!selectedSender) return;

    const updated = new Set(unreadSenders);
    updated.delete(selectedSender);
    setUnreadSenders(updated);

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateRead", list: Array.from(updated) }),
    });

    setSelectedSender(null);
  };

  // Lista de contatos a partir das mensagens normalizadas
  const uniqueSenders = Array.from(
    new Set(messages.filter((m) => m.sender !== "Suporte").map((m) => m.sender))
  ).filter((sender) => !resolvedSenders.includes(sender));

  // Mensagens do contato selecionado + respostas do suporte
  const filteredMessages = selectedSender
    ? messages.filter((m) => m.sender === selectedSender || m.sender === "Suporte")
    : [];

  if (isAuthenticated === null) return null;
  if (isAuthenticated === false) return <p>Redirecionando para login...</p>;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "25%",
          backgroundColor: "#f3f3f3",
          borderRight: "1px solid #ccc",
          padding: "1rem",
          overflowY: "auto",
        }}
      >
        <h2 style={{ fontWeight: "bold", marginBottom: "1rem" }}>Clientes</h2>

        {uniqueSenders.map((sender) => (
          <div
            key={sender}
            onClick={() => {
              setSelectedSender(sender);

              // Remove dos não lidos localmente
              const updated = new Set(unreadSenders);
              updated.delete(sender);
              setUnreadSenders(updated);

              // Persiste lista de lidos no backend
              fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "updateRead", list: Array.from(updated) }),
              });
            }}
            style={{
              padding: "0.5rem",
              marginBottom: "0.5rem",
              cursor: "pointer",
              backgroundColor: selectedSender === sender ? "#007bff" : "#fff",
              color: selectedSender === sender ? "#fff" : "#000",
              fontWeight: unreadSenders.has(sender) ? "bold" : "normal",
              borderRadius: "6px",
            }}
          >
            {sender}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <button
            onClick={resetChatData}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
            }}
          >
            Resetar tudo
          </button>

          <button
            onClick={logout}
            style={{ padding: "0.5rem 1rem", backgroundColor: "#999", color: "#fff", border: "none" }}
          >
            Sair
          </button>
        </div>

        {selectedSender ? (
          <>
            <h2 style={{ fontWeight: "bold", marginBottom: "1rem" }}>
              Conversando com: {selectedSender}
            </h2>

            <div style={{ flex: 1, overflowY: "auto", marginBottom: "1rem" }}>
              {filteredMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: "1rem",
                    padding: "0.75rem",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                  }}
                >
                  <p style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.5rem" }}>
                    <strong>{msg.sender}</strong> — {new Date(msg.timestamp).toLocaleString()}
                  </p>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                style={{ flex: 1, padding: "0.5rem" }}
              />
              <button onClick={sendMessage} style={{ padding: "0.5rem 1rem" }}>
                Enviar
              </button>
              <button
                onClick={markAsResolved}
                style={{ padding: "0.5rem 1rem", backgroundColor: "#dc3545", color: "#fff", border: "none" }}
              >
                Marcar como resolvido
              </button>
              <button
                onClick={clearConversation}
                style={{ padding: "0.5rem 1rem", backgroundColor: "#6c757d", color: "#fff", border: "none" }}
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
  );
}
