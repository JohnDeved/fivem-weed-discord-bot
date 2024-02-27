import { Message, APIEmbedField } from 'discord.js'
import { WeedEmbedData, FieldParams } from './types/types'
import { getStateThread } from './getLogThread'
import { defaultEmbedData } from './defaultEmbedData'

export function getEmbedData(botMessage: Message): WeedEmbedData {
  const stateThread = getStateThread(botMessage.guild!)

  // get first message
  const stateStr = stateThread.messages.cache.first()?.content
  let state: WeedEmbedData

  try {
    state = JSON.parse(stateStr!)
  } catch (error) {
    state = defaultEmbedData
  }

  console.log(state)
  return state
}

function extractFieldParams(field: APIEmbedField): FieldParams {
  const amount = parseInt(field.value.split(' ')[0].replace(/[`.]/g, ''))
  const timestamp = extractTimestamp(field.value)
  return { amount, timestamp }
}

function extractTimestamp(value: string): number {
  // if (!value.includes('<t:')) return 0
  const timestampString = value.split('<t:')[1].split(':R>')[0]
  return parseInt(timestampString)
}
