import { Match, Switch } from "solid-js"
import type { InvestigationStatus } from "../../pages/sre/types"

interface StatusBadgeProps {
  status: InvestigationStatus
  size?: "sm" | "md"
}

export function StatusBadge(props: StatusBadgeProps) {
  const sizeClass = () => (props.size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm")

  return (
    <Switch>
      <Match when={props.status === "in_progress"}>
        <span class={`sre-badge sre-badge-primary ${sizeClass()}`}>In Progress</span>
      </Match>
      <Match when={props.status === "concluded"}>
        <span class={`sre-badge sre-badge-success ${sizeClass()}`}>Concluded</span>
      </Match>
      <Match when={props.status === "inconclusive"}>
        <span class={`sre-badge sre-badge-warning ${sizeClass()}`}>Inconclusive</span>
      </Match>
      <Match when={props.status === "canceled"}>
        <span class={`sre-badge sre-badge-neutral ${sizeClass()}`}>Canceled</span>
      </Match>
    </Switch>
  )
}
