// ─── Reef Design System ────────────────────────────────────────────────────────
// Single source of truth for all styles across the platform.
// Import what you need: import { input, card, REEF_GREEN } from "../../styles"

// ─── Brand ────────────────────────────────────────────────────────────────────
export const REEF_GREEN = "#2D7A4F"
export const FONT = "'Hanken Grotesk', 'DM Sans', sans-serif"

// ─── Form Elements ────────────────────────────────────────────────────────────
export const input = "w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
export const inputSm = "w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
export const select = "w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
export const selectSm = "w-full px-2 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/50"
export const textarea = "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
export const label = "block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5"

// ─── Cards & Sections ─────────────────────────────────────────────────────────
export const card = "bg-white rounded-2xl border border-stone-200 shadow-sm mb-6 overflow-hidden"
export const sectionHeader = "px-8 py-5 border-b border-stone-100 bg-stone-50/50"
export const sectionBody = "px-8 py-6"
export const sectionTitle = "text-sm font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2"
export const sectionNumber = "w-6 h-6 rounded-lg bg-stone-900 text-white flex items-center justify-center text-xs"

// ─── Buttons ──────────────────────────────────────────────────────────────────
export const btnPrimary = "px-10 py-3.5 bg-stone-900 text-white rounded-2xl text-sm font-bold hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
export const btnSecondary = "px-5 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-800 transition-colors"
export const btnDanger = "text-sm text-red-500 hover:text-red-700 font-medium"
export const btnGhost = "px-6 py-3 text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors"
export const btnSmDark = "flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
export const btnToggleActive = "px-4 py-2 rounded-xl text-sm font-semibold transition-colors bg-stone-900 text-white"
export const btnToggleInactive = "px-4 py-2 rounded-xl text-sm font-semibold transition-colors bg-stone-100 text-stone-600 hover:bg-stone-200"

// ─── Layout ───────────────────────────────────────────────────────────────────
export const pageWrapper = "min-h-screen bg-stone-50"
export const pageInner = "max-w-5xl mx-auto px-6 py-10"
export const pageTitle = "text-2xl font-extrabold text-stone-900 tracking-tight"
export const pageSubtitle = "text-sm text-stone-500 mt-1"

// ─── Feedback ─────────────────────────────────────────────────────────────────
export const errorBox = "bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600"
export const infoBox = "bg-stone-50 rounded-xl border border-stone-200 text-sm text-stone-700 font-medium px-4 py-3"

// ─── Toast Colors ─────────────────────────────────────────────────────────────
export const toastColors = {
  success: "bg-emerald-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-stone-800 text-white",
}