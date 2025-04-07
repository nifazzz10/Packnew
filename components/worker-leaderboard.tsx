"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useMobile } from "@/hooks/use-mobile"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface WorkerStat {
  id: string
  name: string
  totalQuantity: number
  totalValue: number
}

interface WorkerLeaderboardProps {
  stats: WorkerStat[]
}

export function WorkerLeaderboard({ stats }: WorkerLeaderboardProps) {
  const isMobile = useMobile()

  // Get top 5 workers
  const topWorkers = useMemo(() => {
    return [...stats].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 5)
  }, [stats])

  // Calculate max quantity for progress bars
  const maxQuantity = useMemo(() => {
    return Math.max(...topWorkers.map((worker) => worker.totalQuantity), 1)
  }, [topWorkers])

  // Prepare data for chart
  const chartData = useMemo(() => {
    return topWorkers.map((worker) => ({
      name: worker.name,
      quantity: worker.totalQuantity,
      value: worker.totalValue,
    }))
  }, [topWorkers])

  // Colors for the bars
  const colors = ["#2563eb", "#4f46e5", "#7c3aed", "#0891b2", "#0d9488"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Items Packed</h3>
            <div className="space-y-4">
              {topWorkers.map((worker, index) => (
                <div key={worker.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{worker.name}</span>
                    <span>{worker.totalQuantity} items</span>
                  </div>
                  <Progress
                    value={(worker.totalQuantity / maxQuantity) * 100}
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
            <h3 className="text-lg font-semibold mb-4">Visual Comparison</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [`${value} items`, "Quantity"]}
                    labelFormatter={(name) => `Worker: ${name}`}
                  />
                  <Bar dataKey="quantity" name="Items Packed">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
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
              <th className="text-left p-2 border">Worker</th>
              <th className="text-right p-2 border">Items Packed</th>
              <th className="text-right p-2 border">Total Value (₹)</th>
            </tr>
          </thead>
          <tbody>
            {stats.slice(0, 10).map((worker, index) => (
              <tr key={worker.id} className={index % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">{worker.name}</td>
                <td className="p-2 border text-right">{worker.totalQuantity}</td>
                <td className="p-2 border text-right">{worker.totalValue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

