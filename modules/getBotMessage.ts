import { Guild, TextChannel } from 'discord.js';

export async function getBotMessage(guild: Guild) {
  // get channel named weed-labor-bot
  const channel = guild?.channels.cache.find(channel => channel.name === 'weed-labor-bot');

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
