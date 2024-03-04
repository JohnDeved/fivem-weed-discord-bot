import { EmbedBuilder, Guild } from "discord.js"
import { getLogThread } from "./getLogThread"

export function logMessage(guild: Guild, message: string) {
  const embed = new EmbedBuilder().setDescription(message)
  return getLogThread(guild).send({ embeds: [embed] })
}