import { GuildMember, Message, Role, User } from 'discord.js'
import { updateBotMessage } from './getBotMessage'
import { getEmbedData } from './getEmbedData'
import { logMessage } from './logMessage'

export const typeDict = {
  leaves: '🌿 Blätter',
  powder: '🍚 Puder',
  blunts: '🚬 Blunts'
}

export function getDisplayId(user: GuildMember | Role | User) {
  return user instanceof Role ? '&' + user.id : user.id
}

export async function onWeedMessage(message: Message) {
  // if by bot, ignore
  if (message.author.bot) return

  const msg = message.content.toLowerCase()

  const isAdd = msg.includes("+") || !msg.includes("-")

  const isStore = msg.includes("lager")
  const isLab = !isStore

  const amount = parseInt(msg.replace(/<.*?>|\D/g, ''))

  if (!amount) return void message.react('❌')

  const userRaw = message.mentions.users.first() || message.mentions.roles.first() || message.author
  const user = getDisplayId(userRaw)

  const isPowder = msg.includes("puder") || msg.includes("pulver")
  const isBlunts = !isPowder && msg.includes("blunts") || msg.includes("blunt") || msg.includes("joint")
  const type: 'leaves' | 'powder' | 'blunts' = isPowder ? 'powder' : isBlunts ? 'blunts' : 'leaves'

  console.log({ store: isAdd, labor: isLab, lager: isStore, amount, user }, msg)

  await logMessage(message.guild!, `Es wurde für <@${user}> \`${isAdd ? '+' : '-' }${amount}\` ${typeDict[type]} im **${isLab ? 'Labor Lager' : 'Frak Lager'}** ${isAdd ? 'eingelagert' : 'ausgelagert'}!`)

  let embedData = await getEmbedData(message.guild!)

  if (isLab) {
    embedData.lab[type].amount += isAdd ? amount : -amount
    embedData.lab[type].timestamp = Math.floor(Date.now() / 1000)

    // if is less than 0, set to 0
    if (embedData.lab[type].amount < 0) embedData.lab[type].amount = 0
  }

  if (isStore && type !== 'powder') {
    embedData.store[type].amount += isAdd ? amount : -amount
    embedData.store[type].timestamp = Math.floor(Date.now() / 1000)

    // if is less than 0, set to 0
    if (embedData.store[type].amount < 0) embedData.store[type].amount = 0
  }

  if (type === 'leaves') {
    let payment = embedData.payouts.payments.find(payment => payment.user === user);
    
    if (!payment) {
      payment = { user, amount: 0, timestamp: Math.floor(Date.now() / 1000) };
      embedData.payouts.payments.push(payment);
    }
    
    payment.amount += isAdd ? amount : -amount;
    payment.timestamp = Math.floor(Date.now() / 1000);

    // if is 0 or less, remove payment
    if (payment.amount <= 0) {
      const index = embedData.payouts.payments.findIndex(p => p.user === user)
      if (index > -1) embedData.payouts.payments.splice(index, 1)
    }
  }

  await updateBotMessage(message.guild!, embedData)

  // react to original message with checkmark
  await message.react('✅')
}


