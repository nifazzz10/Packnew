"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { deleteSale } from "@/lib/actions"
import type { Sale } from "@/lib/supabase"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useMobile } from "@/hooks/use-mobile"

interface SalesListProps {
  sales: Sale[]
}

export function SalesList({ sales }: SalesListProps) {
  const { toast } = useToast()
  const isMobile = useMobile()

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sale?")) {
      try {
        const result = await deleteSale(id)

        if (result.success) {
          toast({
            title: "Sale deleted",
            description: result.message,
          })
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          })
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

  const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0)
  const totalValue = sales.reduce((sum, sale) => sum + sale.total, 0)

  if (sales.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No sales found</p>
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {sales.map((sale) => (
          <div key={sale.id} className="bg-white p-3 rounded-md border shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{sale.item_name}</h3>
                <p className="text-sm text-muted-foreground">{format(new Date(sale.date), "dd/MM/yyyy")}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{sale.buyer_name}</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-t pt-2 mt-2">
              <div className="grid grid-cols-3 gap-2 text-sm w-full">
                <div>
                  <p className="text-muted-foreground">Qty</p>
                  <p className="font-medium">{sale.quantity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rate</p>
                  <p className="font-medium">₹{sale.rate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Value</p>
                  <p className="font-medium">₹{sale.total}</p>
                </div>
              </div>
              <Button variant="destructive" size="icon" onClick={() => handleDelete(sale.id)} className="h-8 w-8">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        ))}
        <div className="bg-muted/50 p-3 rounded-md border font-medium">
          <div className="flex justify-between">
            <span>Total quantity:</span>
            <span>{totalQuantity}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Total Value:</span>
            <span>₹{totalValue.toFixed(2)}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Rate (₹)</TableHead>
            <TableHead className="text-right">Total (₹)</TableHead>
            <TableHead className="text-right print:hidden">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{format(new Date(sale.date), "dd/MM/yyyy")}</TableCell>
              <TableCell>{sale.item_name}</TableCell>
              <TableCell>{sale.buyer_name}</TableCell>
              <TableCell className="text-right">{sale.quantity}</TableCell>
              <TableCell className="text-right">{sale.rate}</TableCell>
              <TableCell className="text-right">{sale.total}</TableCell>
              <TableCell className="text-right print:hidden">
                <Button variant="destructive" size="icon" onClick={() => handleDelete(sale.id)} className="h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-muted/50 font-medium">
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">{totalQuantity}</TableCell>
            <TableCell></TableCell>
            <TableCell className="text-right">{totalValue.toFixed(2)}</TableCell>
            <TableCell className="print:hidden"></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

