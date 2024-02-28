import { ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js"
import { updateBotMessage } from "./getBotMessage"
import { getEmbedData } from "./getEmbedData"
import { LabMachinesKeys, WeedEmbedData } from "./types/types"

const Times = {
  PowderMachine: 1000 * 60 * 30,
  BluntMachine: 1000 * 60 * 45,
}

const NeededMaterials = {
  PowderMachine: 1000,
  BluntMachine: 1,
}

function sanityCheck(type: LabMachinesKeys, data: WeedEmbedData) {
  if (type === 'powder') {
    // check if powder machine is running
    if (data.machines.powder.timestamp > Math.floor(Date.now() / 1000)) {
      return 'Die Pulvermaschine läuft bereits'
    }

    // check if enough materials are available
    if (data.lab.leaves.amount < NeededMaterials.PowderMachine) {
      return 'Es sind nicht genug Materialien für die Pulvermaschine vorhanden'
    }
  }

  if (type === 'blunts') {
    // check if blunt machine is running
    if (data.machines.blunts.timestamp > Math.floor(Date.now() / 1000)) {
      return 'Die Bluntsmaschine läuft bereits'
    }

    // check if enough materials are available
    if (data.lab.powder.amount < NeededMaterials.BluntMachine) {
      return 'Es sind nicht genug Materialien für die Bluntsmaschine vorhanden'
    }
  }
}

function createMachineButton(id: LabMachinesKeys, emoji: string, time: number) {
  const button =  new ButtonBuilder()
    .setCustomId(id)
    .setLabel('Starte Maschine')
    .setEmoji(emoji)
    .setStyle(ButtonStyle.Secondary)

  const callback = async (interaction: ButtonInteraction) => {
    await interaction.reply({ content: `Ich werde dich benachrichtigen, wenn die ${emoji} Maschine fertig ist`, ephemeral: true })

    // update embeddata
    const data = await getEmbedData(interaction.guild!)
    const sanityMessage = sanityCheck(id, data)
    if (sanityMessage) {
      interaction.followUp({ content: sanityMessage, ephemeral: true })
      return
    }
    
    setTimeout(async () => {
      const data = await getEmbedData(interaction.guild!)
      data.lab[id].amount += data.machines[id].amount
      // if is powder, divide by 10 to get powder amount
      if (id === 'powder') data.lab.powder.amount = Math.round(data.lab.powder.amount / 10)
      data.machines[id].amount = 0
      await interaction.followUp({ content: `Die ${emoji} Maschine ist fertig`, ephemeral: true })
      await updateBotMessage(interaction.guild!, data)
    }, time)

    data.machines[id].timestamp = Math.floor((Date.now() + time) / 1000)
    data.machines[id].amount += id === 'powder' ? NeededMaterials.PowderMachine : data.lab.powder.amount
    if (id === 'blunts') data.lab.powder.amount = 0
    else data.lab.leaves.amount -= NeededMaterials.PowderMachine
    
    console.log(data.machines[id])
    await updateBotMessage(interaction.guild!, data)
  }
  
  return {
    id,
    button,
    callback
  }
}

export const botButtons = [
  createMachineButton('powder', '🍚', Times.PowderMachine),
  createMachineButton('blunts', '🚬', Times.BluntMachine)
]