import { ChatInputCommandInteraction, GuildMember, Interaction, Role, SlashCommandBuilder } from "discord.js";
import { createMessage } from "./createMessage";
import { defaultEmbedData } from "./defaultEmbedData";
import { getBotMessage } from "./getBotMessage";
import { getEmbedData } from "./getEmbedData";
import { logStateData } from "./logStateData";

export const botCommands = [
  {
    command: new SlashCommandBuilder().setName('reset').setDescription('setzt alle Werte zurück'),
    callback: async (interaction: ChatInputCommandInteraction) => {
      const botMessage = await getBotMessage(interaction.guild!)

      await interaction.reply({ ephemeral: true, content: 'Werte wurden zurückgesetzt' })

      await logStateData(interaction.guild!, defaultEmbedData)
      await botMessage.edit(createMessage(defaultEmbedData))
    }
  },
  {
    command: new SlashCommandBuilder().setName('refresh').setDescription('lädt die Werte neu')
      .addStringOption(option => option.setName('json').setDescription('json rollback').setRequired(false)),
    callback: async (interaction: ChatInputCommandInteraction) => {
      const botMessage = await getBotMessage(interaction.guild!)
      const data = await getEmbedData(botMessage)

      await interaction.reply({ ephemeral: true, content: 'Werte wurden neu geladen' })
      
      await botMessage.edit(createMessage(data))
    }
  },
  {
    command: new SlashCommandBuilder().setName('kurs').setDescription('setzt den Kurs für ein Member oder Fraktion')
      .addMentionableOption(option => option.setName('member').setDescription('[@Kavkaz] Member/Fraktion für den der Kurs gesetzt werden soll').setRequired(true))
      .addIntegerOption(option => option.setName('kurs').setDescription('[95] Kurs der gesetzt werden soll').setRequired(true)),
    callback: async (interaction: ChatInputCommandInteraction) => {
      const botMessage = await getBotMessage(interaction.guild!)
      const data = await getEmbedData(botMessage)

      // if data.payouts.payments does not contain value for member, add it
      const member = interaction.options.getMentionable('member')!
      const kurs = interaction.options.getInteger('kurs')!

      if (member instanceof GuildMember || member instanceof Role) {
        let displayId = member.id
        if (member instanceof Role) displayId = '&' + member.id

        // find and remove old value
        const index = data.payouts.rate.findIndex(p => p.user === member.id)
        if (index > -1) data.payouts.rate.splice(index, 1)

        // add new value
        data.payouts.rate.push({ user: displayId, percent: kurs / 100 })
        
        await interaction.reply({ 
          ephemeral: true, 
          content: `Kurs für ${member} wurde auf \`${interaction.options.getInteger('kurs')}%\` gesetzt` 
        })
        
        await logStateData(interaction.guild!, data)
        await botMessage.edit(createMessage(data))          
      }
    }
  },
  {
    command: new SlashCommandBuilder().setName('preis').setDescription('setzt den Preis pro 🌿 Blatt')
      .addIntegerOption(option => option.setName('preis').setDescription('[460] Preis der gesetzt werden soll').setRequired(true)),
    callback: async (interaction: ChatInputCommandInteraction) => {
      const botMessage = await getBotMessage(interaction.guild!)
      const data = await getEmbedData(botMessage)

      data.payouts.price = interaction.options.getInteger('preis')!

      await interaction.reply({ 
        ephemeral: true, 
        content: `Preis pro 🌿 Blatt wurde auf \`${interaction.options.getInteger('preis')}\` gesetzt`
      })

      await logStateData(interaction.guild!, data)
      await botMessage.edit(createMessage(data))
    }
  }
]