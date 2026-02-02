import { createMemo, For, Show } from "solid-js"
import { calculateLayout, type FlowNode } from "./layout"
import type { InvestigationMetadata } from "@/hooks/useInvestigationData"

interface Props {
  data: InvestigationMetadata
  onNodeClick?: (node: FlowNode) => void
  collapsed?: boolean
}


export function InvestigationFlowGraph(props: Props) {
  const layout = createMemo(() => calculateLayout(props.data, !!props.collapsed))

  const find = (id: string) => layout().nodes.find(n => n.id === id)
  const group = (node: FlowNode) => {
    const data = node.data
    if (!data) return
    if (!("isGroup" in data)) return
    return data
  }

  const color = (node: FlowNode) => {
    if (node.type === 'incident') return '#fef2f2'
    if (node.type === 'root_cause') return '#e6f9ee'
    if (node.type === 'hypothesis_group' && group(node) && !group(node)?.collapsed) return '#ffffff'
    if (node.type === 'report') return '#ffffff'
    if (node.status === 'ongoing') return '#e8f1ff'
    if (node.status === 'validated') return '#e6f9ee'
    if (node.status === 'invalidated') return '#fef2f2'
    if (node.status === 'inconclusive') return '#f9f5ff'
    return '#f1f5f9'
  }

  const border = (node: FlowNode) => {
    if (node.type === 'incident') return '#eb0027'
    if (node.type === 'root_cause') return '#00c261'
    if (node.type === 'hypothesis_group' && group(node) && !group(node)?.collapsed) return '#e2e8f0'
    if (node.status === 'ongoing') return '#3b82f6'
    if (node.status === 'validated') return '#00c261'
    if (node.status === 'invalidated') return '#eb0027'
    if (node.status === 'inconclusive') return '#8c52ff'
    return '#ced9ec'
  }

  return (
      <div class="investigation-flow-graph overflow-hidden flex items-center justify-center h-full w-full">
        <svg
          width="90%"
          height="90%"
          viewBox={`0 0 ${layout().width} ${layout().height}`}
          preserveAspectRatio="xMidYMid meet"
          class="transition-all duration-300"
        >
        <title>Investigation Flow Graph</title>
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#b0c0d8" />
          </marker>
          <marker id="arrow-validated" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#00c261" />
          </marker>
        </defs>

        <For each={layout().edges}>
          {(edge) => {
            const from = find(edge.from)
            const to = find(edge.to)
            if (!from || !to) return null

            const x1 = from.x + from.width / 2
            const y1 = from.y + from.height
            const x2 = to.x + to.width / 2
            const y2 = to.y
            const midY = (y1 + y2) / 2

            const isRoot = to.type === 'root_cause'
            const validated = edge.type === 'validated' && !isRoot
            const stroke = validated ? '#00c261' : '#ced9ec'
            const marker = validated ? 'url(#arrow-validated)' : 'url(#arrow)'
            const width = validated ? 2 : 1.5

            return (
              <path
                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                fill="none"
                stroke={stroke}
                stroke-width={width}
                marker-end={marker}
                class="transition-all duration-300"
                style={{
                  transition: "stroke 260ms ease, stroke-width 260ms ease, opacity 200ms ease"
                }}
              />
            )
          }}
        </For>

        <For each={layout().nodes}>
          {(node) => {
            const clickable = true
            const press = () => {
              if (!clickable) return
              props.onNodeClick?.(node)
            }

            return (
              <g
                class="flow-node hover:opacity-80 transition-all duration-300 ease-in-out"
                transform={`translate(${node.x}, ${node.y})`}
                style={{
                  cursor: clickable ? "pointer" : "default",
                  transition: "opacity 200ms ease"
                }}
              >
                <rect
                  width={node.width}
                  height={node.height}
                  rx="8"
                  fill={color(node)}
                  stroke={border(node)}
                  stroke-width={node.type === 'hypothesis' || node.type === 'incident' || node.type === 'root_cause' ? 2 : 1}
                  class="transition-colors duration-300"
                  style={{
                    transition: "fill 260ms ease, stroke 260ms ease, stroke-width 260ms ease",
                    cursor: clickable ? "pointer" : "default",
                    "pointer-events": "all"
                  }}
                />
                <rect
                  width={node.width}
                  height={node.height}
                  rx="8"
                  fill="transparent"
                  stroke="transparent"
                  onPointerDown={press}
                  onClick={press}
                  style={{ "pointer-events": "all" }}
                />
                <foreignObject width={node.width} height={node.height} x={0} y={0} style={{ "pointer-events": "none" }}>
                  <div
                    class="w-full h-full flex flex-col items-center justify-start p-3 text-center select-none bg-transparent border-none appearance-none outline-none rounded-lg"
                    aria-label={`Open ${node.label}`}
                  >
                    <div
                      class="font-medium leading-snug w-full"
                      style={{
                        color: '#1a2b4b',
                        "font-size": "14px",
                        "font-weight": "600",
                        display: "-webkit-box",
                        "-webkit-line-clamp": "2",
                        "-webkit-box-orient": "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {node.label}
                    </div>

                    <Show when={node.sublabel}>
                      <div
                        class="mt-1 leading-snug w-full"
                        style={{
                          color: '#6b7d9d',
                          "font-size": "12px",
                          display: "-webkit-box",
                          "-webkit-line-clamp": "1",
                          "-webkit-box-orient": "vertical",
                          overflow: "hidden",
                          "text-overflow": "ellipsis"
                        }}
                      >
                        {node.sublabel}
                      </div>
                    </Show>
                  </div>
                </foreignObject>
              </g>
            )
          }}
        </For>
      </svg>
    </div>
  )
}
