import fs from 'fs/promises'
import path from 'path'

const dataPath = path.resolve(process.cwd(), 'data/chatData.json')

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

// Função para ler os dados do arquivo
async function readData(): Promise<ChatData> {
  try {
    const file = await fs.readFile(dataPath, 'utf-8')
    return JSON.parse(file)
  } catch (err) {
    return { messages: {}, resolvedSenders: [], readSenders: [] }
  }
}

// Função para escrever os dados no arquivo
async function writeData(data: ChatData) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
}

// Armazena uma nova mensagem
export async function storeMessage(phone: string, sender: string, text: string) {
  const data = await readData()
  if (!data.messages[phone]) data.messages[phone] = []
  data.messages[phone].push({ sender, text, timestamp: new Date().toISOString() })
  await writeData(data)
}

// Retorna todas as mensagens salvas
export async function getMessages() {
  const data = await readData()
  return data.messages
}

// Retorna a lista de contatos marcados como resolvidos
export async function getResolvedSenders(): Promise<string[]> {
  const data = await readData()
  return data.resolvedSenders
}

// Retorna a lista de contatos lidos
export async function getReadSenders(): Promise<string[]> {
  const data = await readData()
  return data.readSenders
}

// Atualiza a lista de contatos resolvidos
export async function updateResolvedSenders(list: string[]) {
  const data = await readData()
  data.resolvedSenders = list
  await writeData(data)
}

// Atualiza a lista de contatos lidos
export async function updateReadSenders(list: string[]) {
  const data = await readData()
  data.readSenders = list
  await writeData(data)
}
