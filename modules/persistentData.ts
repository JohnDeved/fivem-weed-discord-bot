import { Client, User } from "discord.js"

const DEV_ID = '124948849893703680'
let cachedDevUser: User | null = null

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

  const pinnedMessage = await cachedDevUser.dmChannel!.messages.fetchPinned().then(pinned => pinned.first())

  // if no pinned message, create one
  if (!pinnedMessage) {
    const message = await cachedDevUser.dmChannel!.send('{}')
    await message.pin()
  }

  return pinnedMessage
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