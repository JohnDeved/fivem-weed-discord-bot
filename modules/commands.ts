import { ChatInputCommandInteraction, GuildMember, Interaction, Role, SlashCommandBuilder } from "discord.js";
import { getBotMessage } from "./getBotMessage";
import { defaultEmbedData } from "./defaultEmbedData";
import { createEmbed } from "./createEmbed";
import { logStateData } from "./logStateData";
import { getEmbedData } from "./getEmbedData";

export const botCommands = [
  {
    command: new SlashCommandBuilder().setName('reset').setDescription('setzt alle Werte zurück'),
    callback: async (interaction: Interaction) => {
      if (interaction instanceof ChatInputCommandInteraction) {
        const botMessage = await getBotMessage(interaction.guild!)
        logStateData(interaction.guild!, defaultEmbedData)
        
        const embeds = createEmbed(defaultEmbedData)
        botMessage.edit({ embeds })

        interaction.reply({ ephemeral: true, content: 'Werte wurden zurückgesetzt' })
      }
    }
  },
  {
    command: new SlashCommandBuilder().setName('kurs').setDescription('setzt den Kurs für ein Member oder Fraktion')
      .addMentionableOption(option => option.setName('member').setDescription('[@Kavkaz] Member/Fraktion für den der Kurs gesetzt werden soll').setRequired(true))
      .addIntegerOption(option => option.setName('kurs').setDescription('[95] Kurs der gesetzt werden soll').setRequired(true)),
    callback: async (interaction: Interaction) => {
      if (interaction instanceof ChatInputCommandInteraction) {
        console.log(interaction.options)


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
          
          logStateData(interaction.guild!, data)
          await botMessage.edit({ embeds: createEmbed(data) })          
        }
      }
    }
  }
]