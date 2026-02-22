import { useState } from "react"
import { usePlatform } from "../context/PlatformContext"
import { REEF_GREEN, FONT } from "../config/apps"

const NavBar = ({ onHome }) => {
  const { user, company, location, logout } = usePlatform()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "#fff", borderBottom: "1px solid #E5E7EB",
      height: 60, display: "flex", alignItems: "center",
      padding: "0 24px", gap: 16, fontFamily: FONT,
    }}>

      {/* Brand */}
      <button onClick={onHome} style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "none", border: "none", cursor: "pointer", padding: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: REEF_GREEN, display: "flex", alignItems: "center",
          justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 700,
        }}>R</div>
        <span style={{ fontWeight: 700, fontSize: 17, color: "#111827", letterSpacing: "-0.3px" }}>Reef</span>
        <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 400, marginLeft: 2 }}>by Ottimate</span>
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: "#E5E7EB" }} />

      {/* Context Pill */}
      {company && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#F0FAF4", border: "1px solid #BBF7D0",
          borderRadius: 20, padding: "4px 12px",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: REEF_GREEN }} />
          <span style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>{company.name}</span>
          {location && (
            <>
              <span style={{ fontSize: 12, color: "#86EFAC" }}>·</span>
              <span style={{ fontSize: 12, color: "#166534" }}>{location.name}</span>
            </>
          )}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User Menu */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "none", border: "1px solid #E5E7EB",
          borderRadius: 20, padding: "5px 12px 5px 8px", cursor: "pointer",
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: REEF_GREEN, color: "#fff",
            fontSize: 11, fontWeight: 700, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            {user?.name?.charAt(0) || "U"}
          </div>
          <span style={{ fontSize: 13, color: "#374151", fontWeight: 500, fontFamily: FONT }}>{user?.name}</span>
          <span style={{ fontSize: 10, color: "#9CA3AF" }}>▾</span>
        </button>

        {menuOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            background: "#fff", border: "1px solid #E5E7EB",
            borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            minWidth: 180, overflow: "hidden", zIndex: 200,
          }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: FONT }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2, fontFamily: FONT }}>{user?.email}</div>
            </div>
            <button onClick={() => { setMenuOpen(false); logout() }} style={{
              width: "100%", padding: "10px 16px", textAlign: "left",
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "#EF4444", fontFamily: FONT,
            }}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default NavBar
