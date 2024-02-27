import { Client, Message } from 'discord.js'
import { getEmbedData } from './getEmbedData'
import { createEmbed } from './createEmbed'
import { getBotMessage } from './getBotMessage'
import { getLogThread } from './getLogThread'
import { logStateData } from './logStateData'

export const typeDict = {
  leaves: '🌿 Blätter',
  powder: '🍚 Puder',
  blunts: '🚬 Blunts'
}

export async function onWeedMessage(message: Message) {
  const msg = message.content.toLowerCase()

  const isAdd = msg.includes("+") || !msg.includes("-")

  const isStore = msg.includes("lager")
  const isLab = !isStore

  const amount = parseInt(msg.replace(/<.*?>|\D/g, ''))

  const firstRole = message.mentions.roles.first()?.id
  const firstUser = message.mentions.users.first()?.id
  const user = firstUser || firstRole
    ? '&' + firstRole
    : message.author.id


  const isPowder = msg.includes("puder") || msg.includes("pulver")
  const isBlunts = !isPowder && msg.includes("blunts") || msg.includes("blunt") || msg.includes("joint")
  const type: 'leaves' | 'powder' | 'blunts' = isPowder ? 'powder' : isBlunts ? 'blunts' : 'leaves'

  console.log({ store: isAdd, labor: isLab, lager: isStore, amount, user }, msg)

  const logThread = getLogThread(message.guild!)
  logThread.send(`Es wurde für <@${user}> \`${isAdd ? '+' : '-' }${amount}\` ${typeDict[type]} im **${isLab ? 'Labor Lager' : 'Frak Lager'}** ${isAdd ? 'eingelagert' : 'ausgelagert'}!`)

  const botMessage = await getBotMessage(message.guild!)
  let embedData = await getEmbedData(botMessage)

  if (isLab) {
    embedData.lab[type].amount += isAdd ? amount : -amount
    embedData.lab[type].timestamp = Math.floor(Date.now() / 1000)
  }

  if (isStore && type !== 'powder') {
    embedData.store[type].amount += isAdd ? amount : -amount
    embedData.store[type].timestamp = Math.floor(Date.now() / 1000)
  }

  if (type === 'leaves') {

    // if is type leaves and user is not in payouts, add user to payouts
    if (type === 'leaves' && !embedData.payouts.payments.find(payment => payment.user === user)) {
      embedData.payouts.payments.push({ user, amount: 0, timestamp: Math.floor(Date.now() / 1000) })
    }
  
    for (const payment of embedData.payouts.payments) {
      if (payment.user === user && type === 'leaves') {
        // find rate for user, if not found, use 1
        const rate = embedData.payouts.rate.find(rate => rate.user === user)?.percent || 1
  
        // find price for leaves
        const price = embedData.payouts.price
  
        // add or subtract amount * rate * price
        payment.amount += isAdd ? amount * rate * price : -amount * rate * price
        payment.timestamp = Math.floor(Date.now() / 1000)
      }
    }
  }

  logStateData(message.guild!, embedData)
  const embeds = createEmbed(embedData)
  botMessage.edit({ embeds })

  // react to original message with checkmark
  message.react('✅')
}


