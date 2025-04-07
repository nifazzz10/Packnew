"use client"

import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { WorkerForm } from "./worker-form"
import { useToast } from "@/hooks/use-toast"
import { deleteWorker } from "@/lib/actions"
import type { Worker } from "@/lib/supabase"

interface WorkerListProps {
  workers: Worker[]
}

export function WorkerList({ workers }: WorkerListProps) {
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleEdit = (worker: Worker) => {
    setEditingWorkerId(worker.id)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this worker?")) {
      try {
        const result = await deleteWorker(id)

        if (result.success) {
          toast({
            title: "Worker deleted",
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
      {workers.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No workers found</p>
      ) : (
        <div className="border rounded-md">
          {workers.map((worker) => (
            <div key={worker.id} className="p-4 border-b last:border-0">
              {editingWorkerId === worker.id ? (
                <div className="space-y-4">
                  <WorkerForm initialData={worker} onSuccess={() => setEditingWorkerId(null)} />
                  <Button variant="outline" onClick={() => setEditingWorkerId(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="font-medium">{worker.name}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(worker)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(worker.id)}>
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

