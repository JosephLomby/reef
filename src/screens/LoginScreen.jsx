import { useState } from "react"
import { usePlatform } from "../context/PlatformContext"
import { REEF_GREEN, FONT } from "../config/apps"

const LoginScreen = () => {
  const { login } = usePlatform()
  const [form, setForm] = useState({
    baseUrl: "https://api.ottimate.com/v1",
    apiKey: "",
    clientId: "",
    clientSecret: "",
    accountId: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    if (!form.apiKey || !form.clientId || !form.clientSecret || !form.accountId) {
      setError("All fields are required.")
      return
    }
    setLoading(true)
    setError("")

    // Step 1: mock login — real OAuth wired in Step 2
    await new Promise(r => setTimeout(r, 800))
    login(form, { name: "Joe Martinez", email: "joe@ottimate.com" })
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: FONT, padding: 24,
      background: "linear-gradient(135deg, #F0FAF4 0%, #FFFFFF 50%, #F9FAFB 100%)",
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: REEF_GREEN,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 28, fontWeight: 800,
            margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(45,122,79,0.25)",
          }}>R</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>Reef</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6B7280" }}>by Ottimate</p>
        </div>

        {/* Card */}
        <div style={{
          background: "#fff", borderRadius: 20, border: "1px solid #E5E7EB",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: 32,
        }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#111827" }}>
            Connect to Ottimate
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6B7280" }}>
            Enter your API credentials to access the Reef platform.
          </p>

          {[
            { key: "baseUrl",       label: "API Base URL",     type: "url",      placeholder: "https://api.ottimate.com/v1" },
            { key: "apiKey",        label: "API Key",          type: "password", placeholder: "your-api-key" },
            { key: "clientId",      label: "Client ID",        type: "text",     placeholder: "client_id" },
            { key: "clientSecret",  label: "Client Secret",    type: "password", placeholder: "client_secret" },
            { key: "accountId",     label: "Account ID",       type: "text",     placeholder: "racc_..." },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 700,
                color: "#6B7280", letterSpacing: "0.8px",
                textTransform: "uppercase", marginBottom: 6,
              }}>
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 14px", borderRadius: 10,
                  border: "1px solid #E5E7EB", background: "#F9FAFB",
                  fontSize: 13, color: "#111827", fontFamily: FONT,
                  outline: "none", transition: "border-color 0.15s",
                }}
                onFocus={e => e.target.style.borderColor = REEF_GREEN}
                onBlur={e => e.target.style.borderColor = "#E5E7EB"}
              />
            </div>
          ))}

          {error && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: 8, padding: "10px 14px",
              marginBottom: 16, fontSize: 13, color: "#DC2626",
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%", padding: "12px 0", borderRadius: 10,
              background: loading ? "#9CA3AF" : REEF_GREEN,
              color: "#fff", fontFamily: FONT, fontSize: 14, fontWeight: 700,
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s", marginTop: 8,
            }}
          >
            {loading ? "Connecting…" : "Connect to Reef"}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#9CA3AF" }}>
          Reef A Marketplace for Ottimate · Solutions Engineering
        </p>
      </div>
    </div>
  )
}

export default LoginScreen