import { useState, useEffect, useRef } from "react"
import { usePlatform } from "../context/PlatformContext"
import { REEF_GREEN, FONT } from "../styles"

const NavBar = ({ onHome }) => {
  const { user, config, company, location, setContext, logout } = usePlatform()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [contextMenuOpen, setContextMenuOpen] = useState(false)
  const [companies, setCompanies] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(company?.id ? String(company.id) : "")
  const [selectedLocation, setSelectedLocation] = useState(location?.id ? String(location.id) : "")
  const contextRef = useRef(null)
  const userRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (contextRef.current && !contextRef.current.contains(e.target)) {
        setContextMenuOpen(false)
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Load companies when context menu opens
  useEffect(() => {
    if (!contextMenuOpen || companies.length > 0) return
    const fetchCompanies = async () => {
      try {
        const res = await fetch(
          `${config.baseUrl}/accounts/${config.accountId}/companies?limit=100`,
          {
            headers: {
              "X-Api-Key": config.apiKey,
              "X-API-Version": "1.0.0",
              "Authorization": `Bearer ${config.accessToken}`,
              "Accept": "application/json",
            }
          }
        )
        const data = await res.json()
        setCompanies(data.results || [])
      } catch (err) {
        console.error("Failed to load companies", err)
      }
    }
    fetchCompanies()
  }, [contextMenuOpen])

  // Load locations when company changes in switcher
  useEffect(() => {
    if (!selectedCompany) return
    const fetchLocations = async () => {
      try {
        const res = await fetch(
          `${config.baseUrl}/accounts/${config.accountId}/locations?ottimate_company_id=${selectedCompany}&limit=100`,
          {
            headers: {
              "X-Api-Key": config.apiKey,
              "X-API-Version": "1.0.0",
              "Authorization": `Bearer ${config.accessToken}`,
              "Accept": "application/json",
            }
          }
        )
        const data = await res.json()
        setLocations(data.results || [])
      } catch (err) {
        console.error("Failed to load locations", err)
      }
    }
    fetchLocations()
  }, [selectedCompany])

  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value)
    setSelectedLocation("")
    setLocations([])
  }

  const handleApply = () => {
    const comp = companies.find(c => String(c.id) === selectedCompany)
    const loc = locations.find(l => String(l.id) === selectedLocation)
    if (comp && loc) {
      setContext(comp, loc)
      setContextMenuOpen(false)
    }
  }

  const canApply = selectedCompany && selectedLocation

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

      {/* Context Switcher */}
      {company && (
        <div ref={contextRef} style={{ position: "relative" }}>
          <button
            onClick={() => setContextMenuOpen(!contextMenuOpen)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: contextMenuOpen ? "#F0FAF4" : "#F0FAF4",
              border: `1px solid ${contextMenuOpen ? REEF_GREEN : "#BBF7D0"}`,
              borderRadius: 20, padding: "4px 12px",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: REEF_GREEN }} />
            <span style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>{company.name}</span>
            <span style={{ fontSize: 12, color: "#86EFAC" }}>·</span>
            <span style={{ fontSize: 12, color: "#166534" }}>{location?.name}</span>
            <span style={{ fontSize: 10, color: "#86EFAC", marginLeft: 2 }}>▾</span>
          </button>

          {contextMenuOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0,
              background: "#fff", border: "1px solid #E5E7EB",
              borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
              minWidth: 280, padding: 16, zIndex: 200,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 12 }}>
                Switch Context
              </div>

              {/* Company */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>
                  Company
                </label>
                <select
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                  style={{
                    width: "100%", padding: "8px 12px", borderRadius: 8,
                    border: "1px solid #E5E7EB", background: "#F9FAFB",
                    fontSize: 13, color: "#111827", fontFamily: FONT, outline: "none",
                  }}
                >
                  <option value="">Select a company…</option>
                  {companies.map(c => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  disabled={!selectedCompany}
                  style={{
                    width: "100%", padding: "8px 12px", borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    background: selectedCompany ? "#F9FAFB" : "#F3F4F6",
                    fontSize: 13, color: selectedLocation ? "#111827" : "#9CA3AF",
                    fontFamily: FONT, outline: "none",
                    cursor: selectedCompany ? "pointer" : "not-allowed",
                    opacity: selectedCompany ? 1 : 0.6,
                  }}
                >
                  <option value="">
                    {selectedCompany ? "Select a location…" : "Select a company first"}
                  </option>
                  {locations.map(l => (
                    <option key={l.id} value={String(l.id)}>{l.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleApply}
                disabled={!canApply}
                style={{
                  width: "100%", padding: "9px 0", borderRadius: 8,
                  background: canApply ? REEF_GREEN : "#E5E7EB",
                  color: canApply ? "#fff" : "#9CA3AF",
                  fontFamily: FONT, fontSize: 13, fontWeight: 700,
                  border: "none", cursor: canApply ? "pointer" : "not-allowed",
                  transition: "all 0.15s",
                }}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User Menu */}
      <div ref={userRef} style={{ position: "relative" }}>
        <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{
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

        {userMenuOpen && (
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
            <button onClick={() => { setUserMenuOpen(false); logout() }} style={{
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