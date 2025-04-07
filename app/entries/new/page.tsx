import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PackingEntryForm } from "@/components/packing-entry-form"
import { getWorkers, getItems } from "@/lib/data"

export default async function NewEntryPage() {
  const [workers, items] = await Promise.all([getWorkers(), getItems()])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">New Packing Entry</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Packing Entry</CardTitle>
          <CardDescription>Add a new packing entry to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <PackingEntryForm workers={workers} items={items} />
        </CardContent>
      </Card>
    </div>
  )
}

