import { useParams, Navigate, useNavigate, useSearchParams } from "@solidjs/router"
import { createEffect, createMemo, createSignal, Show, Suspense } from "solid-js"
import { useInvestigations } from "../../context/investigations"
import { useSreWorkspace } from "../../context/sre-workspace"
import { SDKProvider, useSDK } from "../../context/sdk"
import { SyncProvider, useSync } from "../../context/sync"
import { LocalProvider } from "../../context/local"
import { PromptProvider } from "../../context/prompt"
import { TerminalProvider } from "../../context/terminal"
import { FileProvider } from "../../context/file"
import { CommentsProvider } from "../../context/comments"
import { DataProvider } from "@opencode-ai/ui/context"
import { showToast } from "@opencode-ai/ui/toast"
import type { QuestionAnswer } from "@opencode-ai/sdk/v2"
import { InvestigationHeader } from "../../components/sre/investigation-header"
import Page from "../../pages/session"

const Loading = () => (
  <div class="flex h-full w-full items-center justify-center text-[rgb(var(--aui-color-n-4))]">Loading session...</div>
)

function SessionDataProvider(props: { children: any; directory: string; sessionId: string }) {
  const sync = useSync()
  const sdk = useSDK()
  const params = useParams()
  const navigate = useNavigate()

  const respond = (input: { sessionID: string; permissionID: string; response: "once" | "always" | "reject" }) =>
    sdk.client.permission.respond(input)

  const replyToQuestion = (input: { requestID: string; answers: QuestionAnswer[] }) => sdk.client.question.reply(input)

  const rejectQuestion = (input: { requestID: string }) => sdk.client.question.reject(input)

  const navigateToSession = (sessionID: string) => {
    navigate(`/${params.dir}/session/${sessionID}`)
  }

  createEffect(() => {
    if (!props.sessionId) return
    sync.session.sync(props.sessionId)
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

function AutoInvestigationCommand(props: { sessionId: string }) {
  const sdk = useSDK()
  const sync = useSync()
  const [search] = useSearchParams()
  const params = useParams()
  const navigate = useNavigate()
  const [sent, setSent] = createSignal(false)

  const name = "sre-investigate"
  const ready = createMemo(() => sync.data.agent?.length > 0 && sync.data.command?.length > 0)

  const active = createMemo(() => search.start === "1")

  const text = createMemo(() => {
    const desc = typeof search.desc === "string" ? search.desc.trim() : ""
    if (!desc) return ""
    const service = typeof search.service === "string" ? search.service.trim() : ""
    const namespace = typeof search.namespace === "string" ? search.namespace.trim() : ""
    if (!service && !namespace) return desc
    if (service && namespace) return `${desc}. Affected service ${service} on namespace ${namespace}`
    if (service) return `${desc}. Affected service ${service}`
    return `${desc}. Namespace ${namespace}`
  })

  const available = createMemo(() => sync.data.command.some((cmd) => cmd.name === name))

  createEffect(() => {
    console.log("will check command...")
    if (!active()) return
    if (sent()) return
    const args = text()
    console.log("command is ", text)
    if (!args) return
    if (!props.sessionId) return
    if (!ready()) return
    console.log("ready!")
    if (!available()) {
      console.log("not available :(")
      showToast({
        title: "Investigation command unavailable",
        description: `Missing command: ${name}`,
      })
      setSent(true)
      if (params.dir && params.id) {
        const base = `/${params.dir}/investigations/${params.id}`
        navigate(base, { replace: true })
      }
      return
    }
    console.log("AVAILABLE :)")
    setSent(true)
    const pending = sync.session.sync(props.sessionId)
    Promise.resolve(pending)
      .then(() => {
        requestAnimationFrame(() => {
          sdk.client.session
            .command({
              sessionID: props.sessionId,
              command: name,
              arguments: args,
              agent: "default",
              model: undefined,
            })
            .catch((err: unknown) => {
              const message = err instanceof Error ? err.message : "Unknown error"
              showToast({ title: "Failed to start investigation", description: message })
            })
        })
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Unknown error"
        showToast({ title: "Failed to load session", description: message })
      })

    if (!params.dir || !params.id) return
    const base = `/${params.dir}/investigations/${params.id}`
    navigate(base, { replace: true })
  })

  return null
}

export default function InvestigationDetails() {
  const params = useParams()
  const workspace = useSreWorkspace()
  const { getInvestigation } = useInvestigations()

  const directory = () => workspace.directory()

  if (!directory()) {
    return <Navigate href="/workspace" />
  }

  const investigation = createMemo(() => (params.id ? getInvestigation(params.id) : undefined))

  return (
    <Show when={investigation()} fallback={<NotFoundMessage />}>
      <div class="h-full flex flex-col">
        <div class="">
          <InvestigationHeader investigation={investigation()} />
        </div>

        <div class="flex-1 min-h-0">
          <Show
            when={investigation()?.sessionId}
            fallback={
              <div class="h-full flex flex-col items-center justify-center p-8 text-center">
                <div class="w-16 h-16 rounded-full bg-[var(--aui-color-n-8)] flex items-center justify-center mb-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--aui-color-n-5)"
                    stroke-width="1.5"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-[var(--aui-color-n-2)] mb-2">No Session Linked</h3>
                <p class="text-sm text-[var(--aui-color-n-4)] max-w-sm">
                  This investigation does not have a linked session. Create a new investigation to get started.
                </p>
              </div>
            }
          >
            <SDKProvider directory={directory()!}>
              <SyncProvider>
                <SessionDataProvider directory={directory()!} sessionId={investigation()!.sessionId!}>
                  <AutoInvestigationCommand sessionId={investigation()!.sessionId!} />
                  <LocalProvider>
                    <PromptProvider directory={directory()!} sessionId={investigation()!.sessionId!}>
                      <TerminalProvider>
                        <FileProvider>
                          <CommentsProvider>
                            <Suspense fallback={<Loading />}>
                              <Page sessionId={investigation()!.sessionId!} />
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
    </Show>
  )
}

function NotFoundMessage() {
  const params = useParams()
  const href = params.dir ? `/${params.dir}/investigations` : "/investigations"

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

        <h1 class="text-2xl font-semibold text-[var(--aui-color-n-1)] mb-2">Investigation Not Found</h1>

        <p class="text-[var(--aui-color-n-4)] mb-6">
          The investigation you're looking for doesn't exist or may have been removed.
        </p>

        <a href={href} class="sre-btn sre-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Investigations
        </a>
      </div>
    </div>
  )
}
