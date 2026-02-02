import { createMemo, createSignal, Show } from "solid-js"
import { useInvestigationData } from "@/hooks/useInvestigationData"
import { InvestigationFlowGraph } from "./investigation-flow/InvestigationFlowGraph"
import { InvestigationSlider } from "./investigation-flow/InvestigationSlider"
import { FlowLegend } from "./investigation-flow/FlowLegend"
import type { FlowNode } from "./investigation-flow/layout"
import { IconButton } from "@opencode-ai/ui/icon-button"

interface Props {
  directory?: string
  workspaceDirectory?: string
  fileTreeOpen?: boolean
  onHideFileTree?: () => void
  onShowFileTree?: () => void
}

export function InvestigationFlow(props: Props) {
  const [selectedNode, setSelectedNode] = createSignal<FlowNode | null>(null)
  const [collapsed, setCollapsed] = createSignal(false)
  const hasDirectory = createMemo(() => !!props.directory)

  const { data, loading, error } = useInvestigationData({
    directory: () => props.directory,
    workspaceDirectory: () => props.workspaceDirectory,
    pollInterval: 5000
  })
  const loaded = createMemo(() => !!data())
  const busy = createMemo(() => loading() && !loaded())
  const fault = createMemo(() => !loading() && !loaded() && error())
  const toggleGroup = () => setCollapsed(prev => !prev)
  const onSelect = (node: FlowNode) => {
    if (node.type === "hypothesis_group") {
      toggleGroup()
      setSelectedNode(null)
      return
    }
    setSelectedNode(node)
  }

  return (
    <div class="relative flex h-full w-full bg-background-stronger overflow-hidden">
      <Show when={!hasDirectory()}>
        <EmptyState />
      </Show>

      <Show when={hasDirectory()}>
        <Show when={busy()}>
          <LoadingState />
        </Show>

        <Show when={fault()}>
          <ErrorState error={error()!} />
        </Show>

        <Show when={loaded()}>
          <div class="flex-1 relative">
            <FlowLegend />
            <Show when={props.onShowFileTree && props.fileTreeOpen === false}>
              <IconButton
                icon="layout-right"
                variant="ghost"
                class="absolute top-3 left-3 z-10 bg-white/90 border border-border-base shadow-sm"
                onClick={props.onShowFileTree}
                aria-label="Show file tree panel"
              />
            </Show>
            <Show when={props.onHideFileTree && props.fileTreeOpen === true}>
              <IconButton
                icon="layout-right-full"
                variant="ghost"
                class="absolute top-3 left-3 z-10 bg-white/90 border border-border-base shadow-sm"
                onClick={props.onHideFileTree}
                aria-label="Hide file tree panel"
              />
            </Show>

            <InvestigationFlowGraph
              data={data()!}
              collapsed={collapsed()}
              onNodeClick={onSelect}
            />
          </div>

          <InvestigationSlider
            node={selectedNode()}
            data={data()!}
            onClose={() => setSelectedNode(null)}
            collapsed={collapsed()}
            onToggleGroup={toggleGroup}
          />
        </Show>
      </Show>
    </div>
  )
}

function EmptyState() {
  return (
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="text-text-weak">No investigations in this session yet</div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div class="flex-1 flex items-center justify-center">
      <div class="text-text-weak">Loading investigation data...</div>
    </div>
  )
}

function ErrorState(props: { error: Error }) {
  return (
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="text-text-weak mb-2">Failed to load investigation</div>
        <div class="text-12-regular text-text-weak">{props.error.message}</div>
      </div>
    </div>
  )
}
