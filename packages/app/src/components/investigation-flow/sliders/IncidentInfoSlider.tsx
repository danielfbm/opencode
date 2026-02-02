import { Show, For } from "solid-js"
import type { InvestigationMetadata } from "@/types/investigation"
import { Collapsible } from "./Collapsible"
import { InfoRow, StatusBadge, formatDateTime, asRecord, pickString, pickArray } from "./utils"

interface Props {
  data: InvestigationMetadata
}

export function IncidentInfoSlider(props: Props) {
  const meta = () => asRecord(props.data)
  const incident = () =>
    asRecord(props.data.incident) ||
    asRecord(meta()?.incidentInfo) ||
    asRecord(meta()?.incident_info)
  const log = () =>
    pickArray(meta(), ["decision_log", "decisionLog"]) ||
    props.data.decision_log ||
    []
  const id = () => pickString(incident(), ["id", "incident_id", "incidentId"])
  const status = () => pickString(incident(), ["status", "state"])
  const started = () => pickString(incident(), ["started_at", "startedAt", "start_time", "startTime"])
  const completed = () => pickString(incident(), ["completed_at", "completedAt", "end_time", "endTime"])
  const description = () => pickString(incident(), ["description", "details", "summary"])
  
  return (
    <div class="space-y-5">
      <Collapsible title="Incident Details" defaultOpen>
        <div class="space-y-2">
          <InfoRow label="Incident ID" value={id()} />
          <InfoRow label="Status" value={<StatusBadge status={status()} />} />
          <InfoRow label="Started" value={formatDateTime(started())} />
          <Show when={completed()}>
            <InfoRow label="Completed" value={formatDateTime(completed())} />
          </Show>
          <Show when={description()}>
            <div class="mt-3 p-3 bg-surface-base rounded text-13-regular text-text-base">
              {description()}
            </div>
          </Show>
          <Show when={!incident()}>
            <div class="mt-2 text-12-regular text-text-weak">Incident details will appear once metadata is written.</div>
          </Show>
        </div>
      </Collapsible>
      
      <Collapsible title="Decision Log">
        <Show
          when={log().length > 0}
          fallback={<div class="text-12-regular text-text-weak">No decisions recorded yet.</div>}
        >
          <div class="space-y-3">
            <For each={log()}>
              {(entry) => (
                <div class="p-3 bg-surface-base border border-border-base rounded-lg space-y-2">
                  {(() => {
                    const row = asRecord(entry)
                    const state = pickString(row, ["state", "phase", "status"]) || "—"
                    const time = pickString(row, ["timestamp", "time", "created_at", "createdAt"])
                    const action = pickString(row, ["action", "decision"])
                    const rationale = pickString(row, ["rationale", "reason", "details"])
                    return (
                      <>
                        <div class="flex items-center justify-between">
                          <StatusBadge status={state} />
                          <span class="text-11-regular text-text-weak">{formatDateTime(time)}</span>
                        </div>
                        <Show when={action}>
                          <div class="text-13-medium text-text-strong">{action}</div>
                        </Show>
                        <Show when={rationale}>
                          <div class="text-12-regular text-text-base whitespace-pre-wrap">{rationale}</div>
                        </Show>
                      </>
                    )
                  })()}
                </div>
              )}
            </For>
          </div>
        </Show>
      </Collapsible>
      
    </div>
  )
}
