import { Message } from 'discord.js'
import { defaultEmbedData } from './defaultEmbedData'
import { getStateThread } from './getLogThread'
import { WeedEmbedData } from './types/types'

export async function getEmbedData(botMessage: Message): Promise<WeedEmbedData> {
  const stateThread = getStateThread(botMessage.guild!)

  // get first message
  const stateStr = await stateThread.messages.fetch().then(messages => messages.first()?.content)
  let state: WeedEmbedData

  try {
    state = JSON.parse(stateStr!)
  } catch (error) {
    state = defaultEmbedData
  }

  console.log(state)
  return state
}