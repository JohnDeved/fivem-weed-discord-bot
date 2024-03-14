import { Guild } from "discord.js"
import { checkMachine } from "./buttons"
import { getOnlinePlayers } from "./getOnlinePlayers"

export async function onBotInit (guild: Guild) {
  console.log(guild.client.user, 'ready')

  setInterval(async () => {
    const onlinePlayers = await getOnlinePlayers(guild)
    
    onlinePlayers.forEach(player => {
      console.log('online:', player.displayName)
    })

  }, 1000 * 60)
  
  setInterval(() => {
    checkMachine(guild)
  }, 5000)
}