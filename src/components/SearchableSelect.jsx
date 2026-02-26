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
}) => {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const selected = options.find(o => o.value === value)

  const filtered = query.trim() === ""
    ? options
    : options.filter(o =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        (o.subtitle && o.subtitle.toLowerCase().includes(query.toLowerCase()))
      )

  // Close on outside click
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

  // Reset highlight when filtered changes
  useEffect(() => {
    setHighlighted(0)
  }, [query])

  const handleSelect = (option) => {
    onChange(option.value)
    setQuery("")
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "Enter" || e.key === "ArrowDown") setOpen(true)
      return
    }
    if (e.key === "ArrowDown") setHighlighted(h => Math.min(h + 1, filtered.length - 1))
    if (e.key === "ArrowUp") setHighlighted(h => Math.max(h - 1, 0))
    if (e.key === "Enter" && filtered[highlighted]) handleSelect(filtered[highlighted])
    if (e.key === "Escape") { setOpen(false); setQuery("") }
  }

  const displayValue = open ? query : (selected?.label || "")

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {label && (
        <label style={{
          display: "block", fontSize: 11, fontWeight: 700,
          color: "#6B7280", letterSpacing: "0.8px",
          textTransform: "uppercase", marginBottom: 6,
        }}>
          {label} {required && <span style={{ color: "#F59E0B" }}>*</span>}
        </label>
      )}

      {/* Input */}
      <div
        onClick={() => { if (!disabled) { setOpen(true); inputRef.current?.focus() } }}
        style={{
          display: "flex", alignItems: "center",
          width: "100%", padding: "10px 14px",
          borderRadius: 10, border: `1px solid ${open ? REEF_GREEN : "#E5E7EB"}`,
          background: disabled ? "#F3F4F6" : "#FAFAF9",
          cursor: disabled ? "not-allowed" : "pointer",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
          boxShadow: open ? `0 0 0 3px rgba(45,122,79,0.1)` : "none",
        }}
      >
        <input
          ref={inputRef}
          value={displayValue}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={selected ? selected.label : placeholder}
          style={{
            flex: 1, border: "none", outline: "none",
            background: "transparent", fontSize: 13,
            color: selected && !open ? "#111827" : "#6B7280",
            cursor: disabled ? "not-allowed" : "text",
            fontFamily: "inherit",
          }}
        />
        {/* Chevron */}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#9CA3AF" strokeWidth="2.5"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1px solid #E5E7EB",
          borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
          zIndex: 300, maxHeight: 240, overflowY: "auto",
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "12px 16px", fontSize: 13, color: "#9CA3AF", textAlign: "center" }}>
              No results for "{query}"
            </div>
          ) : (
            filtered.map((option, i) => (
              <div
                key={option.value}
                onMouseDown={() => handleSelect(option)}
                onMouseEnter={() => setHighlighted(i)}
                style={{
                  padding: "10px 14px", cursor: "pointer",
                  background: i === highlighted ? "#F0FAF4" : value === option.value ? "#F9FAFB" : "#fff",
                  borderBottom: i < filtered.length - 1 ? "1px solid #F3F4F6" : "none",
                  transition: "background 0.1s",
                }}
              >
                <div style={{
                  fontSize: 13, fontWeight: value === option.value ? 600 : 400,
                  color: value === option.value ? REEF_GREEN : "#111827",
                }}>
                  {option.label}
                  {value === option.value && (
                    <span style={{ marginLeft: 8, fontSize: 11, color: REEF_GREEN }}>✓</span>
                  )}
                </div>
                {option.subtitle && (
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{option.subtitle}</div>
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