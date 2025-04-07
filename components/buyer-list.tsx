"use client"

import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { BuyerForm } from "./buyer-form"
import { useToast } from "@/hooks/use-toast"
import { deleteBuyer } from "@/lib/actions"
import type { Buyer } from "@/lib/supabase"

interface BuyerListProps {
  buyers: Buyer[]
}

export function BuyerList({ buyers }: BuyerListProps) {
  const [editingBuyerId, setEditingBuyerId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleEdit = (buyer: Buyer) => {
    setEditingBuyerId(buyer.id)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this buyer?")) {
      try {
        const result = await deleteBuyer(id)

        if (result.success) {
          toast({
            title: "Buyer deleted",
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
      {buyers.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No buyers found</p>
      ) : (
        <div className="border rounded-md">
          {buyers.map((buyer) => (
            <div key={buyer.id} className="p-4 border-b last:border-0">
              {editingBuyerId === buyer.id ? (
                <div className="space-y-4">
                  <BuyerForm initialData={buyer} onSuccess={() => setEditingBuyerId(null)} />
                  <Button variant="outline" onClick={() => setEditingBuyerId(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{buyer.name}</span>
                    {buyer.contact && <p className="text-sm text-muted-foreground">{buyer.contact}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(buyer)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(buyer.id)}>
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

