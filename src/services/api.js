// ─── Reef Shared API Service ───────────────────────────────────────────────
// Single API client shared across all app modules.
// Import createApiClient and call it with the config from usePlatform().

export const createApiClient = (config) => {

    const request = async (method, path, body, isFormData = false) => {
      const headers = {
        "X-Api-Key": config.apiKey,
        "X-API-Version": "1.0.0",
        "Authorization": `Bearer ${config.accessToken}`,
        "Accept": "application/json",
      }
      if (!isFormData) headers["Content-Type"] = "application/json"
  
      const opts = { method, headers }
      if (body) opts.body = isFormData ? body : JSON.stringify(body)
  
      const res = await fetch(`${config.baseUrl}${path}`, opts)
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`API ${method} ${path} → ${res.status}: ${errText}`)
      }
      return res.json()
    }
  
    return {
      // ─── Accounts ───────────────────────────────────────────────────────────
      getCompanies: () =>
        request("GET", `/accounts/${config.accountId}/companies?limit=100`),
  
      getLocations: (companyId) =>
        request("GET", `/accounts/${config.accountId}/locations?ottimate_company_id=${companyId}&limit=100`),
  
      // ─── Vendors ────────────────────────────────────────────────────────────
      getVendors: (companyId) =>
        request("GET", `/vendors?ottimate_company_id=${companyId}&limit=200`),
  
      createVendor: (data) =>
        request("POST", "/vendors", data),
  
      // ─── Dimensions ─────────────────────────────────────────────────────────
      getDimensions: (companyId) =>
        request("GET", `/dimensions?ottimate_company_id=${companyId}&limit=500`),
  
      // ─── Invoices ───────────────────────────────────────────────────────────
      uploadInvoice: (formData) =>
        request("POST", "/invoices/upload", formData, true),
  
      patchInvoice: (id, data) =>
        request("PATCH", `/invoices/${id}`, data),
  
      createInvoice: (data) =>
        request("POST", "/invoices", data),
  
      getInvoices: (companyId, params = {}) => {
        const query = new URLSearchParams({
          ottimate_company_id: companyId,
          limit: 100,
          ...params,
        })
        return request("GET", `/invoices?${query}`)
      },
  
      getInvoice: (id) =>
        request("GET", `/invoices/${id}`),
    }
  }