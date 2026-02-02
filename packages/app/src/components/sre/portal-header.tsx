import { createSignal, Show } from "solid-js"

const PortalHeader = () => {
  const [showUserMenu, setShowUserMenu] = createSignal(false);

  return (
    <header class="sre-header">
      <div class="sre-header-title">
        <img src="/assets/logo.svg" alt="Alauda logo" class="sre-header-logo" />
        <span class="sre-header-text">SRE AI Agent</span>
      </div>

      <div class="sre-header-actions" classList={{ "ml-auto": true }}>
        <button class="sre-icon-button" title="Help & Documentation">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>

        <div class="sre-user" style={{ position: "relative" }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu())}
            class="sre-user-button"
          >
            <div class="sre-user-avatar">A</div>
            <span class="sre-user-name">Admin User</span>
          </button>

          <Show when={showUserMenu()}>
            <>
              <div 
                style={{ position: "fixed", inset: 0, "z-index": 99 }} 
                onClick={() => setShowUserMenu(false)}
              />
              
              <div class="sre-user-menu">
                <div class="sre-user-menu-header">
                  <div class="sre-user-menu-name">Admin User</div>
                  <div class="sre-user-menu-email">admin@alauda.io</div>
                </div>

                <div class="sre-user-menu-body">
                  <div class="sre-user-menu-row">
                    <span class="sre-user-menu-label">Theme</span>
                    <span class="sre-user-menu-value">Light</span>
                  </div>

                  <div class="sre-user-menu-row">
                    <span class="sre-user-menu-label">Language</span>
                    <span class="sre-user-menu-value">English</span>
                  </div>
                </div>
              </div>
            </>
          </Show>
        </div>
      </div>
    </header>
  )
}

export default PortalHeader
