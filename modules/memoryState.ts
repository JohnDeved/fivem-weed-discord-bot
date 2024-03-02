import { Guild } from "discord.js"
import { WeedEmbedData } from "./types/types"

let state: {
  [guildId: string]: WeedEmbedData
} = {}

export function setState (guild: Guild, newState: WeedEmbedData) {
  if (state[guild.id])
    return void Object.assign(state[guild.id], newState)

  state[guild.id] = newState
}

export function getState (guild: Guild) {
  return state[guild.id]
}