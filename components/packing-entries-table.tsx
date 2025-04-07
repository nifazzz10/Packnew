"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { deletePackingEntry } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import type { PackingEntry } from "@/lib/supabase"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useMobile } from "@/hooks/use-mobile"
import { useState } from "react"
import { StockConflictDialog } from "./stock-conflict-dialog"

interface PackingEntriesTableProps {
  entries: PackingEntry[]
}

export function PackingEntriesTable({ entries }: PackingEntriesTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useMobile()
  const [stockConflictOpen, setStockConflictOpen] = useState(false)
  const [stockConflictDetails, setStockConflictDetails] = useState<any>(null)
  const [conflictType, setConflictType] = useState<"delete" | "update">("delete")
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const handleEdit = (id: string) => {
    router.push(`/entries/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        const result = await deletePackingEntry(id)

        if (result.success) {
          toast({
            title: "Entry deleted",
            description: result.message,
          })
        } else {
          // Check if this is a stock conflict
          if (result.type === "STOCK_CONFLICT") {
            setStockConflictDetails(result.details)
            setConflictType("delete")
            setPendingDeleteId(id)
            setStockConflictOpen(true)
          } else {
            toast({
              title: "Error",
              description: result.message,
              variant: "destructive",
            })
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleConflictResolved = () => {
    // After resolving the conflict, retry the delete operation
    if (pendingDeleteId && conflictType === "delete") {
      deletePackingEntry(pendingDeleteId).then((result) => {
        if (result.success) {
          toast({
            title: "Entry deleted",
            description: result.message,
          })
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          })
        }
        setPendingDeleteId(null)
      })
    }
  }

  const totalItems = entries.reduce((sum, entry) => sum + entry.quantity, 0)
  const totalValue = entries.reduce((sum, entry) => sum + entry.total, 0)

  if (isMobile) {
    return (
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white p-3 rounded-md border shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{entry.worker_name}</h3>
                <p className="text-sm text-muted-foreground">{format(new Date(entry.date), "dd/MM/yyyy")}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{entry.company}</p>
                <p className="text-sm">{entry.item_name}</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-t pt-2 mt-2">
              <div className="grid grid-cols-3 gap-2 text-sm w-full">
                <div>
                  <p className="text-muted-foreground">Qty</p>
                  <p className="font-medium">{entry.quantity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rate</p>
                  <p className="font-medium">₹{entry.rate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Value</p>
                  <p className="font-medium">₹{entry.total}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={() => handleEdit(entry.id)} className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(entry.id)} className="h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
        <div className="bg-muted/50 p-3 rounded-md border font-medium">
          <div className="flex justify-between">
            <span>Total items packed:</span>
            <span>{totalItems}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Total Value:</span>
            <span>₹{totalValue}</span>
          </div>
        </div>

        {stockConflictDetails && (
          <StockConflictDialog
            open={stockConflictOpen}
            onOpenChange={setStockConflictOpen}
            details={stockConflictDetails}
            onResolve={handleConflictResolved}
            type={conflictType}
          />
        )}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NAME</TableHead>
            <TableHead>CPY</TableHead>
            <TableHead>DATE</TableHead>
            <TableHead>ITEM</TableHead>
            <TableHead className="text-right">QTY</TableHead>
            <TableHead className="text-right">₹</TableHead>
            <TableHead className="text-right">VAL</TableHead>
            <TableHead className="text-right print:hidden">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{entry.worker_name}</TableCell>
              <TableCell>{entry.company}</TableCell>
              <TableCell>{format(new Date(entry.date), "dd/MM/yyyy")}</TableCell>
              <TableCell>{entry.item_name}</TableCell>
              <TableCell className="text-right">{entry.quantity}</TableCell>
              <TableCell className="text-right">{entry.rate}</TableCell>
              <TableCell className="text-right">{entry.total}</TableCell>
              <TableCell className="text-right print:hidden">
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(entry.id)} className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(entry.id)} className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-muted/50 font-medium">
            <TableCell colSpan={4}>Total items packed</TableCell>
            <TableCell className="text-right">{totalItems}</TableCell>
            <TableCell className="text-right">Total Value</TableCell>
            <TableCell className="text-right">{totalValue}</TableCell>
            <TableCell className="print:hidden"></TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {stockConflictDetails && (
        <StockConflictDialog
          open={stockConflictOpen}
          onOpenChange={setStockConflictOpen}
          details={stockConflictDetails}
          onResolve={handleConflictResolved}
          type={conflictType}
        />
      )}
    </div>
  )
}

