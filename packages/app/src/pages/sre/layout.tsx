import { type ParentProps, createMemo } from "solid-js"
import { useLocation } from "@solidjs/router"
import PortalHeader from "@/components/sre/portal-header"
import PortalSidebar from "@/components/sre/portal-sidebar"

export default function SreLayout(props: ParentProps) {
  const location = useLocation()
  
  const isFullbleed = createMemo(() => location.pathname.includes("/session/"))
  
  return (
    <div class="sre-portal">
      <PortalHeader />
      <div class="sre-body">
        <PortalSidebar />
        <main class={isFullbleed() ? "sre-content-fullbleed" : "sre-content"}>
          {props.children}
        </main>
      </div>
    </div>
  )
}
