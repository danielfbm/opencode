import { Show, For, createMemo } from "solid-js"
import type { InvestigationMetadata } from "@/types/investigation"
import { Collapsible } from "./Collapsible"
import { StatusBadge, ConfidenceBadge, formatSource, formatDateTime, asRecord, pickString, pickArray } from "./utils"

interface Props {
  hypothesis: InvestigationMetadata["hypotheses"][0]
  observations: InvestigationMetadata["observations"]
}

export function HypothesisSlider(props: Props) {
  const h = () => props.hypothesis
  const info = () => asRecord(h())
  const status = () => pickString(info(), ["status", "state"]) || h().status || "pending"
  const description = () => pickString(info(), ["description", "details", "summary"]) || h().description
  const chain = () => pickString(info(), ["causal_chain", "causalChain", "details"]) || h().causal_chain
  const priority = () => {
    const direct = h().priority_score
    if (typeof direct === "number") return direct
    const value = info()?.priorityScore
    if (typeof value === "number") return value
    return 0
  }
  const breakdown = () => {
    const direct = h().scoring
    if (direct) return direct
    const value = asRecord(info()?.priorityBreakdown) || asRecord(info()?.scoring)
    return {
      probability: typeof value?.probability === "number" ? value.probability : 0,
      testability: typeof value?.testability === "number" ? value.testability : 0,
      impact: typeof value?.impact === "number" ? value.impact : 0,
      reversibility: typeof value?.reversibility === "number" ? value.reversibility : 0,
    }
  }
  const support = () =>
    h().supporting_observations ||
    pickArray(info(), ["supporting_observations", "supportingEvidence", "supportingObservations"]) ||
    []
  const summary = createMemo(() => {
    const direct =
      h().validation_result?.trim() ||
      pickString(info(), ["validation_result", "validationResult", "validation_summary"])
    if (direct) return direct
    const list = props.observations.filter((obs) => {
      const src = obs.source || pickString(asRecord(obs), ["source", "sourceType", "type"]) || ""
      return src.startsWith("validation-") && src.includes(h().id)
    })
    if (list.length === 0) return ""
    return list
      .map((obs) => obs.finding || pickString(asRecord(obs), ["finding", "details", "summary", "message"]) || "")
      .filter((text) => text.length > 0)
      .join("\n\n")
  })
  const related = createMemo(() => {
    const ids = new Set(support())
    const list = props.observations.filter((obs) => {
      const src = obs.source || pickString(asRecord(obs), ["source", "sourceType", "type"]) || ""
      return ids.has(obs.id) || src.includes(h().id)
    })
    const seen = new Set<string>()
    return list.filter((obs) => {
      if (seen.has(obs.id)) return false
      seen.add(obs.id)
      return true
    })
  })
  const level = (obs: InvestigationMetadata["observations"][0]) => {
    const value = obs.confidence || pickString(asRecord(obs), ["confidence", "level"])
    if (value === "high" || value === "medium" || value === "low") return value
  }
  const accent = (obs: InvestigationMetadata["observations"][0]) => {
    const value = level(obs)
    if (value === "high") return "#00c261"
    if (value === "medium") return "#f5a300"
    if (value === "low") return "#8c9ebf"
    return "#b0c0d8"
  }
  
  return (
    <div class="space-y-5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-11-medium text-text-weak">{h().id}</span>
        <StatusBadge status={status()} />
      </div>
      
      <Show when={summary()}>
        <div class="p-3 bg-surface-base border border-border-base rounded-lg border-l-4" classList={{
          'border-l-success': h().status === 'validated',
          'border-l-error': h().status === 'invalidated',
          'border-l-warning': h().status === 'inconclusive'
        }}>
          <h4 class="text-12-medium text-text-strong mb-1">Validation Summary</h4>
          <p class="text-14-regular text-text-base whitespace-pre-wrap">{summary()}</p>
        </div>
      </Show>

      <Show
        when={description()}
        fallback={<p class="text-13-regular text-text-weak">No hypothesis description yet.</p>}
      >
        <p class="text-14-regular text-text-base">{description()}</p>
      </Show>
      
      <Collapsible title="Causal Chain" defaultOpen>
        <p class="text-13-regular text-text-base whitespace-pre-wrap">{chain() || "—"}</p>
      </Collapsible>
      
      <Collapsible title="Priority Scoring">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-14-medium text-text-strong">Priority Score</span>
            <span class="text-16-medium text-primary">{priority().toFixed(2)}</span>
          </div>
          <div class="space-y-2">
            <PriorityBar label="Probability" value={breakdown().probability * 100} />
            <PriorityBar label="Testability" value={breakdown().testability * 100} />
            <PriorityBar label="Impact" value={breakdown().impact * 100} />
            <PriorityBar label="Reversibility" value={breakdown().reversibility * 100} />
          </div>
        </div>
      </Collapsible>
      
      <Show when={support().length}>
        <Collapsible title="Supporting Evidence">
          <ul class="space-y-1">
            <For each={support()}>
              {(obs) => (
                <li class="text-12-regular text-text-base flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  {obs}
                </li>
              )}
            </For>
          </ul>
        </Collapsible>
      </Show>

      <Collapsible title="Related Observations">
        <Show
          when={related().length > 0}
          fallback={<div class="text-12-regular text-text-weak">No related observations available yet.</div>}
        >
          <div class="space-y-2">
            <For each={related()}>
              {(obs) => (
                <div class="p-3 bg-surface-base border border-border-base rounded-lg space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span
                        class="flow-obs-dot inline-block size-2 rounded-full"
                        data-level={level(obs) ?? "unknown"}
                        style={{ "background-color": accent(obs) }}
                      />
                      <span class="text-11-medium text-text-weak">{obs.id}</span>
                    </div>
                    <Show when={level(obs)} fallback={<span class="text-11-medium text-text-weak">unknown</span>}>
                      {(value) => <ConfidenceBadge confidence={value()} />}
                    </Show>
                  </div>
                  <div class="text-11-medium text-text-weak uppercase tracking-wider">{formatSource(obs.source)}</div>
                  <p class="text-13-regular text-text-base">
                    {obs.finding || pickString(asRecord(obs), ["finding", "details", "summary", "message"]) || "—"}
                  </p>
                  <div class="text-11-regular text-text-weak">
                    {formatDateTime(obs.timestamp || pickString(asRecord(obs), ["timestamp", "time", "created_at", "createdAt"]))}
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Collapsible>
    </div>
  )
}

function PriorityBar(props: { label: string; value: number }) {
  return (
    <div class="flex items-center gap-3">
      <span class="text-12-regular text-text-weak w-24">{props.label}</span>
      <div class="flex-1 h-1.5 bg-surface-raised-base rounded-full overflow-hidden">
        <div class="h-full bg-primary rounded-full transition-all" style={{ width: `${props.value}%` }} />
      </div>
      <span class="text-11-regular text-text-weak w-10 text-right">{props.value.toFixed(0)}%</span>
    </div>
  )
}
