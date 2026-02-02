import { For, Show } from "solid-js"
import type { Hypothesis } from "../../pages/sre/types"

interface Props {
  hypotheses: Hypothesis[]
  onRowClick?: (hypothesis: Hypothesis) => void
}

function getStatusColor(status: Hypothesis["status"]): string {
  switch (status) {
    case "validated":
      return "bg-[var(--aui-color-green)]/15 text-[var(--aui-color-green)]"
    case "invalidated":
      return "bg-[var(--aui-color-red)]/15 text-[var(--aui-color-red)]"
    case "inconclusive":
      return "bg-[#f9f5ff] text-[#8c52ff]"
    case "pending":
    default:
      return "bg-[var(--aui-color-n-7)] text-[var(--aui-color-n-3)]"
  }
}

function getStatusLabel(status: Hypothesis["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function HypothesisTable(props: Props) {
  return (
    <div class="overflow-x-auto">
      <Show 
        when={props.hypotheses.length > 0} 
        fallback={
          <div class="py-8 text-center text-sm text-[var(--aui-color-n-4)]">
            No hypotheses generated yet
          </div>
        }
      >
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[var(--aui-color-border)]">
              <th class="text-left py-3 px-3 font-medium text-[var(--aui-color-n-3)] w-16">ID</th>
              <th class="text-left py-3 px-3 font-medium text-[var(--aui-color-n-3)]">Hypothesis</th>
              <th class="text-left py-3 px-3 font-medium text-[var(--aui-color-n-3)] w-20">Priority</th>
              <th class="text-left py-3 px-3 font-medium text-[var(--aui-color-n-3)] w-28">Status</th>
              <th class="text-left py-3 px-3 font-medium text-[var(--aui-color-n-3)] w-24">Confidence</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.hypotheses}>
              {(hypothesis) => (
                <tr 
                  class="border-b border-[var(--aui-color-border)] hover:bg-[var(--aui-color-n-9)] transition-colors cursor-pointer"
                  onClick={() => props.onRowClick?.(hypothesis)}
                >
                  <td class="py-3 px-3 text-[var(--aui-color-n-2)] font-mono text-xs">
                    {hypothesis.id}
                  </td>
                  <td class="py-3 px-3 text-[var(--aui-color-n-1)]">
                    <div class="line-clamp-2">{hypothesis.description}</div>
                  </td>
                  <td class="py-3 px-3">
                    <span class="inline-flex items-center justify-center w-10 h-6 rounded bg-[var(--aui-color-n-8)] text-[var(--aui-color-n-2)] font-medium text-xs">
                      {hypothesis.priorityScore}
                    </span>
                  </td>
                  <td class="py-3 px-3">
                    <span class={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(hypothesis.status)}`}>
                      {getStatusLabel(hypothesis.status)}
                    </span>
                  </td>
                  <td class="py-3 px-3 text-[var(--aui-color-n-3)] text-xs">
                    {hypothesis.validationResult?.confidence || "—"}
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>
    </div>
  )
}
