import { Message, APIEmbedField } from 'discord.js'
import { WeedEmbedData, FieldParams } from './types/types'

export function getEmbedData(botMessage: Message): WeedEmbedData {
  const [machineEmbed, labEmbed, storeEmbed, payoutsEmbed] = botMessage.embeds

  if (!machineEmbed || !labEmbed || !storeEmbed) {
    throw new Error('Embeds are missing')
  }

  const [powderTime, bluntsTime] = machineEmbed.fields.map(field => extractTimestamp(field.value))
  const machines = { powderTime, bluntsTime }
  console.log({machines})

  const [leaves, powder, blunts] = labEmbed.fields.map(extractFieldParams)
  const lab = { leaves, powder, blunts }
  console.log({lab})

  const [storeLeaves, storeBlunts] = storeEmbed.fields.map(extractFieldParams)
  const store = { leaves: storeLeaves, blunts: storeBlunts }
  console.log({store})

  // get payouts data
  const payments = payoutsEmbed.description?.includes('Keine Auszahlungen ausstehend') 
    ? [] 
    : payoutsEmbed.description?.split('\n').map(payment => {
      const [, user, amount, timestamp] = payment.split(' ')
      console.log('payment', {user, amount, timestamp})
      return { user: user.replace(/[<>@:]/g, ''), amount: parseInt(amount.replace(/[`.€]/g, '')), timestamp: extractTimestamp(timestamp) }
    }).filter(Boolean) ?? []
  console.log({payments})

  const price = parseInt(payoutsEmbed.fields[0].value.split(' ')[0])
  console.log({price})

  const rate = payoutsEmbed.fields.slice(1).map(field => {
    const [user, percent] = field.value.split(' ')
    return { user: user.replace(/[<>@]/g, ''), percent: parseInt(percent) / 100 }
  })
  console.log({rate})

  return {
    machines,
    lab,
    store,
    payouts: {
      payments,
      price,
      rate
    }
  }
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
