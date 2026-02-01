import { ErrorBoundary as SolidErrorBoundary, type ParentProps } from "solid-js"
import { A } from "@solidjs/router"

function ErrorFallback(props: { error: Error; reset: () => void }) {
  return (
    <div class="h-full flex flex-col items-center justify-center p-8">
      <div class="text-center max-w-lg">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-[rgba(var(--aui-color-red-rgb),0.1)] flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--aui-color-danger)" stroke-width="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        
        <h1 class="text-2xl font-semibold text-[var(--aui-color-n-1)] mb-2">
          Something went wrong
        </h1>
        
        <p class="text-[var(--aui-color-n-4)] mb-4">
          An unexpected error occurred while loading this page.
        </p>
        
        <div class="bg-[var(--aui-color-n-9)] rounded-lg p-4 mb-6 text-left">
          <p class="text-xs font-mono text-[var(--aui-color-danger)] break-all">
            {props.error.message}
          </p>
        </div>
        
        <div class="flex gap-3 justify-center">
          <button onClick={props.reset} class="sre-btn sre-btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            Try Again
          </button>
          <A href="/investigations" class="sre-btn sre-btn-primary">
            Back to Investigations
          </A>
        </div>
      </div>
    </div>
  )
}

export function SreErrorBoundary(props: ParentProps) {
  return (
    <SolidErrorBoundary fallback={(err, reset) => <ErrorFallback error={err} reset={reset} />}>
      {props.children}
    </SolidErrorBoundary>
  )
}
