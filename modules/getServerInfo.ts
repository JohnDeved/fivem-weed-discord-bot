import { fail } from "assert"
import { getPersistentData, setPersistentData } from "./persistentData"
import { Client } from "discord.js"

export interface ServerInfo {
  EndPoint: string
  Data: Data
  lastRestart: number | null
}

export interface Data {
  clients: number
  gametype: string
  hostname: string
  mapname: string
  sv_maxclients: number
  enhancedHostSupport: boolean
  requestSteamTicket: string
  resources: string[]
  server: string
  vars: Vars
  selfReportedClients: number
  players: Player[]
  ownerID: number
  private: boolean
  fallback: boolean
  connectEndPoints: string[]
  upvotePower: number
  burstPower: number
  support_status: string
  svMaxclients: number
  ownerName: string
  ownerProfile: string
  ownerAvatar: string
  lastSeen: string
  iconVersion: number
}

export interface Vars {
  activitypubFeed: string
  banner_connecting: string
  banner_detail: string
  gamename: string
  locale: string
  onesync_enabled: string
  sv_enforceGameBuild: string
  sv_enhancedHostSupport: string
  sv_lan: string
  sv_licenseKeyToken: string
  sv_maxClients: string
  sv_projectDesc: string
  sv_projectName: string
  sv_pureLevel: string
  sv_scriptHookAllowed: string
  tags: string
  premium: string
}

export interface Player {
  endpoint: string
  id: number
  identifiers: string[]
  name: string
  ping: number
}

let lastDetectedRestart: number | null = null
let gotPresitentData = false
let failCount = 0

export async function getServerInfo (client: Client) {
  const serverInfo = await fetch('https://servers-frontend.fivem.net/api/servers/single/qpd3z9')
    .then<ServerInfo>(res => res.json())

  // get server ip
  const serverIp = serverInfo.Data.connectEndPoints[0]

  if (!gotPresitentData) {
    const persistentData = await getPersistentData(client)
    if (persistentData.lastRestart) lastDetectedRestart = persistentData.lastRestart
    gotPresitentData = true
  }

  // get realtime player info
  serverInfo.Data.players = await fetch(`http://${serverIp}/players.json`)
    .then<Player[]>(async res => {
      const json = await res.json()
      failCount = 0
      return json
    })
    .catch(async () => {
      console.log('Error fetching players.json', lastDetectedRestart, ++failCount)
      if (failCount >= 3) {
        console.log('Failed to fetch players.json 3 times in a row, this might be a restart')
        lastDetectedRestart = Date.now()
        await setPersistentData(client, { lastRestart: lastDetectedRestart })
      }
      return serverInfo.Data.players
    })

  // set last restart time
  serverInfo.lastRestart = lastDetectedRestart

  return serverInfo
}