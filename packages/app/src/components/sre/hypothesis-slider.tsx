import { Show, For, createEffect, onCleanup, Match, Switch } from "solid-js"
import type { Hypothesis, HypothesisStatus } from "@/pages/sre/types"

interface HypothesisSliderProps {
  hypothesis: Hypothesis | null
  onClose: () => void
}

function HypothesisStatusBadge(props: { status: HypothesisStatus }) {
  return (
    <Switch>
      <Match when={props.status === "validated"}>
        <span class="sre-badge sre-badge-success">Validated</span>
      </Match>
      <Match when={props.status === "invalidated"}>
        <span class="sre-badge sre-badge-danger">Invalidated</span>
      </Match>
      <Match when={props.status === "pending"}>
        <span class="sre-badge sre-badge-neutral">Pending</span>
      </Match>
      <Match when={props.status === "inconclusive"}>
        <span class="sre-badge sre-badge-warning">Inconclusive</span>
      </Match>
    </Switch>
  )
}

export function HypothesisSlider(props: HypothesisSliderProps) {
  createEffect(() => {
    if (!props.hypothesis) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose()
    }
    window.addEventListener("keydown", handler)
    onCleanup(() => window.removeEventListener("keydown", handler))
  })

  return (
    <Show when={props.hypothesis}>
      {(hypothesis) => (
        <>
          <div class="slider-backdrop" onClick={props.onClose} />

          <div class="slider-panel">
            <div class="slider-header">
              <div class="slider-header-content">
                <div class="slider-id">{hypothesis().id}</div>
                <h2 class="slider-title">{hypothesis().description}</h2>
              </div>
              <div class="slider-header-actions">
                <HypothesisStatusBadge status={hypothesis().status} />
                <button class="slider-close" onClick={props.onClose} aria-label="Close">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="slider-content">
              <Collapsible title="Hypothesis Details" defaultOpen>
                <p class="slider-text">{hypothesis().details}</p>
                <div class="slider-meta">
                  <div class="slider-meta-item">
                    <span class="slider-label">Priority Score:</span>
                    <span class="slider-value">{hypothesis().priorityScore}</span>
                  </div>
                  <div class="slider-meta-item">
                    <span class="slider-label">Created:</span>
                    <span class="slider-value">{formatTime(hypothesis().createdAt)}</span>
                  </div>
                </div>
              </Collapsible>

              <Collapsible title="Priority Breakdown">
                <div class="priority-grid">
                  <div class="priority-item">
                    <span class="priority-label">Probability</span>
                    <div class="priority-bar">
                      <div class="priority-fill" style={{ width: `${hypothesis().priorityBreakdown.probability}%` }} />
                    </div>
                    <span class="priority-value">{hypothesis().priorityBreakdown.probability}%</span>
                  </div>
                  <div class="priority-item">
                    <span class="priority-label">Testability</span>
                    <div class="priority-bar">
                      <div class="priority-fill" style={{ width: `${hypothesis().priorityBreakdown.testability}%` }} />
                    </div>
                    <span class="priority-value">{hypothesis().priorityBreakdown.testability}%</span>
                  </div>
                  <div class="priority-item">
                    <span class="priority-label">Impact</span>
                    <div class="priority-bar">
                      <div class="priority-fill" style={{ width: `${hypothesis().priorityBreakdown.impact}%` }} />
                    </div>
                    <span class="priority-value">{hypothesis().priorityBreakdown.impact}%</span>
                  </div>
                  <div class="priority-item">
                    <span class="priority-label">Reversibility</span>
                    <div class="priority-bar">
                      <div class="priority-fill" style={{ width: `${hypothesis().priorityBreakdown.reversibility}%` }} />
                    </div>
                    <span class="priority-value">{hypothesis().priorityBreakdown.reversibility}%</span>
                  </div>
                </div>
              </Collapsible>

              <Show when={hypothesis().supportingEvidence.length > 0}>
                <Collapsible title="Supporting Evidence">
                  <ul class="evidence-list">
                    <For each={hypothesis().supportingEvidence}>
                      {(evidence) => (
                        <li class="evidence-item">
                          <svg class="evidence-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 12l2 2 4-4" />
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                          {evidence}
                        </li>
                      )}
                    </For>
                  </ul>
                </Collapsible>
              </Show>

              <Show when={hypothesis().researchSteps && hypothesis().researchSteps!.length > 0}>
                <Collapsible title="Research Steps">
                  <div class="research-steps">
                    <For each={hypothesis().researchSteps}>
                      {(step) => (
                        <div class="research-step">
                          <div class="step-number">{step.step}</div>
                          <div class="step-content">
                            <div class="step-description">{step.description}</div>
                            <Show when={step.outcome}>
                              <div class="step-outcome">{step.outcome}</div>
                            </Show>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </Collapsible>
              </Show>

              <Show when={hypothesis().validationResult}>
                <Collapsible title="Validation Result" defaultOpen>
                  <div class="validation-result">
                    <div class="validation-header">
                      <span class={`validation-direction validation-${hypothesis().validationResult!.direction}`}>
                        {hypothesis().validationResult!.direction.replace("_", " ")}
                      </span>
                      <span class="validation-confidence">
                        {hypothesis().validationResult!.confidence} confidence
                      </span>
                    </div>
                    <p class="validation-text">{hypothesis().validationResult!.result}</p>
                    <Show when={hypothesis().validationResult!.isRootCause}>
                      <div class="root-cause-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Identified as Root Cause
                      </div>
                    </Show>
                    <Show when={hypothesis().validationResult!.invalidationReason}>
                      <div class="invalidation-reason">
                        <strong>Reason:</strong> {hypothesis().validationResult!.invalidationReason}
                      </div>
                    </Show>
                    <div class="validation-time">
                      Validated at: {formatTime(hypothesis().validationResult!.validatedAt)}
                    </div>
                  </div>
                </Collapsible>
              </Show>

              <Show when={hypothesis().parentId}>
                <Collapsible title="Parent Hypothesis">
                  <div class="parent-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                    View parent hypothesis: {hypothesis().parentId}
                  </div>
                </Collapsible>
              </Show>
            </div>
          </div>
        </>
      )}
    </Show>
  )
}

interface CollapsibleProps {
  title: string
  defaultOpen?: boolean
  children: any
}

function Collapsible(props: CollapsibleProps) {
  let detailsRef: HTMLDetailsElement | undefined

  return (
    <details ref={detailsRef} class="collapsible" open={props.defaultOpen}>
      <summary class="collapsible-header">
        <svg class="collapsible-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
        {props.title}
      </summary>
      <div class="collapsible-content">
        {props.children}
      </div>
    </details>
  )
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })
}
