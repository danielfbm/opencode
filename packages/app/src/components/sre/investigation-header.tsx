import { A } from "@solidjs/router"
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
        <A 
          href="/investigations" 
          class="hover:text-[var(--aui-color-primary)] transition-colors"
        >
          Investigations
        </A>
        <span>/</span>
        <span class="text-[var(--aui-color-n-2)] truncate max-w-[300px]">
          {props.investigation?.name || "Loading..."}
        </span>
      </div>

      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h1 class="text-xl font-semibold text-[var(--aui-color-n-1)] mb-2 truncate">
            {props.investigation?.name || "Loading..."}
          </h1>
          <p class="text-sm text-[var(--aui-color-n-4)] line-clamp-2">
            {props.investigation?.description}
          </p>
        </div>

        <div class="flex items-center gap-4 shrink-0">
          <div class="flex flex-col items-end gap-1">
            <div class="flex items-center gap-2">
              <span class="text-xs text-[var(--aui-color-n-4)]">Phase:</span>
              <span class="text-sm font-medium text-[var(--aui-color-n-2)]">{phase()}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-[var(--aui-color-n-4)]">Elapsed:</span>
              <span class="text-sm font-medium text-[var(--aui-color-n-2)]">{elapsed()}</span>
            </div>
          </div>
          
          {props.investigation && (
            <StatusBadge status={props.investigation.status} />
          )}
        </div>
      </div>
    </div>
  )
}
