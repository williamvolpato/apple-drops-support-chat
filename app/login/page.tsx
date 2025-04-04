"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = () => {
    if (email === "sms@happierpd.com" && password === "GustavoHappier") {
      localStorage.setItem("authenticated", "true")
      router.push("/")
    } else {
      setError("E-mail ou senha incorretos.")
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        width: "300px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}>
        <h2 style={{ textAlign: "center" }}>Login</h2>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "0.5rem" }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "0.5rem" }}
        />

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <button
          onClick={handleLogin}
          style={{ padding: "0.5rem", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: 4 }}
        >
          Entrar
        </button>
      </div>
    </div>
  )
}
