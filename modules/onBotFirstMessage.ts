import { TextChannel } from "discord.js";
import { createMessage } from "./createMessage";
import { defaultEmbedData } from "./defaultEmbedData";

export async function onBotFirstMessage (channel: TextChannel) {
  const msgState = await channel.send('`state`')

  const msg = await channel.send(createMessage(defaultEmbedData))

  msg.startThread({
    name: 'Labor Log'
  })

  msgState.startThread({
    name: 'Labor State Data'
  })

  return msg
}