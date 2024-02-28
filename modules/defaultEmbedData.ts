import { WeedEmbedData } from "./types/types";

export const defaultEmbedData: WeedEmbedData = {
  machines: {
    powder: { 
      amount: 0,
      timestamp: Math.floor(Date.now() / 1000)
    },
    blunts: { 
      amount: 0,
      timestamp: Math.floor(Date.now() / 1000)
    }
  },
  lab: {
    leaves: { amount: 0, timestamp: Math.floor(Date.now() / 1000) },
    powder: { amount: 0, timestamp: Math.floor(Date.now() / 1000) },
    blunts: { amount: 0, timestamp: Math.floor(Date.now() / 1000) }
  },
  store: {
    leaves: { amount: 0, timestamp: Math.floor(Date.now() / 1000) },
    blunts: { amount: 0, timestamp: Math.floor(Date.now() / 1000) }
  },
  payouts: {
    payments: [],
    rate: [],
    price: 560
  }
};
