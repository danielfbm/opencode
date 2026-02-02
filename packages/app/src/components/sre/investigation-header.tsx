import { A, useParams } from "@solidjs/router"
import { createMemo } from "solid-js"
import type { Investigation } from "../../pages/sre/types"
import { StatusBadge } from "./status-badge"

interface Props {
  investigation: Investigation | undefined
}

function formatElapsed(startedAt: number, completedAt?: number): string {
  const end = completedAt || Date.now()
  const diff = end - startedAt
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function formatPhase(phase?: string): string {
  if (!phase) return "Unknown"
  return phase.charAt(0) + phase.slice(1).toLowerCase().replace(/_/g, " ")
}

export function InvestigationHeader(props: Props) {
  const params = useParams()
  const href = createMemo(() => (params.dir ? `/${params.dir}/investigations` : "/investigations"))
  const elapsed = createMemo(() => {
    if (!props.investigation) return "—"
    return formatElapsed(props.investigation.startedAt, props.investigation.completedAt)
  })

  const phase = createMemo(() => {
    if (!props.investigation) return "—"
    return formatPhase(props.investigation.currentPhase)
  })

  return (
    <div class="mb-6">
      <div class="flex items-center gap-2 text-xs text-[var(--aui-color-n-4)] mb-3">
        <A href={href()} class="hover:text-[var(--aui-color-primary)] transition-colors">
          Investigations
        </A>
        <span>/</span>
        <span class="text-[var(--aui-color-n-2)] truncate max-w-[300px]">
          {props.investigation?.name || "Loading..."}
        </span>
      </div>
    </div>
  )
}
