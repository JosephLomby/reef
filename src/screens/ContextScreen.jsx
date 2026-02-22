import { useState, useEffect } from "react"
import { usePlatform } from "../context/PlatformContext"
import { REEF_GREEN, FONT } from "../config/apps"

// Step 1: mock data — replaced with live API calls in Step 3
const MOCK_COMPANIES = [
  { id: "1", name: "Sunrise Senior Living" },
  { id: "2", name: "Pacific Hospitality Group" },
  { id: "3", name: "Coastal Grocery Partners" },
]
const MOCK_LOCATIONS = {
  "1": [{ id: "101", name: "Sunrise — San Diego" }, { id: "102", name: "Sunrise — Los Angeles" }],
  "2": [{ id: "201", name: "Hotel Del Mar" }, { id: "202", name: "Oceanview Suites" }],
  "3": [{ id: "301", name: "Coastal Market — Encinitas" }, { id: "302", name: "Coastal Market — Carlsbad" }],
}

const ContextScreen = () => {
  const { user, setContext } = usePlatform()
  const [companies] = useState(MOCK_COMPANIES)
  const [locations, setLocations] = useState([])
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")

  useEffect(() => {
    if (selectedCompany) {
      setLocations(MOCK_LOCATIONS[selectedCompany] || [])
      setSelectedLocation("")
    }
  }, [selectedCompany])

  const canContinue = selectedCompany && selectedLocation

  const handleContinue = () => {
    const company = companies.find(c => c.id === selectedCompany)
    const location = locations.find(l => l.id === selectedLocation)
    setContext(company, location)
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: FONT, padding: 24,
      background: "linear-gradient(135deg, #F0FAF4 0%, #FFFFFF 50%, #F9FAFB 100%)",
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: REEF_GREEN,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 22, fontWeight: 800,
            margin: "0 auto 14px",
          }}>R</div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.4px" }}>
            Welcome, {user?.name?.split(" ")[0]}
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6B7280" }}>
            Select your company and location to continue.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "#fff", borderRadius: 20, border: "1px solid #E5E7EB",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: 32,
        }}>

          {/* Company */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 700,
              color: "#6B7280", letterSpacing: "0.8px",
              textTransform: "uppercase", marginBottom: 8,
            }}>
              Company
            </label>
            <select
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: "1px solid #E5E7EB", background: "#F9FAFB",
                fontSize: 14, color: selectedCompany ? "#111827" : "#9CA3AF",
                fontFamily: FONT, outline: "none", cursor: "pointer",
              }}
            >
              <option value="">Select a company…</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div style={{ marginBottom: 28 }}>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 700,
              color: "#6B7280", letterSpacing: "0.8px",
              textTransform: "uppercase", marginBottom: 8,
            }}>
              Location
            </label>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              disabled={!selectedCompany}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: "1px solid #E5E7EB",
                background: selectedCompany ? "#F9FAFB" : "#F3F4F6",
                fontSize: 14, color: selectedLocation ? "#111827" : "#9CA3AF",
                fontFamily: FONT, outline: "none",
                cursor: selectedCompany ? "pointer" : "not-allowed",
                opacity: selectedCompany ? 1 : 0.6,
              }}
            >
              <option value="">
                {selectedCompany ? "Select a location…" : "Select a company first"}
              </option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleContinue}
            disabled={!canContinue}
            style={{
              width: "100%", padding: "12px 0", borderRadius: 10,
              background: canContinue ? REEF_GREEN : "#E5E7EB",
              color: canContinue ? "#fff" : "#9CA3AF",
              fontFamily: FONT, fontSize: 14, fontWeight: 700,
              border: "none", cursor: canContinue ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
          >
            Enter Reef →
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContextScreen