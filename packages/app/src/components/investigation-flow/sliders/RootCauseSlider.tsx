import { Show, For } from "solid-js"
import type { InvestigationMetadata } from "@/types/investigation"
import { Collapsible } from "./Collapsible"
import { StatusBadge, asRecord, pickString, pickArray } from "./utils"

interface Props {
  rootCause: NonNullable<InvestigationMetadata["root_cause"]>
  hypothesis?: InvestigationMetadata["hypotheses"][0]
}

export function RootCauseSlider(props: Props) {
  const rc = () => props.rootCause
  const root = () => asRecord(props.rootCause)
  const summary = () => pickString(root(), ["summary", "details", "description"]) || rc().summary
  const evidence = () => pickArray<string>(root(), ["evidence", "evidence_chain", "evidenceChain"]) || rc().evidence || []
  const remediation = () =>
    asRecord((root()?.remediation as unknown) ?? root()?.remediation_plan ?? root()?.remediationPlan) ||
    asRecord(rc().remediation)
  const immediate = () =>
    pickArray<string>(remediation(), ["immediate", "short_term", "shortTerm"]) ||
    rc().remediation?.immediate ||
    []
  const prevention = () =>
    pickArray<string>(remediation(), ["prevention", "long_term", "longTerm"]) ||
    rc().remediation?.prevention ||
    []
  
  return (
    <div class="space-y-5">
      <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span class="text-14-medium text-green-800">Root Cause Confirmed</span>
        </div>
      </div>
      
      <Collapsible title="Summary" defaultOpen>
        <p class="text-13-regular text-text-base whitespace-pre-wrap">{summary() || "—"}</p>
      </Collapsible>
      
      <Show when={evidence().length}>
        <Collapsible title="Evidence Chain" defaultOpen>
          <div class="space-y-2">
            <For each={evidence()}>
              {(evidence, i) => (
                <div class="flex gap-3 p-3 bg-surface-base rounded-lg">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-11-medium">
                    {i() + 1}
                  </div>
                  <p class="text-12-regular text-text-base">{evidence}</p>
                </div>
              )}
            </For>
          </div>
        </Collapsible>
      </Show>
      
      <Show when={remediation()}>
        <Collapsible title="Remediation">
          <div class="space-y-3">
            <Show when={immediate().length}>
              <div>
                <h4 class="text-12-medium text-text-strong mb-2">Immediate Actions</h4>
                <ul class="space-y-1">
                  <For each={immediate()}>
                    {(action) => (
                      <li class="text-12-regular text-text-base pl-4 before:content-['•'] before:absolute before:left-1 relative">{action}</li>
                    )}
                  </For>
                </ul>
              </div>
            </Show>
            <Show when={prevention().length}>
              <div>
                <h4 class="text-12-medium text-text-strong mb-2">Prevention</h4>
                <ul class="space-y-1">
                  <For each={prevention()}>
                    {(action) => (
                      <li class="text-12-regular text-text-base pl-4 before:content-['•'] before:absolute before:left-1 relative">{action}</li>
                    )}
                  </For>
                </ul>
              </div>
            </Show>
          </div>
        </Collapsible>
      </Show>
      
      <Show when={props.hypothesis}>
        <Collapsible title="Related Hypothesis">
          <div class="p-3 border border-border-base rounded-lg space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-11-medium text-text-weak">{props.hypothesis!.id}</span>
              <StatusBadge status={props.hypothesis!.status} />
            </div>
            <p class="text-13-regular text-text-base">{props.hypothesis!.description}</p>
            <Show when={props.hypothesis!.causal_chain}>
              <div class="text-12-regular text-text-weak whitespace-pre-wrap">{props.hypothesis!.causal_chain}</div>
            </Show>
          </div>
        </Collapsible>
      </Show>
      <Show when={!props.hypothesis}>
        <div class="text-12-regular text-text-weak">No related hypothesis found.</div>
      </Show>
    </div>
  )
}
