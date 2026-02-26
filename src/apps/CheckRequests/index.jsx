import { useState, useEffect, useRef } from "react"
import { usePlatform } from "../../context/PlatformContext"
import { generateCheckRequestPDF } from "./utils/pdfGenerator"
import LineItemRow from "./components/LineItemRow"
import SubmissionModal from "./components/SubmissionModal"
import Toast from "./components/Toast"
import SearchableSelect from "../../components/SearchableSelect"
import { REEF_GREEN, FONT } from "../../styles/index"

const emptyLineItem = () => ({ description: "", amount: "", dimensions: {} })

function formatDimLabel(typeKey) {
  const map = {
    Account: "GL Account", Department: "Department", Class: "Class",
    Location: "Location", Project: "Project", CostCenter: "Cost Center",
    Fund: "Fund", Program: "Program", Grant: "Grant", Item: "Item"
  }
  return map[typeKey] || typeKey.replace(/([A-Z])/g, " $1").trim()
}

// ─── Style tokens (inline) ────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: "#FAFAF9", paddingTop: 72, fontFamily: FONT },
  inner: { maxWidth: 860, margin: "0 auto", padding: "40px 32px 80px" },
  pageTitle: { margin: 0, fontSize: 24, fontWeight: 800, color: "#1C1917", letterSpacing: "-0.4px" },
  pageSubtitle: { margin: "6px 0 0", fontSize: 13, color: "#A8A29E" },
  card: { background: "#fff", borderRadius: 16, border: "1px solid #E7E5E4", marginBottom: 20, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  sectionHead: { padding: "18px 28px", borderBottom: "1px solid #F5F5F4", background: "#FAFAF9", display: "flex", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { display: "flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, color: "#78716C", letterSpacing: "1px", textTransform: "uppercase" },
  sectionNum: { width: 22, height: 22, borderRadius: 6, background: "#1C1917", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  sectionBody: { padding: "24px 28px" },
  label: { display: "block", fontSize: 10, fontWeight: 700, color: "#78716C", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 7 },
  input: { width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #E7E5E4", background: "#FAFAF9", fontSize: 13, color: "#1C1917", fontFamily: FONT, outline: "none" },
  textarea: { width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #E7E5E4", background: "#FAFAF9", fontSize: 13, color: "#1C1917", fontFamily: FONT, outline: "none", resize: "vertical" },
  infoBox: { padding: "10px 14px", borderRadius: 8, background: "#F5F5F4", border: "1px solid #E7E5E4", fontSize: 13, color: "#57534E" },
  toggleActive: { padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#1C1917", color: "#fff", border: "none", cursor: "pointer", fontFamily: FONT },
  toggleInactive: { padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, background: "none", color: "#A8A29E", border: "1px solid #E7E5E4", cursor: "pointer", fontFamily: FONT },
  btnPrimary: { padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700, background: REEF_GREEN, color: "#fff", border: "none", cursor: "pointer", fontFamily: FONT, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(45,122,79,0.25)" },
  btnGhost: { padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 500, background: "none", color: "#A8A29E", border: "none", cursor: "pointer", fontFamily: FONT },
  btnAdd: { padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#1C1917", color: "#fff", border: "none", cursor: "pointer", fontFamily: FONT, display: "flex", alignItems: "center", gap: 6 },
  colHeader: { fontSize: 10, fontWeight: 700, color: "#A8A29E", letterSpacing: "0.8px", textTransform: "uppercase" },
}

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
        setDimensionTypes(typeKeys.map(key => ({
          key, label: formatDimLabel(key),
          options: grouped[key].map(d => ({
            value: d.id,
            label: d.erp_dimension_id ? `${d.erp_dimension_id} – ${d.name}` : d.name,
          })).sort((a, b) => a.label.localeCompare(b.label)),
        })))
        setLineItems(prev => prev.map(li => ({ ...li, dimensions: {} })))
        setToast({ message: "Vendors and dimensions loaded", type: "info" })
      } catch (err) {
        setToast({ message: `Failed to load: ${err.message}`, type: "error" })
      } finally {
        setLoading({ vendors: false, dimensions: false })
      }
    })()
  }, [company, api])

  const updateLineItem = (i, item) => { const u = [...lineItems]; u[i] = item; setLineItems(u) }
  const removeLineItem = (i) => setLineItems(lineItems.filter((_, idx) => idx !== i))
  const addLineItem = () => setLineItems([...lineItems, emptyLineItem()])
  const totalAmount = lineItems.reduce((s, li) => s + (parseFloat(li.amount) || 0), 0)

  const resetForm = () => {
    setSelectedVendor(""); setNewVendorName(""); setIsNewVendor(false)
    setInvoiceDate(new Date().toISOString().split("T")[0]); setDueDate("")
    setRequestedBy(""); setNotes(""); setLineItems([emptyLineItem()])
    setAttachment(null); setSubmissionStatus(null); setSubmissionResult({})
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
        const nv = await api.createVendor({ ottimate_company_id: parseInt(company.id), erp_vendor_name: newVendorName, erp_vendor_id: `CR-VENDOR-${Date.now()}` })
        vendorId = nv.id; vendorName = newVendorName
      } else {
        const v = vendors.find(v => v.value === selectedVendor)
        vendorName = v ? v.label : ""
      }

      const { blob, crNumber } = await generateCheckRequestPDF({
        vendorName, vendorId, locationName: location.name,
        invoiceDate, dueDate, requestedBy, notes, lineItems,
      }, dimensionTypes)

      const fd = new FormData()
      fd.append("file", blob, `${crNumber}.pdf`)
      fd.append("ottimate_location_id", String(location.id))

      const uploadRes = await api.uploadInvoice(fd)
      const invoiceId = uploadRes?.invoice?.id || uploadRes?.id

      if (invoiceId) {
        await api.patchInvoice(invoiceId, {
          erp_vendor_id: vendorId ? String(vendorId) : undefined,
          invoice_date: invoiceDate,
          due_date: dueDate || undefined,
          line_items: lineItems.map(li => ({
            description: li.description,
            total: parseFloat(li.amount) || 0,
            dimensions: Object.fromEntries(Object.entries(li.dimensions || {}).filter(([, v]) => v?.value).map(([k, v]) => [k, v.value])),
          })),
          custom_fields: { check_request_number: crNumber, requested_by: requestedBy, notes },
        })
      }

      setSubmissionResult({ invoiceId, crNumber, invoiceUrl: invoiceId ? `https://app.ottimate.com/invoices/${invoiceId}` : null })
      setSubmissionStatus("success")
    } catch (err) {
      console.error(err)
      setSubmissionStatus("error")
      setToast({ message: err.message, type: "error" })
    }
  }

  return (
    <div style={S.page}>
      <div style={S.inner}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={S.pageTitle}>Check Request</h1>
          <p style={S.pageSubtitle}>{company?.name} · {location?.name}</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* 1: Location */}
          <div style={S.card}>
            <div style={S.sectionHead}>
              <div style={S.sectionTitle}>
                <div style={S.sectionNum}>1</div>
                Location
              </div>
            </div>
            <div style={S.sectionBody}>
              <div style={S.infoBox}>
                <strong>{location?.name}</strong>
                <span style={{ color: "#A8A29E", fontWeight: 400, marginLeft: 8 }}>
                  — change using the location selector in the nav bar
                </span>
              </div>
            </div>
          </div>

          {/* 2: Vendor */}
          <div style={S.card}>
            <div style={S.sectionHead}>
              <div style={S.sectionTitle}>
                <div style={S.sectionNum}>2</div>
                Vendor / Payee
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setIsNewVendor(false)}
                  style={!isNewVendor ? S.toggleActive : S.toggleInactive}>
                  Existing Vendor
                </button>
                <button type="button" onClick={() => setIsNewVendor(true)}
                  style={isNewVendor ? S.toggleActive : S.toggleInactive}>
                  New Vendor
                </button>
              </div>
            </div>
            <div style={S.sectionBody}>
              {!isNewVendor ? (
                <SearchableSelect
                  label="Select Vendor"
                  required
                  options={vendors}
                  value={selectedVendor}
                  onChange={setSelectedVendor}
                  placeholder={loading.vendors ? "Loading vendors…" : "Search vendors…"}
                />
              ) : (
                <div>
                  <label style={S.label}>New Vendor Name <span style={{ color: "#F59E0B" }}>*</span></label>
                  <input type="text" value={newVendorName} onChange={e => setNewVendorName(e.target.value)}
                    placeholder="Enter vendor / payee name..." style={S.input} />
                  <div style={{ fontSize: 11, color: "#A8A29E", marginTop: 6 }}>
                    A new vendor record will be created in Ottimate
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3: Details */}
          <div style={S.card}>
            <div style={S.sectionHead}>
              <div style={S.sectionTitle}>
                <div style={S.sectionNum}>3</div>
                Request Details
              </div>
            </div>
            <div style={S.sectionBody}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={S.label}>Invoice Date <span style={{ color: "#F59E0B" }}>*</span></label>
                  <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Requested By</label>
                  <input type="text" value={requestedBy} onChange={e => setRequestedBy(e.target.value)}
                    placeholder="Your name or email" style={S.input} />
                </div>
              </div>
              <div>
                <label style={S.label}>Notes / Justification</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  placeholder="Why is this payment needed? Provide context for approvers..."
                  style={S.textarea} />
              </div>
            </div>
          </div>

          {/* 4: Line Items */}
          <div style={S.card}>
            <div style={S.sectionHead}>
              <div style={S.sectionTitle}>
                <div style={S.sectionNum}>4</div>
                Line Items
                {loading.dimensions && (
                  <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>
                    Loading dimensions…
                  </span>
                )}
              </div>
              <button type="button" onClick={addLineItem} style={S.btnAdd}>
                + Add Line
              </button>
            </div>

            {/* Column headers */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: "1px solid #F5F5F4", background: "#FAFAF9" }}>
              <div style={{ width: 28, flexShrink: 0 }} />
              <div style={{ flex: 1, flexBasis: 180, ...S.colHeader }}>Description</div>
              {dimensionTypes.map(dt => (
                <div key={dt.key} style={{
                  flexShrink: 0, ...S.colHeader,
                  width: dimensionTypes.length <= 2 ? 160 : dimensionTypes.length <= 4 ? 140 : 120,
                }}>
                  {dt.label} <span style={{ color: "#D4CFC9", fontWeight: 400 }}>({dt.options.length})</span>
                </div>
              ))}
              <div style={{ width: 100, flexShrink: 0, ...S.colHeader, textAlign: "right" }}>Amount</div>
              <div style={{ width: 28, flexShrink: 0 }} />
            </div>

            {lineItems.map((item, i) => (
              <LineItemRow key={i} item={item} index={i} onChange={updateLineItem}
                onRemove={removeLineItem} dimensionTypes={dimensionTypes} canRemove={lineItems.length > 1} />
            ))}

            {/* Total */}
            <div style={{ padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16, borderTop: "1px solid #F5F5F4", background: "#FAFAF9" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#A8A29E", letterSpacing: "1px", textTransform: "uppercase" }}>Total</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: "#1C1917", letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums" }}>
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* 5: Attachment */}
          <div style={S.card}>
            <div style={S.sectionHead}>
              <div style={S.sectionTitle}>
                <div style={S.sectionNum}>5</div>
                Supporting Document
                <span style={{ fontSize: 11, fontWeight: 400, color: "#A8A29E", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
              </div>
            </div>
            <div style={S.sectionBody}>
              <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.tiff"
                onChange={e => setAttachment(e.target.files[0] || null)} style={{ display: "none" }} />
              {!attachment ? (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: "100%", padding: "32px 20px", border: "2px dashed #E7E5E4",
                    borderRadius: 12, background: "none", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    fontFamily: FONT, transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = REEF_GREEN}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#E7E5E4"}
                >
                  <svg width="28" height="28" fill="none" stroke="#A8A29E" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span style={{ fontSize: 13, color: "#78716C", fontWeight: 500 }}>Click to upload a supporting document</span>
                  <span style={{ fontSize: 11, color: "#A8A29E" }}>PDF, JPG, PNG, TIFF — max 25MB</span>
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#FAFAF9", borderRadius: 10, border: "1px solid #E7E5E4" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "#F0FAF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="18" height="18" fill="none" stroke={REEF_GREEN} strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#1C1917" }}>{attachment.name}</div>
                      <div style={{ fontSize: 11, color: "#A8A29E" }}>{(attachment.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                  <button type="button"
                    onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                    style={{ fontSize: 13, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontFamily: FONT, fontWeight: 500 }}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
            <button type="button" onClick={resetForm}
              style={S.btnGhost}>
              Reset Form
            </button>
            <button type="submit" disabled={submissionStatus === "submitting"}
              style={{ ...S.btnPrimary, opacity: submissionStatus === "submitting" ? 0.5 : 1 }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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
