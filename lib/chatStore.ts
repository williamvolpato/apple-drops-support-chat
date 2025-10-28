// lib/chatStore.ts
import { REDIS } from "./redis";

export type Message = {
  sender: string;   // "client" | "agent"
  text: string;
  timestamp: string; // ISO string
};

// ============================
// Chaves no Redis
// ============================
// SET: lista de clientes (telefones)
const CLIENTS_SET = "support:clients";
// SET: contatos resolvidos
const RESOLVED_SET = "support:resolved";
// SET: contatos lidos
const READ_SET = "support:read";
// MENSAGENS por contato (valor JSON: Message[])
const msgKey = (phone: string) => `support:messages:${phone}`;

// ============================
// Helpers internos
// ============================
async function addClient(phone: string) {
  if (!phone) return;
  await REDIS.sadd(CLIENTS_SET, phone);
}

async function getClients(): Promise<string[]> {
  const result = await REDIS.smembers(CLIENTS_SET);
  return Array.isArray(result) ? (result as string[]) : [];
}

async function getMessagesByPhone(phone: string): Promise<Message[]> {
  const arr = await REDIS.get<Message[]>(msgKey(phone));
  return Array.isArray(arr) ? arr : [];
}

async function setMessagesByPhone(phone: string, messages: Message[]) {
  await REDIS.set(msgKey(phone), messages);
}

// ============================
// API pública
// ============================

// Armazena uma nova mensagem
export async function storeMessage(phone: string, sender: string, text: string) {
  if (!phone) throw new Error("phone obrigatório");
  await addClient(phone);

  const messages = await getMessagesByPhone(phone);
  messages.push({
    sender,
    text,
    timestamp: new Date().toISOString(),
  });
  await setMessagesByPhone(phone, messages);
}

// Retorna todas as mensagens salvas (Record<phone, Message[]>)
export async function getMessages(): Promise<Record<string, Message[]>> {
  const result: Record<string, Message[]> = {};
  const clients = await getClients();

  for (const phone of clients) {
    result[phone] = await getMessagesByPhone(phone);
  }
  return result;
}

// Contatos resolvidos
export async function getResolvedSenders(): Promise<string[]> {
  const result = await REDIS.smembers(RESOLVED_SET);
  return Array.isArray(result) ? (result as string[]) : [];
}

// Contatos lidos
export async function getReadSenders(): Promise<string[]> {
  const result = await REDIS.smembers(READ_SET);
  return Array.isArray(result) ? (result as string[]) : [];
}

// Atualiza a lista de contatos resolvidos (substitui o SET)
export async function updateResolvedSenders(list: string[]) {
  await REDIS.del(RESOLVED_SET);
  if (list && list.length) {
    for (const m of list) {
      await REDIS.sadd(RESOLVED_SET, m);
    }
  }
}

// Atualiza a lista de contatos lidos (substitui o SET)
export async function updateReadSenders(list: string[]) {
  await REDIS.del(READ_SET);
  if (list && list.length) {
    for (const m of list) {
      await REDIS.sadd(READ_SET, m);
    }
  }
}

// Reseta todos os dados do chat
export async function resetData() {
  const clients = await getClients();

  if (clients.length) {
    const delKeys = clients.map((p) => msgKey(p));
    await REDIS.del(...delKeys);
  }

  await REDIS.del(CLIENTS_SET);
  await REDIS.del(RESOLVED_SET);
  await REDIS.del(READ_SET);
}
