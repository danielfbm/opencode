import { useParams, Navigate } from "@solidjs/router"
import { createMemo, Show } from "solid-js"
import { useInvestigations } from "../../context/investigations"
import { useSreWorkspace } from "../../context/sre-workspace"
import { SDKProvider } from "../../context/sdk"
import { SyncProvider } from "../../context/sync"
import { LocalProvider } from "../../context/local"
import { PromptProvider } from "../../context/prompt"
import { TerminalProvider } from "../../context/terminal"
import { FileProvider } from "../../context/file"
import { CommentsProvider } from "../../context/comments"
import { InvestigationHeader } from "../../components/sre/investigation-header"
import { OverviewPanel } from "../../components/sre/overview-panel"
import { InvestigationSession } from "../../components/sre/investigation-session"

export default function InvestigationDetails() {
  const params = useParams()
  const workspace = useSreWorkspace()
  const { getInvestigation, getHypotheses, getObservations, getReport } = useInvestigations()

  const directory = () => workspace.directory()
  
  if (!directory()) {
    return <Navigate href="/workspace" />
  }

  const investigation = createMemo(() => params.id ? getInvestigation(params.id) : undefined)
  const hypotheses = createMemo(() => params.id ? getHypotheses(params.id) : [])
  const observations = createMemo(() => params.id ? getObservations(params.id) : [])
  const report = createMemo(() => params.id ? getReport(params.id) : undefined)

  return (
    <Show when={investigation()} fallback={<NotFoundMessage />}>
      <div class="h-full flex flex-col p-6">
        <InvestigationHeader investigation={investigation()} />

      <div class="flex-1 flex gap-6 min-h-0">
        <div class="flex-1 min-w-0 flex flex-col bg-[var(--aui-color-surface)] border border-[var(--aui-color-border)] rounded-lg overflow-hidden">
          <div class="px-4 py-3 border-b border-[var(--aui-color-border)] flex items-center justify-between">
            <h2 class="text-sm font-medium text-[var(--aui-color-n-2)]">Agent Chat</h2>
            <Show when={investigation()?.sessionId}>
              <span class="text-xs text-[var(--aui-color-n-4)]">
                Session: {investigation()!.sessionId}
              </span>
            </Show>
          </div>
          
          <Show 
            when={investigation()?.sessionId}
            fallback={
              <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div class="w-16 h-16 rounded-full bg-[var(--aui-color-n-8)] flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--aui-color-n-5)" stroke-width="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-[var(--aui-color-n-2)] mb-2">
                  No Session Linked
                </h3>
                <p class="text-sm text-[var(--aui-color-n-4)] max-w-sm">
                  This investigation does not have a linked session. Create a new investigation to get started.
                </p>
              </div>
            }
          >
            <SDKProvider directory={directory()!}>
              <SyncProvider>
                <LocalProvider>
                  <PromptProvider directory={directory()!} sessionId={investigation()!.sessionId!}>
                    <TerminalProvider>
                      <FileProvider>
                        <CommentsProvider>
                          <div class="flex-1 overflow-hidden">
                            <InvestigationSession sessionId={investigation()!.sessionId!} />
                          </div>
                        </CommentsProvider>
                      </FileProvider>
                    </TerminalProvider>
                  </PromptProvider>
                </LocalProvider>
              </SyncProvider>
            </SDKProvider>
          </Show>
        </div>

        <div class="w-[400px] shrink-0">
          <OverviewPanel 
            investigation={investigation()}
            hypotheses={hypotheses()}
            observations={observations()}
            report={report()}
          />
        </div>
      </div>
      </div>
    </Show>
  )
}

function NotFoundMessage() {
  return (
    <div class="h-full flex flex-col items-center justify-center p-8">
      <div class="text-center max-w-md">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--aui-color-n-8)] flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--aui-color-n-4)" stroke-width="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <path d="M8 8l6 6M14 8l-6 6" stroke="var(--aui-color-danger)" />
          </svg>
        </div>
        
        <h1 class="text-2xl font-semibold text-[var(--aui-color-n-1)] mb-2">
          Investigation Not Found
        </h1>
        
        <p class="text-[var(--aui-color-n-4)] mb-6">
          The investigation you're looking for doesn't exist or may have been removed.
        </p>
        
        <a href="/investigations" class="sre-btn sre-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Investigations
        </a>
      </div>
    </div>
  )
}
