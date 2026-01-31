import { createSignal, Show, For } from "solid-js"
import { Icon } from "@opencode-ai/ui/icon"
import { Button } from "@opencode-ai/ui/button"

type Phase = "incident-info" | "initial-investigation" | "hypothesis" | "conclusion"

const PHASES: { id: Phase; label: string }[] = [
  { id: "incident-info", label: "Incident Information" },
  { id: "initial-investigation", label: "Initial Investigation" },
  { id: "hypothesis", label: "Hypothesis Tree" },
  { id: "conclusion", label: "Conclusion / Root Cause" },
]

export function InvestigationFlow() {
  const [activePhase, setActivePhase] = createSignal<Phase | null>(null)

  return (
    <div class="flex h-full w-full bg-background-base overflow-hidden">
        {/* Main Graph Area */}
        <div class="flex-1 flex flex-col items-center justify-center gap-8 p-8 overflow-auto">
            <h2 class="text-2xl font-bold text-text-strong mb-8">Investigation Flow</h2>
            <div class="flex flex-col gap-4 w-full max-w-2xl">
                <For each={PHASES}>
                    {(phase, index) => (
                         <div
                            class="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-surface-raised-base transition-colors"
                            classList={{
                                "border-border-active bg-surface-base-active": activePhase() === phase.id,
                                "border-border-base bg-surface-base": activePhase() !== phase.id
                            }}
                            onClick={() => setActivePhase(phase.id)}
                         >
                            <div class="size-8 rounded-full bg-surface-interactive-base text-text-invert-base flex items-center justify-center font-bold">
                                {index() + 1}
                            </div>
                            <div class="flex-1">
                                <div class="text-16-medium text-text-strong">{phase.label}</div>
                                <div class="text-12-regular text-text-weak">Click to view details</div>
                            </div>
                            <Icon name="chevron-right" class="text-icon-weak" />
                         </div>
                    )}
                </For>
            </div>
        </div>

        {/* Right Slider / Details Panel */}
        <Show when={activePhase()}>
            <div class="w-96 border-l border-border-base bg-background-stronger flex flex-col h-full shadow-lg transition-transform">
                <div class="flex items-center justify-between p-4 border-b border-border-base">
                    <h3 class="text-16-medium text-text-strong">{PHASES.find(p => p.id === activePhase())?.label}</h3>
                    <Button variant="ghost" size="small" icon="close" onClick={() => setActivePhase(null)} />
                </div>
                <div class="p-4 flex-1 overflow-auto">
                    <div class="text-14-regular text-text-base">
                        <p>Details for {activePhase()}...</p>
                        {/* Placeholder content */}
                        <div class="mt-4 p-3 bg-surface-base rounded border border-border-base">
                             <div class="font-mono text-12-regular">
                                 Status: In Progress<br/>
                                 Updated: Just now
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </Show>
    </div>
  )
}
