export function currentMonthKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Active payment cycle for the squad. */
export const PAYMENT_CYCLE = {
  key: "2026-09-cycle",
  label: "24 Sep – 15 Oct 2026",
  monthlyFee: 5000,
  visitorFee: 1500,
  /**
   * Thursday dates for each fixture week in this cycle.
   * Update together with key/label when rolling to a new cycle.
   */
  weekDates: {
    1: "2026-09-24",
    2: "2026-10-01",
    3: "2026-10-08",
    4: "2026-10-15",
  } as Record<1 | 2 | 3 | 4, string>,
} as const;

export const PAYMENT_ACCOUNT = {
  bank: "Opay",
  accountNumber: "8060332714",
  accountName: "Sabo Ajidokwu Emmanuel",
} as const;

/** Proof of payment — WhatsApp group + admin number. */
export const WHATSAPP = {
  groupName: "Thursday night football",
  groupUrl: "https://chat.whatsapp.com/J4xHyWSX88F5mjrh3oRm0H",
  adminPhone: "08060332714",
  adminChatUrl: "https://wa.me/2348060332714",
} as const;

export const PAYMENT_AMOUNTS = {
  MONTHLY_5K: 5000,
  MONTHLY_INSTALMENT: 0, // amount supplied by admin
  VISITOR_1_5K: 1500,
} as const;

export type PaymentType = keyof typeof PAYMENT_AMOUNTS;

export function seatForPaymentType(
  type: PaymentType,
  amount: number,
): "permanent" | "sub" {
  if (type === "VISITOR_1_5K") return "sub";
  if (type === "MONTHLY_5K") return "permanent";
  // Instalment: permanent only once they've paid full monthly fee this entry
  // Cumulative handled in API; single payment of 5000+ counts as permanent.
  return amount >= PAYMENT_CYCLE.monthlyFee ? "permanent" : "sub";
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

export function overallScore(
  goals: number,
  assists: number,
  yc: number,
  rc: number,
) {
  return goals + assists - yc * 0.5 - rc;
}
