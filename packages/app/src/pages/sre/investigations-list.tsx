import { createSignal } from "solid-js"

export default function InvestigationsList() {
  const [searchQuery, setSearchQuery] = createSignal("")
  const [viewMode, setViewMode] = createSignal<"grid" | "list">("grid")

  return (
    <div style={{ height: "100%", display: "flex", "flex-direction": "column" }}>
      {/* Header Row */}
      <div style={{ 
        display: "flex", 
        "justify-content": "space-between", 
        "align-items": "center",
        "margin-bottom": "20px"
      }}>
        <div>
          <div style={{ 
            "font-size": "12px", 
            color: "var(--aui-color-n-4)", 
            "margin-bottom": "4px" 
          }}>
            Investigations
          </div>
          <h1 style={{ 
            "font-size": "20px", 
            "font-weight": "600", 
            color: "var(--aui-color-n-1)",
            margin: 0
          }}>
            Investigations
          </h1>
        </div>
        <button class="sre-btn sre-btn-primary">
          Start Investigation
        </button>
      </div>

      {/* Control Row */}
      <div style={{ 
        display: "flex", 
        "justify-content": "flex-end", 
        "align-items": "center",
        gap: "12px",
        "margin-bottom": "20px"
      }}>
        {/* Search */}
        <div style={{ 
          display: "flex", 
          "align-items": "center",
          background: "var(--aui-color-surface)",
          border: "1px solid var(--aui-color-border)",
          "border-radius": "4px",
          padding: "0 12px",
          height: "32px",
          width: "240px"
        }}>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="var(--aui-color-n-4)" 
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style={{ "flex-shrink": 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Enter a name..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              "margin-left": "8px",
              "font-size": "13px",
              color: "var(--aui-color-n-1)",
              width: "100%"
            }}
          />
        </div>

        {/* Filter */}
        <button 
          class="sre-btn sre-btn-secondary"
          style={{ padding: "0 12px", gap: "6px" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filter
        </button>

        {/* Sort */}
        <button 
          class="sre-btn sre-btn-secondary"
          style={{ padding: "0 12px" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="4" y1="6" x2="16" y2="6" />
            <line x1="4" y1="12" x2="12" y2="12" />
            <line x1="4" y1="18" x2="8" y2="18" />
            <polyline points="15 15 18 18 21 15" />
            <line x1="18" y1="18" x2="18" y2="9" />
          </svg>
        </button>

        {/* View Toggle */}
        <div style={{ 
          display: "flex", 
          border: "1px solid var(--aui-color-border)",
          "border-radius": "4px",
          overflow: "hidden"
        }}>
          <button 
            onClick={() => setViewMode("grid")}
            style={{
              padding: "6px 10px",
              border: "none",
              background: viewMode() === "grid" ? "var(--aui-color-n-8)" : "var(--aui-color-surface)",
              cursor: "pointer",
              display: "flex",
              "align-items": "center"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
          <button 
            onClick={() => setViewMode("list")}
            style={{
              padding: "6px 10px",
              border: "none",
              "border-left": "1px solid var(--aui-color-border)",
              background: viewMode() === "list" ? "var(--aui-color-n-8)" : "var(--aui-color-surface)",
              cursor: "pointer",
              display: "flex",
              "align-items": "center"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div style={{ 
        flex: 1,
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        background: "var(--aui-color-surface)",
        "border-radius": "4px",
        border: "1px solid var(--aui-color-border)",
        padding: "60px 20px"
      }}>
        <div style={{ 
          width: "80px", 
          height: "80px", 
          "border-radius": "50%",
          background: "var(--aui-color-n-8)",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          "margin-bottom": "24px"
        }}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--aui-color-n-5)"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h2 style={{ 
          "font-size": "18px", 
          "font-weight": "600", 
          color: "var(--aui-color-n-1)",
          margin: "0 0 8px 0"
        }}>
          No investigations yet
        </h2>
        <p style={{ 
          "font-size": "14px", 
          color: "var(--aui-color-n-4)", 
          margin: "0 0 24px 0",
          "text-align": "center",
          "max-width": "360px"
        }}>
          Start your first investigation to begin analyzing incidents and identifying root causes
        </p>
        <button class="sre-btn sre-btn-primary">
          Start Investigation
        </button>
      </div>

      {/* Pagination placeholder */}
      <div style={{ 
        display: "flex", 
        "justify-content": "flex-end", 
        "align-items": "center",
        "margin-top": "16px",
        "font-size": "13px",
        color: "var(--aui-color-n-4)"
      }}>
        <span>Total: 0</span>
      </div>
    </div>
  )
}
