export interface FieldParams {
  amount: number
  timestamp: number
}

interface LabData {
  powder: FieldParams
  blunts: FieldParams
  leaves: FieldParams
}

interface StoreData {
  blunts: FieldParams
  leaves: FieldParams
}

interface LabMachines {
  powderTime: number
  bluntsTime: number
}

interface Payments extends FieldParams {
  user: string
}

interface Payouts {
  payments: Payments[]

  rate: {
    user: string
    percent: number
  }[]

  price: number
}

export interface WeedEmbedData {
  machines: LabMachines
  lab: LabData
  store: StoreData
  payouts: Payouts
}