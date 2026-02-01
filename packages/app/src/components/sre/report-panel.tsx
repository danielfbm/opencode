import { Show, createSignal } from "solid-js"
import type { Investigation } from "../../pages/sre/types"

interface Props {
  investigation: Investigation | undefined
  report: string | undefined
}

export function ReportPanel(props: Props) {
  const [copied, setCopied] = createSignal(false)

  const copyToClipboard = () => {
    if (!props.report) return
    navigator.clipboard.writeText(props.report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium text-[var(--aui-color-n-2)]">Investigation Report</h3>
        <Show when={props.report}>
          <button
            onClick={copyToClipboard}
            class="sre-btn sre-btn-secondary text-xs h-7 px-3"
          >
            <Show when={copied()} fallback={
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            }>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--aui-color-success)" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </Show>
          </button>
        </Show>
      </div>

      <Show 
        when={props.report}
        fallback={
          <div class="py-12 text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--aui-color-n-8)] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--aui-color-n-5)" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <p class="text-sm text-[var(--aui-color-n-4)]">
              {props.investigation?.status === "in_progress" 
                ? "Report will be generated when the investigation is completed"
                : "No report available for this investigation"
              }
            </p>
          </div>
        }
      >
        <div class="report-content bg-[var(--aui-color-n-9)] rounded-lg p-5 text-sm leading-relaxed">
          <MarkdownRenderer content={props.report!} />
        </div>
      </Show>
    </div>
  )
}

function MarkdownRenderer(props: { content: string }) {
  const renderMarkdown = () => {
    const lines = props.content.split("\n")
    const elements: any[] = []
    let inCodeBlock = false
    let codeContent = ""
    let codeLanguage = ""

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre class="bg-[var(--aui-color-n-10)] border border-[var(--aui-color-border)] rounded p-3 my-3 overflow-x-auto text-xs font-mono">
              <code>{codeContent.trim()}</code>
            </pre>
          )
          codeContent = ""
          inCodeBlock = false
        } else {
          codeLanguage = line.slice(3).trim()
          inCodeBlock = true
        }
        continue
      }

      if (inCodeBlock) {
        codeContent += line + "\n"
        continue
      }

      if (line.startsWith("# ")) {
        elements.push(<h1 class="text-xl font-bold text-[var(--aui-color-n-1)] mt-6 mb-3">{line.slice(2)}</h1>)
      } else if (line.startsWith("## ")) {
        elements.push(<h2 class="text-lg font-semibold text-[var(--aui-color-n-1)] mt-5 mb-2">{line.slice(3)}</h2>)
      } else if (line.startsWith("### ")) {
        elements.push(<h3 class="text-base font-medium text-[var(--aui-color-n-2)] mt-4 mb-2">{line.slice(4)}</h3>)
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(
          <div class="flex gap-2 my-1">
            <span class="text-[var(--aui-color-primary)]">•</span>
            <span class="text-[var(--aui-color-n-2)]">{renderInlineFormatting(line.slice(2))}</span>
          </div>
        )
      } else if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.*)/)
        if (match) {
          elements.push(
            <div class="flex gap-2 my-1">
              <span class="text-[var(--aui-color-n-4)] min-w-[20px]">{match[1]}.</span>
              <span class="text-[var(--aui-color-n-2)]">{renderInlineFormatting(match[2])}</span>
            </div>
          )
        }
      } else if (line.trim() === "") {
        elements.push(<div class="h-3" />)
      } else {
        elements.push(<p class="text-[var(--aui-color-n-2)] my-2">{renderInlineFormatting(line)}</p>)
      }
    }

    return elements
  }

  return <>{renderMarkdown()}</>
}

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  return parts.map(part => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong class="font-semibold text-[var(--aui-color-n-1)]">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code class="bg-[var(--aui-color-n-10)] border border-[var(--aui-color-border)] px-1.5 py-0.5 rounded text-xs font-mono text-[var(--aui-color-primary)]">{part.slice(1, -1)}</code>
    }
    return part
  })
}
