# SRE Portal Enhancement Plan

## Overview
Enhance the SRE Investigation Portal to:
1. Add workspace selection on initial page load
2. Connect investigations to real OpenCode sessions
3. Embed OpenCode's Chat + IDE UI in investigation details
4. Layer SRE-specific features (flow graph, report) on top

## Current State
- Entry: `packages/app/index-sre.html` -> `entry-sre.tsx` -> `SreApp`
- Routing: `/` -> `/investigations` -> `/investigations/:id`
- Data: Mock investigations via `InvestigationsProvider`
- Details page: Placeholder chat UI + `OverviewPanel`

## Phase 1: Workspace Selection

### Task 1.1: Create SRE Workspace Context
**File:** `packages/app/src/context/sre-workspace.tsx` (NEW)

```tsx
import { createContext, useContext, createMemo, type JSX } from "solid-js"
import { createStore } from "solid-js/store"
import { Persist, persisted } from "@/utils/persist"

interface SreWorkspaceContextType {
  directory: () => string | undefined
  setDirectory: (directory: string | undefined) => void
  ready: () => boolean
}

const SreWorkspaceContext = createContext<SreWorkspaceContextType>()

export function SreWorkspaceProvider(props: { children: JSX.Element }) {
  const [store, setStore, , ready] = persisted(
    Persist.global("sre.workspace", ["sre.workspace.v1"]),
    createStore({
      directory: undefined as string | undefined,
    }),
  )

  const directory = createMemo(() => store.directory)

  const setDirectory = (directory: string | undefined) => {
    setStore("directory", directory)
  }

  return (
    <SreWorkspaceContext.Provider
      value={{
        directory,
        setDirectory,
        ready: () => ready(),
      }}
    >
      {props.children}
    </SreWorkspaceContext.Provider>
  )
}

export function useSreWorkspace() {
  const context = useContext(SreWorkspaceContext)
  if (!context) {
    throw new Error("useSreWorkspace must be used within a SreWorkspaceProvider")
  }
  return context
}
```

### Task 1.2: Create Workspace Selection Page
**File:** `packages/app/src/pages/sre/workspace-select.tsx` (NEW)

```tsx
import { For, Show, createMemo } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { useLayout } from "@/context/layout"
import { useSreWorkspace } from "@/context/sre-workspace"
import { useGlobalSync } from "@/context/global-sync"
import { getFilename } from "@opencode-ai/util/path"
import { Avatar } from "@opencode-ai/ui/avatar"

export default function WorkspaceSelect() {
  const layout = useLayout()
  const workspace = useSreWorkspace()
  const globalSync = useGlobalSync()
  const navigate = useNavigate()

  const projects = createMemo(() => layout.projects.list())

  const selectWorkspace = (directory: string) => {
    workspace.setDirectory(directory)
    navigate("/investigations")
  }

  return (
    <div class="h-full flex flex-col items-center justify-center p-8">
      <div class="max-w-2xl w-full">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-semibold text-[var(--aui-color-n-1)] mb-2">
            Select Workspace
          </h1>
          <p class="text-[var(--aui-color-n-4)]">
            Choose a workspace to start investigating incidents
          </p>
        </div>

        <Show
          when={projects().length > 0}
          fallback={
            <div class="text-center py-12">
              <p class="text-[var(--aui-color-n-4)] mb-4">
                No workspaces available. Please open a project in OpenCode first.
              </p>
            </div>
          }
        >
          <div class="grid gap-3">
            <For each={projects()}>
              {(project) => {
                const [store] = globalSync.child(project.worktree, { bootstrap: false })
                const sessionCount = createMemo(() => 
                  store.session?.filter(s => !s.parentID && !s.time?.archived).length ?? 0
                )
                
                return (
                  <button
                    class="flex items-center gap-4 p-4 rounded-lg border border-[var(--aui-color-border)] bg-[var(--aui-color-surface)] hover:bg-[var(--aui-color-n-8)] transition-colors text-left"
                    onClick={() => selectWorkspace(project.worktree)}
                  >
                    <Avatar
                      size={40}
                      name={project.name || getFilename(project.worktree)}
                      color={project.icon?.color}
                    />
                    <div class="flex-1 min-w-0">
                      <div class="font-medium text-[var(--aui-color-n-1)] truncate">
                        {project.name || getFilename(project.worktree)}
                      </div>
                      <div class="text-sm text-[var(--aui-color-n-4)] truncate">
                        {project.worktree}
                      </div>
                    </div>
                    <div class="text-sm text-[var(--aui-color-n-4)]">
                      {sessionCount()} sessions
                    </div>
                  </button>
                )
              }}
            </For>
          </div>
        </Show>
      </div>
    </div>
  )
}
```

### Task 1.3: Update SreApp with Workspace Provider and Routing
**File:** `packages/app/src/pages/sre/app.tsx` (MODIFY)

Add `SreWorkspaceProvider` and update routing:

```tsx
// Add import
import { SreWorkspaceProvider } from "../../context/sre-workspace"

// Add lazy load for WorkspaceSelect
const WorkspaceSelect = lazy(() => import("./workspace-select"))

// Wrap InvestigationsProvider with SreWorkspaceProvider in Router root:
<SreWorkspaceProvider>
  <InvestigationsProvider>
    <SreErrorBoundary>
      <SreLayout>{props.children}</SreLayout>
    </SreErrorBoundary>
  </InvestigationsProvider>
</SreWorkspaceProvider>

// Update routes:
<Route path="/" component={() => <Navigate href="/workspace" />} />
<Route
  path="/workspace"
  component={() => (
    <Suspense fallback={<Loading />}>
      <WorkspaceSelect />
    </Suspense>
  )}
/>
// Keep existing /investigations routes
```

### Task 1.4: Add Workspace Guard to Investigations List
**File:** `packages/app/src/pages/sre/investigations-list.tsx` (MODIFY)

Add workspace check at the beginning:

```tsx
import { useSreWorkspace } from "../../context/sre-workspace"
import { Navigate } from "@solidjs/router"

export default function InvestigationsList() {
  const workspace = useSreWorkspace()
  
  // Redirect to workspace selection if none selected
  if (!workspace.directory()) {
    return <Navigate href="/workspace" />
  }
  
  // ... rest of the component
}
```

---

## Phase 2: Connect Investigations to Sessions

### Task 2.1: Update Investigation Type
**File:** `packages/app/src/pages/sre/types.ts` (MODIFY)

Add `sessionId` field:

```typescript
export interface Investigation {
  id: string
  sessionId?: string  // Link to OpenCode session
  name: string
  description: string
  status: "in_progress" | "resolved" | "escalated" | "closed"
  // ... rest of fields
}
```

### Task 2.2: Update InvestigationsProvider to Use Real Sessions
**File:** `packages/app/src/context/investigations.tsx` (MODIFY)

```tsx
import { useSreWorkspace } from "./sre-workspace"
import { useGlobalSync } from "./global-sync"
import { useGlobalSDK } from "./global-sdk"

// Inside provider:
const workspace = useSreWorkspace()
const globalSync = useGlobalSync()
const globalSDK = useGlobalSDK()

const createInvestigation = async (input: CreateInvestigationInput): Promise<Investigation> => {
  const directory = workspace.directory()
  if (!directory) throw new Error("No workspace selected")
  
  // Create a real OpenCode session
  const session = await globalSDK.client.session.create({
    directory,
    title: input.description,
  })
  
  const id = `inv-${Date.now()}`
  const newInvestigation: Investigation = {
    id,
    sessionId: session.data?.id,
    directory,
    name: input.description.slice(0, 50) + (input.description.length > 50 ? "..." : ""),
    description: input.description,
    status: "in_progress",
    severity: input.severity,
    affectedService: input.affectedService,
    namespace: input.namespace,
    cluster: input.cluster,
    startedAt: Date.now(),
    currentPhase: "data_collection",
    hypothesesCount: 0,
    observationsCount: 0,
  }

  // Store investigation metadata (could use session metadata or separate store)
  const current = data() || []
  mutate([newInvestigation, ...current])
  
  return newInvestigation
}

// Update fetchInvestigations to load from sessions
const fetchInvestigations = async (): Promise<Investigation[]> => {
  const directory = workspace.directory()
  if (!directory) return []
  
  const [store] = globalSync.child(directory, { bootstrap: true })
  
  // For now, still use mock data but could filter sessions
  // with investigation metadata
  return [...mockInvestigations]
}
```

---

## Phase 3: Embed OpenCode Chat+IDE

### Task 3.1: Add Missing Providers to SreApp
**File:** `packages/app/src/pages/sre/app.tsx` (MODIFY)

Add required providers for session components:

```tsx
// Add imports
import { SyncProvider } from "../../context/sync"
import { PromptProvider } from "../../context/prompt"
import { TerminalProvider } from "../../context/terminal"
import { FileProvider } from "../../context/file"
import { CommentsProvider } from "../../context/comments"
import { LocalProvider } from "../../context/local"

// These providers need to wrap the investigation details route
// Create a SessionProvidersWrapper component:

function SessionProvidersWrapper(props: { directory: string; children: JSX.Element }) {
  return (
    <SyncProvider directory={props.directory}>
      <LocalProvider directory={props.directory}>
        <PromptProvider directory={props.directory}>
          <TerminalProvider directory={props.directory}>
            <FileProvider directory={props.directory}>
              <CommentsProvider>
                {props.children}
              </CommentsProvider>
            </FileProvider>
          </TerminalProvider>
        </PromptProvider>
      </LocalProvider>
    </SyncProvider>
  )
}
```

### Task 3.2: Create Embedded Session Component
**File:** `packages/app/src/components/sre/investigation-session.tsx` (NEW)

This component wraps the session page content for embedding:

```tsx
import { Show, createMemo } from "solid-js"
import { useParams } from "@solidjs/router"
import { useSreWorkspace } from "@/context/sre-workspace"
import { useSync } from "@/context/sync"
import { useLayout } from "@/context/layout"
import { PromptInput } from "@/components/prompt-input"
import { SessionTurn } from "@opencode-ai/ui/session-turn"
import { SessionReview } from "@opencode-ai/ui/session-review"
import { base64Encode } from "@opencode-ai/util/encode"

interface InvestigationSessionProps {
  sessionId: string
}

export function InvestigationSession(props: InvestigationSessionProps) {
  const workspace = useSreWorkspace()
  const sync = useSync()
  const layout = useLayout()
  
  const directory = () => workspace.directory() || ""
  const sessionKey = createMemo(() => `${base64Encode(directory())}/${props.sessionId}`)
  
  const messages = createMemo(() => sync.data.message[props.sessionId] ?? [])
  const info = createMemo(() => sync.session.get(props.sessionId))
  const diffs = createMemo(() => sync.data.session_diff[props.sessionId] ?? [])
  
  const tabs = createMemo(() => layout.tabs(sessionKey))
  const view = createMemo(() => layout.view(sessionKey))
  
  return (
    <div class="flex flex-col h-full">
      {/* Messages area */}
      <div class="flex-1 overflow-y-auto p-4">
        <Show 
          when={messages().length > 0}
          fallback={
            <div class="flex items-center justify-center h-full text-[var(--aui-color-n-4)]">
              Start a conversation to investigate this incident
            </div>
          }
        >
          {/* Render session turns - simplified version */}
          <For each={messages()}>
            {(message) => (
              <SessionTurn 
                message={message} 
                parts={sync.data.part[message.id] ?? []}
              />
            )}
          </For>
        </Show>
      </div>
      
      {/* Prompt input */}
      <div class="shrink-0 border-t border-[var(--aui-color-border)] p-4">
        <PromptInput />
      </div>
    </div>
  )
}
```

### Task 3.3: Update Investigation Details to Embed Session
**File:** `packages/app/src/pages/sre/investigation-details.tsx` (MODIFY)

Replace placeholder with embedded session:

```tsx
import { Show, createMemo, lazy, Suspense } from "solid-js"
import { useParams, Navigate } from "@solidjs/router"
import { useInvestigations } from "../../context/investigations"
import { useSreWorkspace } from "../../context/sre-workspace"
import { InvestigationHeader } from "../../components/sre/investigation-header"
import { OverviewPanel } from "../../components/sre/overview-panel"
import { SyncProvider } from "../../context/sync"
import { LocalProvider } from "../../context/local"
import { PromptProvider } from "../../context/prompt"
import { TerminalProvider } from "../../context/terminal"
import { FileProvider } from "../../context/file"
import { CommentsProvider } from "../../context/comments"
import { InvestigationSession } from "../../components/sre/investigation-session"

export default function InvestigationDetails() {
  const params = useParams()
  const workspace = useSreWorkspace()
  const { getInvestigation, getHypotheses, getObservations, getReport } = useInvestigations()

  // Redirect if no workspace
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
          {/* Main content: Embedded OpenCode Session */}
          <div class="flex-1 min-w-0 flex flex-col bg-[var(--aui-color-surface)] border border-[var(--aui-color-border)] rounded-lg overflow-hidden">
            <div class="px-4 py-3 border-b border-[var(--aui-color-border)] flex items-center justify-between">
              <h2 class="text-sm font-medium text-[var(--aui-color-n-2)]">Agent Chat</h2>
              <Show when={investigation()?.sessionId}>
                <span class="text-xs text-[var(--aui-color-n-4)]">
                  Session: {investigation()!.sessionId}
                </span>
              </Show>
            </div>
            
            {/* Wrap with session providers */}
            <Show 
              when={investigation()?.sessionId}
              fallback={
                <div class="flex-1 flex items-center justify-center text-[var(--aui-color-n-4)]">
                  No session linked to this investigation
                </div>
              }
            >
              <SyncProvider directory={directory()!}>
                <LocalProvider directory={directory()!}>
                  <PromptProvider directory={directory()!}>
                    <TerminalProvider directory={directory()!}>
                      <FileProvider directory={directory()!}>
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
            </Show>
          </div>

          {/* Right sidebar: SRE-specific panels */}
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
      {/* ... existing not found UI ... */}
    </div>
  )
}
```

---

## Phase 4: SRE-Specific Features (Future)

### Task 4.1: Add Tabbed View for Investigation Modes
- Tab 1: Chat + IDE (default)
- Tab 2: Investigation Graph (HypothesisFlow)
- Tab 3: Report View

### Task 4.2: Integrate Flow Graph Overlay
- Use existing `hypothesis-flow.tsx` component
- Connect to investigation state

### Task 4.3: Report Generation
- Use existing `report-panel.tsx`
- Add report export functionality

---

## File Summary

### New Files
1. `packages/app/src/context/sre-workspace.tsx` - Workspace selection context
2. `packages/app/src/pages/sre/workspace-select.tsx` - Workspace selection page
3. `packages/app/src/components/sre/investigation-session.tsx` - Embedded session component

### Modified Files
1. `packages/app/src/pages/sre/app.tsx` - Add providers and routing
2. `packages/app/src/pages/sre/types.ts` - Add sessionId to Investigation
3. `packages/app/src/context/investigations.tsx` - Use workspace, create real sessions
4. `packages/app/src/pages/sre/investigations-list.tsx` - Add workspace guard
5. `packages/app/src/pages/sre/investigation-details.tsx` - Embed session UI

---

## Execution Order

1. **Task 1.1** - Create `sre-workspace.tsx` context
2. **Task 1.2** - Create `workspace-select.tsx` page
3. **Task 1.3** - Update `app.tsx` routing
4. **Task 1.4** - Add workspace guard to investigations list
5. **Task 2.1** - Update Investigation type
6. **Task 2.2** - Update InvestigationsProvider
7. **Task 3.1** - Add session providers (if needed separately)
8. **Task 3.2** - Create InvestigationSession component
9. **Task 3.3** - Update investigation-details.tsx

---

## Testing Checklist

- [ ] App loads and redirects to `/workspace`
- [ ] Workspace selection shows available projects
- [ ] Selecting workspace navigates to `/investigations`
- [ ] Investigations list shows (mock or real data)
- [ ] Creating investigation creates real OpenCode session
- [ ] Investigation details shows embedded chat UI
- [ ] Chat input works and sends messages
- [ ] Messages display correctly
- [ ] SRE overview panel still functions
- [ ] Navigation between pages works correctly
