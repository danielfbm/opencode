import { createSignal, Show, For } from "solid-js"
import type { Investigation, Hypothesis, Observation } from "../../pages/sre/types"
import { HypothesisTable } from "./hypothesis-table"
import { HypothesisFlow } from "./hypothesis-flow"
import { HypothesisSlider } from "./hypothesis-slider"
import { ReportPanel } from "./report-panel"

interface Props {
  investigation: Investigation | undefined
  hypotheses: Hypothesis[]
  observations: Observation[]
  report?: string
}

type TabId = "overview" | "flow" | "observations" | "report"

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "flow", label: "Flow" },
  { id: "observations", label: "Observations" },
  { id: "report", label: "Report" },
]

function getSourceIcon(source: Observation["source"]): string {
  switch (source) {
    case "metrics": return "📊"
    case "logs": return "📝"
    case "traces": return "🔍"
    case "audits": return "📋"
    case "resources": return "🖥️"
    default: return "📄"
  }
}

export function OverviewPanel(props: Props) {
  const [activeTab, setActiveTab] = createSignal<TabId>("overview")
  const [selectedHypothesis, setSelectedHypothesis] = createSignal<Hypothesis | null>(null)

  const handleHypothesisClick = (hypothesis: Hypothesis) => {
    setSelectedHypothesis(hypothesis)
  }

  const closeSlider = () => {
    setSelectedHypothesis(null)
  }

  return (
    <>
      <div class="h-full flex flex-col bg-[var(--aui-color-surface)] border border-[var(--aui-color-border)] rounded-lg overflow-hidden">
        <div class="flex border-b border-[var(--aui-color-border)] shrink-0">
          <For each={TABS}>
            {(tab) => (
              <button
                onClick={() => setActiveTab(tab.id)}
                class={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab() === tab.id
                    ? "text-[var(--aui-color-primary)] border-[var(--aui-color-primary)]"
                    : "text-[var(--aui-color-n-4)] border-transparent hover:text-[var(--aui-color-n-2)]"
                }`}
              >
                {tab.label}
              </button>
            )}
          </For>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <Show when={activeTab() === "overview"}>
            <div class="space-y-6">
              <Show when={props.investigation}>
                <div class="space-y-3">
                  <h3 class="text-sm font-medium text-[var(--aui-color-n-2)]">Incident Information</h3>
                  <div class="bg-[var(--aui-color-n-9)] rounded-lg p-4 space-y-2">
                    <div class="flex justify-between">
                      <span class="text-xs text-[var(--aui-color-n-4)]">Service</span>
                      <span class="text-sm text-[var(--aui-color-n-1)]">{props.investigation!.affectedService || "—"}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-xs text-[var(--aui-color-n-4)]">Namespace</span>
                      <span class="text-sm text-[var(--aui-color-n-1)]">{props.investigation!.namespace || "—"}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-xs text-[var(--aui-color-n-4)]">Cluster</span>
                      <span class="text-sm text-[var(--aui-color-n-1)]">{props.investigation!.cluster || "—"}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-xs text-[var(--aui-color-n-4)]">Severity</span>
                      <span class="text-sm text-[var(--aui-color-n-1)]">{props.investigation!.severity || "—"}</span>
                    </div>
                  </div>
                </div>
              </Show>

              <Show when={props.investigation?.rootCause}>
                <div class="space-y-3">
                  <h3 class="text-sm font-medium text-[var(--aui-color-n-2)]">Root Cause</h3>
                  <div class="bg-[var(--aui-color-green)]/10 border border-[var(--aui-color-green)]/20 rounded-lg p-4">
                    <p class="text-sm text-[var(--aui-color-n-1)]">{props.investigation!.rootCause}</p>
                  </div>
                </div>
              </Show>

              <div class="space-y-3">
                <h3 class="text-sm font-medium text-[var(--aui-color-n-2)]">
                  Hypotheses ({props.hypotheses.length})
                </h3>
                <HypothesisTable 
                  hypotheses={props.hypotheses} 
                  onRowClick={handleHypothesisClick}
                />
              </div>
            </div>
          </Show>

          <Show when={activeTab() === "flow"}>
            <Show 
              when={props.investigation}
              fallback={
                <div class="py-8 text-center text-sm text-[var(--aui-color-n-4)]">
                  Loading investigation data...
                </div>
              }
            >
              <HypothesisFlow
                investigation={props.investigation!}
                hypotheses={props.hypotheses}
                observations={props.observations}
                onNodeClick={handleHypothesisClick}
              />
            </Show>
          </Show>

          <Show when={activeTab() === "observations"}>
            <div class="space-y-3">
              <Show 
                when={props.observations.length > 0}
                fallback={
                  <div class="py-8 text-center text-sm text-[var(--aui-color-n-4)]">
                    No observations collected yet
                  </div>
                }
              >
                <For each={props.observations}>
                  {(obs) => (
                    <div class="bg-[var(--aui-color-n-9)] rounded-lg p-4 space-y-2">
                      <div class="flex items-center gap-2">
                        <span class="text-base">{getSourceIcon(obs.source)}</span>
                        <span class="text-xs font-medium text-[var(--aui-color-n-3)] uppercase">{obs.source}</span>
                        <span class="text-xs text-[var(--aui-color-n-5)]">•</span>
                        <span class="text-xs text-[var(--aui-color-n-4)]">
                          {new Date(obs.timestamp).toLocaleTimeString()}
                        </span>
                        <span class={`ml-auto text-xs px-2 py-0.5 rounded ${
                          obs.confidence === "high" 
                            ? "bg-[var(--aui-color-green)]/15 text-[var(--aui-color-green)]"
                            : obs.confidence === "medium"
                            ? "bg-[var(--aui-color-yellow)]/15 text-[var(--aui-color-yellow)]"
                            : "bg-[var(--aui-color-n-7)] text-[var(--aui-color-n-4)]"
                        }`}>
                          {obs.confidence}
                        </span>
                      </div>
                      <p class="text-sm text-[var(--aui-color-n-1)]">{obs.finding}</p>
                      <Show when={obs.sourceDetails}>
                        <p class="text-xs text-[var(--aui-color-n-4)]">{obs.sourceDetails}</p>
                      </Show>
                    </div>
                  )}
                </For>
              </Show>
            </div>
          </Show>

          <Show when={activeTab() === "report"}>
            <ReportPanel 
              investigation={props.investigation}
              report={props.report}
            />
          </Show>
        </div>
      </div>

      <HypothesisSlider
        hypothesis={selectedHypothesis()}
        onClose={closeSlider}
      />
    </>
  )
}
