"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { createWorker, updateWorker } from "@/lib/actions"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Worker name must be at least 2 characters.",
  }),
})

interface WorkerFormProps {
  initialData?: {
    id: string
    name: string
  }
  onSuccess?: () => void
}

export function WorkerForm({ initialData, onSuccess }: WorkerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const isEditing = !!initialData

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", values.name)

      let result
      if (isEditing && initialData) {
        result = await updateWorker(initialData.id, formData)
      } else {
        result = await createWorker(formData)
      }

      if (result.success) {
        toast({
          title: isEditing ? "Worker updated" : "Worker created",
          description: result.message,
        })

        if (!isEditing) {
          form.reset({ name: "" })
        }

        if (onSuccess) {
          onSuccess()
        }
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Worker Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter worker name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isEditing ? "Update Worker" : "Add Worker"}
        </Button>
      </form>
    </Form>
  )
}

