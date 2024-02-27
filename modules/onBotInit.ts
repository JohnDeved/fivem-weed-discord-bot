import { Message } from "discord.js"

export async function onBotInit (botMessage: Message) {
  console.log(botMessage.author.username, 'ready')
}