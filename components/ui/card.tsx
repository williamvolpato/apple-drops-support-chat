import * as React from "react"

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border p-4 shadow ${className}`}>{children}</div>
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`mt-2 text-sm ${className}`}>{children}</div>
}
