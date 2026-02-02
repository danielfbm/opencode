import { useLocation, A } from "@solidjs/router"
import { createMemo } from "solid-js"
import { useSreWorkspace } from "@/context/sre-workspace"
import { base64Encode } from "@opencode-ai/util/encode"

export default function PortalSidebar() {
  const location = useLocation()
  const workspace = useSreWorkspace()
  
  const investigationsPath = createMemo(() => {
    const dir = workspace.directory()
    if (!dir) return "/workspace"
    return `/${base64Encode(dir)}/investigations`
  })
  
  const isActive = (pattern: string) => location.pathname.includes(pattern)

  return (
    <nav class="sre-sidebar">
      <A
        href={investigationsPath()}
        class={`sre-nav-item ${isActive("/investigations") ? "active" : ""}`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          style={{ "flex-shrink": 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span style={{ "margin-left": "10px" }}>Investigations</span>
      </A>
    </nav>
  )
}
