import { getWorkerStats, getBuyerStats, getItemStats } from "@/lib/data"

export default async function AnalyticsPrintPage() {
  const [workerStats, buyerStats, itemStats] = await Promise.all([getWorkerStats(), getBuyerStats(), getItemStats()])

  // Get top 10 for each category
  const topWorkers = [...workerStats].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 10)
  const topBuyers = [...buyerStats].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 10)
  const topItems = [...itemStats].sort((a, b) => b.packedQuantity - a.packedQuantity).slice(0, 10)

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Analytics Report</h1>
        <p className="text-muted-foreground">{new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Top Workers</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Rank</th>
                <th className="border p-2 text-left">Worker</th>
                <th className="border p-2 text-right">Items Packed</th>
                <th className="border p-2 text-right">Total Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              {topWorkers.map((worker, index) => (
                <tr key={worker.id}>
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{worker.name}</td>
                  <td className="border p-2 text-right">{worker.totalQuantity}</td>
                  <td className="border p-2 text-right">{worker.totalValue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Top Buyers</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Rank</th>
                <th className="border p-2 text-left">Buyer</th>
                <th className="border p-2 text-right">Items Purchased</th>
                <th className="border p-2 text-right">Total Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              {topBuyers.map((buyer, index) => (
                <tr key={buyer.id}>
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{buyer.name}</td>
                  <td className="border p-2 text-right">{buyer.totalQuantity}</td>
                  <td className="border p-2 text-right">{buyer.totalValue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Top Items</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Rank</th>
                <th className="border p-2 text-left">Item</th>
                <th className="border p-2 text-right">Packed</th>
                <th className="border p-2 text-right">Sold</th>
                <th className="border p-2 text-right">In Stock</th>
                <th className="border p-2 text-right">Packed Value (₹)</th>
                <th className="border p-2 text-right">Sold Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              {topItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2 text-right">{item.packedQuantity}</td>
                  <td className="border p-2 text-right">{item.soldQuantity}</td>
                  <td className="border p-2 text-right">{item.inStock}</td>
                  <td className="border p-2 text-right">{item.packedValue.toFixed(2)}</td>
                  <td className="border p-2 text-right">{item.soldValue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Generated on {new Date().toLocaleString()}</p>
        <p>Packaging Management System</p>
      </div>
    </div>
  )
}

