import { Guild } from "discord.js";
import { WeedEmbedData } from "./types/types";
import { getStateThread } from "./getLogThread";

export function logStateData(guild: Guild, data: WeedEmbedData) {
  getStateThread(guild).send(JSON.stringify(data))
}