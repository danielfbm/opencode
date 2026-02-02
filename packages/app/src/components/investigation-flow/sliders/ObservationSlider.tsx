import { For, createMemo, Show } from "solid-js"
import type { InvestigationMetadata } from "@/types/investigation"
import { ConfidenceBadge, formatSource, formatDateTime, asRecord, pickString } from "./utils"

interface Props {
  source?: string
  observations: InvestigationMetadata["observations"]
  showAll?: boolean
}

export function ObservationSlider(props: Props) {
  const source = (obs: InvestigationMetadata["observations"][0]) =>
    obs.source || pickString(asRecord(obs), ["source", "sourceType", "type"]) || ""
  const finding = (obs: InvestigationMetadata["observations"][0]) =>
    obs.finding || pickString(asRecord(obs), ["finding", "details", "summary", "message"]) || "—"
  const timestamp = (obs: InvestigationMetadata["observations"][0]) =>
    obs.timestamp || pickString(asRecord(obs), ["timestamp", "time", "created_at", "createdAt"])
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
  const obsId = (obs: InvestigationMetadata["observations"][0]) =>
    obs.id || pickString(asRecord(obs), ["id", "observation_id", "observationId"]) || "—"
  const filtered = createMemo(() => {
    if (props.showAll) {
      // Show all except validation results
      return props.observations.filter(o => !source(o).startsWith('validation-'))
    }
    const value = props.source
    // Specific source filtering
    if (!value) return []
    return props.observations.filter(o => source(o) === value || source(o).startsWith(value))
  })
  
  const title = () => props.showAll ? "All Observations" : `${formatSource(props.source || '')} Observations`
  const details = (obs: InvestigationMetadata["observations"][0]) =>
    obs.sourceDetails ||
    pickString(asRecord(obs), ["source_details", "sourceDetails", "details", "data"])
  
  return (
    <div class="space-y-3">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-14-medium text-text-strong">{title()}</h3>
        <span class="text-12-regular text-text-weak">{filtered().length} findings</span>
      </div>
      
      <For each={filtered()} fallback={<p class="text-12-regular text-text-weak">No observations found</p>}>
        {(obs) => (
          <div class="p-3 bg-surface-base border border-border-base rounded-lg space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span
                  class="flow-obs-dot inline-block size-2 rounded-full"
                  data-level={level(obs) ?? "unknown"}
                  style={{ "background-color": accent(obs) }}
                />
                <span class="text-11-medium text-text-weak">{obsId(obs)}</span>
              </div>
              <Show
                when={level(obs)}
                fallback={<span class="text-11-medium text-text-weak">unknown</span>}
              >
                {(value) => <ConfidenceBadge confidence={value()} />}
              </Show>
            </div>
            <Show when={props.showAll}>
              <div class="text-11-medium text-primary uppercase tracking-wider">{formatSource(source(obs))}</div>
            </Show>
            <p class="text-13-regular text-text-base">{finding(obs)}</p>
            <div class="text-11-regular text-text-weak">
              {formatDateTime(timestamp(obs))}
            </div>
            <Show when={details(obs)}>
              {(value) => (
                <div class="text-12-regular text-text-base whitespace-pre-wrap bg-white/60 rounded-md p-2 border border-border-base">
                  {value()}
                </div>
              )}
            </Show>
          </div>
        )}
      </For>
    </div>
  )
}
