export interface ServerInfo {
  EndPoint: string
  Data: Data
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


export async function getServerInfo () {
  const serverInfo = await fetch('https://servers-frontend.fivem.net/api/servers/single/qpd3z9')
    .then<ServerInfo>(res => res.json())

  // get server ip
  const serverIp = serverInfo.Data.connectEndPoints[0]

  // get realtime player info
  const realTimePlayerInfo = await fetch(`http://${serverIp}/players.json`)
    .then<Player[]>(res => res.json())
    .catch(() => serverInfo.Data.players)

  serverInfo.Data.players = realTimePlayerInfo

  return serverInfo
}