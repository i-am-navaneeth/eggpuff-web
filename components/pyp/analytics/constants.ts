// ======================================================
// Discovery Rate Thresholds
// ======================================================

export const GOOD_DISCOVERY_RATE = 70
export const EXCELLENT_DISCOVERY_RATE = 85

// ======================================================
// Progress Bar Colors
// ======================================================

export const COLORS = {
  amber: 'linear-gradient(90deg,#F4B860,#E9A73E)',
  green: 'linear-gradient(90deg,#22C55E,#16A34A)',
  purple: 'linear-gradient(90deg,#A855F7,#7C3AED)',
  blue: 'linear-gradient(90deg,#60A5FA,#2563EB)',
}

// ======================================================
// Funnel Colors
// ======================================================

export const FUNNEL_COLORS = {
  visits: '#F4B860',
  discoveries: '#34D399',
  rewards: '#8B5CF6',
  impressions: '#60A5FA', // Future
}

// ======================================================
// Trend Labels
// ======================================================

export const TREND_LABELS = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
] as const

// ======================================================
// UI Copy
// ======================================================

export const TITLES = {
  stats: 'Performance',
  funnel: 'Performance Funnel',
  trend: '7-Day Trend',
  progress: 'Performance',
}

// ======================================================
// Health Levels
// ======================================================

export const HEALTH = {
  excellent: 'Excellent',
  good: 'Good',
  improving: 'Needs Improvement',
}

// ======================================================
// Default Placeholder Trend
// (Used until daily analytics are implemented.)
// ======================================================

export const DEFAULT_TREND = [
  4,
  7,
  5,
  9,
  8,
  12,
  15,
]