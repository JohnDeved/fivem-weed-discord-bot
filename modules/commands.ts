import { ChatInputCommandInteraction, Interaction, SlashCommandBuilder } from "discord.js";
import { getBotMessage } from "./getBotMessage";
import { defaultEmbedData } from "./defaultEmbedData";
import { createEmbed } from "./createEmbed";

export const botCommands = [
  {
    command: new SlashCommandBuilder().setName('reset').setDescription('setzt alle Werte zurück'),
    callback: async (interaction: Interaction) => {
      if (interaction instanceof ChatInputCommandInteraction) {
        const botMessage = await getBotMessage(interaction.guild!)
        const embeds = createEmbed(defaultEmbedData)
        botMessage.edit({ embeds })

        interaction.reply({ ephemeral: true, content: 'Werte wurden zurückgesetzt' })
      }
    }
  }
]