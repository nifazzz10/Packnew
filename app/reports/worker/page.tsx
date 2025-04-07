"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Printer, FileDown } from "lucide-react"
import { getSupabaseClient, type Worker, type PackingEntry } from "@/lib/supabase"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { WorkerReport } from "@/components/worker-report"
import { useAuth } from "@/lib/auth-context"
import { PosReportPrint } from "@/components/pos-report-print"

export default function WorkerReportPage() {
  const { isLoading: authLoading } = useAuth()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })
  const [entries, setEntries] = useState<PackingEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch workers
  useEffect(() => {
    if (authLoading) return

    const fetchWorkers = async () => {
      const supabase = getSupabaseClient()
      if (!supabase) {
        setError("Database connection error")
        return
      }

      try {
        const { data, error } = await supabase.from("workers").select("*").order("name")

        if (error) {
          console.error("Error fetching workers:", error)
          setError("Failed to load workers")
          return
        }

        setWorkers(data || [])
      } catch (err) {
        console.error("Error:", err)
        setError("An unexpected error occurred")
      }
    }

    fetchWorkers()
  }, [authLoading])

  // Fetch entries based on filters
  useEffect(() => {
    if (authLoading) return
    if (!dateRange?.from) return

    const fetchEntries = async () => {
      setIsLoading(true)
      setError(null)

      const supabase = getSupabaseClient()
      if (!supabase) {
        setError("Database connection error")
        setIsLoading(false)
        return
      }

      try {
        // Check if the view exists
        let query = supabase.from("packing_entries").select(`
          id,
          worker_id,
          workers!packing_entries_worker_id_fkey(id, name),
          item_id,
          items!packing_entries_item_id_fkey(id, name),
          date,
          quantity,
          rate,
          company,
          total,
          created_at,
          updated_at
        `)

        // Apply date range filter
        const fromDate = dateRange.from.toISOString().split("T")[0]
        query = query.gte("date", fromDate)

        if (dateRange.to) {
          const toDate = dateRange.to.toISOString().split("T")[0]
          query = query.lte("date", toDate)
        }

        // Apply worker filter
        if (selectedWorkerId !== "all") {
          query = query.eq("worker_id", selectedWorkerId)
        }

        // Execute query
        const { data, error } = await query.order("date", { ascending: false })

        if (error) {
          console.error("Error fetching entries:", error)
          setError("Failed to load entries")
          setEntries([])
        } else {
          // Transform the data to match the PackingEntry type
          const transformedData = (data || []).map((entry) => ({
            id: entry.id,
            worker_id: entry.worker_id,
            worker_name: entry.workers?.name,
            item_id: entry.item_id,
            item_name: entry.items?.name,
            date: entry.date,
            quantity: entry.quantity,
            rate: entry.rate,
            company: entry.company,
            total: entry.total,
            created_at: entry.created_at,
            updated_at: entry.updated_at,
          }))

          setEntries(transformedData)
        }
      } catch (err) {
        console.error("Error:", err)
        setError("An unexpected error occurred")
        setEntries([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntries()
  }, [dateRange, selectedWorkerId, authLoading])

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    if (entries.length === 0) return

    // Create CSV content
    const headers = ["Date", "Worker", "Company", "Item", "Quantity", "Rate", "Total"]
    const rows = entries.map((entry) => [
      entry.date,
      entry.worker_name,
      entry.company,
      entry.item_name,
      entry.quantity.toString(),
      entry.rate.toString(),
      entry.total.toString(),
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    // Set up download attributes
    const workerName =
      selectedWorkerId !== "all" ? workers.find((w) => w.id === selectedWorkerId)?.name || "all-workers" : "all-workers"

    const fromDate = format(dateRange?.from || new Date(), "yyyy-MM-dd")
    const toDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : fromDate

    link.setAttribute("href", url)
    link.setAttribute("download", `worker-report-${workerName}-${fromDate}-to-${toDate}.csv`)
    link.style.display = "none"

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Get worker name for display
  const workerName =
    selectedWorkerId === "all" ? "All Workers" : workers.find((w) => w.id === selectedWorkerId)?.name || ""

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Worker Report</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" className="print:hidden">
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handlePrint} className="print:hidden">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Card className="bg-white shadow-sm print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle>Worker Report</CardTitle>
          <CardDescription>View and print worker packing entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 print:hidden">
              <div className="w-full md:w-1/3">
                <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select worker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Workers</SelectItem>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-2/3">
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
            </div>

            <div className="print:hidden mt-4">
              <h3 className="text-md font-medium mb-2">Receipt Printing</h3>
              <PosReportPrint entries={entries} dateRange={dateRange} workerName={workerName} />
            </div>

            <WorkerReport
              entries={entries}
              isLoading={isLoading}
              error={error}
              dateRange={dateRange}
              workerName={workerName}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

