export const HYDERABAD_LOCATIONS = [
  "Gachibowli",
  "Kokapet",
  "Narsingi",
  "Financial District",
  "Tellapur",
  "Kollur",
  "Manikonda",
  "Kondapur",
  "Madhapur",
  "Nanakramguda",
  "Other",
] as const;

export const BUDGET_RANGES = [
  "₹50L - ₹1Cr",
  "₹1Cr - ₹2Cr",
  "₹2Cr - ₹3Cr",
  "₹3Cr+",
] as const;

export const BUYING_PURPOSES = ["Investment", "End Use", "Both"] as const;

export const BUYING_TIMELINES = [
  "Immediate",
  "1-3 Months",
  "3-6 Months",
  "6+ Months",
] as const;

export type HyderabadLocation = (typeof HYDERABAD_LOCATIONS)[number];
export type BudgetRange = (typeof BUDGET_RANGES)[number];
export type BuyingPurpose = (typeof BUYING_PURPOSES)[number];
export type BuyingTimeline = (typeof BUYING_TIMELINES)[number];
