"use client";

import { useEffect, useState } from "react";
import { AppChrome, formatNaira } from "@/components/AppChrome";
import { PAYMENT_ACCOUNT, PAYMENT_CYCLE } from "@/lib/league-db";

type PaymentRow = {
  id: string;
  type: string;
  amount: number;
  note: string | null;
  paidAt: string;
  player: { name: string; seat: string; team: { name: string } | null };
};

type SummaryRow = {
  playerId: string;
  name: string;
  total: number;
  seat: string;
  remaining: number;
  isInstalment: boolean;
};

export function PaymentsClient() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payments")
      .then((r) => r.json())
      .then((data) => {
        setPayments(data.payments ?? []);
        setSummary(data.summary ?? []);
      })
      .catch(() => setError("Could not load payments"));
  }, []);

  return (
    <AppChrome title="Payments">
      <p className="text-muted">
        Cycle: <span className="text-chalk">{PAYMENT_CYCLE.label}</span>. Monthly
        fee ₦{PAYMENT_CYCLE.monthlyFee.toLocaleString()} · Visitor ₦
        {PAYMENT_CYCLE.visitorFee.toLocaleString()}/week. Instalments allowed.
      </p>

      <div className="mt-6 border border-flood/35 bg-black/20 px-4 py-4">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-flood">
          Pay into
        </p>
        <p className="mt-2 text-lg font-semibold text-chalk">
          {PAYMENT_ACCOUNT.accountNumber}
        </p>
        <p className="text-muted">
          {PAYMENT_ACCOUNT.accountName} · {PAYMENT_ACCOUNT.bank}
        </p>
      </div>

      {error ? <p className="mt-6 text-danger">{error}</p> : null}

      <h2 className="font-display mt-10 text-2xl text-chalk">This cycle</h2>
      <div className="mt-4 overflow-x-auto border border-line">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-flood/30 bg-black/20 text-[0.7rem] uppercase tracking-[0.12em] text-flood">
            <tr>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Remaining</th>
              <th className="px-4 py-3">Seat</th>
            </tr>
          </thead>
          <tbody>
            {summary.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-muted">
                  No payments this cycle yet.
                </td>
              </tr>
            ) : (
              summary.map((row) => (
                <tr key={row.playerId} className="border-b border-line">
                  <td className="px-4 py-3 font-semibold text-chalk">
                    {row.name}
                    {row.isInstalment ? (
                      <span className="ml-2 text-xs text-flood">instalment</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-flood">{formatNaira(row.total)}</td>
                  <td className="px-4 py-3 text-muted">
                    {row.remaining > 0 ? formatNaira(row.remaining) : "—"}
                  </td>
                  <td className="px-4 py-3 capitalize text-muted">{row.seat}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2 className="font-display mt-10 text-2xl text-chalk">Payment log</h2>
      <div className="mt-4 overflow-x-auto border border-line">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-flood/30 bg-black/20 text-[0.7rem] uppercase tracking-[0.12em] text-flood">
            <tr>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Paid</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-line">
                <td className="px-4 py-3 font-semibold text-chalk">
                  {p.player.name}
                </td>
                <td className="px-4 py-3 text-muted">
                  {p.type === "MONTHLY_INSTALMENT"
                    ? "Instalment"
                    : p.type === "MONTHLY_5K"
                      ? "Monthly"
                      : "Visitor"}
                </td>
                <td className="px-4 py-3 text-flood">{formatNaira(p.amount)}</td>
                <td className="px-4 py-3 text-muted">{p.note ?? "—"}</td>
                <td className="px-4 py-3 text-muted">
                  {new Date(p.paidAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppChrome>
  );
}
