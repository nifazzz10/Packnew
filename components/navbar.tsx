"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, User, ListPlus, Home, FileText, BarChart, LogOut, Users, PieChart } from "lucide-react"
import { MobileNav } from "./mobile-nav"
import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const { signOut, user, isLoading } = useAuth()
  const pathname = usePathname()

  // Don't show navbar on login page
  if (pathname === "/login") {
    return null
  }

  // Don't show navbar while checking auth
  if (isLoading) {
    return null
  }

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">Packaging Management</span>
        </Link>

        <nav className="ml-auto hidden md:flex gap-2">
          <Button asChild variant="ghost">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/workers" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Workers</span>
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/buyers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Buyers</span>
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/items" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>Items</span>
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/summary" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Stock & Sales</span>
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/analytics" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>Analytics</span>
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/reports/worker" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Reports</span>
            </Link>
          </Button>
          <Button asChild variant="default">
            <Link href="/entries/new" className="flex items-center gap-2">
              <ListPlus className="h-4 w-4" />
              <span>New Entry</span>
            </Link>
          </Button>

          {user && (
            <Button variant="ghost" onClick={() => signOut()} className="ml-2">
              <LogOut className="h-4 w-4 mr-2" />
              <span>Sign Out</span>
            </Button>
          )}
        </nav>

        <div className="ml-auto md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

