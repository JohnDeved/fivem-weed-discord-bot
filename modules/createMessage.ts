import { MessagePayloadOption } from "discord.js";
import { createEmbed } from "./createEmbed";
import { WeedEmbedData } from "./types/types";

export function createMessage (data: WeedEmbedData) {
  return {
    embeds: createEmbed(data),
    components: []
  }
}