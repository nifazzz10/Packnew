import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PackingEntryForm } from "@/components/packing-entry-form"
import { getWorkers, getItems, getPackingEntryById } from "@/lib/data"
import { notFound } from "next/navigation"

interface EditEntryPageProps {
  params: {
    id: string
  }
}

export default async function EditEntryPage({ params }: EditEntryPageProps) {
  const { id } = params

  const [workers, items, entry] = await Promise.all([getWorkers(), getItems(), getPackingEntryById(id)])

  if (!entry) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Packing Entry</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Packing Entry</CardTitle>
          <CardDescription>Update the packing entry details</CardDescription>
        </CardHeader>
        <CardContent>
          <PackingEntryForm workers={workers} items={items} initialData={entry} />
        </CardContent>
      </Card>
    </div>
  )
}

