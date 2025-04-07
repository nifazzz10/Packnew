import { createClient } from "@supabase/supabase-js"

// Database types based on our schema
export type Worker = {
  id: string
  name: string
  created_at: string
  updated_at: string
  user_id?: string
}

export type Item = {
  id: string
  name: string
  created_at: string
  updated_at: string
  user_id?: string
}

export type Buyer = {
  id: string
  name: string
  contact?: string
  created_at: string
  updated_at: string
  user_id?: string
}

export type Company = "NCC" | "ICD" | "CC"

export type PackingEntry = {
  id: string
  worker_id: string
  worker_name?: string // Joined field
  item_id: string
  item_name?: string // Joined field
  date: string
  quantity: number
  rate: number
  company: Company
  total: number
  created_at: string
  updated_at: string
  user_id?: string
}

export type Sale = {
  id: string
  item_id: string
  item_name?: string // Joined field
  buyer_id: string
  buyer_name?: string // Joined field
  quantity: number
  rate: number
  total: number
  date: string
  created_at: string
  updated_at: string
  user_id?: string
}

// Create a singleton Supabase client
let supabase: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (supabase) return supabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing")
    return null
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey)
  return supabase
}

