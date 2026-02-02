import { createSignal, createMemo, Show, For } from "solid-js"
import { useNavigate, Navigate, useParams } from "@solidjs/router"
import { useInvestigations } from "../../context/investigations"
import { useSreWorkspace } from "../../context/sre-workspace"
import { InvestigationCard } from "../../components/sre/investigation-card"
import { InvestigationTable } from "../../components/sre/investigation-table"
import { DialogConfirmDelete } from "../../components/sre/dialog-confirm-delete"
import { DialogStartInvestigation } from "../../components/sre/dialog-start-investigation"
import { CardSkeletonGrid, TableSkeleton } from "../../components/sre/skeleton"
import type { InvestigationStatus } from "./types"

export default function InvestigationsList() {
  const params = useParams()
  const workspace = useSreWorkspace()

  // Redirect to workspace selection if none selected
  if (!workspace.directory()) {
    return <Navigate href="/workspace" />
  }

  const navigate = useNavigate()
  const { filteredInvestigations, loading, filters, setFilters, deleteInvestigation, createInvestigation } =
    useInvestigations()

  const [viewMode, setViewMode] = createSignal<"grid" | "list">("grid")

  const [deleteId, setDeleteId] = createSignal<string | null>(null)
  const [showStartDialog, setShowStartDialog] = createSignal(false)

  const investigationToDelete = createMemo(() => {
    const id = deleteId()
    if (!id) return null
    return filteredInvestigations().find((inv) => inv.id === id)?.name || "Investigation"
  })

  const investigationData = createMemo(() => filteredInvestigations())

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    const id = deleteId()
    if (id) {
      await deleteInvestigation(id)
      setDeleteId(null)
    }
  }

  return (
    <div class="h-full flex flex-col">
      <div class="text-xs text-[var(--aui-color-n-4)] mb-4">Investigations</div>

      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <button class="sre-btn sre-btn-primary" onClick={() => setShowStartDialog(true)}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="mr-2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Investigation
        </button>
        <div class="ml-auto flex flex-wrap items-center justify-end gap-3">
          <div class="flex items-center bg-[var(--aui-color-surface)] border border-[var(--aui-color-border)] rounded px-3 h-8 w-[240px] focus-within:border-[var(--aui-color-primary)] transition-colors">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--aui-color-n-4)"
              stroke-width="2"
              class="shrink-0"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
              <input
                type="text"
                placeholder="Search investigations..."
                value={filters.search}
                onInput={(e) => {
                  setFilters({ search: e.currentTarget.value })
                }}
                class="border-none outline-none bg-transparent ml-2 text-[13px] text-[var(--aui-color-n-1)] w-full placeholder:text-[var(--aui-color-n-4)]"
              />
          </div>

          <div class="relative group">
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ status: e.currentTarget.value as InvestigationStatus | "all" })
              }}
              class="sre-btn sre-btn-secondary appearance-none pr-8 pl-3"
            >
              <option value="all">All Status</option>
              <option value="in_progress">In Progress</option>
              <option value="concluded">Concluded</option>
              <option value="inconclusive">Inconclusive</option>
              <option value="canceled">Canceled</option>
            </select>
            <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--aui-color-n-4)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div class="relative group">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ sortBy: e.currentTarget.value as any })}
              class="sre-btn sre-btn-secondary appearance-none pr-8 pl-3 min-w-[150px]"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="name_asc">Name A-Z</option>
            </select>
            <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--aui-color-n-4)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div class="flex border border-[var(--aui-color-border)] rounded overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              class={`p-1.5 flex items-center justify-center transition-colors ${
                viewMode() === "grid"
                  ? "bg-[var(--aui-color-n-8)] text-[var(--aui-color-n-1)]"
                  : "bg-[var(--aui-color-surface)] text-[var(--aui-color-n-4)] hover:bg-[var(--aui-color-n-9)]"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              class={`p-1.5 flex items-center justify-center border-l border-[var(--aui-color-border)] transition-colors ${
                viewMode() === "list"
                  ? "bg-[var(--aui-color-n-8)] text-[var(--aui-color-n-1)]"
                  : "bg-[var(--aui-color-surface)] text-[var(--aui-color-n-4)] hover:bg-[var(--aui-color-n-9)]"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="flex-1 min-h-0 relative">
        <Show when={!loading()} fallback={viewMode() === "grid" ? <CardSkeletonGrid /> : <TableSkeleton />}>
          <Show
            when={filteredInvestigations().length > 0}
            fallback={
              <div class="h-full flex flex-col items-center justify-center bg-[var(--aui-color-surface)] rounded border border-[var(--aui-color-border)] p-12 text-center animate-in fade-in duration-300">
                <div class="w-20 h-20 rounded-full bg-[var(--aui-color-n-8)] flex items-center justify-center mb-6">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--aui-color-n-5)"
                    stroke-width="1.5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-[var(--aui-color-n-1)] mb-2">No investigations found</h2>
                <p class="text-[var(--aui-color-n-4)] mb-6 max-w-sm">
                  We couldn't find any investigations matching your filters. Try adjusting your search or filters.
                </p>
                <button
                  class="sre-btn sre-btn-secondary"
                  onClick={() => {
                    setFilters({ search: "", status: "all" })
                  }}
                >
                  Clear Filters
                </button>
              </div>
            }
          >
            <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Show
                when={viewMode() === "grid"}
                fallback={<InvestigationTable investigations={investigationData()} onDelete={handleDelete} />}
              >
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <For each={investigationData()}>
                    {(inv) => <InvestigationCard investigation={inv} onDelete={handleDelete} />}
                  </For>
                </div>
              </Show>
            </div>
          </Show>
        </Show>
      </div>

      <DialogConfirmDelete
        isOpen={!!deleteId()}
        investigationName={investigationToDelete() || ""}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />

      <DialogStartInvestigation
        isOpen={showStartDialog()}
        onClose={() => setShowStartDialog(false)}
        onSubmit={async (data) => {
          const investigation = await createInvestigation({
            description: data.description,
            affectedService: data.affectedService || undefined,
            namespace: data.namespace || undefined,
            cluster: data.cluster || undefined,
          })
          const desc = data.description.trim()
          const service = data.affectedService.trim()
          const namespace = data.namespace.trim()
          const query = new URLSearchParams()
          query.set("start", "1")
          if (desc) query.set("desc", desc)
          if (service) query.set("service", service)
          if (namespace) query.set("namespace", namespace)
          const base = `/${params.dir}/investigations/${investigation.id}`
          const text = query.toString()
          const href = text ? `${base}?${text}` : base
          navigate(href)
        }}
      />
    </div>
  )
}
