import { Guild, TextChannel } from 'discord.js';

export function getLogThread(guild: Guild) {
  // get channel named weed-labor-bot
  const channel = guild?.channels.cache.find(channel => channel.name === 'weed-labor-bot');

  if (channel instanceof TextChannel) {
    const thread = channel?.threads.cache.find(thread => thread.name === 'Labor Log');

    if (thread) {
      return thread;
    } else {
      throw new Error('Labor Log Thread is missing or not loaded!');
    }
  }
  throw new Error('Labor Log Thread is missing or not loaded! 2');
}
