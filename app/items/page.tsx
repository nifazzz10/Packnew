import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ItemForm } from "@/components/item-form"
import { ItemList } from "@/components/item-list"
import { getItems } from "@/lib/data"

export default async function ItemsPage() {
  const items = await getItems()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Items Management</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Item</CardTitle>
            <CardDescription>Add a new item to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items List</CardTitle>
            <CardDescription>Manage existing items</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemList items={items} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

