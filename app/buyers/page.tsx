import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BuyerForm } from "@/components/buyer-form"
import { BuyerList } from "@/components/buyer-list"
import { getBuyers } from "@/lib/data"

export default async function BuyersPage() {
  const buyers = await getBuyers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Buyers Management</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Add New Buyer</CardTitle>
            <CardDescription>Add a new buyer to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <BuyerForm />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Buyers List</CardTitle>
            <CardDescription>Manage existing buyers</CardDescription>
          </CardHeader>
          <CardContent>
            <BuyerList buyers={buyers} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

