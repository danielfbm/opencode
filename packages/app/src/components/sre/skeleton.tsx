import { For } from "solid-js"

export function CardSkeleton() {
  return (
    <div class="sre-card animate-pulse">
      <div class="h-6 w-3/4 bg-[var(--aui-color-n-8)] rounded mb-4" />
      <div class="flex gap-3 mb-4">
        <div class="h-5 w-20 bg-[var(--aui-color-n-8)] rounded-full" />
        <div class="h-5 w-16 bg-[var(--aui-color-n-8)] rounded" />
        <div class="h-5 w-24 bg-[var(--aui-color-n-8)] rounded" />
      </div>
      <div class="space-y-2 mb-4">
        <div class="h-4 w-full bg-[var(--aui-color-n-8)] rounded" />
        <div class="h-4 w-5/6 bg-[var(--aui-color-n-8)] rounded" />
      </div>
      <div class="flex gap-2">
        <div class="h-6 w-16 bg-[var(--aui-color-n-8)] rounded" />
        <div class="h-6 w-24 bg-[var(--aui-color-n-8)] rounded" />
      </div>
    </div>
  )
}

export function CardSkeletonGrid() {
  return (
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <For each={Array(6).fill(0)}>{() => <CardSkeleton />}</For>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div class="w-full border border-[var(--aui-color-border)] rounded bg-[var(--aui-color-surface)] animate-pulse">
      <div class="border-b border-[var(--aui-color-border)] bg-[var(--aui-color-n-9)] h-10" />
      <For each={Array(5).fill(0)}>
        {() => (
          <div class="flex items-center border-b border-[var(--aui-color-border)] px-4 py-3 gap-4">
            <div class="w-[240px]">
              <div class="h-5 w-3/4 bg-[var(--aui-color-n-8)] rounded mb-1" />
              <div class="h-3 w-1/2 bg-[var(--aui-color-n-8)] rounded" />
            </div>
            <div class="w-[120px]">
              <div class="h-5 w-20 bg-[var(--aui-color-n-8)] rounded-full" />
            </div>
            <div class="flex-1">
              <div class="h-4 w-full bg-[var(--aui-color-n-8)] rounded" />
            </div>
            <div class="w-[160px]">
              <div class="h-4 w-24 bg-[var(--aui-color-n-8)] rounded" />
            </div>
            <div class="w-[100px]">
              <div class="h-4 w-16 bg-[var(--aui-color-n-8)] rounded" />
            </div>
          </div>
        )}
      </For>
    </div>
  )
}
