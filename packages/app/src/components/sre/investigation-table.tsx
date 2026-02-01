import { For, Show } from "solid-js"
import { useNavigate } from "@solidjs/router"
import type { Investigation } from "../../pages/sre/types"
import { StatusBadge } from "./status-badge"

interface Props {
  investigations: Investigation[]
  onDelete: (id: string) => void
}

export function InvestigationTable(props: Props) {
  const navigate = useNavigate()

  const formatDuration = (start: number, end?: number) => {
    const ms = (end || Date.now()) - start
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  const formatDate = (ms: number) => {
    return new Date(ms).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    })
  }

  return (
    <div class="w-full overflow-x-auto border border-[var(--aui-color-border)] rounded bg-[var(--aui-color-surface)]">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-[var(--aui-color-border)] text-xs font-semibold text-[var(--aui-color-n-4)] uppercase bg-[var(--aui-color-n-9)]">
            <th class="px-4 py-3 w-[240px]">Investigation</th>
            <th class="px-4 py-3 w-[120px]">Status</th>
            <th class="px-4 py-3">Description</th>
            <th class="px-4 py-3 w-[160px]">Started</th>
            <th class="px-4 py-3 w-[100px]">Duration</th>
            <th class="px-4 py-3 w-[60px]"></th>
          </tr>
        </thead>
        <tbody>
          <For each={props.investigations}>
            {(inv) => (
              <tr 
                class="border-b border-[var(--aui-color-border)] last:border-0 hover:bg-[var(--aui-color-n-9)] cursor-pointer transition-colors"
                onClick={() => navigate(`/investigations/${inv.id}`)}
              >
                <td class="px-4 py-3">
                  <div class="font-medium text-[var(--aui-color-n-1)]">{inv.name}</div>
                  <div class="text-xs text-[var(--aui-color-n-4)] mt-0.5">{inv.id}</div>
                </td>
                <td class="px-4 py-3">
                  <StatusBadge status={inv.status} size="sm" />
                </td>
                <td class="px-4 py-3">
                  <p class="text-sm text-[var(--aui-color-n-3)] line-clamp-2 max-w-[400px]">
                    {inv.description}
                  </p>
                </td>
                <td class="px-4 py-3 text-sm text-[var(--aui-color-n-3)]">
                  {formatDate(inv.startedAt)}
                </td>
                <td class="px-4 py-3 text-sm text-[var(--aui-color-n-3)]">
                  {formatDuration(inv.startedAt, inv.completedAt)}
                </td>
                <td class="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    class="p-1.5 rounded hover:bg-[var(--aui-color-n-8)] text-[var(--aui-color-n-4)] hover:text-[var(--aui-color-red)] transition-colors"
                    title="Delete"
                    onClick={() => props.onDelete(inv.id)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <Show when={props.investigations.length === 0}>
        <div class="p-8 text-center text-[var(--aui-color-n-4)] text-sm">
          No investigations found
        </div>
      </Show>
    </div>
  )
}
