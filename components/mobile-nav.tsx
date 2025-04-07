"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Package, User, ListPlus, Home, Menu, BarChart, FileText, LogOut, Users, PieChart } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { signOut, user } = useAuth()

  const handleSignOut = () => {
    setOpen(false)
    signOut()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[80%] sm:w-[350px]">
        <div className="flex flex-col gap-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-2 py-1 text-lg font-semibold"
            onClick={() => setOpen(false)}
          >
            <Package className="h-5 w-5 text-primary" />
            <span>Packaging Management</span>
          </Link>

          <div className="flex flex-col gap-1">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/workers"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4" />
              <span>Workers</span>
            </Link>
            <Link
              href="/buyers"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <Users className="h-4 w-4" />
              <span>Buyers</span>
            </Link>
            <Link
              href="/items"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <Package className="h-4 w-4" />
              <span>Items</span>
            </Link>
            <Link
              href="/summary"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <BarChart className="h-4 w-4" />
              <span>Stock & Sales</span>
            </Link>
            <Link
              href="/analytics"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <PieChart className="h-4 w-4" />
              <span>Analytics</span>
            </Link>
            <Link
              href="/reports/worker"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <FileText className="h-4 w-4" />
              <span>Reports</span>
            </Link>
          </div>

          <div className="mt-2 space-y-2">
            <Button asChild className="w-full">
              <Link href="/entries/new" onClick={() => setOpen(false)}>
                <ListPlus className="mr-2 h-4 w-4" />
                <span>New Entry</span>
              </Link>
            </Button>

            {user && (
              <Button variant="outline" className="w-full" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

