const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL!
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!

export type Message = {
  sender: string
  text: string
  timestamp: string
}

type ChatData = {
  messages: Record<string, Message[]>
  resolvedSenders: string[]
  readSenders: string[]
}

// Helpers para ler/escrever no Redis
async function getData(): Promise<ChatData> {
  const res = await fetch(`${UPSTASH_URL}/get/chatData`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    cache: 'no-store',
  })

  if (!res.ok) return { messages: {}, resolvedSenders: [], readSenders: [] }

  const json = await res.json()
  return JSON.parse(json.result)
}

async function setData(data: ChatData) {
  await fetch(`${UPSTASH_URL}/set/chatData`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value: JSON.stringify(data) }),
  })
}

// Armazena uma nova mensagem
export async function storeMessage(phone: string, sender: string, text: string) {
  const data = await getData()
  if (!data.messages[phone]) data.messages[phone] = []
  data.messages[phone].push({ sender, text, timestamp: new Date().toISOString() })
  await setData(data)
}

// Retorna todas as mensagens salvas
export async function getMessages() {
  const data = await getData()
  return data.messages
}

// Retorna a lista de contatos marcados como resolvidos
export async function getResolvedSenders(): Promise<string[]> {
  const data = await getData()
  return data.resolvedSenders
}

// Retorna a lista de contatos lidos
export async function getReadSenders(): Promise<string[]> {
  const data = await getData()
  return data.readSenders
}

// Atualiza a lista de contatos resolvidos
export async function updateResolvedSenders(list: string[]) {
  const data = await getData()
  data.resolvedSenders = list
  await setData(data)
}

// Atualiza a lista de contatos lidos
export async function updateReadSenders(list: string[]) {
  const data = await getData()
  data.readSenders = list
  await setData(data)
}

// Reseta todos os dados do chat
export async function resetData() {
  const emptyData: ChatData = {
    messages: {},
    resolvedSenders: [],
    readSenders: []
  }
  await setData(emptyData)
}
