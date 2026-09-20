"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppChrome, formatNaira } from "@/components/AppChrome";
import { PaymentProofBox } from "@/components/PaymentProofBox";

type Dashboard = {
  monthKey: string;
  player: {
    id: string;
    name: string;
    phone: string;
    status: string;
    seat: string;
    photoPath?: string | null;
    isAdmin?: boolean;
    team: { name: string; number: number } | null;
  };
  payment: {
    paidThisMonth: boolean;
    permanentPaid: boolean;
    paidTotal?: number;
    remaining?: number;
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

          <div className="flex flex-wrap items-start gap-6">
            <div className="size-24 overflow-hidden border border-line bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  data.player.photoPath
                    ? `/api/avatars/${data.player.id}?t=${encodeURIComponent(data.player.photoPath)}`
                    : "data:image/svg+xml," +
                      encodeURIComponent(
                        `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect fill='#0c281c' width='100%' height='100%'/><text x='50%' y='54%' fill='#9aafa2' text-anchor='middle' font-size='24'>${data.player.name.slice(0, 1)}</text></svg>`,
                      )
                }
                alt=""
                className="size-full object-cover"
              />
            </div>
            <form
              className="flex flex-wrap items-center gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fd = new FormData(form);
                const res = await fetch(`/api/players/${data.player.id}`, {
                  method: "POST",
                  body: fd,
                });
                if (res.ok) {
                  const player = await res.json();
                  setData({ ...data, player: { ...data.player, ...player } });
                  form.reset();
                }
              }}
            >
              <input type="file" name="photo" accept="image/*" required className="text-sm text-muted" />
              <button
                type="submit"
                className="bg-flood px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-pitch-deep"
              >
                Upload photo
              </button>
              <Link
                href={`/players/${data.player.id}`}
                className="text-sm text-flood hover:underline"
              >
                Public profile
              </Link>
            </form>
          </div>

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
            {data.player.isAdmin ? (
              <p className="mt-2 text-muted">
                You can mark yourself paid in Admin. Your row stays off the
                public payments board.
              </p>
            ) : (
              <p className="mt-2 text-muted">
                {data.payment.paidThisMonth
                  ? data.payment.permanentPaid
                    ? `Paid in full (${formatNaira(data.payment.paidTotal ?? 5000)}) — regular seat.`
                    : `Partial: ${formatNaira(data.payment.paidTotal ?? 0)} paid${
                        data.payment.remaining
                          ? ` · ${formatNaira(data.payment.remaining)} remaining`
                          : ""
                      }.`
                  : data.player.seat === "permanent"
                    ? "Marked as regular — still send proof of payment on WhatsApp so admin can log it."
                    : "No payment logged yet. Pay, then send proof with your name on WhatsApp."}
              </p>
            )}
            {!data.payment.paidThisMonth && !data.player.isAdmin ? (
              <PaymentProofBox className="mt-4" />
            ) : null}
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
                        : p.type === "MONTHLY_INSTALMENT"
                          ? "Instalment"
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
