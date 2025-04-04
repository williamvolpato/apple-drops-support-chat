type Message = {
  sender: string
  text: string
}

const chats = new Map<string, Message[]>()

export function storeMessage(phone: string, sender: string, text: string) {
  if (!chats.has(phone)) chats.set(phone, [])
  chats.get(phone)!.push({ sender, text })
}

export function getChats(): Record<string, Message[]> {
  return Array.from(chats.entries())
    .sort((a, b) => {
      const lastA = a[1].at(-1)
      const lastB = b[1].at(-1)
      return lastB?.text?.localeCompare(lastA?.text || '') || 0
    })
    .reduce((acc, [phone, msgs]) => {
      acc[phone] = msgs
      return acc
    }, {} as Record<string, Message[]>)
}
