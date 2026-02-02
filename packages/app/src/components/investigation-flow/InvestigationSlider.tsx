import { Show, Switch, Match, createEffect, onCleanup } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import type { FlowNode } from "./layout"
import type { InvestigationMetadata } from "@/hooks/useInvestigationData"
import { IncidentInfoSlider } from "./sliders/IncidentInfoSlider"
import { SymptomSlider } from "./sliders/SymptomSlider"
import { ObservationSlider } from "./sliders/ObservationSlider"
import { HypothesisSlider } from "./sliders/HypothesisSlider"
import { RootCauseSlider } from "./sliders/RootCauseSlider"
import { ReportSlider } from "./sliders/ReportSlider"
import { asRecord } from "./sliders/utils"

interface Props {
  node: FlowNode | null
  data: InvestigationMetadata
  onClose: () => void
  collapsed?: boolean
  onToggleGroup?: () => void
}

export function InvestigationSlider(props: Props) {
  const hypotheses = () => props.data.hypotheses || []
  const observations = () => props.data.observations || []
  const hidden = () => props.node?.type === "hypothesis_group"
  const root = () =>
    props.data.root_cause ||
    (asRecord(props.data)?.rootCause as InvestigationMetadata["root_cause"] | undefined)
  const rootId = () => {
    const raw = asRecord(root())
    if (!raw) return
    const direct = raw.hypothesis_id
    if (typeof direct === "string") return direct
    const alt = raw.hypothesisId
    if (typeof alt === "string") return alt
  }
  const rootHypothesis = () => {
    const target = rootId()
    if (!target) return
    return props.data.hypotheses.find((h) => h.id === target)
  }
  const collection = (node: FlowNode | null | undefined) => {
    if (!node) return
    if (node.type !== "source") return
    const data = node.data
    if (!data) return
    if (!("isCollection" in data)) return
    return data
  }
  const hypothesis = (node: FlowNode | null | undefined) => {
    if (!node) return
    if (node.type !== "hypothesis") return
    const data = node.data
    if (!data) return
    if (!("id" in data)) return
    return data
  }
  const source = (node: FlowNode | null | undefined) => {
    if (!node) return
    if (node.type !== "source") return
    const data = node.data
    if (data && "source" in data && typeof data.source === "string") return data.source
    return node.label.toLowerCase()
  }
  const isCollection = () => !!collection(props.node)
  const isReport = () => props.node?.type === "report"

  createEffect(() => {
    if (!props.node) return
    
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose()
    }
    window.addEventListener("keydown", handler)
    onCleanup(() => window.removeEventListener("keydown", handler))
  })
  
  const getTitle = () => {
    const node = props.node
    if (!node) return ""
    switch (node.type) {
      case "incident": return "Incident Details"
      case "gathering": return "Information Gathering"
      case "source": return collection(node) ? "Data Collection" : `${node.label} Data`
      case "hypothesis_group": return "Hypothesis Investigation"
      case "hypothesis": return `Hypothesis ${hypothesis(node)?.id || ""}`
      case "root_cause": return "Root Cause Analysis"
      case "report": return "Incident Report"
      default: return node.label
    }
  }
  
  const getIcon = () => {
    const type = props.node?.type
    if (type === "incident") return (
      <svg class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
    if (type === "root_cause") return (
      <svg class="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    )
    if (type === "hypothesis") return (
      <svg class="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
    if (type === "hypothesis_group") return (
      <svg class="w-5 h-5 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M7 7h10M7 12h10M7 17h10" />
      </svg>
    )
    if (type === "report") return (
      <svg class="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    )
    return (
      <svg class="w-5 h-5 text-text-weak" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    )
  }
  
  return (
    <Show when={props.node && !hidden() ? props.node : undefined}>
      {(node) => (
        <>
          <button 
            type="button"
            class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 w-full h-full cursor-default"
            onClick={props.onClose}
            aria-label="Close slider"
          />
          
          <div class={`fixed top-0 right-0 h-full ${isReport() ? "w-[720px] max-w-[96vw]" : "w-[440px] max-w-[92vw]"} bg-surface-raised-stronger-non-alpha text-text-base border-l border-border-base shadow-2xl z-50 flex flex-col animate-slide-in-right rounded-l-2xl overflow-hidden`}>
            <div class="flex items-center justify-between px-5 py-4 border-b border-border-base shrink-0 bg-surface-raised-stronger-non-alpha">
              <div class="flex items-center gap-3">
                {getIcon()}
                <h2 class="text-16-medium text-text-strong">{getTitle()}</h2>
              </div>
              <Button 
                variant="ghost" 
                size="small" 
                icon="close" 
                onClick={props.onClose}
              />
            </div>
            
            <div class="flex-1 overflow-y-auto p-5 text-text-base">
              <Switch>
                <Match when={node().type === "incident"}>
                  <IncidentInfoSlider data={props.data} />
                </Match>
                <Match when={node().type === "gathering"}>
                  <SymptomSlider data={props.data} />
                </Match>
                <Match when={node().type === "source"}>
                  <ObservationSlider 
                    source={source(node())}
                    observations={observations()}
                    showAll={isCollection()}
                  />
                </Match>
                <Match when={node().type === "hypothesis_group"}>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="text-12-regular text-text-weak">Total hypotheses</span>
                      <span class="text-13-medium text-text-strong">{hypotheses().length}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-11-medium text-text-weak">Validated</span>
                      <span class="text-11-medium text-text-base">
                        {hypotheses().filter(h => h.status === "validated").length}
                      </span>
                      <span class="text-11-medium text-text-weak">Invalidated</span>
                      <span class="text-11-medium text-text-base">
                        {hypotheses().filter(h => h.status === "invalidated").length}
                      </span>
                      <span class="text-11-medium text-text-weak">Inconclusive</span>
                      <span class="text-11-medium text-text-base">
                        {hypotheses().filter(h => h.status === "inconclusive").length}
                      </span>
                      <span class="text-11-medium text-text-weak">Pending</span>
                      <span class="text-11-medium text-text-base">
                        {hypotheses().filter(h => h.status === "pending").length}
                      </span>
                    </div>
                    <Show when={props.onToggleGroup}>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={props.onToggleGroup}
                      >
                        {props.collapsed ? "Expand hypotheses" : "Collapse hypotheses"}
                      </Button>
                    </Show>
                  </div>
                </Match>
                <Match when={hypothesis(node())}>
                  {(data) => <HypothesisSlider hypothesis={data()} observations={observations()} />}
                </Match>
                <Match when={node().type === "root_cause" && root()}>
                  <RootCauseSlider 
                    rootCause={root()!}
                    hypothesis={rootHypothesis()}
                  />
                </Match>
                <Match when={node().type === "report"}>
                  <ReportSlider report={props.data.reportContent} />
                </Match>
                <Match when={true}>
                  <div class="text-12-regular text-text-weak">Details will appear once investigation metadata is available.</div>
                </Match>
              </Switch>
            </div>
          </div>
        </>
      )}
    </Show>
  )
}
