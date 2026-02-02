import { Show, For, createMemo, createEffect, onMount } from "solid-js"
import { createStore } from "solid-js/store"
import { useSync } from "@/context/sync"
import { SessionTurn } from "@opencode-ai/ui/session-turn"
import { PromptInput } from "@/components/prompt-input"
import { createAutoScroll } from "@opencode-ai/ui/hooks"

interface InvestigationSessionProps {
  sessionId: string
}

export function InvestigationSession(props: InvestigationSessionProps) {
  const sync = useSync()

  const [store, setStore] = createStore<{
    expanded: Record<string, boolean>
  }>({
    expanded: {},
  })

  onMount(() => {
    sync.session.sync(props.sessionId)
  })

  const messages = createMemo(() => sync.data.message[props.sessionId] ?? [])

  const lastUserMessage = createMemo(() => {
    const msgs = messages()
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "user") return msgs[i]
    }
    return undefined
  })

  const autoScroll = createAutoScroll({
    working: () => true,
    overflowAnchor: "dynamic",
  })

  createEffect(() => {
    const msgs = messages()
    if (msgs.length > 0) {
      autoScroll.scrollToBottom()
    }
  })

  return (
    <div class="flex flex-col h-full">
      <div
        ref={autoScroll.scrollRef}
        class="flex-1 overflow-y-auto"
        onScroll={autoScroll.handleScroll}
      >
        <div ref={autoScroll.contentRef}>
        <Show
          when={messages().length > 0}
          fallback={
            <div class="flex flex-col items-center justify-center h-full text-center p-8">
              <div class="w-16 h-16 rounded-full bg-[var(--aui-color-n-8)] flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--aui-color-n-5)" stroke-width="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-[var(--aui-color-n-2)] mb-2">
                Start Investigation
              </h3>
              <p class="text-sm text-[var(--aui-color-n-4)] max-w-sm">
                Send a message to start investigating. The AI agent will help analyze the incident.
              </p>
            </div>
          }
        >
          <div class="p-4">
            <For each={messages()}>
              {(message) => (
                <div
                  data-message-id={message.id}
                  class="min-w-0 w-full max-w-full mb-4"
                >
                  <SessionTurn
                    sessionID={props.sessionId}
                    messageID={message.id}
                    lastUserMessageID={lastUserMessage()?.id}
                    stepsExpanded={store.expanded[message.id] ?? false}
                    onStepsExpandedToggle={() =>
                      setStore("expanded", message.id, (open: boolean | undefined) => !open)
                    }
                    classes={{
                      root: "min-w-0 w-full relative",
                      content: "flex flex-col justify-between !overflow-visible",
                      container: "w-full",
                    }}
                  />
                </div>
              )}
            </For>
          </div>
        </Show>
        </div>
      </div>

      <div class="shrink-0 border-t border-[var(--aui-color-border)] p-4">
        <PromptInput />
      </div>
    </div>
  )
}
