import { For, Show, createMemo } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { useLayout } from "@/context/layout"
import { useSreWorkspace } from "@/context/sre-workspace"
import { useGlobalSync } from "@/context/global-sync"
import { useServer } from "@/context/server"
import { usePlatform } from "@/context/platform"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { getFilename } from "@opencode-ai/util/path"
import { base64Encode } from "@opencode-ai/util/encode"
import { Avatar } from "@opencode-ai/ui/avatar"
import { DialogSelectDirectory } from "@/components/dialog-select-directory"

export default function WorkspaceSelect() {
  const layout = useLayout()
  const workspace = useSreWorkspace()
  const globalSync = useGlobalSync()
  const navigate = useNavigate()
  const dialog = useDialog()
  const platform = usePlatform()
  const server = useServer()

  const projects = createMemo(() => layout.projects.list())

  const selectWorkspace = (directory: string) => {
    workspace.setDirectory(directory)
    navigate(`/${base64Encode(directory)}/investigations`)
  }

  const addWorkspace = async () => {
    const resolve = (result: string | string[] | null) => {
      if (Array.isArray(result)) {
        for (const directory of result) {
          layout.projects.open(directory)
          server.projects.touch(directory)
          selectWorkspace(directory)
        }
      } else if (result) {
        layout.projects.open(result)
        server.projects.touch(result)
        selectWorkspace(result)
      }
    }

    if (platform.openDirectoryPickerDialog && server.isLocal()) {
      const result = await platform.openDirectoryPickerDialog({
        title: "Select Workspace",
        multiple: false,
      })
      resolve(result)
    } else {
      dialog.show(
        () => <DialogSelectDirectory title="Select Workspace" onSelect={resolve} />,
        () => resolve(null),
      )
    }
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
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--aui-color-n-8)] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--aui-color-n-4)" stroke-width="1.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
              </div>
              <p class="text-[var(--aui-color-n-4)] mb-6">
                No workspaces available. Add a workspace to start investigating.
              </p>
              <button 
                class="sre-btn sre-btn-primary"
                onClick={addWorkspace}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
                Add Workspace
              </button>
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

            <button
              class="flex items-center justify-center gap-2 p-4 rounded-lg border border-dashed border-[var(--aui-color-border)] bg-transparent hover:bg-[var(--aui-color-n-8)] hover:border-[var(--aui-color-primary)] transition-colors text-[var(--aui-color-n-4)] hover:text-[var(--aui-color-primary)]"
              onClick={addWorkspace}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span class="font-medium">Add Workspace</span>
            </button>
          </div>
        </Show>
      </div>
    </div>
  )
}
