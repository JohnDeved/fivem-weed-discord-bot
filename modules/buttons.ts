import { ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";

const Times = {
  PowderMachine: 1000 * 60 * 30,
  BluntMachine: 1000 * 60 * 45
}

export const botButtons = [
  {
    id: 'startPowderMachine',
    button: new ButtonBuilder()
      .setCustomId('startPowderMachine')
      .setLabel('Starte Maschine')
      .setEmoji('🍚')
      .setStyle(ButtonStyle.Secondary),
    callback: async (interaction: ButtonInteraction) => {
      await interaction.reply({ content: 'Ich werde dich benachrichtigen, wenn die 🍚 Maschine fertig ist', ephemeral: true })

      setTimeout(() => {
        interaction.followUp({ content: 'Die 🍚 Maschine ist fertig', ephemeral: true })
      }, Times.PowderMachine)
    }
  },
  {
    id: 'startBluntMachine',
    button: new ButtonBuilder()
      .setCustomId('startBluntMachine')
      .setLabel('Starte Maschine')
      .setEmoji('🚬')
      .setStyle(ButtonStyle.Secondary),
    callback: async (interaction: ButtonInteraction) => {
      await interaction.reply({ content: 'Ich werde dich benachrichtigen, wenn die 🚬 Maschine fertig ist', ephemeral: true })

      setTimeout(() => {
        interaction.followUp({ content: 'Die 🚬 Maschine ist fertig', ephemeral: true })
      }, Times.BluntMachine)
    }
  }
]