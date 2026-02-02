export function FlowLegend() {
  return (
    <div class="absolute top-3 right-3 flex items-center gap-2 px-2 py-1 bg-surface-base rounded-md border border-border-base text-[10px] leading-none shadow-[0_2px_8px_rgba(15,23,42,0.12)] z-10">
      <div class="flex items-center gap-1.5">
        <div class="size-2 rounded border border-[#00c261] bg-[#e6f9ee]" />
        <span class="text-text-base">Validated</span>
      </div>

      <div class="flex items-center gap-1.5">
        <div class="size-2 rounded border border-[#eb0027] bg-[#fef2f2]" />
        <span class="text-text-base">Invalidated</span>
      </div>

      <div class="flex items-center gap-1.5">
        <div class="size-2 rounded border border-[#8c52ff] bg-[#f9f5ff]" />
        <span class="text-text-base">Inconclusive</span>
      </div>

      <div class="flex items-center gap-1.5">
        <div class="size-2 rounded border border-[#ced9ec] bg-[#f1f5f9]" />
        <span class="text-text-base">Pending</span>
      </div>
    </div>
  )
}
