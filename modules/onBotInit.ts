import { Guild, Message } from "discord.js"
import { checkMachine } from "./buttons"

export async function onBotInit (guild: Guild) {
  console.log(guild.client.user, 'ready')

  setInterval(() => {
    checkMachine(guild)
  }, 5000)
}