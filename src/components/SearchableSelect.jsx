import { useState, useEffect, useRef } from "react"
import { REEF_GREEN } from "../styles/index"

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Search or select...",
  disabled = false,
  label,
  required = false,
  compact = false,
}) => {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const selected = options.find(o => String(o.value) === String(value))

  const filtered = query.trim() === ""
    ? options
    : options.filter(o =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        (o.subtitle && o.subtitle.toLowerCase().includes(query.toLowerCase()))
      )

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => { setHighlighted(0) }, [query])

  const handleSelect = (option) => {
    onChange(option.value)
    setQuery("")
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "Enter" || e.key === "ArrowDown") { setOpen(true); return }
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[highlighted]) handleSelect(filtered[highlighted]) }
    else if (e.key === "Escape") { setOpen(false); setQuery("") }
  }

  const pad = compact ? "8px 10px" : "10px 14px"
  const fontSize = compact ? 12 : 13

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {label && (
        <div style={{
          fontSize: 10, fontWeight: 700, color: "#78716C",
          letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 6,
        }}>
          {label} {required && <span style={{ color: "#F59E0B" }}>*</span>}
        </div>
      )}

      <div
        onClick={() => { if (!disabled) { setOpen(true); inputRef.current?.focus() } }}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: pad, borderRadius: 8,
          border: `1.5px solid ${open ? REEF_GREEN : "#E7E5E4"}`,
          background: disabled ? "#F5F5F4" : "#FAFAF9",
          cursor: disabled ? "not-allowed" : "pointer",
          boxSizing: "border-box", width: "100%",
          boxShadow: open ? `0 0 0 3px rgba(45,122,79,0.12)` : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        <input
          ref={inputRef}
          value={open ? query : (selected?.label || "")}
          onChange={e => { setQuery(e.target.value); if (!open) setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={open ? "Type to filter..." : (selected ? "" : placeholder)}
          style={{
            flex: 1, border: "none", outline: "none",
            background: "transparent", fontSize,
            color: selected && !open ? "#1C1917" : "#9CA3AF",
            cursor: disabled ? "not-allowed" : "text",
            fontFamily: "inherit", minWidth: 0,
          }}
        />
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="#A8A29E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1.5px solid #E7E5E4",
          borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          zIndex: 999, maxHeight: 220, overflowY: "auto",
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "12px 14px", fontSize: 13, color: "#A8A29E", textAlign: "center" }}>
              No results for "{query}"
            </div>
          ) : (
            filtered.map((option, i) => (
              <div
                key={option.value}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(option) }}
                onMouseEnter={() => setHighlighted(i)}
                style={{
                  padding: compact ? "8px 12px" : "10px 14px",
                  cursor: "pointer",
                  background: i === highlighted ? "#F0FAF4" : String(value) === String(option.value) ? "#F9FAFB" : "#fff",
                  borderBottom: i < filtered.length - 1 ? "1px solid #F5F5F4" : "none",
                }}
              >
                <div style={{
                  fontSize: compact ? 12 : 13,
                  fontWeight: String(value) === String(option.value) ? 600 : 400,
                  color: String(value) === String(option.value) ? REEF_GREEN : "#1C1917",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span>{option.label}</span>
                  {String(value) === String(option.value) && (
                    <span style={{ color: REEF_GREEN, fontSize: 11 }}>✓</span>
                  )}
                </div>
                {option.subtitle && (
                  <div style={{ fontSize: 11, color: "#A8A29E", marginTop: 2 }}>{option.subtitle}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default SearchableSelect