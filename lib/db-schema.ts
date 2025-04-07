// This file defines the database schema that will be used when you add database integration

export type Worker = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export type Item = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export type Company = "NCC" | "ICD" | "CC"

export type PackingEntry = {
  id: string
  workerId: string
  worker: Worker
  itemId: string
  item: Item
  date: Date
  quantity: number
  rate: number
  company: Company
  total: number // Calculated field (quantity * rate)
  createdAt: Date
  updatedAt: Date
}

