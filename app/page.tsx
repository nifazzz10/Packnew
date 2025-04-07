"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { PackingEntriesTable } from "@/components/packing-entries-table"
import { DateRangePicker } from "@/components/date-range-picker"
import { FilterBar } from "@/components/filter-bar"
import { useEffect, useState } from "react"
import type { DateRange } from "react-day-picker"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay } from "date-fns"
import { getSupabaseClient, type PackingEntry, type Worker, type Item, type Company } from "@/lib/supabase"
import { getFilteredPackingEntries } from "@/lib/data"
import { PrintButton } from "@/components/print-button"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const { isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("daily")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })
  const [entries, setEntries] = useState<PackingEntry[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [itemSummary, setItemSummary] = useState<{ item: string; quantity: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<{
    workerId?: string
    itemId?: string
    company?: Company
    searchTerm?: string
  }>({})
  const [connectionError, setConnectionError] = useState(false)
  const [schemaError, setSchemaError] = useState(false)

  // Fetch workers and items
  useEffect(() => {
    if (authLoading) return

    const fetchWorkersAndItems = async () => {
      const supabase = getSupabaseClient()
      if (!supabase) {
        setConnectionError(true)
        return
      }

      try {
        const [workersResult, itemsResult] = await Promise.all([
          supabase.from("workers").select("*").order("name"),
          supabase.from("items").select("*").order("name"),
        ])

        if (workersResult.error) {
          console.error("Error fetching workers:", workersResult.error)
          setSchemaError(true)
          return
        }

        if (itemsResult.error) {
          console.error("Error fetching items:", itemsResult.error)
          setSchemaError(true)
          return
        }

        setWorkers(workersResult.data || [])
        setItems(itemsResult.data || [])
      } catch (error) {
        console.error("Error fetching workers and items:", error)
        setConnectionError(true)
      }
    }

    fetchWorkersAndItems()
  }, [authLoading])

  // Handle tab changes
  useEffect(() => {
    const now = new Date()

    if (activeTab === "daily") {
      setDateRange({ from: now, to: now })
    } else if (activeTab === "weekly") {
      try {
        const weekStart = startOfWeek(now, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
        setDateRange({
          from: weekStart,
          to: weekEnd,
        })
      } catch (error) {
        console.error("Error setting weekly date range:", error)
        setDateRange({ from: now, to: now })
      }
    } else if (activeTab === "monthly") {
      try {
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)
        setDateRange({
          from: monthStart,
          to: monthEnd,
        })
      } catch (error) {
        console.error("Error setting monthly date range:", error)
        setDateRange({ from: now, to: now })
      }
    }
  }, [activeTab])

  // Fetch entries based on date range and filters
  useEffect(() => {
    if (authLoading) return
    if (!dateRange?.from) return

    const fetchEntries = async () => {
      setIsLoading(true)

      try {
        // Ensure we have valid date objects
        const startDate = dateRange.from instanceof Date ? dateRange.from : new Date(dateRange.from)
        const endDate = dateRange.to instanceof Date ? dateRange.to : dateRange.to ? new Date(dateRange.to) : startDate

        // Check if dates are valid before proceeding
        if (isNaN(startDate.getTime()) || (dateRange.to && isNaN(endDate.getTime()))) {
          console.error("Invalid date in date range")
          setEntries([])
          setItemSummary([])
          setIsLoading(false)
          return
        }

        // Use the data.ts function that handles the view existence check
        const entriesData = await getFilteredPackingEntries({
          startDate,
          endDate,
          workerId: filters.workerId,
          itemId: filters.itemId,
          company: filters.company,
        })

        // Filter by search term client-side if needed
        const filteredEntries = filters.searchTerm
          ? entriesData.filter(
              (entry) =>
                entry.worker_name?.toLowerCase().includes(filters.searchTerm?.toLowerCase() || "") ||
                entry.item_name?.toLowerCase().includes(filters.searchTerm?.toLowerCase() || ""),
            )
          : entriesData

        setEntries(filteredEntries)

        // Calculate item summary
        const summary = filteredEntries.reduce((acc: Record<string, number>, entry) => {
          const itemName = entry.item_name || "Unknown"
          if (!acc[itemName]) {
            acc[itemName] = 0
          }
          acc[itemName] += entry.quantity
          return acc
        }, {})

        setItemSummary(Object.entries(summary).map(([item, quantity]) => ({ item, quantity })))
      } catch (error) {
        console.error("Error in fetchEntries:", error)
        setSchemaError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntries()
  }, [dateRange, filters, authLoading])

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    setActiveTab("custom")
  }

  const handleFilterChange = (newFilters: {
    workerId?: string
    itemId?: string
    company?: Company
    searchTerm?: string
  }) => {
    setFilters(newFilters)
  }

  const totalItems = entries.reduce((sum, entry) => sum + entry.quantity, 0)
  const totalValue = entries.reduce((sum, entry) => sum + entry.total, 0)

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange?.from) return "No date selected"

    try {
      if (activeTab === "daily" || (dateRange.to && isSameDay(dateRange.from, dateRange.to))) {
        return format(new Date(dateRange.from), "EEEE dd MMM yyyy")
      } else if (activeTab === "weekly" && dateRange.to) {
        return `Week of ${format(new Date(dateRange.from), "dd MMM")} - ${format(new Date(dateRange.to), "dd MMM yyyy")}`
      } else if (activeTab === "monthly" && dateRange.from) {
        return format(new Date(dateRange.from), "MMMM yyyy")
      } else if (dateRange.from && dateRange.to) {
        return `${format(new Date(dateRange.from), "dd MMM yyyy")} - ${format(new Date(dateRange.to), "dd MMM yyyy")}`
      } else if (dateRange.from) {
        return format(new Date(dateRange.from), "dd MMM yyyy")
      } else {
        return "Invalid date range"
      }
    } catch (error) {
      console.error("Error formatting date range:", error)
      return "Invalid date format"
    }
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

  if (connectionError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold text-red-600">Database Connection Error</h2>
          <p className="text-muted-foreground">
            Unable to connect to the database. Please check your Supabase URL and anon key in the environment variables.
          </p>
          <div className="p-4 bg-muted rounded-md text-sm">
            <p className="font-mono mb-2">NEXT_PUBLIC_SUPABASE_URL</p>
            <p className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
          </div>
          <p>Make sure you've created the required tables in your Supabase database using the provided SQL schema.</p>
        </div>
      </div>
    )
  }

  if (schemaError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold text-amber-600">Database Schema Not Set Up</h2>
          <p className="text-muted-foreground">
            The database tables or views required by this application are missing. Please run the SQL schema in your
            Supabase SQL Editor.
          </p>
          <div className="p-4 bg-muted rounded-md text-sm overflow-auto max-h-[300px]">
            <pre className="text-left whitespace-pre-wrap">
              {`-- Create workers table
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create packing_entries table
CREATE TABLE packing_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  quantity INTEGER NOT NULL,
  rate DECIMAL(10, 2) NOT NULL,
  company TEXT NOT NULL CHECK (company IN ('NCC', 'ICD', 'CC')),
  total DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * rate) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create views for easier querying
CREATE VIEW packing_entries_view AS
SELECT 
  pe.id,
  pe.worker_id,
  w.name as worker_name,
  pe.item_id,
  i.name as item_name,
  pe.date,
  pe.quantity,
  pe.rate,
  pe.company,
  pe.total,
  pe.created_at,
  pe.updated_at
FROM packing_entries pe
JOIN workers w ON pe.worker_id = w.id
JOIN items i ON pe.item_id = i.id;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_workers_updated_at
BEFORE UPDATE ON workers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packing_entries_updated_at
BEFORE UPDATE ON packing_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();`}
            </pre>
          </div>
          <p>After running the SQL schema, refresh this page to see your data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <PrintButton />
          <Button asChild>
            <Link href="/entries/new">Add New Entry</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalValue}</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workers.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
              <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
            </div>

            <TabsContent value="daily" className="space-y-4">
              <FilterBar workers={workers} items={items} onFilter={handleFilterChange} />
              <div className="rounded-md border">
                <div className="py-4 px-6 bg-muted/50">
                  <h2 className="text-xl font-semibold text-center">{formatDateRange()}</h2>
                </div>
                {isLoading ? (
                  <div className="p-8 text-center">Loading...</div>
                ) : entries.length > 0 ? (
                  <PackingEntriesTable entries={entries} />
                ) : (
                  <div className="p-8 text-center text-muted-foreground">No entries found for this period</div>
                )}
                {entries.length > 0 && (
                  <div className="p-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-md border overflow-hidden bg-white">
                      <div className="bg-muted px-4 py-2 font-medium">Item Summary</div>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Item</th>
                            <th className="text-left p-2">Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itemSummary.map((item, index) => (
                            <tr key={index} className={index !== itemSummary.length - 1 ? "border-b" : ""}>
                              <td className="p-2">{item.item}</td>
                              <td className="p-2">{item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="rounded-md border overflow-hidden bg-white">
                      <div className="bg-muted px-4 py-2 font-medium">Summary</div>
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between">
                          <span>Total Items Packed:</span>
                          <span className="font-medium">{totalItems}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Value:</span>
                          <span className="font-medium">₹{totalValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="weekly" className="space-y-4">
              <FilterBar workers={workers} items={items} onFilter={handleFilterChange} />
              <div className="rounded-md border">
                <div className="py-4 px-6 bg-muted/50">
                  <h2 className="text-xl font-semibold text-center">{formatDateRange()}</h2>
                </div>
                {isLoading ? (
                  <div className="p-8 text-center">Loading...</div>
                ) : entries.length > 0 ? (
                  <PackingEntriesTable entries={entries} />
                ) : (
                  <div className="p-8 text-center text-muted-foreground">No entries found for this period</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <FilterBar workers={workers} items={items} onFilter={handleFilterChange} />
              <div className="rounded-md border">
                <div className="py-4 px-6 bg-muted/50">
                  <h2 className="text-xl font-semibold text-center">{formatDateRange()}</h2>
                </div>
                {isLoading ? (
                  <div className="p-8 text-center">Loading...</div>
                ) : entries.length > 0 ? (
                  <PackingEntriesTable entries={entries} />
                ) : (
                  <div className="p-8 text-center text-muted-foreground">No entries found for this period</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <FilterBar workers={workers} items={items} onFilter={handleFilterChange} />
              <div className="rounded-md border">
                <div className="py-4 px-6 bg-muted/50">
                  <h2 className="text-xl font-semibold text-center">{formatDateRange()}</h2>
                </div>
                {isLoading ? (
                  <div className="p-8 text-center">Loading...</div>
                ) : entries.length > 0 ? (
                  <PackingEntriesTable entries={entries} />
                ) : (
                  <div className="p-8 text-center text-muted-foreground">No entries found for this period</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

