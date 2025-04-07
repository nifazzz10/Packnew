
// import { revalidatePath } from "next/cache"
import { getSupabaseClient } from "./supabase"

// Update the createWorker function to include user ID
export async function createWorker(formData: FormData) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database connection not available",
    }
  }

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      message: "User not authenticated",
    }
  }

  const name = formData.get("name") as string

  const { data, error } = await supabase
    .from("workers")
    .insert([{ name, user_id: user.id }])
    .select()

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }



  return {
    success: true,
    message: `Worker ${name} created successfully`,
    data: data[0],
  }
}

export async function updateWorker(id: string, formData: FormData) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database connection not available",
    }
  }

  const name = formData.get("name") as string

  const { data, error } = await supabase.from("workers").update({ name }).eq("id", id).select()

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

  

  return {
    success: true,
    message: `Worker ${name} updated successfully`,
    data: data[0],
  }
}

export async function deleteWorker(id: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database connection not available",
    }
  }

  const { error } = await supabase.from("workers").delete().eq("id", id)

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

  

  return {
    success: true,
    message: "Worker deleted successfully",
  }
}

// Update the createItem function to include user ID
export async function createItem(formData: FormData) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database connection not available",
    }
  }

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      message: "User not authenticated",
    }
  }

  const name = formData.get("name") as string

  const { data, error } = await supabase
    .from("items")
    .insert([{ name, user_id: user.id }])
    .select()

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

   

  return {
    success: true,
    message: `Item ${name} created successfully`,
    data: data[0],
  }
}

export async function updateItem(id: string, formData: FormData) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database connection not available",
    }
  }

  const name = formData.get("name") as string

  const { data, error } = await supabase.from("items").update({ name }).eq("id", id).select()

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

   

  return {
    success: true,
    message: `Item ${name} updated successfully`,
    data: data[0],
  }
}

export async function deleteItem(id: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database connection not available",
    }
  }

  const { error } = await supabase.from("items").delete().eq("id", id)

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

   

  return {
    success: true,
    message: "Item deleted successfully",
  }
}

// Update the createBuyer function to include user ID
export async function createBuyer(formData: FormData) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database connection not available",
    }
  }

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      message: "User not authenticated",
    }
  }

  const name = formData.get("name") as string
  const contact = (formData.get("contact") as string) || null

  const { data, error } = await supabase
    .from("buyers")
    .insert([{ name, contact, user_id: user.id }])
    .select()

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

    

  return {
    success: true,
    message: `Buyer ${name} created successfully`,
    data: data[0],
  }
}

export async function updateBuyer(id: string, formData: FormData) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database connection not available",
    }
  }

  const name = formData.get("name") as string
  const contact = (formData.get("contact") as string) || null

  const { data, error } = await supabase.from("buyers").update({ name, contact }).eq("id", id).select()

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

    

  return {
    success: true,
    message: `Buyer ${name} updated successfully`,
    data: data[0],
  }
}

export async function deleteBuyer(id: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database connection not available",
    }
  }

  const { error } = await supabase.from("buyers").delete().eq("id", id)

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

    

  return {
    success: true,
    message: "Buyer deleted successfully",
  }
}

// Update the createPackingEntry function to include user ID
export async function createPackingEntry(data: {
  worker_id: string
  item_id: string
  date: Date
  quantity: number
  rate: number
  company: "NCC" | "ICD" | "CC"
}) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database connection not available",
    }
  }

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      message: "User not authenticated",
    }
  }

  // Check if quantity exceeds available stock
  const { data: stockLevel, error: stockError } = await supabase
    .from("items")
    .select("id, name")
    .eq("id", data.item_id)
    .single()

  if (stockError) {
    return {
      success: false,
      message: "Error checking stock level: " + stockError.message,
    }
  }

  const formattedDate = data.date.toISOString().split("T")[0]

  const { error } = await supabase.from("packing_entries").insert([
    {
      worker_id: data.worker_id,
      item_id: data.item_id,
      date: formattedDate,
      quantity: data.quantity,
      rate: data.rate,
      company: data.company,
      user_id: user.id,
    },
  ])

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

  

  return {
    success: true,
    message: "Packing entry created successfully",
  }
}

export async function updatePackingEntry(
  id: string,
  data: {
    worker_id: string
    item_id: string
    date: Date
    quantity: number
    rate: number
    company: "NCC" | "ICD" | "CC"
  },
) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database connection not available",
    }
  }

  const formattedDate = data.date.toISOString().split("T")[0]

  const { error } = await supabase
    .from("packing_entries")
    .update({
      worker_id: data.worker_id,
      item_id: data.item_id,
      date: formattedDate,
      quantity: data.quantity,
      rate: data.rate,
      company: data.company,
    })
    .eq("id", id)

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }


  return {
    success: true,
    message: "Packing entry updated successfully",
  }
}

export async function deletePackingEntry(id: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database connection not available",
    }
  }

  // Get the packing entry to be deleted
  const { data: entryData, error: entryError } = await supabase
    .from("packing_entries")
    .select("item_id, quantity")
    .eq("id", id)
    .single()

  if (entryError) {
    return {
      success: false,
      message: "Error fetching packing entry: " + entryError.message,
    }
  }

  // Get total packed quantity
  const { data: packedData, error: packedError } = await supabase
    .from("packing_entries")
    .select("quantity")
    .eq("item_id", entryData.item_id)

  if (packedError) {
    return {
      success: false,
      message: "Error checking packed quantity: " + packedError.message,
    }
  }

  // Get total sold quantity
  const { data: soldData, error: soldError } = await supabase
    .from("sales")
    .select("quantity")
    .eq("item_id", entryData.item_id)

  if (soldError) {
    return {
      success: false,
      message: "Error checking sold quantity: " + soldError.message,
    }
  }

  const totalPacked = packedData.reduce((sum, entry) => sum + entry.quantity, 0)
  const totalSold = soldData.reduce((sum, sale) => sum + sale.quantity, 0)
  const availableStock = totalPacked - totalSold

  // Check if deleting the entry would result in negative stock
  if (availableStock - entryData.quantity < 0) {
    // Get affected sales
    const { data: affectedSales, error: affectedSalesError } = await supabase
      .from("sales")
      .select("id, quantity, date, buyers(name), items(name)")
      .eq("item_id", entryData.item_id)

    if (affectedSalesError) {
      return {
        success: false,
        message: "Error fetching affected sales: " + affectedSalesError.message,
      }
    }

    const sales = affectedSales.map((sale) => ({
      id: sale.id,
      quantity: sale.quantity,
      date: sale.date,
      buyer: sale.buyers?.name || "Unknown",
      item: sale.items?.name || "Unknown",
    }))

    return {
      success: false,
      type: "STOCK_CONFLICT",
      message: "Deleting this entry would result in negative stock. Please adjust sales.",
      details: {
        deficit: entryData.quantity - availableStock,
        affectedSales: sales,
        itemId: entryData.item_id,
        itemName: stockLevel?.name || "Unknown",
        entryQuantity: entryData.quantity,
      },
    }
  }

  // Proceed with deletion if no stock conflict
  const { error } = await supabase.from("packing_entries").delete().eq("id", id)

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

 

  return {
    success: true,
    message: "Packing entry deleted successfully",
  }
}

// Update the createSale function to include user ID
export async function createSale(data: {
  item_id: string
  buyer_id: string
  date: Date
  quantity: number
  rate: number
}) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database connection not available",
    }
  }

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      message: "User not authenticated",
    }
  }

  // Check if quantity exceeds available stock
  // Get total packed quantity
  const { data: packedData, error: packedError } = await supabase
    .from("packing_entries")
    .select("quantity")
    .eq("item_id", data.item_id)

  if (packedError) {
    return {
      success: false,
      message: "Error checking packed quantity: " + packedError.message,
    }
  }

  // Get total sold quantity
  const { data: soldData, error: soldError } = await supabase
    .from("sales")
    .select("quantity")
    .eq("item_id", data.item_id)

  if (soldError) {
    return {
      success: false,
      message: "Error checking sold quantity: " + soldError.message,
    }
  }

  const totalPacked = packedData.reduce((sum, entry) => sum + entry.quantity, 0)
  const totalSold = soldData.reduce((sum, sale) => sum + sale.quantity, 0)
  const availableStock = totalPacked - totalSold

  if (data.quantity > availableStock) {
    return {
      success: false,
      message: `Cannot sell ${data.quantity} items. Only ${availableStock} items available in stock.`,
    }
  }

  const formattedDate = data.date.toISOString().split("T")[0]

  const { error } = await supabase.from("sales").insert([
    {
      item_id: data.item_id,
      buyer_id: data.buyer_id,
      date: formattedDate,
      quantity: data.quantity,
      rate: data.rate,
      user_id: user.id,
    },
  ])

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

  

  return {
    success: true,
    message: "Sale recorded successfully",
  }
}

export async function deleteSale(id: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database connection not available",
    }
  }

  const { error } = await supabase.from("sales").delete().eq("id", id)

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }



  return {
    success: true,
    message: "Sale deleted successfully",
  }
}

export async function adjustSales(
  itemId: string,
  salesToDelete: string[],
  salesToAdjust: { id: string; newQuantity: number }[],
) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database connection not available",
    }
  }

  try {
    // Delete sales
    if (salesToDelete.length > 0) {
      const { error: deleteError } = await supabase.from("sales").delete().in("id", salesToDelete)

      if (deleteError) {
        return {
          success: false,
          message: "Error deleting sales: " + deleteError.message,
        }
      }
    }

    // Adjust sales quantities
    if (salesToAdjust.length > 0) {
      for (const sale of salesToAdjust) {
        const { error: updateError } = await supabase
          .from("sales")
          .update({ quantity: sale.newQuantity })
          .eq("id", sale.id)

        if (updateError) {
          return {
            success: false,
            message: `Error updating sale ${sale.id}: ` + updateError.message,
          }
        }
      }
    }

   

    return {
      success: true,
      message: "Sales adjusted successfully",
    }
  } catch (error) {
    console.error("Error adjusting sales:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
    }
  }
}

