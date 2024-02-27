import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessagePayloadOption } from "discord.js";
import { createEmbed } from "./createEmbed";
import { WeedEmbedData } from "./types/types";
import { botButtons } from "./buttons";

export function createMessage (data: WeedEmbedData) {
  return {
    embeds: createEmbed(data),
    components: botButtons.map<any>(b => b.button) // dont ask me why typescript is complaining here without the any
  }
}