import { inputSm } from "../../../styles/index"
import SearchableSelect from "../../../components/SearchableSelect"

const LineItemRow = ({ item, index, onChange, onRemove, dimensionTypes, canRemove }) => {
  const update = (field, value) => onChange(index, { ...item, [field]: value })
  const updateDim = (key, value) => onChange(index, { ...item, dimensions: { ...item.dimensions, [key]: value } })

  return (
    <div className="flex items-start gap-3 px-6 py-4 border-b border-stone-100 last:border-0">

      {/* Row number */}
      <div className="w-8 flex-shrink-0 text-center text-xs font-mono text-stone-400 pt-3">
        {index + 1}
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0" style={{ flexBasis: "180px" }}>
        <input
          type="text"
          value={item.description}
          onChange={e => update("description", e.target.value)}
          placeholder="Description..."
          className={inputSm}
        />
      </div>

      {/* Dimension columns */}
      {dimensionTypes.map(dt => (
        <div key={dt.key} className="min-w-0 flex-shrink-0"
          style={{ width: dimensionTypes.length <= 2 ? 160 : dimensionTypes.length <= 4 ? 130 : 110 }}>
          <SearchableSelect
            options={dt.options}
            value={item.dimensions?.[dt.key]?.value || ""}
            onChange={val => {
              const opt = dt.options.find(o => o.value === val)
              updateDim(dt.key, opt || null)
            }}
            placeholder={dt.label}
          />
        </div>
      ))}

      {/* Amount */}
      <div className="w-28 flex-shrink-0">
        <input
          type="number"
          value={item.amount}
          onChange={e => update("amount", e.target.value)}
          placeholder="0.00"
          className={`${inputSm} text-right`}
        />
      </div>

      {/* Remove */}
      <div className="w-8 flex-shrink-0 pt-1">
        {canRemove && (
          <button
            onClick={() => onRemove(index)}
            className="w-8 h-8 flex items-center justify-center text-stone-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default LineItemRow
