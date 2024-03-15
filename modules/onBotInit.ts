import { ActivityType, Guild, TextChannel } from "discord.js"
import { checkMachine } from "./buttons"
import { getOnlinePlayers } from "./getOnlinePlayers"

export async function onBotInit (guild: Guild) {
  console.log(guild.client.user, 'ready')

  if (guild.name.includes('Kavkaz')) {
    setInterval(async () => {
      const onlinePlayers = await getOnlinePlayers(guild)
      
      guild.client.user.setActivity(`${onlinePlayers.size ? '🟢' : '🟡'} ${onlinePlayers.size} Kavkaz Online`, {
        type: ActivityType.Custom
      })
  
      // onlinePlayers.forEach(player => {
      //   console.log('online:', player.displayName)
      // })
  
    }, 1000 * 5)
  }
  
  setInterval(() => {
    checkMachine(guild)
  }, 5000)
}