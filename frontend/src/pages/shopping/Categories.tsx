import { useEffect, useState } from "react"
import { Grid2x2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { categoryService } from "@/services/category.service"
import type { CategoryNode } from "@/types/api.types"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { ErrorState } from "@/components/common/ErrorState"
import { getApiErrorMessage } from "@/lib/apiError"

function countDescendants(c: CategoryNode): number {
  const ch = c.children ?? []
  if (!ch.length) return 1
  return ch.reduce((acc, x) => acc + countDescendants(x), 0)
}

export default function Categories() {
  const [roots, setRoots] = useState<CategoryNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await categoryService.getRoots()
        if (!data.success || !data.result) throw new Error(data.message)
        setRoots(data.result)
      } catch (e) {
        setError(getApiErrorMessage(e))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <LoadingSpinner label="Loading categories..." />
  if (error) return <ErrorState message={error} />

  return (
    <div className="container py-8">
      <div className="mb-12">
        <h1 className="mb-2 flex items-center gap-2 text-4xl font-bold">
          <Grid2x2 className="h-10 w-10" />
          Categories
        </h1>
        <p className="text-lg text-muted-foreground">Data from GET /categories/roots</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roots.map((category) => (
          <Card key={category.id} className="overflow-hidden transition-shadow hover:shadow-lg">
            <div className="bg-gradient-to-br from-primary/20 to-secondary p-8 text-center">
              <h2 className="text-2xl font-bold">{category.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{category.description || "Không có mô tả"}</p>
            </div>
            <div className="space-y-3 p-6">
              <p className="text-sm text-muted-foreground">~{countDescendants(category)} category branches</p>
              <Button className="w-full" asChild>
                <Link to={`/products?categoryId=${category.id}`}>View products</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {!roots.length ? <p className="py-12 text-center text-muted-foreground">No root categories yet.</p> : null}
    </div>
  )
}
