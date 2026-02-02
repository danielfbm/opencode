import type { JSX } from "solid-js"

interface CollapsibleProps {
  title: string
  defaultOpen?: boolean
  children: JSX.Element
}

export function Collapsible(props: CollapsibleProps) {
  return (
    <details class="collapsible border border-border-base rounded-lg overflow-hidden" open={props.defaultOpen}>
      <summary class="collapsible-header flex items-center gap-3 px-4 py-3 bg-surface-base cursor-pointer hover:bg-surface-raised-base">
        <svg class="collapsible-icon w-4 h-4 text-icon-weak transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span class="text-13-medium text-text-strong">{props.title}</span>
      </summary>
      <div class="collapsible-content p-4 border-t border-border-base bg-surface-raised-base">
        {props.children}
      </div>
    </details>
  )
}
