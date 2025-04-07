"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { adjustSales } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface AffectedSale {
  id: string
  quantity: number
  date: string
  buyer: string
  item: string
}

interface StockConflictDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  details: {
    deficit: number
    affectedSales: AffectedSale[]
    itemId: string
    itemName: string
    entryQuantity?: number
    currentQuantity?: number
    newQuantity?: number
  }
  onResolve: () => void
  type: "delete" | "update"
}

export function StockConflictDialog({ open, onOpenChange, details, onResolve, type }: StockConflictDialogProps) {
  const [selectedSales, setSelectedSales] = useState<Record<string, boolean>>({})
  const [adjustedQuantities, setAdjustedQuantities] = useState<Record<string, number>>({})
  const [isAdjusting, setIsAdjusting] = useState(false)
  const { toast } = useToast()

  // Initialize selected sales and adjusted quantities
  useState(() => {
    const selected: Record<string, boolean> = {}
    const quantities: Record<string, number> = {}

    details.affectedSales.forEach((sale) => {
      selected[sale.id] = false
      quantities[sale.id] = sale.quantity
    })

    setSelectedSales(selected)
    setAdjustedQuantities(quantities)
  })

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedSales((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  const handleQuantityChange = (id: string, value: string) => {
    const quantity = Number.parseInt(value)
    if (!isNaN(quantity) && quantity >= 0) {
      setAdjustedQuantities((prev) => ({
        ...prev,
        [id]: quantity,
      }))
    }
  }

  const calculateTotalAdjustment = () => {
    let totalDeleted = 0
    let totalReduced = 0

    details.affectedSales.forEach((sale) => {
      if (selectedSales[sale.id]) {
        totalDeleted += sale.quantity
      } else {
        const originalQuantity = sale.quantity
        const newQuantity = adjustedQuantities[sale.id] || 0
        if (newQuantity < originalQuantity) {
          totalReduced += originalQuantity - newQuantity
        }
      }
    })

    return totalDeleted + totalReduced
  }

  const isResolutionValid = () => {
    return calculateTotalAdjustment() >= details.deficit
  }

  const handleResolve = async () => {
    if (!isResolutionValid()) {
      toast({
        title: "Invalid adjustment",
        description: `You need to adjust sales by at least ${details.deficit} units to resolve the conflict.`,
        variant: "destructive",
      })
      return
    }

    setIsAdjusting(true)

    // Prepare data for adjustment
    const salesToDelete = Object.entries(selectedSales)
      .filter(([_, selected]) => selected)
      .map(([id]) => id)

    const salesToAdjust = Object.entries(adjustedQuantities)
      .filter(([id, quantity]) => {
        const sale = details.affectedSales.find((s) => s.id === id)
        return !selectedSales[id] && sale && quantity < sale.quantity
      })
      .map(([id, quantity]) => ({
        id,
        newQuantity: quantity,
      }))

    try {
      const result = await adjustSales(details.itemId, salesToDelete, salesToAdjust)

      if (result.success) {
        toast({
          title: "Sales adjusted",
          description: result.message,
        })
        onOpenChange(false)
        onResolve()
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
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsAdjusting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Stock Conflict</DialogTitle>
          <DialogDescription>
            {type === "delete" ? (
              <>
                Deleting this packing entry of {details.entryQuantity} {details.itemName} would result in negative
                stock. You need to adjust sales by at least {details.deficit} units to proceed.
              </>
            ) : (
              <>
                {details.currentQuantity !== undefined && details.newQuantity !== undefined ? (
                  <>
                    Reducing quantity from {details.currentQuantity} to {details.newQuantity} would result in negative
                    stock. You need to adjust sales by at least {details.deficit} units to proceed.
                  </>
                ) : (
                  <>
                    This change would result in negative stock for {details.itemName}. You need to adjust sales by at
                    least {details.deficit} units to proceed.
                  </>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Delete</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {details.affectedSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSales[sale.id]}
                      onCheckedChange={(checked) => handleCheckboxChange(sale.id, checked === true)}
                    />
                  </TableCell>
                  <TableCell>{sale.buyer}</TableCell>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell className="text-right">
                    {selectedSales[sale.id] ? (
                      <span className="line-through">{sale.quantity}</span>
                    ) : (
                      <Input
                        type="number"
                        min="0"
                        max={sale.quantity}
                        value={adjustedQuantities[sale.id] || 0}
                        onChange={(e) => handleQuantityChange(sale.id, e.target.value)}
                        className="w-20 h-8 inline-block text-right"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-muted p-3 rounded-md mt-2">
          <div className="flex justify-between font-medium">
            <span>Total adjustment:</span>
            <span>
              {calculateTotalAdjustment()} of {details.deficit} required
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleResolve} disabled={!isResolutionValid() || isAdjusting}>
            {isAdjusting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adjusting...
              </>
            ) : (
              "Adjust Sales & Proceed"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

