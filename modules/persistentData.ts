import { Client, User, Message } from "discord.js"

const DEV_ID = '124948849893703680'
let cachedDevUser: User | undefined
let cachedMessage: Message | undefined

interface PresistentData {
  lastRestart?: number
}

async function getCachedMessage(client: Client<boolean>) {
  if (!cachedDevUser) {
    cachedDevUser = await client.users.fetch(DEV_ID)
  }
  
  // if no dm channel, create one
  if (!cachedDevUser.dmChannel) {
    await cachedDevUser.createDM()
  }

  if (!cachedMessage) {
    cachedMessage = await cachedDevUser.dmChannel!.messages.fetchPinned().then(pinned => pinned.first())

    // if no pinned message, create one
    if (!cachedMessage) {
      cachedMessage = await cachedDevUser.dmChannel!.send('{}')
      await cachedMessage.pin()
    }
  }

  return cachedMessage
}

export async function getPersistentData (client: Client): Promise<PresistentData> {
  const msg = await getCachedMessage(client)

  if (msg) {
    try {
      return JSON.parse(msg.content)
    } catch (e) {
      console.error('Error parsing persistent data', e)
    }
  }

  return {}
}

export async function setPersistentData (client: Client, data: PresistentData) {
  const msg = await getCachedMessage(client)

  if (msg) {
    await msg.edit(JSON.stringify(data))
  }
}