export const coreMetrics = {
  totalUsers: 28561,
  coreUsers: 7117,
  mau: 2375,
  dau: 114,
  totalMessages: 691428,
  lastMonthMessages: 43745,
  firstMatchAcceptance: 81,
  avgMessagesPerUser: 97,
  avgAge: 23.6
};

export const funnelData = [
  { stage: 'Landing', users: 18488, conversion: null },
  { stage: 'Signup', users: 6689, conversion: 36 },
  { stage: 'Continue', users: 2907, conversion: 43 },
  { stage: 'Account Created', users: 1815, conversion: 62 }
];

export const retentionData = [
  { period: 'D1', rate: 31, benchmark: '30-40%' },
  { period: 'D7', rate: 42, benchmark: '20-30%' },
  { period: 'D15', rate: 6, benchmark: '5-10%' },
  { period: 'D30', rate: 14, benchmark: '10-15%' }
];

export const ageDistribution = [
  { range: '18-24', percentage: 72.54, count: 5322 },
  { range: '25-34', percentage: 20.85, count: 1529 },
  { range: '35-44', percentage: 5.43, count: 400 },
  { range: '45-54', percentage: 0.72, count: 53 },
  { range: '55-64', percentage: 0.20, count: 15 },
  { range: '65+', percentage: 0.26, count: 19 }
];

export const weeklyAcceptanceRate = [
  { week: 'Aug 25', rate: 33 },
  { week: 'Sep 1', rate: 31 },
  { week: 'Sep 8', rate: 33 },
  { week: 'Sep 15', rate: 54 },
  { week: 'Sep 22', rate: 41 }
];

export const monthlyMAU = [
  { month: 'July 2025', mau: 2200 },
  { month: 'August 2025', mau: 1700 },
  { month: 'September 2025', mau: 1300 }
];