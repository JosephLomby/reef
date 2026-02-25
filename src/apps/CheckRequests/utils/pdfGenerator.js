export const generateCheckRequestPDF = async (formData, dimensionTypes) => {
    const crNumber = `CR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    const totalAmount = formData.lineItems.reduce((sum, li) => sum + (parseFloat(li.amount) || 0), 0)
  
    const thS = `padding:10px 14px;text-align:left;font-size:10px;font-weight:700;color:#a8a29e;letter-spacing:1.5px;text-transform:uppercase;border-bottom:2px solid #e8e5e0;`
    const tdS = `padding:10px 14px;border-bottom:1px solid #e8e5e0;font-size:13px;color:#44403c;`
  
    const dimHeaders = dimensionTypes.map(dt => `<th style="${thS}">${dt.label}</th>`).join("")
    const rows = formData.lineItems.map((li, i) => {
      const dimCells = dimensionTypes.map(dt =>
        `<td style="${tdS}">${li.dimensions?.[dt.key]?.label || "—"}</td>`
      ).join("")
      return `<tr>
        <td style="${tdS}">${i + 1}</td>
        <td style="${tdS}">${li.description || "—"}</td>
        ${dimCells}
        <td style="${tdS}text-align:right;">$${parseFloat(li.amount || 0).toFixed(2)}</td>
      </tr>`
    }).join("")
  
    const html = `<!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><title>Check Request ${crNumber}</title></head>
  <body style="margin:0;padding:40px;font-family:Helvetica,Arial,sans-serif;background:#fff;color:#1c1917;">
  <div style="max-width:800px;margin:0 auto;">
  
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:20px;border-bottom:3px solid #1c1917;">
    <div>
      <h1 style="margin:0;font-size:28px;font-weight:800;">CHECK REQUEST</h1>
      <p style="margin:4px 0 0;font-size:12px;color:#78716c;letter-spacing:1px;text-transform:uppercase;">Payment Authorization Form</p>
    </div>
    <div style="text-align:right;">
      <p style="margin:0;font-size:18px;font-weight:700;">${crNumber}</p>
      <p style="margin:4px 0 0;font-size:12px;color:#78716c;">Date: ${today}</p>
    </div>
  </div>
  
  <div style="display:flex;gap:40px;margin-bottom:32px;">
    <div style="flex:1;">
      <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#a8a29e;letter-spacing:1.5px;text-transform:uppercase;">Pay To</p>
      <p style="margin:0;font-size:16px;font-weight:700;">${formData.vendorName}</p>
      ${formData.vendorId ? `<p style="margin:2px 0 0;font-size:12px;color:#78716c;">Vendor ID: ${formData.vendorId}</p>` : ""}
    </div>
    <div style="flex:1;">
      <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#a8a29e;letter-spacing:1.5px;text-transform:uppercase;">Location</p>
      <p style="margin:0;font-size:14px;">${formData.locationName}</p>
    </div>
  </div>
  
  <div style="display:flex;gap:40px;margin-bottom:32px;">
    <div>
      <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#a8a29e;letter-spacing:1.5px;text-transform:uppercase;">Invoice Date</p>
      <p style="margin:0;font-size:14px;">${formData.invoiceDate || today}</p>
    </div>
    <div>
      <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#a8a29e;letter-spacing:1.5px;text-transform:uppercase;">Due Date</p>
      <p style="margin:0;font-size:14px;">${formData.dueDate || "Upon Receipt"}</p>
    </div>
    <div>
      <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#a8a29e;letter-spacing:1.5px;text-transform:uppercase;">Requested By</p>
      <p style="margin:0;font-size:14px;">${formData.requestedBy || "—"}</p>
    </div>
  </div>
  
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
      <tr style="background:#fafaf9;">
        <th style="${thS}">#</th>
        <th style="${thS}">Description</th>
        ${dimHeaders}
        <th style="${thS}text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  
  <div style="display:flex;justify-content:flex-end;margin-bottom:32px;">
    <div style="background:#1c1917;color:white;padding:14px 28px;border-radius:12px;">
      <span style="font-size:12px;font-weight:500;opacity:0.7;margin-right:16px;">TOTAL</span>
      <span style="font-size:22px;font-weight:800;">$${totalAmount.toFixed(2)}</span>
    </div>
  </div>
  
  ${formData.notes ? `
  <div style="margin-bottom:32px;padding:20px;background:#fafaf9;border-radius:12px;border:1px solid #e8e5e0;">
    <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#a8a29e;letter-spacing:1.5px;text-transform:uppercase;">Notes / Justification</p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#44403c;">${formData.notes}</p>
  </div>` : ""}
  
  <div style="border-top:1px solid #e8e5e0;padding-top:16px;display:flex;justify-content:space-between;">
    <p style="margin:0;font-size:11px;color:#a8a29e;">Generated via Reef · Ottimate Check Request</p>
    <p style="margin:0;font-size:11px;color:#a8a29e;">${new Date().toISOString()}</p>
  </div>
  
  </div>
  </body>
  </html>`
  
    return { blob: new Blob([html], { type: "text/html" }), crNumber, html }
  }