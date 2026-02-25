const SubmissionModal = ({ status, invoiceId, invoiceUrl, crNumber, onClose, onNew }) => {
    if (!status) return null
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
  
          {status === "submitting" && (
            <div className="px-8 py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <p className="text-lg font-bold text-stone-900">Submitting to Ottimate…</p>
              <p className="text-sm text-stone-500 mt-2">Creating invoice and routing for approval</p>
            </div>
          )}
  
          {status === "success" && (
            <div className="px-8 py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-bold text-stone-900 mb-1">Check Request Submitted</p>
              <p className="text-sm text-stone-500 mb-2">{crNumber}</p>
              {invoiceId && <p className="text-xs text-stone-400 mb-6">Invoice ID: {invoiceId}</p>}
              <div className="flex gap-3">
                {invoiceUrl && (
                  <a href={invoiceUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors">
                    View in Ottimate
                  </a>
                )}
                <button onClick={onNew}
                  className="flex-1 px-4 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors">
                  New Request
                </button>
              </div>
            </div>
          )}
  
          {status === "error" && (
            <div className="px-8 py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-lg font-bold text-stone-900 mb-2">Submission Failed</p>
              <p className="text-sm text-stone-500 mb-6">Please check your API configuration and try again.</p>
              <button onClick={onClose}
                className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors">
                Close
              </button>
            </div>
          )}
  
        </div>
      </div>
    )
  }
  
  export default SubmissionModal