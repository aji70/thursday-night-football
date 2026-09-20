"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppChrome, formatNaira } from "@/components/AppChrome";

type Dashboard = {
  monthKey: string;
  player: {
    name: string;
    phone: string;
    status: string;
    seat: string;
    team: { name: string; number: number } | null;
  };
  payment: {
    paidThisMonth: boolean;
    permanentPaid: boolean;
    payments: { type: string; amount: number; paidAt: string }[];
  };
  stats: {
    goals: number;
    assists: number;
    yc: number;
    rc: number;
    overall: number;
  };
  events: {
    id: string;
    type: string;
    week: number;
    match: number;
    count: number;
  }[];
};

export function MeClient() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/login");
          return null;
        }
        return r.json();
      })
      .then((payload) => {
        if (payload) setData(payload);
      })
      .catch(() => setError("Could not load your profile"));
  }, [router]);

  async function logout() {
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/login");
  }

  return (
    <AppChrome title="My profile">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-muted">
          Your team, payment status, and monthly record.
        </p>
        <button
          type="button"
          onClick={logout}
          className="border border-line px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted"
        >
          Log out
        </button>
      </div>

      {error ? <p className="mt-6 text-danger">{error}</p> : null}
      {!data && !error ? <p className="mt-6 text-muted">Loading…</p> : null}

      {data ? (
        <div className="mt-8 space-y-10">
          {data.player.status === "pending" ? (
            <p className="border border-flood/40 bg-black/20 px-4 py-3 text-flood-soft">
              Profile pending admin verification. You can view this page, but
              you are not active in the league until approved.
            </p>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard label="Name" value={data.player.name} />
            <InfoCard label="Phone" value={data.player.phone} />
            <InfoCard
              label="Team"
              value={data.player.team?.name ?? "Not assigned yet"}
            />
            <InfoCard
              label="Seat"
              value={`${data.player.seat} · ${data.player.status}`}
            />
          </section>

          <section>
            <h2 className="font-display text-2xl text-chalk">
              Payment · {data.monthKey}
            </h2>
            <p className="mt-2 text-muted">
              {data.payment.paidThisMonth
                ? data.payment.permanentPaid
                  ? "Paid ₦5,000 this month — permanent seat."
                  : "Paid this month (visitor / sub)."
                : "No payment logged for this month yet."}
            </p>
            <ul className="mt-4 border-t border-line">
              {data.payment.payments.length === 0 ? (
                <li className="py-4 text-muted">Nothing recorded.</li>
              ) : (
                data.payment.payments.map((p, i) => (
                  <li
                    key={`${p.paidAt}-${i}`}
                    className="flex justify-between gap-3 border-b border-line py-3 text-sm"
                  >
                    <span className="text-chalk">
                      {p.type === "MONTHLY_5K"
                        ? "Monthly ₦5k"
                        : "Visitor ₦1.5k"}
                    </span>
                    <span className="text-flood">
                      {formatNaira(p.amount)} ·{" "}
                      {new Date(p.paidAt).toLocaleDateString()}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-chalk">
              Monthly stats · {data.monthKey}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Stat label="Goals" value={data.stats.goals} />
              <Stat label="Assists" value={data.stats.assists} />
              <Stat label="YC" value={data.stats.yc} />
              <Stat label="RC" value={data.stats.rc} />
              <Stat label="Overall" value={data.stats.overall} />
            </div>
            <ul className="mt-6 border-t border-line">
              {data.events.length === 0 ? (
                <li className="py-4 text-muted">No match events yet.</li>
              ) : (
                data.events.map((ev) => (
                  <li
                    key={ev.id}
                    className="border-b border-line py-2 text-sm text-muted"
                  >
                    Week {ev.week} · Match {ev.match} · {ev.type} ×{ev.count}
                  </li>
                ))
              )}
            </ul>
          </section>

          <p className="text-sm text-muted">
            Browse everyone on{" "}
            <Link href="/players" className="text-flood hover:underline">
              Players
            </Link>{" "}
            or the full{" "}
            <Link href="/tables" className="text-flood hover:underline">
              Tables
            </Link>
            .
          </p>
        </div>
      ) : null}
    </AppChrome>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line px-4 py-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-2 font-semibold capitalize text-chalk">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-line px-3 py-4 text-center">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="font-display mt-1 text-2xl text-flood">{value}</p>
    </div>
  );
}
