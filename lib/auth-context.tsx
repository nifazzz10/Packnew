"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { getSupabaseClient } from "./supabase"
import type { Session, User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean
    error?: string
  }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    // Check active session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)

        // If no session and not on login page, redirect to login
        if (!session && pathname !== "/login") {
          router.push("/login")
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error initializing auth:", error)
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (!session && pathname !== "/login") {
        router.push("/login")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { success: false, error: "Supabase client not initialized" }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Store session in localStorage for persistence
      localStorage.setItem("supabase.auth.token", JSON.stringify(data.session))

      router.push("/")
      return { success: true }
    } catch (error) {
      console.error("Sign in error:", error)
      return {
        success: false,
        error: "An unexpected error occurred during sign in",
      }
    }
  }

  const signOut = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    await supabase.auth.signOut()
    localStorage.removeItem("supabase.auth.token")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

