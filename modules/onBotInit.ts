import { Guild, Message } from "discord.js"
import { checkReminder } from "./buttons"

export async function onBotInit (guild: Guild) {
  console.log(guild.client.user, 'ready')

  setInterval(() => {
    checkReminder(guild)
  }, 5000)
}