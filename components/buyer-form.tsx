"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { createBuyer, updateBuyer } from "@/lib/actions"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Buyer name must be at least 2 characters.",
  }),
  contact: z.string().optional(),
})

interface BuyerFormProps {
  initialData?: {
    id: string
    name: string
    contact?: string
  }
  onSuccess?: () => void
}

export function BuyerForm({ initialData, onSuccess }: BuyerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const isEditing = !!initialData

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      contact: initialData?.contact || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", values.name)
      if (values.contact) {
        formData.append("contact", values.contact)
      }

      let result
      if (isEditing && initialData) {
        result = await updateBuyer(initialData.id, formData)
      } else {
        result = await createBuyer(formData)
      }

      if (result.success) {
        toast({
          title: isEditing ? "Buyer updated" : "Buyer created",
          description: result.message,
        })

        if (!isEditing) {
          form.reset({ name: "", contact: "" })
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
              <FormLabel>Buyer Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter buyer name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter contact information" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isEditing ? "Update Buyer" : "Add Buyer"}
        </Button>
      </form>
    </Form>
  )
}

