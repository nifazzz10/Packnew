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
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { createSale } from "@/lib/actions"
import type { Buyer } from "@/lib/supabase"

const formSchema = z.object({
  item_id: z.string({
    required_error: "Please select an item",
  }),
  buyer_id: z.string({
    required_error: "Please select a buyer",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  quantity: z.coerce
    .number()
    .positive({
      message: "Quantity must be a positive number",
    })
    .refine((val) => val <= 1000, {
      message: "Quantity cannot exceed available stock",
    }),
  rate: z.coerce.number().positive({
    message: "Rate must be a positive number",
  }),
})

interface SalesFormProps {
  buyers: Buyer[]
  stockItems: {
    id: string
    name: string
    inStock: number
    avgRate: number
  }[]
  onSuccess?: () => void
}

export function SalesForm({ buyers, stockItems, onSuccess }: SalesFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [maxQuantity, setMaxQuantity] = useState<number>(0)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_id: "",
      buyer_id: "",
      date: new Date(),
      quantity: 0,
      rate: 0,
    },
  })

  const quantity = form.watch("quantity")
  const rate = form.watch("rate")
  const itemId = form.watch("item_id")

  // Update total when quantity or rate changes
  useEffect(() => {
    const calculatedTotal = (quantity || 0) * (rate || 0)
    setTotal(calculatedTotal)
  }, [quantity, rate])

  // Update rate and max quantity when item changes
  useEffect(() => {
    if (itemId) {
      const selectedStockItem = stockItems.find((item) => item.id === itemId)
      if (selectedStockItem) {
        setSelectedItem(itemId)
        setMaxQuantity(selectedStockItem.inStock)
        form.setValue("rate", selectedStockItem.avgRate)

        // Update the quantity validation
        form.clearErrors("quantity")
      }
    }
  }, [itemId, stockItems, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Check if quantity exceeds available stock
    const selectedStockItem = stockItems.find((item) => item.id === values.item_id)
    if (!selectedStockItem || values.quantity > selectedStockItem.inStock) {
      form.setError("quantity", {
        type: "manual",
        message: `Quantity cannot exceed available stock (${selectedStockItem?.inStock || 0})`,
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await createSale(values)

      if (result.success) {
        toast({
          title: "Sale recorded",
          description: result.message,
        })

        form.reset({
          item_id: "",
          buyer_id: "",
          date: new Date(),
          quantity: 0,
          rate: 0,
        })

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="item_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stockItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.inStock} in stock)
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
            name="buyer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buyer</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select buyer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {buyers.map((buyer) => (
                      <SelectItem key={buyer.id} value={buyer.id}>
                        {buyer.name}
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter quantity" {...field} max={maxQuantity} />
                </FormControl>
                {selectedItem && <p className="text-xs text-muted-foreground">Available: {maxQuantity} units</p>}
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
            <span className="text-xl font-bold">₹{total.toFixed(2)}</span>
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          Record Sale
        </Button>
      </form>
    </Form>
  )
}

