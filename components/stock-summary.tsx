"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useMobile } from "@/hooks/use-mobile"

interface StockSummaryItem {
  id: string
  name: string
  totalQuantity: number
  totalSpent: number
  totalSold?: number
  totalSalesValue?: number
  inStock: number
  averageRate: number
}

interface StockSummaryProps {
  items: StockSummaryItem[]
}

export function StockSummary({ items }: StockSummaryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const isMobile = useMobile()

  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const totalQuantity = items.reduce((sum, item) => sum + item.totalQuantity, 0)
  const totalSpent = items.reduce((sum, item) => sum + item.totalSpent, 0)
  const totalInStock = items.reduce((sum, item) => sum + item.inStock, 0)
  const totalSold = items.reduce((sum, item) => sum + (item.totalSold || 0), 0)
  const totalSalesValue = items.reduce((sum, item) => sum + (item.totalSalesValue || 0), 0)

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isMobile ? (
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No items found</div>
          ) : (
            <>
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-md border shadow-sm">
                  <h3 className="font-medium mb-2">{item.name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Packed</p>
                      <p className="font-medium">{item.totalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Sold</p>
                      <p className="font-medium">{item.totalSold || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">In Stock</p>
                      <p className="font-medium">{item.inStock}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg. Rate (₹)</p>
                      <p className="font-medium">{item.averageRate.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Stock Value (₹)</p>
                      <p className="font-medium">{(item.inStock * item.averageRate).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-muted/50 p-3 rounded-md border font-medium">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-muted-foreground">Total Packed</p>
                    <p>{totalQuantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Sold</p>
                    <p>{totalSold}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">In Stock</p>
                    <p>{totalInStock}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stock Value (₹)</p>
                    <p>{totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead className="text-right">Total Packed</TableHead>
                <TableHead className="text-right">Total Sold</TableHead>
                <TableHead className="text-right">In Stock</TableHead>
                <TableHead className="text-right">Avg. Rate (₹)</TableHead>
                <TableHead className="text-right">Stock Value (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No items found
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.totalQuantity}</TableCell>
                      <TableCell className="text-right">{item.totalSold || 0}</TableCell>
                      <TableCell className="text-right">{item.inStock}</TableCell>
                      <TableCell className="text-right">{item.averageRate.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{(item.inStock * item.averageRate).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{totalQuantity}</TableCell>
                    <TableCell className="text-right">{totalSold}</TableCell>
                    <TableCell className="text-right">{totalInStock}</TableCell>
                    <TableCell className="text-right"></TableCell>
                    <TableCell className="text-right">{totalSpent.toFixed(2)}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

