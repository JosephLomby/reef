import { inputSm, selectSm } from "../../../styles"

const LineItemRow = ({ item, index, onChange, onRemove, dimensionTypes, canRemove }) => {
  const update = (field, value) => onChange(index, { ...item, [field]: value })
  const updateDim = (key, value) => onChange(index, { ...item, dimensions: { ...item.dimensions, [key]: value } })

  return (
    <div className="flex items-start gap-2 px-4 py-3 border-b border-stone-100 last:border-0">
      <div className="w-8 flex-shrink-0 text-center text-xs font-mono text-stone-400 pt-2.5">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0" style={{ flexBasis: "180px" }}>
        <input
          type="text"
          value={item.description}
          onChange={e => update("description", e.target.value)}
          placeholder="Description..."
          className={inputSm}
        />
      </div>
      {dimensionTypes.map(dt => (
        <div key={dt.key} className="min-w-0"
          style={{
            flexBasis: dimensionTypes.length <= 2 ? "160px" : dimensionTypes.length <= 4 ? "130px" : "110px",
            flexShrink: 1, flexGrow: 0
          }}>
          <select
            value={item.dimensions?.[dt.key]?.value || ""}
            onChange={e => {
              const opt = dt.options.find(o => o.value === e.target.value)
              updateDim(dt.key, opt || null)
            }}
            className={selectSm}
          >
            <option value="">— {dt.label}</option>
            {dt.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      ))}
      <div className="w-28 flex-shrink-0">
        <input
          type="number"
          value={item.amount}
          onChange={e => update("amount", e.target.value)}
          placeholder="0.00"
          className={`${inputSm} text-right`}
        />
      </div>
      <div className="w-8 flex-shrink-0">
        {canRemove && (
          <button onClick={() => onRemove(index)}
            className="w-8 h-8 flex items-center justify-center text-stone-300 hover:text-red-400 transition-colors">
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default LineItemRow