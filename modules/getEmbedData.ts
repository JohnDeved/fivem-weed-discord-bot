import { Guild } from 'discord.js'
import { defaultEmbedData } from './defaultEmbedData'
import { getStateThread } from './getLogThread'
import { WeedEmbedData } from './types/types'
import { getState } from './memoryState'

export async function getEmbedData(guild: Guild): Promise<WeedEmbedData> {
  let state = getState(guild)

  if (!state) {
    const stateThread = getStateThread(guild)
  
    // get first message
    const stateStr = await stateThread.messages.fetch({ limit: 1 }).then(messages => messages.first()?.content)
  
    try {
      state = JSON.parse(stateStr!)
    } catch (error) {
      state = defaultEmbedData
    }
  }

  if (!state) return defaultEmbedData
  return state
}