import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js"
import { getEmbedData } from "./getEmbedData"
import { LabMachinesKeys, WeedEmbedData } from "./types/types"
import { updateBotMessage } from "./getBotMessage"

const Times = {
  PowderMachine: 1000 * 60 * 30,
  BluntMachine: 1000 * 60 * 45
}

function createMachineButton(id: LabMachinesKeys, emoji: string, time: number) {
  const button =  new ButtonBuilder()
    .setCustomId(id)
    .setLabel('Starte Maschine')
    .setEmoji(emoji)
    .setStyle(ButtonStyle.Secondary)

  const callback = async (interaction: ButtonInteraction) => {
    await interaction.reply({ content: `Ich werde dich benachrichtigen, wenn die ${emoji} Maschine fertig ist`, ephemeral: true })

    setTimeout(() => {
      interaction.followUp({ content: `Die ${emoji} Maschine ist fertig`, ephemeral: true })
    }, time)

    // update embeddata
    const data = await getEmbedData(interaction.guild!)
    data.machines[id] = Math.floor((Date.now() + time) / 1000)
    console.log(data.machines[id])
    
    updateBotMessage(interaction.guild!, data)
  }
  
  return {
    id,
    button,
    callback
  }
}

export const botButtons = [
  createMachineButton('powderTime', '🍚', Times.PowderMachine),
  createMachineButton('bluntsTime', '🚬', Times.BluntMachine)
]