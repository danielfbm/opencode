import { useLocation, A } from "@solidjs/router";
import { Component } from "solid-js";

const PortalSidebar: Component = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav class="sre-sidebar py-4">
      <div class="flex flex-col gap-1 px-2">
        <A
          href="/investigations"
          class={`sre-nav-item ${isActive("/investigations") ? "active" : ""}`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span class="text-[14px]">Investigations</span>
        </A>
      </div>
    </nav>
  );
};

export default PortalSidebar;
