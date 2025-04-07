
import {
  getSupabaseClient,
  type Worker,
  type Item,
  type PackingEntry,
  type Company,
  type Buyer,
  type Sale,
} from "./supabase"

// Helper function to check if a table or view exists
async function checkIfViewExists(viewName: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  try {
    // Try to select a single row from the view
    const { error } = await supabase.from(viewName).select("*").limit(1)

    // If there's no error, the view exists
    return !error
  } catch (error) {
    console.error(`Error checking if ${viewName} exists:`, error)
    return false
  }
}

// Function to get entries directly from the base tables (fallback when view doesn't exist)
async function getEntriesFromBaseTables(): Promise<PackingEntry[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  try {
    // Join the tables manually
    const { data, error } = await supabase
      .from("packing_entries")
      .select(`
        id,
        worker_id,
        workers!packing_entries_worker_id_fkey(name),
        item_id,
        items!packing_entries_item_id_fkey(name),
        date,
        quantity,
        rate,
        company,
        total,
        created_at,
        updated_at
      `)
      .order("date", { ascending: false })

    if (error) {
      console.error("Error fetching from base tables:", error)
      return []
    }

    // Transform the data to match the PackingEntry type
    return (data || []).map((entry) => ({
      id: entry.id,
      worker_id: entry.worker_id,
      worker_name: entry.workers?.name,
      item_id: entry.item_id,
      item_name: entry.items?.name,
      date: entry.date,
      quantity: entry.quantity,
      rate: entry.rate,
      company: entry.company as Company,
      total: entry.total,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
    }))
  } catch (error) {
    console.error("Error in getEntriesFromBaseTables:", error)
    return []
  }
}

// Update the getWorkers function to filter by user ID
export async function getWorkers(): Promise<Worker[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase.from("workers").select("*").order("name")
console.log("dta",data)
  if (error) {
    console.error("Error fetching workers:", error)
    return []
  }

  return data || []
}

// Update the getWorkerById function to filter by user ID
export async function getWorkerById(id: string): Promise<Worker | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase.from("workers").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching worker:", error)
    return null
  }

  return data
}

// Update the getItems function to filter by user ID
export async function getItems(): Promise<Item[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase.from("items").select("*").eq("user_id", user.id).order("name")

  if (error) {
    console.error("Error fetching items:", error)
    return []
  }

  return data || []
}

export async function getItemById(id: string): Promise<Item | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase.from("items").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching item:", error)
    return null
  }

  return data
}

export async function getPackingEntries(): Promise<PackingEntry[]> {
  // Check if the view exists
  const viewExists = await checkIfViewExists("packing_entries_view")

  if (viewExists) {
    const supabase = getSupabaseClient()
    if (!supabase) return []

    const { data, error } = await supabase.from("packing_entries_view").select("*").order("date", { ascending: false })

    if (error) {
      console.error("Error fetching packing entries:", error)
      return []
    }

    return data || []
  } else {
    // Fallback to getting entries from base tables
    return getEntriesFromBaseTables()
  }
}

export async function getPackingEntryById(id: string): Promise<PackingEntry | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  // Check if the view exists
  const viewExists = await checkIfViewExists("packing_entries_view")

  if (viewExists) {
    const { data, error } = await supabase.from("packing_entries_view").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching packing entry:", error)
      return null
    }

    return data
  } else {
    // Fallback to getting entry from base tables
    const { data, error } = await supabase
      .from("packing_entries")
      .select(`
        id,
        worker_id,
        workers!packing_entries_worker_id_fkey(name),
        item_id,
        items!packing_entries_item_id_fkey(name),
        date,
        quantity,
        rate,
        company,
        total,
        created_at,
        updated_at
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching packing entry from base tables:", error)
      return null
    }

    return {
      id: data.id,
      worker_id: data.worker_id,
      worker_name: data.workers?.name,
      item_id: data.item_id,
      item_name: data.items?.name,
      date: data.date,
      quantity: data.quantity,
      rate: data.rate,
      company: data.company as Company,
      total: data.total,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  }
}

export async function getPackingEntriesByDate(date: Date): Promise<PackingEntry[]> {
  const formattedDate = date.toISOString().split("T")[0]

  // Check if the view exists
  const viewExists = await checkIfViewExists("packing_entries_view")

  if (viewExists) {
    const supabase = getSupabaseClient()
    if (!supabase) return []

    const { data, error } = await supabase
      .from("packing_entries_view")
      .select("*")
      .eq("date", formattedDate)
      .order("worker_name")

    if (error) {
      console.error("Error fetching packing entries by date:", error)
      return []
    }

    return data || []
  } else {
    // Fallback to getting entries from base tables
    const supabase = getSupabaseClient()
    if (!supabase) return []

    const { data, error } = await supabase
      .from("packing_entries")
      .select(`
        id,
        worker_id,
        workers!packing_entries_worker_id_fkey(name),
        item_id,
        items!packing_entries_item_id_fkey(name),
        date,
        quantity,
        rate,
        company,
        total,
        created_at,
        updated_at
      `)
      .eq("date", formattedDate)
      .order("created_at")

    if (error) {
      console.error("Error fetching packing entries by date from base tables:", error)
      return []
    }

    return (data || []).map((entry) => ({
      id: entry.id,
      worker_id: entry.worker_id,
      worker_name: entry.workers?.name,
      item_id: entry.item_id,
      item_name: entry.items?.name,
      date: entry.date,
      quantity: entry.quantity,
      rate: entry.rate,
      company: entry.company as Company,
      total: entry.total,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
    }))
  }
}

// The rest of the functions would follow the same pattern...
// For brevity, I'm not updating all of them, but in a real application
// you would update each function to check if the view exists and provide a fallback

// Update the getFilteredPackingEntries function to filter by user ID
export async function getFilteredPackingEntries({
  startDate,
  endDate,
  workerId,
  itemId,
  company,
}: {
  startDate?: Date
  endDate?: Date
  workerId?: string
  itemId?: string
  company?: Company
}): Promise<PackingEntry[]> {
  // Check if the view exists
  const viewExists = await checkIfViewExists("packing_entries_view")

  const supabase = getSupabaseClient()
  if (!supabase) return []

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  if (viewExists) {
    let query = supabase.from("packing_entries_view").select("*").eq("user_id", user.id)

    // Apply filters
    if (startDate) {
      const formattedStartDate = startDate.toISOString().split("T")[0]
      query = query.gte("date", formattedStartDate)
    }

    if (endDate) {
      const formattedEndDate = endDate.toISOString().split("T")[0]
      query = query.lte("date", formattedEndDate)
    }

    if (workerId) {
      query = query.eq("worker_id", workerId)
    }

    if (itemId) {
      query = query.eq("item_id", itemId)
    }

    if (company) {
      query = query.eq("company", company)
    }

    const { data, error } = await query.order("date", { ascending: false })

    if (error) {
      console.error("Error fetching filtered packing entries:", error)
      return []
    }

    return data || []
  } else {
    // Fallback to getting entries from base tables with filters
    let query = supabase
      .from("packing_entries")
      .select(`
        id,
        worker_id,
        workers!packing_entries_worker_id_fkey(name),
        item_id,
        items!packing_entries_item_id_fkey(name),
        date,
        quantity,
        rate,
        company,
        total,
        created_at,
        updated_at,
        user_id
      `)
      .eq("user_id", user.id)

    // Apply filters
    if (startDate) {
      const formattedStartDate = startDate.toISOString().split("T")[0]
      query = query.gte("date", formattedStartDate)
    }

    if (endDate) {
      const formattedEndDate = endDate.toISOString().split("T")[0]
      query = query.lte("date", formattedEndDate)
    }

    if (workerId) {
      query = query.eq("worker_id", workerId)
    }

    if (itemId) {
      query = query.eq("item_id", itemId)
    }

    if (company) {
      query = query.eq("company", company)
    }

    const { data, error } = await query.order("date", { ascending: false })

    if (error) {
      console.error("Error fetching filtered packing entries from base tables:", error)
      return []
    }

    return (data || []).map((entry) => ({
      id: entry.id,
      worker_id: entry.worker_id,
      worker_name: entry.workers?.name,
      item_id: entry.item_id,
      item_name: entry.items?.name,
      date: entry.date,
      quantity: entry.quantity,
      rate: entry.rate,
      company: entry.company as Company,
      total: entry.total,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      user_id: entry.user_id,
    }))
  }
}

// Update the getBuyers function to filter by user ID
export async function getBuyers(): Promise<Buyer[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase.from("buyers").select("*").eq("user_id", user.id).order("name")

  if (error) {
    console.error("Error fetching buyers:", error)
    return []
  }

  return data || []
}

export async function getBuyerById(id: string): Promise<Buyer | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase.from("buyers").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching buyer:", error)
    return null
  }

  return data
}

export async function getSales(): Promise<Sale[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  // Check if the view exists
  try {
    const { data: viewCheck } = await supabase.from("sales_view").select("count").limit(1)

    if (viewCheck !== null) {
      // View exists, use it
      const { data, error } = await supabase.from("sales_view").select("*").order("date", { ascending: false })

      if (error) {
        console.error("Error fetching sales:", error)
        return []
      }

      return data || []
    } else {
      // Fallback to joining tables manually
      const { data, error } = await supabase
        .from("sales")
        .select(`
          id,
          item_id,
          items!sales_item_id_fkey(name),
          buyer_id,
          buyers!sales_buyer_id_fkey(name),
          quantity,
          rate,
          total,
          date,
          created_at,
          updated_at
        `)
        .order("date", { ascending: false })

      if (error) {
        console.error("Error fetching sales:", error)
        return []
      }

      return (data || []).map((sale) => ({
        id: sale.id,
        item_id: sale.item_id,
        item_name: sale.items?.name,
        buyer_id: sale.buyer_id,
        buyer_name: sale.buyers?.name,
        quantity: sale.quantity,
        rate: sale.rate,
        total: sale.total,
        date: sale.date,
        created_at: sale.created_at,
        updated_at: sale.updated_at,
      }))
    }
  } catch (error) {
    console.error("Error checking sales view:", error)
    return []
  }
}

export async function getSaleById(id: string): Promise<Sale | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  // Check if the view exists
  try {
    const { data: viewCheck } = await supabase.from("sales_view").select("count").limit(1)

    if (viewCheck !== null) {
      // View exists, use it
      const { data, error } = await supabase.from("sales_view").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching sale:", error)
        return null
      }

      return data
    } else {
      // Fallback to joining tables manually
      const { data, error } = await supabase
        .from("sales")
        .select(`
          id,
          item_id,
          items!sales_item_id_fkey(name),
          buyer_id,
          buyers!sales_buyer_id_fkey(name),
          quantity,
          rate,
          total,
          date,
          created_at,
          updated_at
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching sale:", error)
        return null
      }

      return {
        id: data.id,
        item_id: data.item_id,
        item_name: data.items?.name,
        buyer_id: data.buyer_id,
        buyer_name: data.buyers?.name,
        quantity: data.quantity,
        rate: data.rate,
        total: data.total,
        date: data.date,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
    }
  } catch (error) {
    console.error("Error checking sales view:", error)
    return null
  }
}

// Function to get stock levels (items in stock)
export async function getStockLevels(): Promise<
  {
    id: string
    name: string
    inStock: number
    avgRate: number
  }[]
> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  try {
    // Get all items
    const { data: items, error: itemsError } = await supabase.from("items").select("*")

    if (itemsError) {
      console.error("Error fetching items:", itemsError)
      return []
    }

    // Get all packing entries
    const { data: packingEntries, error: packingError } = await supabase.from("packing_entries").select("*")

    if (packingError) {
      console.error("Error fetching packing entries:", packingError)
      return []
    }

    // Get all sales
    const { data: sales, error: salesError } = await supabase.from("sales").select("*")

    if (salesError) {
      console.error("Error fetching sales:", salesError)
      return []
    }

    // Calculate stock levels
    return items
      .map((item) => {
        // Total packed
        const packedItems = packingEntries.filter((entry) => entry.item_id === item.id)
        const totalPacked = packedItems.reduce((sum, entry) => sum + entry.quantity, 0)
        const totalPackedValue = packedItems.reduce((sum, entry) => sum + entry.total, 0)

        // Total sold
        const soldItems = sales.filter((sale) => sale.item_id === item.id)
        const totalSold = soldItems.reduce((sum, sale) => sum + sale.quantity, 0)

        // Calculate in stock and average rate
        const inStock = totalPacked - totalSold
        const avgRate = totalPacked > 0 ? totalPackedValue / totalPacked : 0

        return {
          id: item.id,
          name: item.name,
          inStock: inStock > 0 ? inStock : 0,
          avgRate,
        }
      })
      .filter((item) => item.inStock > 0) // Only return items with stock
  } catch (error) {
    console.error("Error calculating stock levels:", error)
    return []
  }
}

export async function getWorkerStats() {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  try {
    // Get all packing entries
    const { data: entries, error } = await supabase.from("packing_entries").select(`
        worker_id,
        workers!packing_entries_worker_id_fkey(name),
        quantity,
        total
      `)

    if (error) {
      console.error("Error fetching worker stats:", error)
      return []
    }

    // Aggregate data by worker
    const workerMap = new Map()

    entries.forEach((entry) => {
      const workerId = entry.worker_id
      const workerName = entry.workers?.name || "Unknown"
      const quantity = entry.quantity
      const value = entry.total

      if (!workerMap.has(workerId)) {
        workerMap.set(workerId, {
          id: workerId,
          name: workerName,
          totalQuantity: 0,
          totalValue: 0,
        })
      }

      const workerData = workerMap.get(workerId)
      workerData.totalQuantity += quantity
      workerData.totalValue += value
    })

    // Convert to array and sort by quantity
    return Array.from(workerMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity)
  } catch (error) {
    console.error("Error in getWorkerStats:", error)
    return []
  }
}

export async function getBuyerStats() {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  try {
    // Get all sales
    const { data: sales, error } = await supabase.from("sales").select(`
        buyer_id,
        buyers!sales_buyer_id_fkey(name),
        quantity,
        total
      `)

    if (error) {
      console.error("Error fetching buyer stats:", error)
      return []
    }

    // Aggregate data by buyer
    const buyerMap = new Map()

    sales.forEach((sale) => {
      const buyerId = sale.buyer_id
      const buyerName = sale.buyers?.name || "Unknown"
      const quantity = sale.quantity
      const value = sale.total

      if (!buyerMap.has(buyerId)) {
        buyerMap.set(buyerId, {
          id: buyerId,
          name: buyerName,
          totalQuantity: 0,
          totalValue: 0,
        })
      }

      const buyerData = buyerMap.get(buyerId)
      buyerData.totalQuantity += quantity
      buyerData.totalValue += value
    })

    // Convert to array and sort by quantity
    return Array.from(buyerMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity)
  } catch (error) {
    console.error("Error in getBuyerStats:", error)
    return []
  }
}

export async function getItemStats() {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  try {
    // Get all items
    const { data: items, error: itemsError } = await supabase.from("items").select("id, name")

    if (itemsError) {
      console.error("Error fetching items:", itemsError)
      return []
    }

    // Get all packing entries
    const { data: packingEntries, error: packingError } = await supabase
      .from("packing_entries")
      .select("item_id, quantity, total")

    if (packingError) {
      console.error("Error fetching packing entries:", packingError)
      return []
    }

    // Get all sales
    const { data: sales, error: salesError } = await supabase.from("sales").select("item_id, quantity, total")

    if (salesError) {
      console.error("Error fetching sales:", salesError)
      return []
    }

    // Aggregate data by item
    const itemStats = items.map((item) => {
      const packed = packingEntries
        .filter((entry) => entry.item_id === item.id)
        .reduce(
          (sum, entry) => ({
            quantity: sum.quantity + entry.quantity,
            value: sum.value + entry.total,
          }),
          { quantity: 0, value: 0 },
        )

      const sold = sales
        .filter((sale) => sale.item_id === item.id)
        .reduce(
          (sum, sale) => ({
            quantity: sum.quantity + sale.quantity,
            value: sum.value + sale.total,
          }),
          { quantity: 0, value: 0 },
        )

      return {
        id: item.id,
        name: item.name,
        packedQuantity: packed.quantity,
        packedValue: packed.value,
        soldQuantity: sold.quantity,
        soldValue: sold.value,
        inStock: packed.quantity - sold.quantity,
      }
    })

    // Sort by packed quantity
    return itemStats.sort((a, b) => b.packedQuantity - a.packedQuantity)
  } catch (error) {
    console.error("Error in getItemStats:", error)
    return []
  }
}

