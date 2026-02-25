import { useState } from "react"
import { usePlatform } from "../context/PlatformContext"
import { APP_CATALOG, REEF_GREEN, FONT } from "../styles"

const AppCard = ({ app, onLaunch }) => {
  const isLive = app.status === "live"
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: 16,
        border: `1px solid ${hovered && isLive ? "#BBF7D0" : "#E5E7EB"}`,
        padding: 24, display: "flex", flexDirection: "column", gap: 16,
        transition: "all 0.2s",
        boxShadow: hovered && isLive ? "0 8px 24px rgba(45,122,79,0.10)" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered && isLive ? "translateY(-2px)" : "none",
        opacity: isLive ? 1 : 0.75,
      }}
    >
      {/* Icon + Status Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: isLive ? "#F0FAF4" : "#F3F4F6",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, color: isLive ? REEF_GREEN : "#9CA3AF",
        }}>
          {app.icon}
        </div>
        <div style={{
          padding: "3px 10px", borderRadius: 20,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.5px",
          textTransform: "uppercase",
          background: isLive ? "#F0FAF4" : "#F3F4F6",
          color: isLive ? "#166534" : "#9CA3AF",
          border: `1px solid ${isLive ? "#BBF7D0" : "#E5E7EB"}`,
        }}>
          {isLive ? "Available" : "Coming Soon"}
        </div>
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
          {app.name}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600, marginBottom: 8,
          color: isLive ? REEF_GREEN : "#9CA3AF",
        }}>
          {app.tagline}
        </div>
        <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
          {app.description}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={isLive ? onLaunch : undefined}
        disabled={!isLive}
        style={{
          width: "100%", padding: "10px 0", borderRadius: 10,
          background: isLive ? (hovered ? REEF_GREEN : "#F0FAF4") : "#F3F4F6",
          color: isLive ? (hovered ? "#fff" : REEF_GREEN) : "#9CA3AF",
          fontFamily: FONT, fontSize: 13, fontWeight: 700,
          border: `1px solid ${isLive ? (hovered ? REEF_GREEN : "#BBF7D0") : "#E5E7EB"}`,
          cursor: isLive ? "pointer" : "not-allowed",
          transition: "all 0.2s",
        }}
      >
        {isLive ? "Open App →" : "Coming Soon"}
      </button>
    </div>
  )
}

const AppCatalog = ({ onLaunchApp }) => {
  const { company, location } = usePlatform()

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: FONT, paddingTop: 60 }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Page Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>
            App Catalog
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 15, color: "#6B7280" }}>
            Workflow tools for {company?.name} · {location?.name}
          </p>
        </div>

        {/* App Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}>
          {APP_CATALOG.map(app => (
            <AppCard
              key={app.id}
              app={app}
              onLaunch={() => onLaunchApp(app)}
            />
          ))}
        </div>

        {/* Footer Hint */}
        <div style={{
          marginTop: 60, padding: "20px 24px",
          background: "#F0FAF4", borderRadius: 14,
          border: "1px solid #BBF7D0",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ fontSize: 20 }}>💡</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>
              More apps are on the way
            </div>
            <div style={{ fontSize: 12, color: "#4ADE80", marginTop: 2 }}>
              The Reef catalog grows as new workflow gaps are identified. Check back regularly.
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AppCatalog