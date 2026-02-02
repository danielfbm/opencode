import { Show } from "solid-js"
import type { InvestigationMetadata } from "@/types/investigation"
import { Collapsible } from "./Collapsible"
import { InfoRow, asRecord, pickString, pickBoolean } from "./utils"

interface Props {
  data: InvestigationMetadata
}

export function SymptomSlider(props: Props) {
  const meta = () => asRecord(props.data)
  const symptom = () =>
    asRecord(props.data.symptom) ||
    asRecord(meta()?.symptomInfo) ||
    asRecord(meta()?.symptom_info)
  const description = () => pickString(symptom(), ["description", "details", "summary"])
  const service = () => pickString(symptom(), ["affected_service", "affectedService", "service"])
  const severity = () => pickString(symptom(), ["severity", "priority"])
  const scope = () => pickString(symptom(), ["scope", "impact"])
  const verified = () => pickBoolean(symptom(), ["verified", "isVerified", "confirmed"])

  return (
    <div class="space-y-5">
      <Collapsible title="Symptom" defaultOpen>
        <Show
          when={symptom()}
          fallback={<div class="text-12-regular text-text-weak">Symptom details will appear once metadata is written.</div>}
        >
          {(value) => (
            <div class="space-y-3">
              <p class="text-13-regular text-text-base">{description() || "—"}</p>
              <div class="grid grid-cols-2 gap-2">
                <InfoRow label="Service" value={service() || "—"} />
                <InfoRow label="Severity" value={severity() || "—"} />
                <InfoRow label="Scope" value={scope() || "—"} />
                <InfoRow label="Verified" value={verified() === true ? "Yes" : verified() === false ? "No" : "—"} />
              </div>
            </div>
          )}
        </Show>
      </Collapsible>
    </div>
  )
}
