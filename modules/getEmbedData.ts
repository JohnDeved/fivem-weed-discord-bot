import { Guild } from 'discord.js'
import { defaultEmbedData } from './defaultEmbedData'
import { getStateThread } from './getLogThread'
import { WeedEmbedData } from './types/types'

export async function getEmbedData(guild: Guild): Promise<WeedEmbedData> {
  const stateThread = getStateThread(guild)

  // get first message
  const stateStr = await stateThread.messages.fetch({ limit: 1 }).then(messages => messages.first()?.content)
  let state: WeedEmbedData

  try {
    state = JSON.parse(stateStr!)
  } catch (error) {
    state = defaultEmbedData
  }

  // console.log(state)
  return state
}