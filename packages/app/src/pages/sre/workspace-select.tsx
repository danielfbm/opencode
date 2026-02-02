import { For, Show, createMemo } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { useLayout } from "@/context/layout"
import { useSreWorkspace } from "@/context/sre-workspace"
import { useGlobalSync } from "@/context/global-sync"
import { getFilename } from "@opencode-ai/util/path"
import { base64Encode } from "@opencode-ai/util/encode"
import { Avatar } from "@opencode-ai/ui/avatar"

export default function WorkspaceSelect() {
  const layout = useLayout()
  const workspace = useSreWorkspace()
  const globalSync = useGlobalSync()
  const navigate = useNavigate()

  const projects = createMemo(() => layout.projects.list())

  const selectWorkspace = (directory: string) => {
    workspace.setDirectory(directory)
    navigate(`/${base64Encode(directory)}/investigations`)
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
                    <div class="size-10 shrink-0">
                      <Avatar
                        fallback={project.name || getFilename(project.worktree)}
                        src={"override" in (project.icon || {}) ? (project.icon as { override?: string }).override : undefined}
                        background={`var(--avatar-background-${project.icon?.color ?? "pink"})`}
                        foreground={`var(--avatar-text-${project.icon?.color ?? "pink"})`}
                        class="size-full rounded"
                      />
                    </div>
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
