import { type JSX } from "solid-js"

export function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") return
  return value as Record<string, unknown>
}

export function pickString(target: Record<string, unknown> | undefined, keys: string[]) {
  if (!target) return
  const value = keys.map((key) => target[key]).find((item) => typeof item === "string")
  if (typeof value === "string") return value
}

export function pickBoolean(target: Record<string, unknown> | undefined, keys: string[]) {
  if (!target) return
  const value = keys.map((key) => target[key]).find((item) => typeof item === "boolean")
  if (typeof value === "boolean") return value
}

export function pickArray<T = unknown>(target: Record<string, unknown> | undefined, keys: string[]) {
  if (!target) return
  const value = keys.map((key) => target[key]).find((item) => Array.isArray(item))
  if (Array.isArray(value)) return value as T[]
}

export function formatDateTime(iso?: string): string {
  if (!iso) return "—"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })
}

export function formatSource(source: string): string {
  const labels: Record<string, string> = {
    "k8s-resources": "Kubernetes Resources",
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

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max - 1) + "…"
}

export function InfoRow(props: { label: string; value?: string | JSX.Element }) {
  const value = () => props.value ?? "—"
  return (
    <div class="flex items-start gap-2">
      <span class="text-12-regular text-text-weak min-w-[100px]">{props.label}:</span>
      <span class="text-12-regular text-text-base">{typeof value() === 'string' ? value() : value()}</span>
    </div>
  )
}

export function ConfidenceBadge(props: { confidence: "high" | "medium" | "low" }) {
  const classes = () => {
    if (props.confidence === "high") return "bg-green-50 text-green-700 border-green-200"
    if (props.confidence === "medium") return "bg-yellow-50 text-yellow-700 border-yellow-200"
    return "bg-gray-50 text-gray-600 border-gray-200"
  }
  
  return (
    <span class={`px-2 py-0.5 text-11-medium rounded border ${classes()}`}>
      {props.confidence}
    </span>
  )
}

export function StatusBadge(props: { status?: string }) {
  const status = () => props.status ?? "unknown"
  const classes = () => {
    if (status() === "validated" || status() === "completed") return "bg-green-50 text-green-700"
    if (status() === "invalidated") return "bg-red-50 text-red-700"
    if (status() === "inconclusive") return "bg-purple-50 text-purple-700"
    if (status() === "ongoing") return "bg-blue-50 text-blue-700"
    if (status() === "pending") return "bg-gray-50 text-gray-600"
    if (status() === "in_progress") return "bg-blue-50 text-blue-700"
    return "bg-gray-50 text-gray-600"
  }
  
  return (
    <span class={`px-2 py-0.5 text-11-medium rounded ${classes()}`}>
      {status().replace(/_/g, " ")}
    </span>
  )
}
