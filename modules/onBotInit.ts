import { ActivityType, Guild, TextChannel } from "discord.js"
import { checkMachine } from "./buttons"
import { getOnlinePlayers } from "./getOnlinePlayers"
import { getServerInfo } from "./getServerInfo"

export async function onBotInit (guild: Guild) {
  const client = guild.client
  console.log(client.user.displayName, 'ready', guild.name)  

  if (guild.name.includes('Kavkaz')) {
    // airdrop time 4 hours after restart
    const AIRDROP_TIME = 1000 * 60 * 60 * 4
    // notify 5 minutes before airdrop
    const AIRDROP_NOTIFY_TIME = 1000 * 60 * 5
    let hasAirdropNotified = true

    setInterval(async () => {
      const serverInfo = await getServerInfo(client)
      const onlinePlayers = await getOnlinePlayers(guild, serverInfo)
      
      client.user.setActivity(`${onlinePlayers.size ? '🟢' : '🟡'} ${onlinePlayers.size} Kavkaz Online`, {
        type: ActivityType.Custom
      })

      // check if airdrop time is in 5 minutes
      if (serverInfo.lastRestart && !hasAirdropNotified) {
        const airDropTime = serverInfo.lastRestart + AIRDROP_TIME
        if (airDropTime < Date.now() + AIRDROP_NOTIFY_TIME) {
          hasAirdropNotified = true

          // notify each online player
          for (const member of onlinePlayers.values()) {
            // send embed with relative time
            await member.send({
              embeds: [{
                description: `# Airdrop Info:\n 📦 Der Airdrop landet <t:${Math.round(airDropTime / 1000)}:R>`
              }]
            })
            .then(() => {
              console.log('Airdrop notify sent to', member.displayName)
            })
            .catch(e => {
              console.error('Airdrop notify error', e)
            })
          }
        }
      }

      // reset airdrop notify
      if (serverInfo.lastRestart && hasAirdropNotified && serverInfo.lastRestart + AIRDROP_TIME > Date.now()) {
        hasAirdropNotified = false
        console.log('Airdrop notify reset, next airdrop at', new Date(serverInfo.lastRestart + AIRDROP_TIME).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }))
      }
    }, 1000 * 5)
  }
  
  setInterval(() => {
    checkMachine(guild)
  }, 5000)
}