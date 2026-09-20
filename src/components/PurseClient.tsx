"use client";

import { useEffect, useState } from "react";
import { AppChrome, formatNaira } from "@/components/AppChrome";

type Expense = {
  id: string;
  title: string;
  amount: number;
  note: string | null;
  spentAt: string;
};

type PursePayload = {
  income: number;
  spent: number;
  balance: number;
  expenses: Expense[];
};

export function PurseClient() {
  const [data, setData] = useState<PursePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/expenses")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("Could not load purse"));
  }, []);

  return (
    <AppChrome title="Squad purse">
      <p className="max-w-xl text-muted">
        Transparent purse: fees in, spending out. Management logs every expense
        here.
      </p>

      {error ? <p className="mt-6 text-danger">{error}</p> : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="border border-line px-4 py-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Income
          </p>
          <p className="font-display mt-2 text-3xl text-flood">
            {formatNaira(data?.income ?? 0)}
          </p>
        </div>
        <div className="border border-line px-4 py-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Spent
          </p>
          <p className="font-display mt-2 text-3xl text-flood-soft">
            {formatNaira(data?.spent ?? 0)}
          </p>
        </div>
        <div className="border border-line px-4 py-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Balance
          </p>
          <p className="font-display mt-2 text-3xl text-chalk">
            {formatNaira(data?.balance ?? 0)}
          </p>
        </div>
      </div>

      <h2 className="font-display mt-12 text-2xl text-chalk">Expenses</h2>
      <ul className="mt-4 border-t border-line">
        {(data?.expenses ?? []).length === 0 ? (
          <li className="py-6 text-muted">No expenses logged yet.</li>
        ) : (
          data!.expenses.map((e) => (
            <li
              key={e.id}
              className="grid gap-1 border-b border-line py-4 sm:grid-cols-[1fr_auto] sm:items-baseline"
            >
              <div>
                <p className="font-semibold text-chalk">{e.title}</p>
                <p className="text-sm text-muted">
                  {new Date(e.spentAt).toLocaleDateString()}
                  {e.note ? ` · ${e.note}` : ""}
                </p>
              </div>
              <p className="font-display text-xl text-flood">
                {formatNaira(e.amount)}
              </p>
            </li>
          ))
        )}
      </ul>
    </AppChrome>
  );
}
