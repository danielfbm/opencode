import { For } from "solid-js"

export function SkeletonBox(props: { class?: string }) {
  return (
    <div 
      class={`bg-[var(--aui-color-n-8)] rounded animate-pulse ${props.class || ""}`} 
    />
  )
}

export function InvestigationCardSkeleton() {
  return (
    <div class="bg-[var(--aui-color-surface)] border border-[var(--aui-color-border)] rounded-lg p-5">
      <div class="flex items-start justify-between mb-3">
        <SkeletonBox class="h-5 w-32" />
        <SkeletonBox class="h-5 w-20 rounded-full" />
      </div>
      <SkeletonBox class="h-4 w-full mb-2" />
      <SkeletonBox class="h-4 w-3/4 mb-4" />
      <div class="flex gap-3 mb-4">
        <SkeletonBox class="h-6 w-20 rounded" />
        <SkeletonBox class="h-6 w-24 rounded" />
        <SkeletonBox class="h-6 w-16 rounded" />
      </div>
      <div class="flex items-center justify-between pt-3 border-t border-[var(--aui-color-n-8)]">
        <SkeletonBox class="h-4 w-28" />
        <SkeletonBox class="h-4 w-20" />
      </div>
    </div>
  )
}

export function InvestigationListSkeleton() {
  return (
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <For each={[1, 2, 3, 4, 5, 6]}>
        {() => <InvestigationCardSkeleton />}
      </For>
    </div>
  )
}

export function InvestigationTableSkeleton() {
  return (
    <div class="bg-[var(--aui-color-surface)] border border-[var(--aui-color-border)] rounded-lg overflow-hidden">
      <div class="border-b border-[var(--aui-color-border)] bg-[var(--aui-color-n-9)]">
        <div class="flex items-center gap-4 px-4 py-3">
          <SkeletonBox class="h-4 w-20" />
          <SkeletonBox class="h-4 w-32 flex-1" />
          <SkeletonBox class="h-4 w-16" />
          <SkeletonBox class="h-4 w-20" />
          <SkeletonBox class="h-4 w-24" />
          <SkeletonBox class="h-4 w-20" />
        </div>
      </div>
      <For each={[1, 2, 3, 4, 5]}>
        {() => (
          <div class="flex items-center gap-4 px-4 py-4 border-b border-[var(--aui-color-n-8)]">
            <SkeletonBox class="h-4 w-20" />
            <SkeletonBox class="h-4 w-full flex-1" />
            <SkeletonBox class="h-5 w-16 rounded-full" />
            <SkeletonBox class="h-4 w-20" />
            <SkeletonBox class="h-4 w-24" />
            <SkeletonBox class="h-4 w-20" />
          </div>
        )}
      </For>
    </div>
  )
}

export function InvestigationDetailsSkeleton() {
  return (
    <div class="h-full flex flex-col p-6">
      <div class="mb-6">
        <SkeletonBox class="h-4 w-48 mb-4" />
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <SkeletonBox class="h-8 w-64" />
            <SkeletonBox class="h-6 w-20 rounded-full" />
          </div>
          <SkeletonBox class="h-9 w-32 rounded" />
        </div>
      </div>
      
      <div class="flex-1 flex gap-6 min-h-0">
        <div class="flex-1 min-w-0 flex flex-col bg-[var(--aui-color-surface)] border border-[var(--aui-color-border)] rounded-lg overflow-hidden">
          <div class="px-4 py-3 border-b border-[var(--aui-color-border)] flex items-center justify-between">
            <SkeletonBox class="h-5 w-24" />
            <SkeletonBox class="h-4 w-32" />
          </div>
          <div class="flex-1 flex flex-col items-center justify-center p-8">
            <SkeletonBox class="h-16 w-16 rounded-full mb-4" />
            <SkeletonBox class="h-6 w-40 mb-2" />
            <SkeletonBox class="h-4 w-64" />
          </div>
        </div>
        
        <div class="w-[400px] shrink-0 bg-[var(--aui-color-surface)] border border-[var(--aui-color-border)] rounded-lg overflow-hidden">
          <div class="border-b border-[var(--aui-color-border)]">
            <div class="flex gap-4 px-4 py-3">
              <SkeletonBox class="h-5 w-20" />
              <SkeletonBox class="h-5 w-16" />
              <SkeletonBox class="h-5 w-24" />
            </div>
          </div>
          <div class="p-4 space-y-4">
            <SkeletonBox class="h-20 w-full rounded" />
            <SkeletonBox class="h-32 w-full rounded" />
            <SkeletonBox class="h-24 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function HypothesisTableSkeleton() {
  return (
    <div class="border border-[var(--aui-color-n-8)] rounded-lg overflow-hidden">
      <For each={[1, 2, 3]}>
        {() => (
          <div class="flex items-center gap-3 px-3 py-3 border-b border-[var(--aui-color-n-8)] last:border-b-0">
            <SkeletonBox class="h-4 w-16" />
            <SkeletonBox class="h-4 w-full flex-1" />
            <SkeletonBox class="h-5 w-16 rounded-full" />
          </div>
        )}
      </For>
    </div>
  )
}
