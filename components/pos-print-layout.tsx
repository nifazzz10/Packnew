"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface WorkerStat {
  id: string
  name: string
  totalQuantity: number
  totalValue: number
}

interface BuyerStat {
  id: string
  name: string
  totalQuantity: number
  totalValue: number
}

interface ItemStat {
  id: string
  name: string
  packedQuantity: number
  packedValue: number
  soldQuantity: number
  soldValue: number
  inStock: number
}

interface PosPrintLayoutProps {
  workerStats: WorkerStat[]
  buyerStats: BuyerStat[]
  itemStats: ItemStat[]
}

export function PosPrintLayout({ workerStats, buyerStats, itemStats }: PosPrintLayoutProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    // Apply POS receipt styling
    printWindow.document.write(`
      <html>
        <head>
          <title>Analytics Report</title>
          <style>
            @page {
              size: 80mm auto; /* 3-inch width */
              margin: 0;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 10px;
              width: 72mm; /* Slightly less than 3 inches for safe printing */
              margin: 0 auto;
              padding: 4mm;
            }
            .receipt {
              width: 100%;
            }
            .header {
              text-align: center;
              margin-bottom: 5mm;
              border-bottom: 1px dashed #000;
              padding-bottom: 2mm;
            }
            .section {
              margin-bottom: 5mm;
              border-bottom: 1px dashed #000;
              padding-bottom: 2mm;
            }
            .section-title {
              font-weight: bold;
              font-size: 12px;
              margin-bottom: 2mm;
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              text-align: left;
              padding: 1mm 0;
            }
            .right {
              text-align: right;
            }
            .center {
              text-align: center;
            }
            .footer {
              text-align: center;
              margin-top: 5mm;
              font-size: 9px;
            }
            .divider {
              border-bottom: 1px dashed #000;
              margin: 2mm 0;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${content.innerHTML}
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  // Get top 5 for each category
  const topWorkers = [...workerStats].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 5)
  const topBuyers = [...buyerStats].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 5)
  const topItems = [...itemStats].sort((a, b) => b.packedQuantity - a.packedQuantity).slice(0, 5)

  return (
    <div className="space-y-4">
      <Button onClick={handlePrint} className="print:hidden">
        <Printer className="mr-2 h-4 w-4" />
        Print POS Receipt
      </Button>

      <div className="hidden">
        <div ref={printRef}>
          <div className="header">
            <h1>ANALYTICS REPORT</h1>
            <p>{new Date().toLocaleDateString()}</p>
          </div>

          <div className="section">
            <div className="section-title">TOP WORKERS</div>
            <table>
              <thead>
                <tr>
                  <th>NAME</th>
                  <th className="right">QTY</th>
                </tr>
              </thead>
              <tbody>
                {topWorkers.map((worker, index) => (
                  <tr key={worker.id}>
                    <td>{worker.name.substring(0, 12)}</td>
                    <td className="right">{worker.totalQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section">
            <div className="section-title">TOP BUYERS</div>
            <table>
              <thead>
                <tr>
                  <th>NAME</th>
                  <th className="right">QTY</th>
                </tr>
              </thead>
              <tbody>
                {topBuyers.map((buyer, index) => (
                  <tr key={buyer.id}>
                    <td>{buyer.name.substring(0, 12)}</td>
                    <td className="right">{buyer.totalQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section">
            <div className="section-title">TOP ITEMS</div>
            <table>
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th className="right">PACKED</th>
                  <th className="right">SOLD</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{item.name.substring(0, 8)}</td>
                    <td className="right">{item.packedQuantity}</td>
                    <td className="right">{item.soldQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="footer">
            <div className="divider"></div>
            <p>Thank you for using our system</p>
            <p>Packaging Management System</p>
          </div>
        </div>
      </div>
    </div>
  )
}

