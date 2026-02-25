import { useState, useEffect } from "react"
import { PlatformProvider, usePlatform } from "./context/PlatformContext"
import NavBar from "./components/NavBar"
import LoginScreen from "./screens/LoginScreen"
import ContextScreen from "./screens/ContextScreen"
import AppCatalog from "./screens/AppCatalog"
import { FONT } from "./styles/index"

// ─── App Module Placeholder (replaced in Steps 6 & 7) ────────────────────────
const AppModulePlaceholder = ({ app, onBack }) => (
  <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: FONT, paddingTop: 60 }}>
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "none", border: "none", cursor: "pointer",
        fontSize: 13, color: "#6B7280", fontFamily: FONT,
        marginBottom: 32, padding: 0,
      }}>
        ← Back to App Catalog
      </button>
      <div style={{
        background: "#fff", borderRadius: 20, border: "1px solid #E5E7EB",
        padding: 48, textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, background: "#F0FAF4",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, margin: "0 auto 20px", color: "#2D7A4F",
        }}>
          {app.icon}
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#111827" }}>
          {app.name}
        </h2>
        <p style={{
          margin: "0 0 24px", fontSize: 14, color: "#6B7280",
          maxWidth: 400, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6,
        }}>
          {app.description}
        </p>
        <div style={{
          display: "inline-block", padding: "8px 20px", borderRadius: 8,
          background: "#F0FAF4", border: "1px solid #BBF7D0",
          fontSize: 12, color: "#166534", fontWeight: 600,
        }}>
          ✓ App slot ready — full integration coming in Steps 6 & 7
        </div>
      </div>
    </div>
  </div>
)

// ─── Router ───────────────────────────────────────────────────────────────────
const ReefRouter = () => {
  const { user, company, location } = usePlatform()
  const [activeApp, setActiveApp] = useState(null)

  // Determine current view based on platform state
  const getView = () => {
    if (!user) return "login"
    if (!company || !location) return "context"
    if (activeApp) return "app"
    return "catalog"
  }

  const view = getView()
  const showNav = view === "catalog" || view === "app"

  return (
    <>
      {showNav && <NavBar onHome={() => setActiveApp(null)} />}

      {view === "login"   && <LoginScreen />}
      {view === "context" && <ContextScreen />}
      {view === "catalog" && <AppCatalog onLaunchApp={app => setActiveApp(app)} />}
      {view === "app"     && <AppModulePlaceholder app={activeApp} onBack={() => setActiveApp(null)} />}
    </>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <PlatformProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Hanken Grotesk', sans-serif; }
      `}</style>
      <ReefRouter />
    </PlatformProvider>
  )
}