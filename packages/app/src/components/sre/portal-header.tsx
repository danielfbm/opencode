import { createSignal, Show } from "solid-js";

const PortalHeader = () => {
  const [showUserMenu, setShowUserMenu] = createSignal(false);

  return (
    <header
      class="sre-header"
      style={{
        height: "48px",
        background: "#fff",
        display: "flex",
        "align-items": "center",
        padding: "0 16px",
        "border-bottom": "1px solid rgba(0,0,0,0.06)",
        "justify-content": "space-between",
        "box-sizing": "border-box",
      }}
    >
      <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
        <div
          style={{
            width: "24px",
            height: "24px",
            background: "rgb(var(--aui-color-primary))",
            "border-radius": "2px",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L22 19H2L12 2Z"
              fill="white"
              stroke="white"
              stroke-width="2"
              stroke-linejoin="round"
            />
            <path d="M12 6L17 17H7L12 6Z" fill="rgb(var(--aui-color-primary))" />
          </svg>
        </div>
        
        <span
          style={{
            "font-size": "16px",
            "font-weight": "600",
            color: "rgb(var(--aui-color-n-1))",
            "line-height": "1",
            "letter-spacing": "-0.01em"
          }}
        >
          SRE AI Agent
        </span>
      </div>

      <div style={{ display: "flex", "align-items": "center", gap: "16px" }} class="ml-auto">
        <button
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            "align-items": "center",
            color: "rgb(var(--aui-color-n-4))",
            "border-radius": "4px",
            transition: "color 0.2s, background 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgb(var(--aui-color-n-1))";
            e.currentTarget.style.background = "rgba(0,0,0,0.04)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgb(var(--aui-color-n-4))";
            e.currentTarget.style.background = "transparent";
          }}
          title="Help & Documentation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu())}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              "align-items": "center",
              padding: "2px",
              "border-radius": "50%",
              outline: "none"
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                "border-radius": "50%",
                background: "rgb(var(--aui-color-p-6))",
                color: "rgb(var(--aui-color-primary))",
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                "font-size": "14px",
                "font-weight": "600",
                border: "2px solid transparent",
                transition: "border-color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgb(var(--aui-color-primary))"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "transparent"}
            >
              A
            </div>
          </button>

          <Show when={showUserMenu()}>
            <>
              <div 
                style={{ position: "fixed", inset: 0, "z-index": 99 }} 
                onClick={() => setShowUserMenu(false)}
              />
              
              <div
                style={{
                  position: "absolute",
                  top: "120%",
                  right: "0",
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  "box-shadow": "0 8px 24px rgba(0,0,0,0.12)",
                  "border-radius": "8px",
                  "min-width": "240px",
                  "z-index": "100",
                  padding: "8px 0",
                  "transform-origin": "top right",
                  animation: "fadeIn 0.15s ease-out"
                }}
              >
                <div style={{ padding: "12px 20px", "border-bottom": "1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ "font-weight": "600", color: "rgb(var(--aui-color-n-1))", "margin-bottom": "4px" }}>Admin User</div>
                  <div style={{ "font-size": "12px", color: "rgb(var(--aui-color-n-4))" }}>admin@alauda.io</div>
                </div>
                
                <div style={{ padding: "8px 0" }}>
                  <div 
                    style={{ 
                      padding: "10px 20px", 
                      display: "flex", 
                      "justify-content": "space-between", 
                      "font-size": "14px",
                      "align-items": "center",
                      cursor: "default"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgb(var(--aui-color-n-8))"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ color: "rgb(var(--aui-color-n-4))" }}>Theme</span>
                    <span style={{ color: "rgb(var(--aui-color-n-1))", "font-weight": "500" }}>Light</span>
                  </div>
                  
                  <div 
                    style={{ 
                      padding: "10px 20px", 
                      display: "flex", 
                      "justify-content": "space-between", 
                      "font-size": "14px",
                      "align-items": "center",
                      cursor: "default"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgb(var(--aui-color-n-8))"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ color: "rgb(var(--aui-color-n-4))" }}>Language</span>
                    <span style={{ color: "rgb(var(--aui-color-n-1))", "font-weight": "500" }}>English</span>
                  </div>
                </div>
              </div>
            </>
          </Show>
        </div>
      </div>
    </header>
  );
};

export default PortalHeader;
