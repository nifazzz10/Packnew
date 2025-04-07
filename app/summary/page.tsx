import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getItems, getPackingEntries, getBuyers, getSales, getStockLevels } from "@/lib/data"
import { StockSummary } from "@/components/stock-summary"
import { PrintButton } from "@/components/print-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesForm } from "@/components/sales-form"
import { SalesList } from "@/components/sales-list"

export default async function SummaryPage() {
  const [items, entries, buyers, sales, stockItems] = await Promise.all([
    getItems(),
    getPackingEntries(),
    getBuyers(),
    getSales(),
    getStockLevels(),
  ])

  // Calculate summary data for all items (including those with no stock)
  const itemSummary = items.map((item) => {
    const itemEntries = entries.filter((entry) => entry.item_id === item.id)
    const totalQuantity = itemEntries.reduce((sum, entry) => sum + entry.quantity, 0)
    const totalSpent = itemEntries.reduce((sum, entry) => sum + entry.total, 0)

    // Calculate sales for this item
    const itemSales = sales.filter((sale) => sale.item_id === item.id)
    const totalSold = itemSales.reduce((sum, sale) => sum + sale.quantity, 0)
    const totalSalesValue = itemSales.reduce((sum, sale) => sum + sale.total, 0)

    // Calculate in stock
    const inStock = totalQuantity - totalSold

    return {
      id: item.id,
      name: item.name,
      totalQuantity,
      totalSpent,
      totalSold,
      totalSalesValue,
      inStock: inStock > 0 ? inStock : 0,
      averageRate: totalQuantity > 0 ? totalSpent / totalQuantity : 0,
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Stock & Sales</h1>
        <PrintButton />
      </div>

      <Tabs defaultValue="stock" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stock">Stock Summary</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Item Summary</CardTitle>
              <CardDescription>Overview of all items packed and their costs</CardDescription>
            </CardHeader>
            <CardContent>
              <StockSummary items={itemSummary} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Record Sale</CardTitle>
                <CardDescription>Sell items from available stock</CardDescription>
              </CardHeader>
              <CardContent>
                <SalesForm buyers={buyers} stockItems={stockItems} />
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Sales History</CardTitle>
                <CardDescription>View all recorded sales</CardDescription>
              </CardHeader>
              <CardContent>
                <SalesList sales={sales} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

