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
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const selected = options.find(o => String(o.value) === String(value))

  const filtered = query.trim() === ""
    ? options
    : options.filter(o =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        (o.subtitle && o.subtitle.toLowerCase().includes(query.toLowerCase()))
      )

  const updateDropdownPos = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }

  const handleOpen = () => {
    if (disabled) return
    updateDropdownPos()
    setOpen(true)
    inputRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    const handleScroll = () => updateDropdownPos()
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    window.addEventListener("scroll", handleScroll, true)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      window.removeEventListener("scroll", handleScroll, true)
    }
  }, [open])

  useEffect(() => { setHighlighted(0) }, [query])

  const handleSelect = (option) => {
    onChange(option.value)
    setQuery("")
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "Enter" || e.key === "ArrowDown") { handleOpen(); return }
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[highlighted]) handleSelect(filtered[highlighted]) }
    else if (e.key === "Escape") { setOpen(false); setQuery("") }
  }

  const pad = compact ? "8px 10px" : "10px 14px"
  const fontSize = compact ? 12 : 13

  return (
    <>
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
          onClick={handleOpen}
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
            onChange={e => { setQuery(e.target.value); if (!open) handleOpen() }}
            onFocus={handleOpen}
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
      </div>

      {/* Dropdown rendered at document root level via fixed positioning */}
      {open && (
        <div style={{
          position: "fixed",
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: dropdownPos.width,
          background: "#fff",
          border: "1.5px solid #E7E5E4",
          borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          zIndex: 9999,
          maxHeight: 220,
          overflowY: "auto",
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
    </>
  )
}

export default SearchableSelect
