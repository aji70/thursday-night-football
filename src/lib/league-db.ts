export function currentMonthKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export const PAYMENT_AMOUNTS = {
  MONTHLY_5K: 5000,
  VISITOR_1_5K: 1500,
} as const;

export type PaymentType = keyof typeof PAYMENT_AMOUNTS;

export function seatForPaymentType(type: PaymentType): "permanent" | "sub" {
  return type === "MONTHLY_5K" ? "permanent" : "sub";
}

export type PlayerStatRow = {
  playerId: string;
  name: string;
  teamName: string | null;
  seat: string;
  goals: number;
  assists: number;
  yc: number;
  rc: number;
  overall: number;
};

export function overallScore(goals: number, assists: number, yc: number, rc: number) {
  return goals + assists - yc * 0.5 - rc;
}
