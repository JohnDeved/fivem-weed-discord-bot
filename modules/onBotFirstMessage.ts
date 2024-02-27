import { TextChannel } from "discord.js";
import { createEmbed } from "./createEmbed";
import { defaultEmbedData } from "./defaultEmbedData";

export async function onBotFirstMessage (channel: TextChannel) {
  const msgState = await channel.send('`state`')

  const msg = await channel.send({
    embeds: createEmbed(defaultEmbedData)
  })

  msg.startThread({
    name: 'Labor Log'
  })

  msgState.startThread({
    name: 'Labor State Data'
  })

  return msg
}