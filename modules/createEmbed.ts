import { EmbedBuilder } from 'discord.js'
import { WeedEmbedData } from './types/types'

function formatMoney(amount: number) {
  return amount.toLocaleString('de', { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
}

export function createEmbed(data: WeedEmbedData) {
  return [
    new EmbedBuilder()
      .setTitle('⚙️ Labor Maschinen')
      .addFields(
        { name: '🍚 Puder Maschine', value: `ferting <t:${data.machines.powderTime}:R>`, inline: true },
        { name: '🚬 Blunt Maschine', value: `ferting <t:${data.machines.bluntsTime}:R>`, inline: true }
      ),
    new EmbedBuilder()
      .setTitle('📦 Labor Inhalt')
      .setColor(10044741)
      .addFields(
        { name: '🌿 Blätter', value: `\`${data.lab.leaves.amount}\` <t:${data.lab.leaves.timestamp}:R>`, inline: true },
        { name: '🍚 Puder', value: `\`${data.lab.powder.amount}\` <t:${data.lab.powder.timestamp}:R>`, inline: true },
        { name: '🚬 Blunts', value: `\`${data.lab.blunts.amount}\` <t:${data.lab.blunts.timestamp}:R>`, inline: true }
      ),
    new EmbedBuilder()
      .setTitle('📦 Lager Inhalt')
      .addFields(
        { name: '🌿 Blätter', value: `\`${data.store.leaves.amount}\` <t:${data.store.leaves.timestamp}:R>`, inline: true },
        { name: '🚬 Blunts', value: `\`${data.store.blunts.amount}\` <t:${data.store.blunts.timestamp}:R>`, inline: true }
      ),
    new EmbedBuilder()
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

          return `👤 <@${payment.user}>: \`${formatMoney(payout)} [🌿x${payment.amount}]\` <t:${payment.timestamp}:R>`
        }).join('\n')
        : 'Keine Auszahlungen ausstehend' 
      )
      .addFields(
        { name: '💵 Preis', value: `\`${formatMoney(data.payouts.price)}\` pro 🌿 Blatt`, inline: false }
      )
      .addFields(
        data.payouts.rate.map(rate => {
          return { name: `📈 Kurs`, value: `<@${rate.user}> ${rate.percent * 100}%`, inline: true }
        })
      )
  ]
}
