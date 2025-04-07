"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useMobile } from "@/hooks/use-mobile"
import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts"

interface BuyerStat {
  id: string
  name: string
  totalQuantity: number
  totalValue: number
}

interface BuyerLeaderboardProps {
  stats: BuyerStat[]
}

export function BuyerLeaderboard({ stats }: BuyerLeaderboardProps) {
  const isMobile = useMobile()

  // Get top 5 buyers
  const topBuyers = useMemo(() => {
    return [...stats].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 5)
  }, [stats])

  // Calculate max quantity for progress bars
  const maxQuantity = useMemo(() => {
    return Math.max(...topBuyers.map((buyer) => buyer.totalQuantity), 1)
  }, [topBuyers])

  // Prepare data for charts
  const barChartData = useMemo(() => {
    return topBuyers.map((buyer) => ({
      name: buyer.name,
      quantity: buyer.totalQuantity,
      value: buyer.totalValue,
    }))
  }, [topBuyers])

  const pieChartData = useMemo(() => {
    return topBuyers.map((buyer) => ({
      name: buyer.name,
      value: buyer.totalQuantity,
    }))
  }, [topBuyers])

  // Colors for the charts
  const colors = ["#2563eb", "#4f46e5", "#7c3aed", "#0891b2", "#0d9488"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Items Purchased</h3>
            <div className="space-y-4">
              {topBuyers.map((buyer, index) => (
                <div key={buyer.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{buyer.name}</span>
                    <span>{buyer.totalQuantity} items</span>
                  </div>
                  <Progress
                    value={(buyer.totalQuantity / maxQuantity) * 100}
                    className="h-2"
                    style={{ backgroundColor: "#e5e7eb" }} // Light gray background
                    indicatorClassName={
                      index === 0
                        ? "bg-blue-600"
                        : index === 1
                          ? "bg-indigo-600"
                          : index === 2
                            ? "bg-purple-600"
                            : index === 3
                              ? "bg-cyan-600"
                              : "bg-teal-600"
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Purchase Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} items`, "Quantity"]} />
                  <Legend />
                </PieChart>
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
              <th className="text-left p-2 border">Buyer</th>
              <th className="text-right p-2 border">Items Purchased</th>
              <th className="text-right p-2 border">Total Value (₹)</th>
            </tr>
          </thead>
          <tbody>
            {stats.slice(0, 10).map((buyer, index) => (
              <tr key={buyer.id} className={index % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">{buyer.name}</td>
                <td className="p-2 border text-right">{buyer.totalQuantity}</td>
                <td className="p-2 border text-right">{buyer.totalValue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

