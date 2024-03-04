import { EmbedBuilder } from 'discord.js'
import { WeedEmbedData } from './types/types'

export function formatMoney(amount: number) {
  return amount.toLocaleString('de', { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
}

function getLabContentPrice(data: WeedEmbedData) {
  const blunts = data.lab.blunts.amount * data.payouts.price * 10
  const powder = (data.lab.powder.amount + data.machines.blunts.amount) * data.payouts.price * 10
  const leaves = (data.lab.leaves.amount + data.machines.powder.amount) * data.payouts.price
  return blunts + powder + leaves
}

function getStoreContentPrice(data: WeedEmbedData) {
  const blunts = data.store.blunts.amount * data.payouts.price * 10
  const leaves = data.store.leaves.amount * data.payouts.price
  return blunts + leaves
}

function getPayoutTotal(data: WeedEmbedData) {
  return data.payouts.payments.reduce((sum, payment) => {
    const rate = data.payouts.rate.find(rate => rate.user === payment.user)?.percent || 1
    const price = data.payouts.price
    const payout = payment.amount * rate * price
    return sum + payout
  }, 0)
}

export function createEmbed(data: WeedEmbedData) {
  const labMachinesEmbed = new EmbedBuilder()
    .setTitle('⚙️ Labor Maschinen')
    .addFields(
      { name: '🍚 Puder Maschine', value: `\`[🌿x${data.machines.powder.amount}]\` fertig <t:${data.machines.powder.timestamp}:R>`, inline: true },
      { name: '🚬 Blunt Maschine', value: `\`[🍚x${data.machines.blunts.amount}]\` fertig <t:${data.machines.blunts.timestamp}:R>`, inline: true }
    )

  const labContentEmbed = new EmbedBuilder()
    .setTitle('📦 Labor Inhalt')
    .setColor(10044741)
    .addFields(
      { name: '🌿 Blätter', value: `\`${data.lab.leaves.amount}\` <t:${data.lab.leaves.timestamp}:R>`, inline: true },
      { name: '🍚 Puder', value: `\`${data.lab.powder.amount}\` <t:${data.lab.powder.timestamp}:R>`, inline: true },
      { name: '🚬 Blunts', value: `\`${data.lab.blunts.amount}\` <t:${data.lab.blunts.timestamp}:R>`, inline: true }
    )
    .setFooter({ 
      text: `Puder und Blunts anzahl kann abweichen\nEs befinden sich Materialen im Wert von ca. ${formatMoney(getLabContentPrice(data))} im Labor`
    })

  const storeContentEmbed = new EmbedBuilder()
    .setTitle('📦 Lager Inhalt')
    .addFields(
      { name: '🌿 Blätter', value: `\`${data.store.leaves.amount}\` <t:${data.store.leaves.timestamp}:R>`, inline: true },
      { name: '🚬 Blunts', value: `\`${data.store.blunts.amount}\` <t:${data.store.blunts.timestamp}:R>`, inline: true }
    )
    .setFooter({ 
      text: `Es befinden sich Materialen im Wert von ca. ${formatMoney(getStoreContentPrice(data))} im Lager` 
    })

  const payoutsEmbed = new EmbedBuilder()
    .setTitle('💰 Anstehende Auszahlungen')
    .setColor(4561227)
    .setDescription(data.payouts.payments.length 
      ? data.payouts.payments.map(payment => {
        // find rate for user, if not found, use 1
        const rate = data.payouts.rate.find(rate => rate.user === payment.user)?.percent || 1

        // find price for leaves
        const price = data.payouts.price

        // add or subtract amount * rate * price
        const payout = payment.amount * rate * price

        const blunts = Math.floor(payout / (price * 10))

        return `<@${payment.user}>: \`${formatMoney(payout)} / 🚬x${blunts}\` \`[🌿x${payment.amount}]\` <t:${payment.timestamp}:R>`
      }).join('\n')
      : 'Keine Auszahlungen ausstehend' 
    )
    .addFields(
      { name: '💵 Preis', value: `\`${formatMoney(data.payouts.price)}\` pro 🌿 Blatt`, inline: false }
    )
    .addFields(
      data.payouts.rate.map(rate => {
        return { 
          name: `📈 Kurs`, 
          value: `<@${rate.user}> ${rate.percent * 100}%\n${formatMoney(rate.percent * data.payouts.price)} pro 🌿`, 
          inline: true 
        }
      })
    )
  .setFooter({
    text: `Alle Preise sind in Schwarzgeld gerechnet\nAuszahlung Gesamtbetrag: ${formatMoney(getPayoutTotal(data))}\nGesamt Bestandswert: ${formatMoney(getLabContentPrice(data) + getStoreContentPrice(data))}`
  })

  return [
    payoutsEmbed,
    storeContentEmbed,
    labContentEmbed,
    labMachinesEmbed,
  ]
}
