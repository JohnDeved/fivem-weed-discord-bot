import { ChatInputCommandInteraction, GuildMember, Role, SlashCommandBuilder } from "discord.js";
import { defaultEmbedData } from "./defaultEmbedData";
import { updateWeedBotMessage } from "./getWeedBotMessage";
import { getEmbedData } from "./getEmbedData";
import { getDisplayId } from "./onWeedMessage";
import { formatMoney } from "./createEmbed";
import { getOnlinePlayers } from "./getOnlinePlayers";
import { getServerInfo } from "./getServerInfo";

export const botCommands = [
  {
    command: new SlashCommandBuilder().setName('reset').setDescription('setzt alle Werte zurück'),
    callback: async (interaction: ChatInputCommandInteraction) => {
      await interaction.deferReply({ ephemeral: true })
      
      await updateWeedBotMessage(interaction.guild!, defaultEmbedData)
      await interaction.followUp({ content: 'Werte wurden zurückgesetzt' })
    }
  },
  {
    command: new SlashCommandBuilder().setName('refresh').setDescription('lädt die Werte neu')
      .addStringOption(option => option.setName('json').setDescription('json rollback').setRequired(false)),
    callback: async (interaction: ChatInputCommandInteraction) => {
      await interaction.deferReply({ ephemeral: true })
      const json = interaction.options.getString('json')
      const data = await getEmbedData(interaction.guild!)
      
      if (json) {
        try {
          await updateWeedBotMessage(interaction.guild!, JSON.parse(json))
        } catch (e) {
          await interaction.followUp({ content: 'Fehler beim Parsen des JSON', ephemeral: true })
        }
      } else {
        await updateWeedBotMessage(interaction.guild!, data)
      }

      await interaction.followUp({ content: 'Werte wurden neu geladen', ephemeral: true })
    }
  },
  {
    command: new SlashCommandBuilder().setName('kurs').setDescription('setzt den Kurs für ein Member oder Fraktion')
      .addMentionableOption(option => option.setName('member').setDescription('[@Kavkaz] Member/Fraktion für den der Kurs gesetzt werden soll').setRequired(true))
      .addIntegerOption(option => option.setName('kurs').setDescription('[95] Kurs der gesetzt werden soll').setRequired(true)),
    callback: async (interaction: ChatInputCommandInteraction) => {
      await interaction.deferReply()
      // if data.payouts.payments does not contain value for member, add it
      const member = interaction.options.getMentionable('member')!
      const kurs = interaction.options.getInteger('kurs')!

      if (member instanceof GuildMember || member instanceof Role) {
        const displayId = getDisplayId(member)

        const data = await getEmbedData(interaction.guild!)
        // find and remove old value
        const index = data.payouts.rate.findIndex(p => p.user === displayId)
        if (index > -1) data.payouts.rate.splice(index, 1)

        // add new value
        data.payouts.rate.push({ user: displayId, percent: kurs / 100 })
        
        await updateWeedBotMessage(interaction.guild!, data)

        await interaction.followUp({
          content: `Kurs für ${member} wurde auf \`${interaction.options.getInteger('kurs')}%\` gesetzt` 
        })
      }
    }
  },
  {
    command: new SlashCommandBuilder().setName('preis').setDescription('setzt den Preis pro 🌿 Blatt')
      .addIntegerOption(option => option.setName('preis').setDescription('[460] Preis der gesetzt werden soll').setRequired(true)),
    callback: async (interaction: ChatInputCommandInteraction) => {
      await interaction.deferReply()
      
      const data = await getEmbedData(interaction.guild!)
      data.payouts.price = interaction.options.getInteger('preis')!
      await updateWeedBotMessage(interaction.guild!, data)

      await interaction.followUp({
        content: `Preis pro 🌿 Blatt wurde auf \`${interaction.options.getInteger('preis')}\` gesetzt`
      })
    }
  },
  {
    command: new SlashCommandBuilder().setName('auszahlung').setDescription('setzt die Auszahlung für ein Member oder Fraktion')
      .addMentionableOption(option => option.setName('member').setDescription('[@Kavkaz] Member/Fraktion für den die Auszahlung gesetzt werden soll').setRequired(true))
      .addIntegerOption(option => option.setName('payout').setDescription('[1000] Auszahlung gegeben wurde, leer = alles').setRequired(false)),
    callback: async (interaction: ChatInputCommandInteraction) => {
      await interaction.deferReply()
      const member = interaction.options.getMentionable('member')!
      const payout = interaction.options.getInteger('payout')

      if (member instanceof GuildMember || member instanceof Role) {
        const displayId = getDisplayId(member)
        const data = await getEmbedData(interaction.guild!)

        const payment = data.payouts.payments.find(p => p.user === displayId)
        if (!payment) {
          return void await interaction.followUp({
            content: `Keine Auszahlung für ${member} gefunden`
          })
        }
        const rate = data.payouts.rate.find(rate => rate.user === displayId)?.percent || 1
        const price = data.payouts.price

        let remainingPayout = payment.amount * rate * price

        if (payout) {
          remainingPayout -= payout
        } else {
          remainingPayout = 0
        }

        payment.amount = Math.ceil(remainingPayout / rate / price)

        // if payout is 0 or less, remove payment
        if (payment.amount <= 0) {
          const index = data.payouts.payments.findIndex(p => p.user === displayId)
          if (index > -1) data.payouts.payments.splice(index, 1)
        }

        await interaction.followUp({
          content: `Auszahlung für ${member} wurde auf \`${formatMoney(remainingPayout)}\` gesetzt`
        })

        await updateWeedBotMessage(interaction.guild!, data)
      }
    }
  },
  {
    command: new SlashCommandBuilder().setName('help').setDescription('Zeigt Informationen über die verfügbaren Befehle'),
    callback: async (interaction: ChatInputCommandInteraction) => {
      const helpMessage = `
Um Produkte zum Lager oder Labor hinzuzufügen, schreib eine Nachricht mit dem Produkttyp, der Menge und dem "+" Zeichen. 
Zum Beispiel: \`+100 Blätter Lager\` fügt 100 Blätter zum Fraktions Lager hinzu, und \`+50 Puder Labor\` fügt 50 Puder zum Labor hinzu.

Du kannst auch einen User oder eine Rolle in eurer Nachricht erwähnen, um die Aktion auf sie zu beziehen. 
Zum Beispiel: \`+100 Blätter @User\` fügt 100 Blätter zum Labor für den erwähnten User oder Fraktion hinzu

Um Produkte aus dem Lager oder Labor zu entfernen, schreib eine Nachricht mit dem Produkttyp, der Menge und dem "-" Zeichen. 
Zum Beispiel: \`-100 Blätter Lager\` entfernt 100 Blätter aus dem Lager, und \`-50 Puder Labor\` entfernt 50 Puder aus dem Labor.

Kurzform: 
wenn kein "-" oder "+" vorhanden ist, wird "+" angenommen.
wenn kein "Lager" oder "Labor" vorhanden ist, wird "Labor" angenommen.
wenn kein Produkttyp vorhanden ist, wird Blätter angenommen.
Groß/Kleinschreibung müsst ihr nicht beachten.

**/kurs**: Setzt den Kurs für ein Mitglied oder eine Fraktion. Verwendung: \`/kurs @Mitglied Kurs\`
**/preis**: Setzt den Preis pro Blatt. Verwendung: \`/preis Preis\`
**/auszahlung**: Setzt die Auszahlung für ein Mitglied oder eine Fraktion. Verwendung: \`/auszahlung @Mitglied Auszahlung\`
      `;
  
      await interaction.reply({ content: helpMessage });
    }
  },
  {
    command: new SlashCommandBuilder().setName('who').setDescription('Zeigt Wer gerade online ist'),
    callback: async (interaction: ChatInputCommandInteraction) => {
      await interaction.deferReply({ ephemeral: true })

      const serverInfo = await getServerInfo(interaction.guild!.client)
      const onlinePlayers = await getOnlinePlayers(interaction.guild!, serverInfo)
      
      await interaction.followUp({ content: `Aktuell sind ${onlinePlayers.size} Kavkaz online`, embeds: [
        {
          title: 'Online Spieler',
          description: onlinePlayers.map(p => p.toString()).join('\n')
        }
      ]})
    }
  }
]