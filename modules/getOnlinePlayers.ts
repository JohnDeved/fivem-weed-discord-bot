import { Guild } from "discord.js";
import { ServerInfo, getServerInfo } from "./getServerInfo";

export async function getOnlinePlayers(guild: Guild, serverInfo: ServerInfo) {
  const members = await guild.members.fetch({ limit: 100 })

  const onlineIds = serverInfo.Data.players
    .map(player => player.identifiers.find(id => id.includes('discord:')))
    .map(id => id?.split(':')[1])

  const onlineMembers = members
    .filter(member => onlineIds.includes(member.id))
    .filter(member => {
      const roles = member.roles.cache.map(role => role.name).join(',')
      
      if (roles.includes('Fraktion')) {
        return false
      }

      if (roles.includes('Freund')) {
        return false
      }

      if (!roles.includes('Kavkaz')) {
        return false
      }

      return true
    })

  return onlineMembers
}