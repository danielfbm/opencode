import { useLocation, A } from "@solidjs/router"

export default function PortalSidebar() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <nav class="sre-sidebar">
      <A
        href="/investigations"
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
