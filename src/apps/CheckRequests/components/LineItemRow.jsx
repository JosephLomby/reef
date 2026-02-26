import SearchableSelect from "../../../components/SearchableSelect"

const LineItemRow = ({ item, index, onChange, onRemove, dimensionTypes, canRemove }) => {
  const update = (field, value) => onChange(index, { ...item, [field]: value })
  const updateDim = (key, value) => onChange(index, { ...item, dimensions: { ...item.dimensions, [key]: value } })

  console.log("dimension types:", dimensionTypes)

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 8,
      padding: "12px 16px",
      borderBottom: "1px solid #F5F5F4",
    }}>
      {/* Row number */}
      <div style={{
        width: 28, flexShrink: 0, textAlign: "center",
        fontSize: 11, color: "#A8A29E", fontFamily: "monospace", paddingTop: 10,
      }}>
        {index + 1}
      </div>

      {/* Description */}
      <div style={{ flex: 1, minWidth: 0, flexBasis: 180 }}>
        <input
          type="text"
          value={item.description}
          onChange={e => update("description", e.target.value)}
          placeholder="Description..."
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "8px 10px", borderRadius: 8,
            border: "1.5px solid #E7E5E4", background: "#FAFAF9",
            fontSize: 13, outline: "none", fontFamily: "inherit",
          }}
        />
      </div>

      {/* Dimension columns */}
      {dimensionTypes.map(dt => (
        <div key={dt.key} style={{
          flexShrink: 0,
          width: dimensionTypes.length <= 2 ? 160 : dimensionTypes.length <= 4 ? 140 : 120,
        }}>
          <SearchableSelect
            compact
            options={dt.options}
            value={item.dimensions?.[dt.key]?.value || ""}
            onChange={val => {
              const opt = dt.options.find(o => String(o.value) === String(val))
              updateDim(dt.key, opt || null)
            }}
            placeholder={dt.label}
          />
        </div>
      ))}

      {/* Amount */}
      <div style={{ width: 100, flexShrink: 0 }}>
        <input
          type="number"
          value={item.amount}
          onChange={e => update("amount", e.target.value)}
          placeholder="0.00"
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "8px 10px", borderRadius: 8,
            border: "1.5px solid #E7E5E4", background: "#FAFAF9",
            fontSize: 13, textAlign: "right", outline: "none", fontFamily: "inherit",
          }}
        />
      </div>

      {/* Remove */}
      <div style={{ width: 28, flexShrink: 0, paddingTop: 4 }}>
        {canRemove && (
          <button
            onClick={() => onRemove(index)}
            style={{
              width: 28, height: 28, display: "flex", alignItems: "center",
              justifyContent: "center", border: "none", background: "none",
              cursor: "pointer", color: "#D4CFC9", fontSize: 14, borderRadius: 6,
            }}
            onMouseEnter={e => e.target.style.color = "#EF4444"}
            onMouseLeave={e => e.target.style.color = "#D4CFC9"}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default LineItemRow