import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkerLeaderboard } from "@/components/worker-leaderboard"
import { BuyerLeaderboard } from "@/components/buyer-leaderboard"
import { ItemLeaderboard } from "@/components/item-leaderboard"
import { getWorkerStats, getBuyerStats, getItemStats } from "@/lib/data"
import { PosPrintLayout } from "@/components/pos-print-layout"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import Link from "next/link"

export default async function AnalyticsPage() {
  const [workerStats, buyerStats, itemStats] = await Promise.all([getWorkerStats(), getBuyerStats(), getItemStats()])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="flex gap-2">
          <Button asChild className="print:hidden">
            <Link href="/analytics/print" target="_blank">
              <Printer className="mr-2 h-4 w-4" />
              Print Full Report
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="workers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workers">Worker Leaderboard</TabsTrigger>
          <TabsTrigger value="buyers">Buyer Leaderboard</TabsTrigger>
          <TabsTrigger value="items">Item Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="workers">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Top Workers</CardTitle>
              <CardDescription>Workers who have packed the most items</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkerLeaderboard stats={workerStats} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buyers">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Top Buyers</CardTitle>
              <CardDescription>Buyers who have purchased the most items</CardDescription>
            </CardHeader>
            <CardContent>
              <BuyerLeaderboard stats={buyerStats} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Top Items</CardTitle>
              <CardDescription>Most packed and sold items</CardDescription>
            </CardHeader>
            <CardContent>
              <ItemLeaderboard stats={itemStats} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <PosPrintLayout workerStats={workerStats} buyerStats={buyerStats} itemStats={itemStats} />
      </div>
    </div>
  )
}

