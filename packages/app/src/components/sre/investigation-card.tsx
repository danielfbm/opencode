import { createSignal, Show } from "solid-js"
import { A, useParams } from "@solidjs/router"
import type { Investigation } from "../../pages/sre/types"
import { StatusBadge } from "./status-badge"

interface Props {
  investigation: Investigation
  onDelete: (id: string) => void
}

export function InvestigationCard(props: Props) {
  const params = useParams()
  const [menuOpen, setMenuOpen] = createSignal(false)

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m`
    return "< 1m"
  }

  const duration = () => {
    const end = props.investigation.completedAt ?? props.investigation.updatedAt
    if (end) return formatDuration(end - props.investigation.startedAt)
    const current = Date.now()
    const diff = Math.max(current - props.investigation.startedAt, 0)
    return formatDuration(diff)
  }

  const startedDate = () => {
    return new Date(props.investigation.startedAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }

  return (
    <div class="sre-card relative hover:shadow-md transition-shadow">
      <div class="sre-card-title">
        <div class="flex items-center gap-2 min-w-0">
          <A
            href={`/${params.dir}/investigations/${props.investigation.id}`}
            class="hover:text-[rgb(var(--aui-color-blue-rgb))] transition-colors truncate"
          >
            {props.investigation.name}
          </A>

        </div>
        <div class="relative">
          <button
            class="p-1 rounded hover:bg-[var(--aui-color-n-8)] text-[var(--aui-color-n-4)]"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setMenuOpen(!menuOpen())
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>

          <Show when={menuOpen()}>
            <div
              class="absolute right-0 top-full mt-1 w-32 bg-[var(--aui-color-surface)] border border-[var(--aui-color-border)] rounded shadow-lg z-10 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                class="w-full text-left px-3 py-2 text-sm text-[var(--aui-color-red)] hover:bg-[var(--aui-color-n-9)] flex items-center gap-2"
                onClick={() => {
                  props.onDelete(props.investigation.id)
                  setMenuOpen(false)
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </button>
            </div>
            <div
              class="fixed inset-0 z-0"
              onClick={() => setMenuOpen(false)}
            />
          </Show>
        </div>
      </div>

      <div class="flex items-center gap-3 mb-4 text-xs text-[var(--aui-color-n-4)]">
        <span><Show when={props.investigation.hasInvestigation}>
            <StatusBadge status={props.investigation.status} size="sm" />
          </Show></span>
        <span>{duration()}</span>
        <span>•</span>
        <span>{startedDate()}</span>
      </div>

      <p class="text-sm text-[var(--aui-color-n-3)] line-clamp-3 mb-4">
        {props.investigation.description}
      </p>

      <div class="flex items-center gap-2 text-xs font-medium text-[var(--aui-color-n-4)]">
        <Show when={props.investigation.affectedService}>
          <span class="bg-[var(--aui-color-n-9)] px-2 py-1 rounded border border-[var(--aui-color-n-8)]">
            {props.investigation.affectedService}
          </span>
        </Show>
      </div>
    </div>
  )
}
