import { useState, useEffect, useRef } from "react"
import { usePlatform } from "../../context/PlatformContext"
import { generateCheckRequestPDF } from "./utils/pdfGenerator"
import LineItemRow from "./components/LineItemRow"
import SubmissionModal from "./components/SubmissionModal"
import Toast from "./components/Toast"
import {
  card, sectionHeader, sectionBody, sectionTitle, sectionNumber,
  input, select, textarea, label,
  btnPrimary, btnGhost, btnSmDark, btnDanger, btnToggleActive, btnToggleInactive,
  infoBox, pageWrapper, pageInner, pageTitle, pageSubtitle
} from "../../styles/index"

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDimLabel(typeKey) {
  const map = {
    Account: "GL Account", Department: "Department", Class: "Class",
    Location: "Location", Project: "Project", CostCenter: "Cost Center",
    Fund: "Fund", Program: "Program", Grant: "Grant", Item: "Item"
  }
  return map[typeKey] || typeKey.replace(/([A-Z])/g, " $1").trim()
}

const emptyLineItem = () => ({ description: "", amount: "", dimensions: {} })

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CheckRequestApp() {
  const { api, company, location } = usePlatform()

  const [vendors, setVendors] = useState([])
  const [dimensionTypes, setDimensionTypes] = useState([])
  const [loading, setLoading] = useState({ vendors: false, dimensions: false })
  const [selectedVendor, setSelectedVendor] = useState("")
  const [newVendorName, setNewVendorName] = useState("")
  const [isNewVendor, setIsNewVendor] = useState(false)
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState("")
  const [requestedBy, setRequestedBy] = useState("")
  const [notes, setNotes] = useState("")
  const [lineItems, setLineItems] = useState([emptyLineItem()])
  const [attachment, setAttachment] = useState(null)
  const [submissionStatus, setSubmissionStatus] = useState(null)
  const [submissionResult, setSubmissionResult] = useState({})
  const [toast, setToast] = useState(null)
  const fileInputRef = useRef(null)

  // Load vendors and dimensions when company changes
  useEffect(() => {
    if (!company || !api) return
    ;(async () => {
      setLoading({ vendors: true, dimensions: true })
      try {
        const [vendRes, dimRes] = await Promise.all([
          api.getVendors(company.id),
          api.getDimensions(company.id),
        ])
        setVendors((vendRes.vendors || []).map(v => ({
          value: String(v.id),
          label: v.erp_vendor_name,
          subtitle: v.erp_vendor_id,
          raw: v,
        })))
        const dims = dimRes.dimensions || []
        const grouped = {}
        for (const d of dims) {
          const k = d.type || d.dimension_type || "Other"
          if (!grouped[k]) grouped[k] = []
          grouped[k].push(d)
        }
        const typeKeys = Object.keys(grouped).sort((a, b) => {
          if (a === "Account") return -1
          if (b === "Account") return 1
          return a.localeCompare(b)
        })
        const newDT = typeKeys.map(key => ({
          key,
          label: formatDimLabel(key),
          options: grouped[key].map(d => ({
            value: d.id,
            label: d.erp_dimension_id ? `${d.erp_dimension_id} – ${d.name}` : d.name,
            raw: d,
          })).sort((a, b) => a.label.localeCompare(b.label)),
        }))
        setDimensionTypes(newDT)
        setLineItems(prev => prev.map(li => ({ ...li, dimensions: {} })))
        if (newDT.length > 0) {
          setToast({ message: `Loaded ${newDT.length} dimension type${newDT.length !== 1 ? "s" : ""}`, type: "info" })
        }
      } catch (err) {
        setToast({ message: `Failed to load: ${err.message}`, type: "error" })
      } finally {
        setLoading({ vendors: false, dimensions: false })
      }
    })()
  }, [company, api])

  const updateLineItem = (i, item) => {
    const u = [...lineItems]
    u[i] = item
    setLineItems(u)
  }
  const removeLineItem = (i) => setLineItems(lineItems.filter((_, idx) => idx !== i))
  const addLineItem = () => setLineItems([...lineItems, emptyLineItem()])
  const totalAmount = lineItems.reduce((s, li) => s + (parseFloat(li.amount) || 0), 0)

  const resetForm = () => {
    setSelectedVendor("")
    setNewVendorName("")
    setIsNewVendor(false)
    setInvoiceDate(new Date().toISOString().split("T")[0])
    setDueDate("")
    setRequestedBy("")
    setNotes("")
    setLineItems([emptyLineItem()])
    setAttachment(null)
    setSubmissionStatus(null)
    setSubmissionResult({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!api) return
    if (!location) return setToast({ message: "Please select a location", type: "error" })
    if (!selectedVendor && !newVendorName) return setToast({ message: "Please select or enter a vendor", type: "error" })
    if (totalAmount <= 0) return setToast({ message: "Total amount must be greater than 0", type: "error" })

    setSubmissionStatus("submitting")
    try {
      let vendorName = "", vendorId = selectedVendor
      if (isNewVendor && newVendorName) {
        const nv = await api.createVendor({
          ottimate_company_id: parseInt(company.id),
          erp_vendor_name: newVendorName,
          erp_vendor_id: `CR-VENDOR-${Date.now()}`,
        })
        vendorId = nv.id
        vendorName = newVendorName
      } else {
        const v = vendors.find(v => v.value === selectedVendor)
        vendorName = v ? v.label : ""
      }

      const { blob, crNumber } = await generateCheckRequestPDF({
        vendorName, vendorId,
        locationName: location.name,
        invoiceDate, dueDate, requestedBy, notes, lineItems,
      }, dimensionTypes)

      const formData = new FormData()
formData.append("file", blob, `${crNumber}.pdf`)
      formData.append("ottimate_location_id", String(location.id))

      const uploadRes = await api.uploadInvoice(formData)
      const invoiceId = uploadRes?.invoice?.id || uploadRes?.id

      if (invoiceId) {
        const lineItemsPayload = lineItems.map(li => ({
          description: li.description,
          total: parseFloat(li.amount) || 0,
          dimensions: Object.fromEntries(
            Object.entries(li.dimensions || {})
              .filter(([, v]) => v?.value)
              .map(([k, v]) => [k, v.value])
          ),
        }))
        await api.patchInvoice(invoiceId, {
          erp_vendor_id: vendorId ? String(vendorId) : undefined,
          invoice_date: invoiceDate,
          due_date: dueDate || undefined,
          line_items: lineItemsPayload,
          custom_fields: { check_request_number: crNumber, requested_by: requestedBy, notes },
        })
      }

      setSubmissionResult({
        invoiceId,
        crNumber,
        invoiceUrl: invoiceId ? `https://app.ottimate.com/invoices/${invoiceId}` : null,
      })
      setSubmissionStatus("success")
    } catch (err) {
      console.error(err)
      setSubmissionStatus("error")
      setToast({ message: err.message, type: "error" })
    }
  }

  return (
    <div className={pageWrapper} style={{ paddingTop: 60 }}>
      <div className={pageInner}>

        {/* Header */}
        <div className="mb-8">
          <h1 className={pageTitle}>Check Request</h1>
          <p className={pageSubtitle}>{company?.name} · {location?.name}</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* 1: Location */}
          <div className={card}>
            <div className={sectionHeader}>
              <h2 className={sectionTitle}>
                <span className={sectionNumber}>1</span>
                Location
              </h2>
            </div>
            <div className={sectionBody}>
              <div className={infoBox}>
                {location?.name}
                <span className="text-stone-400 font-normal ml-2">
                  — change location using the selector in the top navigation bar
                </span>
              </div>
            </div>
          </div>

          {/* 2: Vendor */}
          <div className={card}>
            <div className={sectionHeader}>
              <h2 className={sectionTitle}>
                <span className={sectionNumber}>2</span>
                Vendor / Payee
              </h2>
            </div>
            <div className={sectionBody}>
              <div className="flex gap-3 mb-4">
                <button type="button" onClick={() => setIsNewVendor(false)}
                  className={!isNewVendor ? btnToggleActive : btnToggleInactive}>
                  Existing Vendor
                </button>
                <button type="button" onClick={() => setIsNewVendor(true)}
                  className={isNewVendor ? btnToggleActive : btnToggleInactive}>
                  New Vendor
                </button>
              </div>
              {!isNewVendor ? (
                <div>
                  <label className={label}>Select Vendor <span className="text-amber-500">*</span></label>
                  <select value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)} className={select}>
                    <option value="">{loading.vendors ? "Loading vendors…" : "Select a vendor…"}</option>
                    {vendors.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className={label}>New Vendor Name <span className="text-amber-500">*</span></label>
                  <input type="text" value={newVendorName} onChange={e => setNewVendorName(e.target.value)}
                    placeholder="Enter vendor / payee name..." className={input} />
                  <p className="text-xs text-stone-400 mt-1.5">A new vendor record will be created in Ottimate</p>
                </div>
              )}
            </div>
          </div>

          {/* 3: Details */}
          <div className={card}>
            <div className={sectionHeader}>
              <h2 className={sectionTitle}>
                <span className={sectionNumber}>3</span>
                Request Details
              </h2>
            </div>
            <div className={sectionBody}>
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <label className={label}>Invoice Date <span className="text-amber-500">*</span></label>
                  <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className={input} />
                </div>
                <div>
                  <label className={label}>Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={input} />
                </div>
                <div>
                  <label className={label}>Requested By</label>
                  <input type="text" value={requestedBy} onChange={e => setRequestedBy(e.target.value)}
                    placeholder="Your name or email" className={input} />
                </div>
              </div>
              <div>
                <label className={label}>Notes / Justification</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  placeholder="Why is this payment needed? Provide context for approvers..."
                  className={textarea} />
              </div>
            </div>
          </div>

          {/* 4: Line Items */}
          <div className={card}>
            <div className={`${sectionHeader} flex items-center justify-between`}>
              <div>
                <h2 className={sectionTitle}>
                  <span className={sectionNumber}>4</span>
                  Line Items
                </h2>
                {loading.dimensions && <p className="text-xs text-amber-600 mt-1 ml-8">Loading dimensions…</p>}
              </div>
              <button type="button" onClick={addLineItem} className={btnSmDark}>
                + Add Line
              </button>
            </div>
            <div className="px-4 py-2 overflow-x-auto">
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                <div className="w-8 flex-shrink-0 text-center">#</div>
                <div className="flex-1" style={{ flexBasis: "180px" }}>Description</div>
                {dimensionTypes.map(dt => (
                  <div key={dt.key} className="min-w-0 truncate"
                    style={{ flexBasis: dimensionTypes.length <= 2 ? "160px" : dimensionTypes.length <= 4 ? "130px" : "110px", flexShrink: 1, flexGrow: 0 }}>
                    {dt.label} <span className="text-stone-300 font-normal">({dt.options.length})</span>
                  </div>
                ))}
                <div className="w-28 flex-shrink-0 text-right">Amount</div>
                <div className="w-8 flex-shrink-0"></div>
              </div>
              {lineItems.map((item, i) => (
                <LineItemRow key={i} item={item} index={i} onChange={updateLineItem}
                  onRemove={removeLineItem} dimensionTypes={dimensionTypes} canRemove={lineItems.length > 1} />
              ))}
            </div>
            <div className="px-8 py-5 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-6">
              <span className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Total</span>
              <span className="text-2xl font-extrabold text-stone-900 tracking-tight">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* 5: Attachment */}
          <div className={card}>
            <div className={sectionHeader}>
              <h2 className={sectionTitle}>
                <span className={sectionNumber}>5</span>
                Supporting Document
                <span className="text-xs font-normal text-stone-400 normal-case tracking-normal ml-1">(optional)</span>
              </h2>
            </div>
            <div className={sectionBody}>
              <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.tiff"
                onChange={e => setAttachment(e.target.files[0] || null)} className="hidden" />
              {!attachment ? (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center gap-2 hover:border-amber-400 hover:bg-amber-50/30 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
                    <svg className="w-6 h-6 text-stone-400 group-hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-stone-500 group-hover:text-stone-700">Click to upload a supporting document</p>
                  <p className="text-xs text-stone-400">PDF, JPG, PNG, TIFF — max 25MB</p>
                </button>
              ) : (
                <div className="flex items-center justify-between px-5 py-4 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-800">{attachment.name}</p>
                      <p className="text-xs text-stone-400">{(attachment.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                    className={btnDanger}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <button type="button" onClick={resetForm} className={btnGhost}>Reset Form</button>
            <button type="submit" disabled={submissionStatus === "submitting"} className={btnPrimary}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Submit Check Request
            </button>
          </div>

        </form>
      </div>

      <SubmissionModal
        status={submissionStatus}
        invoiceId={submissionResult.invoiceId}
        invoiceUrl={submissionResult.invoiceUrl}
        crNumber={submissionResult.crNumber}
        onClose={() => setSubmissionStatus(null)}
        onNew={resetForm}
      />
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  )
}