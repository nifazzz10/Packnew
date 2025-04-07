"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useMobile } from "@/hooks/use-mobile"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface ItemStat {
  id: string
  name: string
  packedQuantity: number
  packedValue: number
  soldQuantity: number
  soldValue: number
  inStock: number
}

interface ItemLeaderboardProps {
  stats: ItemStat[]
}

export function ItemLeaderboard({ stats }: ItemLeaderboardProps) {
  const isMobile = useMobile()

  // Get top 5 items
  const topItems = useMemo(() => {
    return [...stats].sort((a, b) => b.packedQuantity - a.packedQuantity).slice(0, 5)
  }, [stats])

  // Calculate max quantity for progress bars
  const maxQuantity = useMemo(() => {
    return Math.max(...topItems.map((item) => item.packedQuantity), 1)
  }, [topItems])

  // Prepare data for chart
  const chartData = useMemo(() => {
    return topItems.map((item) => ({
      name: item.name,
      packed: item.packedQuantity,
      sold: item.soldQuantity,
      inStock: item.inStock,
    }))
  }, [topItems])

  // Colors for the bars
  const colors = {
    packed: "#2563eb", // blue
    sold: "#0891b2", // cyan
    inStock: "#0d9488", // teal
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Most Packed Items</h3>
            <div className="space-y-4">
              {topItems.map((item, index) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span>{item.packedQuantity} items</span>
                  </div>
                  <Progress
                    value={(item.packedQuantity / maxQuantity) * 100}
                    className="h-2"
                    style={{ backgroundColor: "#e5e7eb" }} // Light gray background
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Packed vs Sold</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="packed" name="Packed" fill={colors.packed} />
                  <Bar dataKey="sold" name="Sold" fill={colors.sold} />
                  <Bar dataKey="inStock" name="In Stock" fill={colors.inStock} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="text-left p-2 border">Rank</th>
              <th className="text-left p-2 border">Item</th>
              <th className="text-right p-2 border">Packed</th>
              <th className="text-right p-2 border">Sold</th>
              <th className="text-right p-2 border">In Stock</th>
              <th className="text-right p-2 border">Packed Value (₹)</th>
              <th className="text-right p-2 border">Sold Value (₹)</th>
            </tr>
          </thead>
          <tbody>
            {stats.slice(0, 10).map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border text-right">{item.packedQuantity}</td>
                <td className="p-2 border text-right">{item.soldQuantity}</td>
                <td className="p-2 border text-right">{item.inStock}</td>
                <td className="p-2 border text-right">{item.packedValue.toFixed(2)}</td>
                <td className="p-2 border text-right">{item.soldValue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

