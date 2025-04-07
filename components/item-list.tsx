"use client"

import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { ItemForm } from "./item-form"
import { useToast } from "@/hooks/use-toast"
import { deleteItem } from "@/lib/actions"
import type { Item } from "@/lib/supabase"

interface ItemListProps {
  items: Item[]
}

export function ItemList({ items }: ItemListProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleEdit = (item: Item) => {
    setEditingItemId(item.id)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const result = await deleteItem(id)

        if (result.success) {
          toast({
            title: "Item deleted",
            description: result.message,
          })
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No items found</p>
      ) : (
        <div className="border rounded-md">
          {items.map((item) => (
            <div key={item.id} className="p-4 border-b last:border-0">
              {editingItemId === item.id ? (
                <div className="space-y-4">
                  <ItemForm initialData={item} onSuccess={() => setEditingItemId(null)} />
                  <Button variant="outline" onClick={() => setEditingItemId(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.name}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

