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

async function readData(): Promise<ChatData> {
  try {
    const file = await fs.readFile(dataPath, 'utf-8')
    return JSON.parse(file)
  } catch (err) {
    return { messages: {}, resolvedSenders: [], readSenders: [] }
  }
}

async function writeData(data: ChatData) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
}

export async function storeMessage(phone: string, sender: string, text: string) {
  const data = await readData()
  if (!data.messages[phone]) data.messages[phone] = []
  data.messages[phone].push({ sender, text, timestamp: new Date().toISOString() })
  await writeData(data)
}

export async function getMessages() {
  const data = await readData()
  return data.messages
}

export async function getResolvedSenders(): Promise<string[]> {
  const data = await readData()
  return data.resolvedSenders
}

export async function getReadSenders(): Promise<string[]> {
  const data = await readData()
  return data.readSenders
}

export async function updateResolvedSenders(list: string[]) {
  const data = await readData()
  data.resolvedSenders = list
  await writeData(data)
}

export async function updateReadSenders(list: string[]) {
  const data = await readData()
  data.readSenders = list
  await writeData(data)
}
