import { jsPDF } from "jspdf"

export const generateCheckRequestPDF = async (formData, dimensionTypes) => {
  const crNumber = `CR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const totalAmount = formData.lineItems.reduce((sum, li) => sum + (parseFloat(li.amount) || 0), 0)

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" })
  const margin = 48
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - margin * 2
  let y = 48

  // ─── Header ───────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.setTextColor(28, 25, 23)
  doc.text("CHECK REQUEST", margin, y)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(120, 113, 108)
  doc.text("PAYMENT AUTHORIZATION FORM", margin, y + 16)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(28, 25, 23)
  doc.text(crNumber, pageWidth - margin, y, { align: "right" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(120, 113, 108)
  doc.text(`Date: ${today}`, pageWidth - margin, y + 16, { align: "right" })

  y += 28
  doc.setDrawColor(28, 25, 23)
  doc.setLineWidth(2)
  doc.line(margin, y, pageWidth - margin, y)
  y += 20

  // ─── Vendor + Location Row ─────────────────────────────────────────────────
  const labelColor = [168, 162, 158]
  const valueColor = [28, 25, 23]

  const drawField = (label, value, x, width) => {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(...labelColor)
    doc.text(label.toUpperCase(), x, y)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(...valueColor)
    doc.text(String(value || "—"), x, y + 14, { maxWidth: width })
  }

  const halfWidth = contentWidth / 2 - 16
  drawField("Pay To", formData.vendorName, margin, halfWidth)
  drawField("Location", formData.locationName, margin + contentWidth / 2, halfWidth)
  y += 36

  // ─── Date + Requested By Row ───────────────────────────────────────────────
  const thirdWidth = contentWidth / 3 - 12
  drawField("Invoice Date", formData.invoiceDate || today, margin, thirdWidth)
  drawField("Due Date", formData.dueDate || "Upon Receipt", margin + contentWidth / 3, thirdWidth)
  drawField("Requested By", formData.requestedBy || "—", margin + (contentWidth / 3) * 2, thirdWidth)
  y += 40

  // ─── Line Items Table ──────────────────────────────────────────────────────
  const dimCount = dimensionTypes.length
  const amountColWidth = 70
  const descColWidth = dimCount > 0 ? 160 : contentWidth - amountColWidth - 24
  const dimColWidth = dimCount > 0 ? (contentWidth - descColWidth - amountColWidth - 24) / dimCount : 0

  // Table header
  doc.setFillColor(250, 250, 249)
  doc.rect(margin, y, contentWidth, 20, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...labelColor)

  let colX = margin + 8
  doc.text("#", colX, y + 13)
  colX += 16
  doc.text("DESCRIPTION", colX, y + 13)
  colX += descColWidth
  dimensionTypes.forEach(dt => {
    doc.text(dt.label.toUpperCase(), colX, y + 13, { maxWidth: dimColWidth - 4 })
    colX += dimColWidth
  })
  doc.text("AMOUNT", pageWidth - margin - 8, y + 13, { align: "right" })

  doc.setDrawColor(232, 229, 224)
  doc.setLineWidth(1)
  doc.line(margin, y + 20, pageWidth - margin, y + 20)
  y += 20

  // Table rows
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(...valueColor)

  formData.lineItems.forEach((li, i) => {
    const rowY = y + (i * 24) + 16
    colX = margin + 8
    doc.text(String(i + 1), colX, rowY)
    colX += 16
    doc.text(li.description || "—", colX, rowY, { maxWidth: descColWidth - 8 })
    colX += descColWidth
    dimensionTypes.forEach(dt => {
      const dimVal = li.dimensions?.[dt.key]?.label || "—"
      doc.text(dimVal, colX, rowY, { maxWidth: dimColWidth - 4 })
      colX += dimColWidth
    })
    doc.text(`$${parseFloat(li.amount || 0).toFixed(2)}`, pageWidth - margin - 8, rowY, { align: "right" })
    doc.setDrawColor(232, 229, 224)
    doc.setLineWidth(0.5)
    doc.line(margin, rowY + 8, pageWidth - margin, rowY + 8)
  })

  y += formData.lineItems.length * 24 + 16

  // ─── Total ─────────────────────────────────────────────────────────────────
  y += 8
  doc.setFillColor(28, 25, 23)
  doc.roundedRect(pageWidth - margin - 160, y, 160, 36, 6, 6, "F")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text("TOTAL", pageWidth - margin - 100, y + 14)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text(`$${totalAmount.toFixed(2)}`, pageWidth - margin - 10, y + 24, { align: "right" })
  y += 52

  // ─── Notes ─────────────────────────────────────────────────────────────────
  if (formData.notes) {
    doc.setFillColor(250, 250, 249)
    doc.roundedRect(margin, y, contentWidth, 52, 6, 6, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(...labelColor)
    doc.text("NOTES / JUSTIFICATION", margin + 12, y + 14)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(...valueColor)
    doc.text(formData.notes, margin + 12, y + 28, { maxWidth: contentWidth - 24 })
    y += 60
  }

  // ─── Footer ────────────────────────────────────────────────────────────────
  doc.setDrawColor(232, 229, 224)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...labelColor)
  doc.text("Generated via Reef · Ottimate Check Request", margin, y + 14)
  doc.text(new Date().toISOString(), pageWidth - margin, y + 14, { align: "right" })

  // ─── Output ────────────────────────────────────────────────────────────────
  const pdfBlob = doc.output("blob")
  return { blob: pdfBlob, crNumber }
}