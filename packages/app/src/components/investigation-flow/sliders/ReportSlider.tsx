import { Show } from "solid-js"
import { Markdown } from "@opencode-ai/ui/markdown"

interface Props {
  report?: string
}

export function ReportSlider(props: Props) {
  const text = () => props.report?.trim()

  return (
    <div class="space-y-4">
      <div class="text-12-regular text-text-weak">report.md</div>
      <Show
        when={text()}
        fallback={
          <div class="rounded-lg border border-border-base bg-surface-base p-6 text-12-regular text-text-weak">
            Report content is not available yet.
          </div>
        }
      >
        {(value) => (
          <div class="rounded-lg border border-border-base bg-surface-base p-5">
            <Markdown text={value()} class="text-13-regular" />
          </div>
        )}
      </Show>
    </div>
  )
}
