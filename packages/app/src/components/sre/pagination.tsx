import { createMemo, For, Show } from "solid-js"

interface Props {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function Pagination(props: Props) {
  const pages = createMemo(() => {
    const total = props.totalPages
    const current = props.currentPage
    
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, "...", total]
    }

    if (current >= total - 3) {
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
    }

    return [1, "...", current - 1, current, current + 1, "...", total]
  })

  return (
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 text-sm text-[var(--aui-color-n-4)]">
      <div class="flex items-center gap-4">
        <span>Total: {props.totalItems}</span>
        
        <div class="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            class="bg-[var(--aui-color-surface)] border border-[var(--aui-color-border)] rounded px-2 py-1 outline-none focus:border-[var(--aui-color-primary)] cursor-pointer"
            value={props.pageSize}
            onChange={(e) => props.onPageSizeChange(Number(e.currentTarget.value))}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-1">
        <button
          class="p-1 rounded hover:bg-[var(--aui-color-n-8)] disabled:opacity-30 disabled:hover:bg-transparent"
          onClick={() => props.onPageChange(props.currentPage - 1)}
          disabled={props.currentPage === 1}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <For each={pages()}>
          {(page) => (
            <Show
              when={typeof page === "number"}
              fallback={<span class="px-2">...</span>}
            >
              <button
                class={`min-w-[28px] h-7 px-1 rounded flex items-center justify-center transition-colors ${
                  props.currentPage === page
                    ? "bg-[var(--aui-color-primary)] text-white font-medium"
                    : "hover:bg-[var(--aui-color-n-8)]"
                }`}
                onClick={() => props.onPageChange(page as number)}
              >
                {page}
              </button>
            </Show>
          )}
        </For>

        <button
          class="p-1 rounded hover:bg-[var(--aui-color-n-8)] disabled:opacity-30 disabled:hover:bg-transparent"
          onClick={() => props.onPageChange(props.currentPage + 1)}
          disabled={props.currentPage === props.totalPages}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
