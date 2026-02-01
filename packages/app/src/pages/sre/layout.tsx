import { type ParentProps } from "solid-js"
import PortalHeader from "@/components/sre/portal-header"
import PortalSidebar from "@/components/sre/portal-sidebar"

export default function SreLayout(props: ParentProps) {
  return (
    <div class="sre-portal">
      <PortalHeader />
      <div class="sre-body">
        <PortalSidebar />
        <main class="sre-content">
          {props.children}
        </main>
      </div>
    </div>
  )
}
