"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import type { Worker, Item, Company } from "@/lib/supabase"

interface FilterBarProps {
  workers: Worker[]
  items: Item[]
  onFilter: (filters: {
    workerId?: string
    itemId?: string
    company?: Company
    searchTerm?: string
  }) => void
}

export function FilterBar({ workers, items, onFilter }: FilterBarProps) {
  const [workerId, setWorkerId] = useState<string>("all")
  const [itemId, setItemId] = useState<string>("all")
  const [company, setCompany] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")

  const handleApplyFilters = () => {
    onFilter({
      workerId: workerId !== "all" ? workerId : undefined,
      itemId: itemId !== "all" ? itemId : undefined,
      company: company !== "all" ? (company as Company) : undefined,
      searchTerm: searchTerm || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Select value={workerId} onValueChange={setWorkerId}>
          <SelectTrigger>
            <SelectValue placeholder="Worker" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Workers</SelectItem>
            {workers.map((worker) => (
              <SelectItem key={worker.id} value={worker.id}>
                {worker.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={company} onValueChange={(value) => setCompany(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            <SelectItem value="NCC">NCC</SelectItem>
            <SelectItem value="ICD">ICD</SelectItem>
            <SelectItem value="CC">CC</SelectItem>
          </SelectContent>
        </Select>

        <Select value={itemId} onValueChange={setItemId}>
          <SelectTrigger>
            <SelectValue placeholder="Item" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            {items.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <Button type="button" onClick={handleApplyFilters} className="w-full sm:w-auto">
        Apply Filters
      </Button>
    </div>
  )
}

