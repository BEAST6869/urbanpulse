import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight animate-fade-in-up">{title}</h1>
      {subtitle && <p className="text-muted-foreground animate-fade-in mt-1">{subtitle}</p>}
    </div>
  )
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow",
        className
      )}
      {...props}
    />
  )
}

export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </div>
  )
}

