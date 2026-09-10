// ─── Fee structure ────────────────────────────────────────────────
export const feeStructure = {
  tuition:     550000,
  boarding:    280000,
  lunch:        90000,
  activity:     45000,
  library:      20000,
  development:  65000,
}

export const termFeeTotal = Object.values(feeStructure).reduce((a, b) => a + b, 0)

// ─── Student fee records ──────────────────────────────────────────
export const studentFees = [
  { id: 's301', name: 'David Ssemanda',   class: 'S.3A', termFee: termFeeTotal, paid: 600000,  balance: termFeeTotal - 600000,  status: 'partial'  },
  { id: 's302', name: 'Queen Nabirye',    class: 'S.3A', termFee: termFeeTotal, paid: termFeeTotal, balance: 0,               status: 'cleared'  },
  { id: 's303', name: 'Robert Tumwine',   class: 'S.3A', termFee: termFeeTotal, paid: 0,           balance: termFeeTotal,     status: 'unpaid'   },
  { id: 's304', name: 'Sarah Nantongo',   class: 'S.3A', termFee: termFeeTotal, paid: 800000,  balance: termFeeTotal - 800000,  status: 'partial'  },
  { id: 's305', name: 'Thomas Okello',    class: 'S.3A', termFee: termFeeTotal, paid: termFeeTotal, balance: 0,               status: 'cleared'  },
  { id: 's401', name: 'Xavier Mugisha',   class: 'S.4A', termFee: termFeeTotal, paid: 500000,  balance: termFeeTotal - 500000,  status: 'partial'  },
  { id: 's402', name: 'Yvonne Namutebi',  class: 'S.4A', termFee: termFeeTotal, paid: 0,           balance: termFeeTotal,     status: 'unpaid'   },
  { id: 's403', name: 'Zara Akiiki',      class: 'S.4A', termFee: termFeeTotal, paid: termFeeTotal, balance: 0,               status: 'cleared'  },
  { id: 's201', name: 'Irene Nakazibwe',  class: 'S.2B', termFee: termFeeTotal, paid: 700000,  balance: termFeeTotal - 700000,  status: 'partial'  },
  { id: 's202', name: 'James Kiggundu',   class: 'S.2B', termFee: termFeeTotal, paid: termFeeTotal, balance: 0,               status: 'cleared'  },
]

// ─── Payment history for David Ssemanda ──────────────────────────
export const paymentHistory = [
  { id: 'p1', date: '2026-05-03', amount: 400000, method: 'Mobile Money', ref: 'MTN-2026-0503-8821', received_by: 'Bursar' },
  { id: 'p2', date: '2026-05-21', amount: 200000, method: 'Bank Transfer', ref: 'STB-2026-0521-4432', received_by: 'Bursar' },
]

// ─── School-wide finance summary ─────────────────────────────────
export const financeSummary = {
  totalExpected:  842 * termFeeTotal,
  totalCollected: Math.round(842 * termFeeTotal * 0.78),
  overdueCount:   102,
  clearedCount:   584,
  partialCount:   156,
}

// ─── Monthly collection trend ────────────────────────────────────
export const collectionTrend = [
  { month: 'Feb', collected: 180000000 },
  { month: 'Mar', collected: 245000000 },
  { month: 'Apr', collected: 198000000 },
  { month: 'May', collected: 312000000 },
  { month: 'Jun', collected: 156000000 },
]

export function formatUGX(amount) {
  return `UGX ${amount.toLocaleString()}`
}

export const statusStyle = {
  cleared: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  label: 'Cleared' },
  partial: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  label: 'Partial' },
  unpaid:  { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    label: 'Unpaid'  },
}