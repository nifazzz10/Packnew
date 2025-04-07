"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { createPackingEntry, updatePackingEntry } from "@/lib/actions"
import type { Worker, Item } from "@/lib/supabase"
import { StockConflictDialog } from "./stock-conflict-dialog"

const formSchema = z.object({
  worker_id: z.string({
    required_error: "Please select a worker",
  }),
  item_id: z.string({
    required_error: "Please select an item",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  quantity: z.coerce.number().positive({
    message: "Quantity must be a positive number",
  }),
  rate: z.coerce.number().positive({
    message: "Rate must be a positive number",
  }),
  company: z.enum(["NCC", "ICD", "CC"], {
    required_error: "Please select a company",
  }),
})

interface PackingEntryFormProps {
  workers: Worker[]
  items: Item[]
  initialData?: {
    id: string
    worker_id: string
    item_id: string
    date: string
    quantity: number
    rate: number
    company: "NCC" | "ICD" | "CC"
  }
}

export function PackingEntryForm({ workers, items, initialData }: PackingEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const { toast } = useToast()
  const router = useRouter()
  const isEditing = !!initialData
  const [stockConflictOpen, setStockConflictOpen] = useState(false)
  const [stockConflictDetails, setStockConflictDetails] = useState<any>(null)
  const [pendingFormValues, setPendingFormValues] = useState<z.infer<typeof formSchema> | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      worker_id: initialData?.worker_id || "",
      item_id: initialData?.item_id || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      quantity: initialData?.quantity || 0,
      rate: initialData?.rate || 0,
      company: initialData?.company || "NCC",
    },
  })

  const quantity = form.watch("quantity")
  const rate = form.watch("rate")

  useEffect(() => {
    const calculatedTotal = (quantity || 0) * (rate || 0)
    setTotal(calculatedTotal)
  }, [quantity, rate])

  const handleConflictResolved = async () => {
    // After resolving the conflict, retry the update operation with the pending values
    if (pendingFormValues && initialData) {
      try {
        const result = await updatePackingEntry(initialData.id, pendingFormValues)

        if (result.success) {
          toast({
            title: "Entry updated",
            description: result.message,
          })

          router.push("/")
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
        setPendingFormValues(null)
      }
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      let result
      if (isEditing && initialData) {
        result = await updatePackingEntry(initialData.id, values)
      } else {
        result = await createPackingEntry(values)
      }

      if (result.success) {
        toast({
          title: isEditing ? "Entry updated" : "Entry created",
          description: result.message,
        })

        router.push("/")
      } else {
        // Check if this is a stock conflict
        if (result.type === "STOCK_CONFLICT") {
          setStockConflictDetails(result.details)
          setPendingFormValues(values)
          setStockConflictOpen(true)
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          })
        }
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
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="worker_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Worker Name</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select worker" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id}>
                          {worker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="item_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NCC">NCC</SelectItem>
                      <SelectItem value="ICD">ICD</SelectItem>
                      <SelectItem value="CC">CC</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter quantity" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter rate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="border rounded-md p-4 bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Value:</span>
              <span className="text-xl font-bold">₹{total}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isEditing ? "Update Entry" : "Create Entry"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>

      {stockConflictDetails && (
        <StockConflictDialog
          open={stockConflictOpen}
          onOpenChange={setStockConflictOpen}
          details={stockConflictDetails}
          onResolve={handleConflictResolved}
          type="update"
        />
      )}
    </>
  )
}

