import { A } from "@solidjs/router"

export default function NotFound() {
  return (
    <div class="h-full flex flex-col items-center justify-center p-8">
      <div class="text-center max-w-md">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--aui-color-n-8)] flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--aui-color-n-4)" stroke-width="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <path d="M8 8l6 6M14 8l-6 6" stroke="var(--aui-color-danger)" />
          </svg>
        </div>
        
        <h1 class="text-2xl font-semibold text-[var(--aui-color-n-1)] mb-2">
          Investigation Not Found
        </h1>
        
        <p class="text-[var(--aui-color-n-4)] mb-6">
          The investigation you're looking for doesn't exist or may have been removed.
        </p>
        
        <A href="/investigations" class="sre-btn sre-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Investigations
        </A>
      </div>
    </div>
  )
}
