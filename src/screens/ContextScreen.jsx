import { useState, useEffect } from "react"
import { usePlatform } from "../context/PlatformContext"
import { REEF_GREEN, FONT } from "../styles/index"

const ContextScreen = () => {
  const { user, config, setContext } = usePlatform()
  const [companies, setCompanies] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Load companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true)
      setError("")
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
        if (!res.ok) throw new Error(`Failed to load companies: ${res.status}`)
        const data = await res.json()
        setCompanies(data.results || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (config?.accessToken) fetchCompanies()
  }, [config])

  // Load locations when company changes
  useEffect(() => {
    if (!selectedCompany) return
    const fetchLocations = async () => {
      setError("")
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
        if (!res.ok) throw new Error(`Failed to load locations: ${res.status}`)
        const data = await res.json()
        setLocations(data.results || [])
        setSelectedLocation("")
      } catch (err) {
        setError(err.message)
      }
    }
    fetchLocations()
  }, [selectedCompany, config])

  const canContinue = selectedCompany && selectedLocation

  const handleContinue = () => {
    const company = companies.find(c => String(c.id) === selectedCompany)
    const location = locations.find(l => String(l.id) === selectedLocation)
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

          {/* Loading state */}
          {loading && (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#6B7280", fontSize: 14 }}>
              Loading your companies…
            </div>
          )}

          {/* Error state */}
          {error && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: 8, padding: "10px 14px",
              marginBottom: 16, fontSize: 13, color: "#DC2626",
            }}>
              {error}
            </div>
          )}

          {!loading && (
            <>
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
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
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
                    <option key={l.id} value={String(l.id)}>{l.name}</option>
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
                Enter The Reef →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContextScreen