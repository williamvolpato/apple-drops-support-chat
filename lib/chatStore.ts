// lib/chatStore.ts
import fs from 'fs';
import path from 'path';

export type Message = {
  sender: string;
  text: string;
  timestamp: string;
};

const filePath = path.join(process.cwd(), 'messages.json');

function readMessages(): Record<string, Message[]> {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function writeMessages(chats: Record<string, Message[]>) {
  fs.writeFileSync(filePath, JSON.stringify(chats, null, 2), 'utf8');
}

export function storeMessage(phone: string, sender: string, text: string) {
  const chats = readMessages();
  const timestamp = new Date().toISOString();
  if (!chats[phone]) chats[phone] = [];
  chats[phone].push({ sender, text, timestamp });
  writeMessages(chats);
}

export function getChats(): Record<string, Message[]> {
  const chats = readMessages();
  return Object.fromEntries(
    Object.entries(chats).sort(([, a], [, b]) => {
      const lastA = a[a.length - 1]?.timestamp || '';
      const lastB = b[b.length - 1]?.timestamp || '';
      return lastB.localeCompare(lastA);
    })
  );
}
