import { Badge } from "@/components/ui/badge"
import { typeMeta } from "@/lib/pokemon-meta"
import { cn } from "@/lib/utils"

export function TypeBadge({
  type,
  compact = false,
  className,
}: {
  type: string
  compact?: boolean
  className?: string
}) {
  const meta = typeMeta(type)
  const Icon = meta.icon

  return (
    <Badge
      className={cn(
        "border-white/15 text-white shadow-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]",
        compact ? "h-5 px-2 text-[0.65rem]" : "h-6 px-2.5",
        className
      )}
      style={{ backgroundColor: `${meta.color}d9` }}
    >
      <Icon data-icon="inline-start" />
      {meta.label}
    </Badge>
  )
}
