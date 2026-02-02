import { createMemo, For, Show } from "solid-js"
import type { Investigation, Hypothesis, Observation, HypothesisStatus, ObservationSource } from "@/pages/sre/types"

interface FlowNode {
  id: string
  type: "incident" | "source" | "hypothesis" | "conclusion"
  label: string
  sublabel?: string
  status?: HypothesisStatus
  x: number
  y: number
  width: number
  height: number
  data?: Hypothesis
}

interface FlowEdge {
  from: string
  to: string
}

interface HypothesisFlowProps {
  investigation: Investigation
  hypotheses: Hypothesis[]
  observations: Observation[]
  onNodeClick?: (hypothesis: Hypothesis) => void
}

const NODE_WIDTH = 180
const NODE_HEIGHT = 56
const SOURCE_WIDTH = 100
const SOURCE_HEIGHT = 40
const HORIZONTAL_GAP = 24
const VERTICAL_GAP = 60
const CANVAS_PADDING = 40

export function HypothesisFlow(props: HypothesisFlowProps) {
  const layout = createMemo(() => {
    const nodes: FlowNode[] = []
    const edges: FlowEdge[] = []

    let y = CANVAS_PADDING

    const incidentNode: FlowNode = {
      id: "incident",
      type: "incident",
      label: props.investigation.name,
      sublabel: props.investigation.affectedService,
      x: 0,
      y,
      width: NODE_WIDTH + 40,
      height: NODE_HEIGHT
    }
    nodes.push(incidentNode)

    y += NODE_HEIGHT + VERTICAL_GAP

    const sources = getUniqueSources(props.observations)
    const sourceNodes: FlowNode[] = sources.map((source, i) => ({
      id: `source-${source}`,
      type: "source" as const,
      label: formatSource(source),
      x: i * (SOURCE_WIDTH + HORIZONTAL_GAP),
      y,
      width: SOURCE_WIDTH,
      height: SOURCE_HEIGHT
    }))
    nodes.push(...sourceNodes)

    sourceNodes.forEach(sn => edges.push({ from: "incident", to: sn.id }))

    y += SOURCE_HEIGHT + VERTICAL_GAP

    const sortedHypotheses = [...props.hypotheses].sort((a, b) => b.priorityScore - a.priorityScore)
    const hypothesisNodes: FlowNode[] = sortedHypotheses.map((h, i) => {
      const node: FlowNode = {
        id: h.id,
        type: "hypothesis",
        label: h.description,
        status: h.status,
        x: i * (NODE_WIDTH + HORIZONTAL_GAP),
        y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        data: h
      }
      return node
    })
    nodes.push(...hypothesisNodes)

    sourceNodes.forEach(sn => {
      hypothesisNodes.forEach(hn => {
        edges.push({ from: sn.id, to: hn.id })
      })
    })

    y += NODE_HEIGHT + VERTICAL_GAP

    if (props.investigation.status === "concluded" && props.investigation.rootCause) {
      const conclusionNode: FlowNode = {
        id: "conclusion",
        type: "conclusion",
        label: "Root Cause Identified",
        sublabel: props.investigation.rootCause.slice(0, 60) + (props.investigation.rootCause.length > 60 ? "..." : ""),
        x: 0,
        y,
        width: NODE_WIDTH + 40,
        height: NODE_HEIGHT
      }
      nodes.push(conclusionNode)

      const validatedHypothesis = hypothesisNodes.find(hn => hn.data?.validationResult?.isRootCause)
      if (validatedHypothesis) {
        edges.push({ from: validatedHypothesis.id, to: "conclusion" })
      }

      y += NODE_HEIGHT
    }

    const maxX = Math.max(...nodes.map(n => n.x + n.width))
    const centerOffset = (maxX / 2)

    nodes.forEach(node => {
      if (node.type === "incident" || node.type === "conclusion") {
        node.x = centerOffset - node.width / 2
      } else if (node.type === "source") {
        const totalSourceWidth = sourceNodes.length * SOURCE_WIDTH + (sourceNodes.length - 1) * HORIZONTAL_GAP
        const sourceStartX = centerOffset - totalSourceWidth / 2
        const idx = sourceNodes.indexOf(node)
        node.x = sourceStartX + idx * (SOURCE_WIDTH + HORIZONTAL_GAP)
      } else if (node.type === "hypothesis") {
        const totalWidth = hypothesisNodes.length * NODE_WIDTH + (hypothesisNodes.length - 1) * HORIZONTAL_GAP
        const startX = centerOffset - totalWidth / 2
        const idx = hypothesisNodes.indexOf(node)
        node.x = startX + idx * (NODE_WIDTH + HORIZONTAL_GAP)
      }
    })

    const canvasWidth = maxX + CANVAS_PADDING * 2
    const canvasHeight = y + CANVAS_PADDING

    return { nodes, edges, width: Math.max(canvasWidth, 600), height: canvasHeight }
  })

  const getNodeById = (id: string) => layout().nodes.find(n => n.id === id)

  const statusColors: Record<HypothesisStatus, string> = {
    validated: "#00c261",
    invalidated: "#eb0027",
    pending: "#ced9ec",
    inconclusive: "#8c52ff"
  }

  return (
    <div class="flow-container">
      <FlowLegend />
      <div class="flow-canvas-wrapper">
        <svg
          class="flow-canvas"
          width={layout().width}
          height={layout().height}
          viewBox={`0 0 ${layout().width} ${layout().height}`}
        >
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#b0c0d8" />
            </marker>
          </defs>

          <For each={layout().edges}>
            {(edge) => {
              const from = getNodeById(edge.from)
              const to = getNodeById(edge.to)
              if (!from || !to) return null

              const x1 = from.x + from.width / 2
              const y1 = from.y + from.height
              const x2 = to.x + to.width / 2
              const y2 = to.y

              const midY = (y1 + y2) / 2

              return (
                <path
                  d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                  fill="none"
                  stroke="#ced9ec"
                  stroke-width="1.5"
                  marker-end="url(#arrow)"
                />
              )
            }}
          </For>

          <For each={layout().nodes}>
            {(node) => (
              <g
                class={`flow-node flow-node-${node.type}`}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => {
                  if (node.type === "hypothesis" && node.data && props.onNodeClick) {
                    props.onNodeClick(node.data)
                  }
                }}
                style={{ cursor: node.type === "hypothesis" ? "pointer" : "default" }}
              >
                <rect
                  x="0"
                  y="0"
                  width={node.width}
                  height={node.height}
                  rx="6"
                  fill={node.type === "incident" ? "#fef2f2" : 
                        node.type === "conclusion" ? "#e6f9ee" :
                        node.type === "source" ? "#f7f9fc" : "#ffffff"}
                  stroke={node.type === "incident" ? "#eb0027" :
                          node.type === "conclusion" ? "#00c261" :
                          node.type === "hypothesis" && node.status ? statusColors[node.status] :
                          node.type === "source" ? "#ced9ec" : "transparent"}
                  stroke-width={node.type === "hypothesis" || node.type === "incident" || node.type === "conclusion" ? "2" : "1"}
                />

                <text
                  x={node.width / 2}
                  y={node.sublabel ? node.height / 2 - 6 : node.height / 2 + 4}
                  text-anchor="middle"
                  fill="#1a2b4b"
                  font-size={node.type === "source" ? "11" : "12"}
                  font-weight="500"
                >
                  <tspan>{truncate(node.label, node.type === "hypothesis" ? 22 : 28)}</tspan>
                </text>

                <Show when={node.sublabel}>
                  <text
                    x={node.width / 2}
                    y={node.height / 2 + 12}
                    text-anchor="middle"
                    fill="#6b7d9d"
                    font-size="11"
                  >
                    {truncate(node.sublabel!, 35)}
                  </text>
                </Show>
              </g>
            )}
          </For>
        </svg>
      </div>
    </div>
  )
}

function FlowLegend() {
  return (
    <div class="flow-legend">
      <div class="legend-item">
        <span class="legend-dot" style={{ "background-color": "#00c261" }} />
        <span>Validated</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot" style={{ "background-color": "#eb0027" }} />
        <span>Invalidated</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot" style={{ "background-color": "#ced9ec" }} />
        <span>Pending</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot" style={{ "background-color": "#8c52ff" }} />
        <span>Inconclusive</span>
      </div>
    </div>
  )
}

function getUniqueSources(observations: Observation[]): ObservationSource[] {
  const sources = new Set(observations.map(o => o.source))
  return Array.from(sources)
}

function formatSource(source: ObservationSource): string {
  const labels: Record<ObservationSource, string> = {
    metrics: "Metrics",
    logs: "Logs",
    traces: "Traces",
    audits: "Audits",
    resources: "Resources",
    changes: "Changes",
    topology: "Topology"
  }
  return labels[source] || source
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1) + "…"
}
