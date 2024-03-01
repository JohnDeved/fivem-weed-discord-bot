import { WeedEmbedData } from "./types/types"

let state: WeedEmbedData | null = null

export function setState (newState: WeedEmbedData) {
  if (state)
    return void Object.assign(state, newState)

  state = newState
}

export function getState () {
  return state
}