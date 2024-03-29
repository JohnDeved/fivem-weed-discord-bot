import { ActivityType, ButtonInteraction, ChatInputCommandInteraction, Client, GatewayIntentBits, Guild, TextChannel } from 'discord.js'
import { config } from 'dotenv'
import { botButtons } from './modules/buttons'
import { botCommands } from './modules/commands'
import { onBotFirstMessage } from './modules/onBotFirstMessage'
import { onBotInit } from './modules/onBotInit'
import { onWeedMessage } from './modules/onWeedMessage'
config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers
  ]
})

client.once('ready', async client => {
  // find all channels named weed-labor-bot
  const channels = client.channels.cache.filter((channel): channel is TextChannel => 
    channel instanceof TextChannel && channel.name.includes('weed-labor-bot')
  )

  // find message by bot
  for (const [, channel] of channels) {
    // find all messages by bot
    const messages = await channel.messages.fetch({ limit: 100 })
    const botMessages = messages.filter(msg => msg.author.id === client.user?.id)
    
    // get the first bot message that has embeds
    let botMessage = botMessages.find(msg => msg.embeds.length > 0)
    if (botMessages.size === 0) {
      botMessage = await onBotFirstMessage(channel)
    }

    if (!botMessage) throw new Error('Bot message is missing')

    // init commands
    await channel.guild.commands.set(botCommands.map(c => c.command))
    
    onBotInit(channel.guild)
  }
})

client.on('messageCreate', message => {
  if (message.channel instanceof TextChannel) {
    if (message.channel.name.includes('weed-labor-abgaben')) {
      onWeedMessage(message)
    }
  }
})

client.on('interactionCreate', async interaction => {
  if (interaction.isCommand() && interaction instanceof ChatInputCommandInteraction) {
    const command = botCommands.find(c => c.command.name === interaction.commandName)
    if (command?.callback) {
      command.callback(interaction)
    }
  }

  if (interaction.isButton() && interaction instanceof ButtonInteraction) {
    const button = botButtons.find(b => b.id === interaction.customId)
    if (button?.callback) {
      button.callback(interaction)
    }
  }
})

client.login(process.env.BOT_TOKEN)



