"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import type { PackingEntry } from "@/lib/supabase"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"

interface PosReportPrintProps {
  entries: PackingEntry[]
  dateRange: DateRange | undefined
  workerName: string
}

export function PosReportPrint({ entries, dateRange, workerName }: PosReportPrintProps) {
  // Create a hidden div to hold the content for printing
  const printContentRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (!printContentRef.current) return

    // Calculate totals
    const totalQuantity = entries.reduce((sum, entry) => sum + entry.quantity, 0)
    const totalValue = entries.reduce((sum, entry) => sum + entry.total, 0)

    // Format date range for display
    const dateRangeText = dateRange?.from
      ? dateRange.to && dateRange.from.toDateString() !== dateRange.to.toDateString()
        ? `${format(dateRange.from, "dd/MM/yy")} - ${format(dateRange.to, "dd/MM/yy")}`
        : format(dateRange.from, "dd/MM/yy")
      : ""

    // Group entries by worker
    const entriesByWorker = entries.reduce(
      (acc, entry) => {
        const workerName = entry.worker_name || "Unknown"
        if (!acc[workerName]) {
          acc[workerName] = []
        }
        acc[workerName].push(entry)
        return acc
      },
      {} as Record<string, PackingEntry[]>,
    )

    // Create a new iframe
    const iframe = document.createElement("iframe")
    iframe.style.display = "none"
    document.body.appendChild(iframe)

    // Write the content to the iframe
    const doc = iframe.contentWindow?.document
    if (!doc) {
      document.body.removeChild(iframe)
      return
    }

    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Worker Report</title>
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
            .worker-name {
              font-weight: bold;
              font-size: 11px;
              margin-bottom: 1mm;
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
            .summary {
              margin-top: 3mm;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>WORKER REPORT</h1>
              <p>${workerName}</p>
              <p>${dateRangeText}</p>
            </div>

            ${Object.entries(entriesByWorker)
              .map(
                ([worker, workerEntries]) => `
              <div class="section">
                <div class="worker-name">${worker}</div>
                <table>
                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>ITEM</th>
                      <th class="right">QTY</th>
                      <th class="right">₹</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${workerEntries
                      .map(
                        (entry) => `
                      <tr>
                        <td>${format(new Date(entry.date), "dd/MM")}</td>
                        <td>${(entry.item_name || "").substring(0, 8)}</td>
                        <td class="right">${entry.quantity}</td>
                        <td class="right">${entry.total}</td>
                      </tr>
                    `,
                      )
                      .join("")}
                    <tr>
                      <td colspan="2" class="right">TOTAL:</td>
                      <td class="right">${workerEntries.reduce((sum, entry) => sum + entry.quantity, 0)}</td>
                      <td class="right">${workerEntries.reduce((sum, entry) => sum + entry.total, 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `,
              )
              .join("")}

            <div class="summary">
              <div class="divider"></div>
              <table>
                <tr>
                  <td>GRAND TOTAL:</td>
                  <td class="right">${totalQuantity} items</td>
                </tr>
                <tr>
                  <td>VALUE:</td>
                  <td class="right">₹${totalValue.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <div class="footer">
              <div class="divider"></div>
              <p>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
              <p>Packaging Management System</p>
            </div>
          </div>
        </body>
      </html>
    `)
    doc.close()

    // Print the iframe
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()

    // Remove the iframe after printing
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 1000)
  }

  return (
    <div>
      <Button onClick={handlePrint} variant="outline" className="print:hidden">
        <Printer className="mr-2 h-4 w-4" />
        Print POS Receipt (3-inch)
      </Button>

      {/* Hidden div to hold the content for printing */}
      <div ref={printContentRef} className="hidden"></div>
    </div>
  )
}

