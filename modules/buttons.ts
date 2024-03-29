import { ButtonBuilder, ButtonInteraction, ButtonStyle, Guild, User } from "discord.js"
import { updateWeedBotMessage } from "./getWeedBotMessage"
import { getEmbedData } from "./getEmbedData"
import { logMessage } from "./logMessage"
import { LabMachinesKeys, WeedEmbedData } from "./types/types"

export const Times = {
  PowderMachine: 1000 * 60 * 30,
  BluntMachine: 1000 * 60 * 45,
}

export const NeededMaterials = {
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

export async function checkMachine(guild: Guild) {
  if (guild.name.includes('undefined')) return
  const data = await getEmbedData(guild)

  const timeNow = Math.floor(Date.now() / 1000)

  if (data.machines.powder.timestamp < timeNow) {
    if (data.machines.powder.amount > 0) {
      data.lab.powder.amount += (NeededMaterials.PowderMachine / 10)
      data.machines.powder.amount = 0
      await updateWeedBotMessage(guild, data)
    }

  }

  if (data.machines.blunts.timestamp < timeNow) {
    if (data.machines.blunts.amount > 0) {
      data.lab.blunts.amount += data.machines.blunts.amount
      data.machines.blunts.amount = 0
      await updateWeedBotMessage(guild, data)
    }
  }
}

export async function sendReminder(user: User, type: LabMachinesKeys) {
  await user.send(`Die ${type === 'blunts' ? '🚬 Blunt' : '🍚 Puder'} Maschine ist fertig`)
}

function createMachineButton(id: LabMachinesKeys, emoji: string, time: number) {
  const button =  new ButtonBuilder()
    .setCustomId(id)
    .setLabel('Starte Maschine')
    .setEmoji(emoji)
    .setStyle(ButtonStyle.Secondary)

  const callback = async (interaction: ButtonInteraction) => {
    await interaction.deferReply({ ephemeral: true })

    // update embeddata
    const data = await getEmbedData(interaction.guild!)
    const sanityMessage = sanityCheck(id, data)
    if (sanityMessage) {
      interaction.followUp({ content: sanityMessage, ephemeral: true })
      return
    }

    setTimeout(async () => {
      sendReminder(interaction.user, id)
    }, time)

    data.machines[id].timestamp = Math.floor((Date.now() + time) / 1000)
    data.machines[id].amount += id === 'powder' ? NeededMaterials.PowderMachine : data.lab.powder.amount
    if (id === 'blunts') data.lab.powder.amount = 0
    else data.lab.leaves.amount -= NeededMaterials.PowderMachine
    
    await logMessage(interaction.guild!, `Die ${id === 'blunts' ? '🚬 Blunt' : '🍚 Puder'} Maschine wurde von <@${interaction.user.id}> gestartet`)
    await updateWeedBotMessage(interaction.guild!, data)
    await interaction.followUp({ content: `Ich werde dich benachrichtigen, wenn die ${emoji} Maschine fertig ist`, ephemeral: true })
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