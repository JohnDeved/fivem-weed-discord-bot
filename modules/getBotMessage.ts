import { Guild, TextChannel } from 'discord.js';
import { WeedEmbedData } from './types/types';
import { createMessage } from './createMessage';
import { logStateData } from './logStateData';
import { setState } from './memoryState';

export async function getBotMessage(guild: Guild) {
  // get channel named weed-labor-bot
  const channel = guild?.channels.cache.find(channel => channel.name.includes('weed-labor-bot'));

  if (channel instanceof TextChannel) {
    // find all messages by bot
    const messages = await channel.messages.fetch({ limit: 100 });
    const botMessages = messages.filter(msg => msg.author.id === guild.client.user?.id);
    if (botMessages.size === 0) {
      throw new Error('Bot message is missing');
    }

    // get the first bot message that has embeds
    const botMessage = botMessages.find(msg => msg.embeds.length > 0);
    if (!botMessage) {
      throw new Error('Bot message is missing 3');
    }

    return botMessage;
  }
  throw new Error('Bot message is missing 2');
}

export async function updateBotMessage(guild: Guild, data: WeedEmbedData) {
  setState(guild, data)
  await logStateData(guild, data)
  const botMessage = await getBotMessage(guild)
  await botMessage.edit(createMessage(data))
}