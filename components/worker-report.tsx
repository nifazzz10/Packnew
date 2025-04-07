import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import type { PackingEntry } from "@/lib/supabase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface WorkerReportProps {
  entries: PackingEntry[]
  isLoading: boolean
  error: string | null
  dateRange: DateRange | undefined
  workerName: string
}

export function WorkerReport({ entries, isLoading, error, dateRange, workerName }: WorkerReportProps) {
  if (isLoading) {
    return <div className="py-8 text-center">Loading...</div>
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">{error}</div>
  }

  if (entries.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No entries found for the selected criteria</div>
  }

  // Group entries by worker
  const entriesByWorker = entries.reduce(
    (acc, entry) => {
      const workerName = entry.worker_name || "Unknown"
      if (!acc[workerName]) {
        acc[workerName] = []
      }
      acc[workerName].push(entry)
      return acc
    },
    {} as Record<string, PackingEntry[]>,
  )

  // Calculate totals
  const totalQuantity = entries.reduce((sum, entry) => sum + entry.quantity, 0)
  const totalValue = entries.reduce((sum, entry) => sum + entry.total, 0)

  // Format date range for display
  const dateRangeText = dateRange?.from
    ? dateRange.to && dateRange.from.toDateString() !== dateRange.to.toDateString()
      ? `${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
      : format(dateRange.from, "dd MMM yyyy")
    : ""

  return (
    <div className="space-y-6">
      <div className="text-center print:mb-6">
        <h2 className="text-2xl font-bold">{workerName} - Packing Report</h2>
        <p className="text-muted-foreground">{dateRangeText}</p>
      </div>

      {Object.entries(entriesByWorker).map(([worker, workerEntries]) => (
        <div key={worker} className="space-y-2">
          <h3 className="text-lg font-semibold">{worker}</h3>
          <div className="rounded-md border overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Rate (₹)</TableHead>
                  <TableHead className="text-right">Value (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workerEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{format(new Date(entry.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{entry.company}</TableCell>
                    <TableCell>{entry.item_name}</TableCell>
                    <TableCell className="text-right">{entry.quantity}</TableCell>
                    <TableCell className="text-right">{entry.rate}</TableCell>
                    <TableCell className="text-right">{entry.total}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell colSpan={3}>Worker Total</TableCell>
                  <TableCell className="text-right">
                    {workerEntries.reduce((sum, entry) => sum + entry.quantity, 0)}
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right">
                    {workerEntries.reduce((sum, entry) => sum + entry.total, 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      ))}

      <div className="mt-6 p-4 border rounded-md bg-muted/30">
        <div className="flex justify-between items-center">
          <span className="font-medium">Grand Total:</span>
          <div className="text-right">
            <div>
              Items: <span className="font-bold">{totalQuantity}</span>
            </div>
            <div>
              Value: <span className="font-bold">₹{totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

