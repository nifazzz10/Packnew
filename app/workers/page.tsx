import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WorkerForm } from "@/components/worker-form"
import { WorkerList } from "@/components/worker-list"
import { getWorkers } from "@/lib/data"

export default async function WorkersPage() {
  const workers = await getWorkers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Workers Management</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Worker</CardTitle>
            <CardDescription>Add a new worker to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <WorkerForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workers List</CardTitle>
            <CardDescription>Manage existing workers</CardDescription>
          </CardHeader>
          <CardContent>
            <WorkerList workers={workers} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

