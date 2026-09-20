"use client";

import { useEffect, useState } from "react";
import { AppChrome, formatNaira } from "@/components/AppChrome";

type PaymentRow = {
  id: string;
  type: string;
  amount: number;
  monthKey: string;
  paidAt: string;
  note: string | null;
  player: {
    name: string;
    seat: string;
    team: { name: string } | null;
  };
};

export function PaymentsClient() {
  const [monthKey, setMonthKey] = useState("");
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payments")
      .then((r) => r.json())
      .then((data) => {
        setMonthKey(data.monthKey);
        setPayments(data.payments);
      })
      .catch(() => setError("Could not load payments"));
  }, []);

  return (
    <AppChrome title="Payments">
      <p className="text-muted">
        Who has paid for <span className="text-chalk">{monthKey || "…"}</span>.
        ₦5,000 = permanent seat. ₦1,500 = visitor sub.
      </p>

      {error ? <p className="mt-6 text-danger">{error}</p> : null}

      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-flood/30 bg-black/20 text-[0.7rem] uppercase tracking-[0.12em] text-flood">
            <tr>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Seat</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Paid</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-muted">
                  No payments logged this month yet.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="border-b border-line">
                  <td className="px-4 py-3 font-semibold text-chalk">
                    {p.player.name}
                  </td>
                  <td className="px-4 py-3 capitalize text-muted">
                    {p.player.seat}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {p.player.team?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {p.type === "MONTHLY_5K" ? "Monthly ₦5k" : "Visitor ₦1.5k"}
                  </td>
                  <td className="px-4 py-3 text-flood">
                    {formatNaira(p.amount)}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(p.paidAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppChrome>
  );
}
