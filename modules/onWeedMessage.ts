import { Message } from 'discord.js'
import { updateBotMessage } from './getBotMessage'
import { getEmbedData } from './getEmbedData'
import { getLogThread } from './getLogThread'

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

  let embedData = await getEmbedData(message.guild!)

  if (isLab) {
    embedData.lab[type].amount += isAdd ? amount : -amount
    embedData.lab[type].timestamp = Math.floor(Date.now() / 1000)
  }

  if (isStore && type !== 'powder') {
    embedData.store[type].amount += isAdd ? amount : -amount
    embedData.store[type].timestamp = Math.floor(Date.now() / 1000)
  }

  if (type === 'leaves') {
    let payment = embedData.payouts.payments.find(payment => payment.user === user);
    
    if (!payment) {
      payment = { user, amount: 0, timestamp: Math.floor(Date.now() / 1000) };
      embedData.payouts.payments.push(payment);
    }
    
    payment.amount += isAdd ? amount : -amount;
    payment.timestamp = Math.floor(Date.now() / 1000);
  }

  await updateBotMessage(message.guild!, embedData)

  // react to original message with checkmark
  await message.react('✅')
}


