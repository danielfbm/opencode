import { createEffect, createMemo, Show, lazy, Suspense } from "solid-js"
import { useParams, Navigate, useNavigate, useSearchParams } from "@solidjs/router"
import { useSreWorkspace } from "../../context/sre-workspace"
import { SDKProvider, useSDK } from "../../context/sdk"
import { SyncProvider, useSync } from "../../context/sync"
import { LocalProvider } from "../../context/local"
import { TerminalProvider } from "../../context/terminal"
import { FileProvider } from "../../context/file"
import { PromptProvider } from "../../context/prompt"
import { CommentsProvider } from "../../context/comments"
import { DataProvider } from "@opencode-ai/ui/context"
import type { QuestionAnswer } from "@opencode-ai/sdk/v2"
import { base64Encode } from "@opencode-ai/util/encode"

const Session = lazy(() => import("../session"))

const Loading = () => (
  <div class="flex h-full w-full items-center justify-center text-[rgb(var(--aui-color-n-4))]">
    Loading session...
  </div>
)

function SessionDataProvider(props: { children: any; directory: string }) {
  const sync = useSync()
  const sdk = useSDK()
  const params = useParams()
  const navigate = useNavigate()

  const respond = (input: {
    sessionID: string
    permissionID: string
    response: "once" | "always" | "reject"
  }) => sdk.client.permission.respond(input)

  const replyToQuestion = (input: { requestID: string; answers: QuestionAnswer[] }) =>
    sdk.client.question.reply(input)

  const rejectQuestion = (input: { requestID: string }) => sdk.client.question.reject(input)

  const navigateToSession = (sessionID: string) => {
    navigate(`/${params.dir}/session/${sessionID}`)
  }

  createEffect(() => {
    if (params.id) {
      sync.session.sync(params.id)
    }
  })

  return (
    <DataProvider
      data={sync.data}
      directory={props.directory}
      onPermissionRespond={respond}
      onQuestionReply={replyToQuestion}
      onQuestionReject={rejectQuestion}
      onNavigateToSession={navigateToSession}
    >
      {props.children}
    </DataProvider>
  )
}

export default function InvestigationSessionPage() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const workspace = useSreWorkspace()
  const navigate = useNavigate()

  const directory = createMemo(() => workspace.directory())
  const sessionId = createMemo(() => params.id)
  const investigationId = createMemo(() => searchParams.inv as string | undefined)

  if (!directory()) {
    return <Navigate href="/workspace" />
  }

  const goBack = () => {
    const dir = directory()
    if (!dir) return
    
    const invId = investigationId()
    if (invId) {
      navigate(`/${base64Encode(dir)}/investigations/${invId}`)
    } else {
      navigate(`/${base64Encode(dir)}/investigations`)
    }
  }

  return (
    <div class="h-full flex flex-col">
      <div class="shrink-0 px-4 py-2 border-b border-[var(--aui-color-border)] bg-[var(--aui-color-surface)] flex items-center gap-3">
        <button
          onClick={goBack}
          class="flex items-center gap-2 text-sm text-[var(--aui-color-n-4)] hover:text-[var(--aui-color-n-1)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {investigationId() ? "Back to Investigation" : "Back to Investigations"}
        </button>
      </div>

      <div class="flex-1 min-h-0">
        <Show
          when={sessionId()}
          fallback={
            <div class="h-full flex items-center justify-center">
              <div class="text-center">
                <p class="text-[var(--aui-color-n-4)]">No session ID provided</p>
              </div>
            </div>
          }
        >
          <SDKProvider directory={directory()!}>
            <SyncProvider>
              <SessionDataProvider directory={directory()!}>
                <LocalProvider>
                  <PromptProvider directory={directory()!} sessionId={sessionId()!}>
                    <TerminalProvider>
                      <FileProvider>
                        <CommentsProvider>
                          <Suspense fallback={<Loading />}>
                            <Session />
                          </Suspense>
                        </CommentsProvider>
                      </FileProvider>
                    </TerminalProvider>
                  </PromptProvider>
                </LocalProvider>
              </SessionDataProvider>
            </SyncProvider>
          </SDKProvider>
        </Show>
      </div>
    </div>
  )
}
