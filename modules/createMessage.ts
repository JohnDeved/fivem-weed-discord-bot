import { ActionRowBuilder } from "discord.js";
import { botButtons } from "./buttons";
import { createEmbed } from "./createEmbed";
import { WeedEmbedData } from "./types/types";

export function createMessage(data: WeedEmbedData) {
  const buttons = botButtons.map(b => b.button)
  return {
    embeds: createEmbed(data),
    components: [
      new ActionRowBuilder().addComponents(buttons) as any
    ] // dont ask me why typescript is complaining here without the any
  }
}