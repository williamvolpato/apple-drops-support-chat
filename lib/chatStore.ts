type Message = {
  sender: string
  text: string
  timestamp: string
}

const chats = new Map<string, Message[]>()

export function storeMessage(phone: string, sender: string, text: string) {
  if (!chats.has(phone)) chats.set(phone, [])
  chats.get(phone)!.push({
    sender,
    text,
    timestamp: new Date().toISOString(),
  })
}

export function getMessages() {
  return Object.fromEntries(chats.entries())
}
