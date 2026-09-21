"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatNaira } from "@/components/AppChrome";
import { fixturesByWeek } from "@/data/league";

type Team = {
  id: string;
  number: number;
  name: string;
  players: Player[];
};

type Player = {
  id: string;
  name: string;
  phone: string | null;
  status: string;
  seat: string;
  isAdmin?: boolean;
  teamId: string | null;
  overall?: number;
  team?: { id: string; name: string; number: number } | null;
};

type EventRow = {
  id: string;
  type: string;
  week: number;
  match: number;
  count: number;
  player: { name: string };
};

type MatchResultRow = {
  id: string;
  week: number;
  match: number;
  homeGoals: number;
  awayGoals: number;
  homeTeam: { name: string; number: number };
  awayTeam: { name: string; number: number };
};

type Expense = {
  id: string;
  title: string;
  amount: number;
  note: string | null;
  spentAt: string;
};

type PaymentRow = {
  id: string;
  type: string;
  amount: number;
  note: string | null;
  paidAt: string;
  status?: string;
  player: { id: string; name: string };
};

const field =
  "select-field border border-line bg-pitch-lift px-3 py-2 text-sm text-chalk outline-none focus:border-flood";
const label =
  "grid gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted";

export function AdminClient() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [results, setResults] = useState<MatchResultRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balance, setBalance] = useState(0);
  const [feedback, setFeedback] = useState<
    {
      id: string;
      type: string;
      message: string;
      name: string | null;
      status: string;
      createdAt: string;
      player: { name: string } | null;
    }[]
  >([]);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [pRes, tRes, eRes, rRes, payRes, xRes, fRes] = await Promise.all([
      fetch("/api/players"),
      fetch("/api/teams"),
      fetch("/api/events"),
      fetch("/api/results"),
      fetch("/api/payments"),
      fetch("/api/expenses"),
      fetch("/api/feedback"),
    ]);
    setPlayers(await pRes.json());
    setTeams(await tRes.json());
    const eventData = await eRes.json();
    setEvents(eventData.events ?? []);
    const resultData = await rRes.json();
    setResults(resultData.results ?? []);
    const payData = await payRes.json();
    setPayments(payData.payments ?? []);
    const purse = await xRes.json();
    setExpenses(purse.expenses ?? []);
    setBalance(purse.balance ?? 0);
    if (fRes.ok) setFeedback(await fRes.json());
  }, []);

  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then(async (data) => {
        setAuthed(!!data.authenticated);
        if (data.authenticated) await refresh();
      });
  }, [refresh]);

  // If not password-authed, check player session — sole admin can open /admin after login.
  useEffect(() => {
    if (authed) return;
    fetch("/api/auth/login")
      .then((r) => r.json())
      .then(async (data) => {
        if (data.player?.isAdmin && data.player?.status === "active") {
          setAuthed(true);
          await refresh();
        }
      })
      .catch(() => {});
  }, [authed, refresh]);

  async function login(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("Wrong password");
      return;
    }
    setAuthed(true);
    setPassword("");
    await refresh();
  }

  async function logout() {
    await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setAuthed(false);
  }

  function flash(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(null), 2500);
  }

  if (!authed) {
    return (
      <div className="section-shell py-16">
        <Link href="/" className="font-display text-xl tracking-[0.12em] text-flood">
          TNF
        </Link>
        <h1 className="font-display mt-8 text-3xl text-chalk">Admin</h1>
        <p className="mt-3 max-w-md text-muted">
          Log in with your player profile (Aji) for admin access, or use the
          emergency password.
        </p>
        <p className="mt-4">
          <Link
            href="/login"
            className="bg-flood px-4 py-2.5 text-sm font-semibold text-pitch-deep"
          >
            Player login
          </Link>
        </p>
        <form onSubmit={login} className="mt-10 max-w-sm space-y-4 border-t border-line pt-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Emergency password
          </p>
          <label className={label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
              required
            />
          </label>
          <button
            type="submit"
            className="border border-line px-4 py-2.5 text-sm font-semibold text-muted"
          >
            Sign in with password
          </button>
          {loginError ? <p className="text-danger">{loginError}</p> : null}
        </form>
      </div>
    );
  }

  const pending = players.filter((p) => p.status === "pending");
  const active = players.filter((p) => p.status === "active");
  const permanents = active.filter((p) => p.seat === "permanent");
  const subs = active.filter((p) => p.seat === "sub");

  return (
    <div className="section-shell py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/" className="font-display text-xl tracking-[0.12em] text-flood">
            TNF
          </Link>
          <h1 className="font-display mt-2 text-3xl text-chalk">Admin</h1>
          <p className="mt-1 text-sm text-muted">
            Purse balance:{" "}
            <span className="text-flood">{formatNaira(balance)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="border border-line px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted"
        >
          Log out
        </button>
      </div>

      {message ? <p className="mt-4 text-flood-soft">{message}</p> : null}

      <section className="mt-10 border-t border-line pt-8">
        <h2 className="font-display text-2xl text-chalk">Pending registrations</h2>
        <ul className="mt-4 space-y-3">
          {pending.length === 0 ? (
            <li className="text-muted">None</li>
          ) : (
            pending.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 border border-line px-4 py-3"
              >
                <span className="text-chalk">
                  {p.name}
                  {p.phone ? (
                    <span className="text-muted"> · {p.phone}</span>
                  ) : null}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="bg-flood px-3 py-1.5 text-xs font-semibold text-pitch-deep"
                    onClick={async () => {
                      await fetch("/api/players", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          id: p.id,
                          status: "active",
                          seat: "permanent",
                        }),
                      });
                      flash(`Approved ${p.name} as regular`);
                      await refresh();
                    }}
                  >
                    Approve as regular
                  </button>
                  <button
                    type="button"
                    className="border border-line px-3 py-1.5 text-xs font-semibold text-muted"
                    onClick={async () => {
                      await fetch("/api/players", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          id: p.id,
                          status: "active",
                          seat: "sub",
                        }),
                      });
                      flash(`Approved ${p.name} as sub`);
                      await refresh();
                    }}
                  >
                    Approve as sub
                  </button>
                  <button
                    type="button"
                    className="text-xs text-danger"
                    onClick={async () => {
                      if (
                        !confirm(
                          `Delete ${p.name}? Their profile and related payments/events will be removed.`,
                        )
                      )
                        return;
                      const res = await fetch(`/api/players?id=${p.id}`, {
                        method: "DELETE",
                      });
                      if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        flash(err.error || "Could not delete");
                        return;
                      }
                      flash(`Deleted ${p.name}`);
                      await refresh();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-2xl text-chalk">Mark payment</h2>
        <p className="mt-2 text-sm text-muted">
          Log full ₦5,000 or a partial amount — including yourself. Player
          payment status on the public board still excludes admin.
        </p>
        <PaymentForm
          players={active}
          payments={payments}
          onDone={async () => {
            flash("Payment logged");
            await refresh();
          }}
        />
        <ClaimReviewList
          payments={payments}
          onDone={async (msg) => {
            flash(msg);
            await refresh();
          }}
        />
        <PaymentEditList
          payments={payments.filter((p) => p.status !== "claimed")}
          onDone={async (msg) => {
            flash(msg);
            await refresh();
          }}
        />
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-2xl text-chalk">
          Mark as regular (before pay)
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Set a permanent / regular seat even if payment is not logged yet.
          Tell them to send proof with their name to WhatsApp.
        </p>
        <ul className="mt-4 space-y-2">
          {active.length === 0 ? (
            <li className="text-muted">No active players.</li>
          ) : (
            active.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3 text-sm"
              >
                <span className="text-chalk">
                  {p.name}
                  <span className="text-muted">
                    {" "}
                    · {p.seat === "permanent" ? "regular" : "sub"}
                    {p.isAdmin ? " · admin" : ""}
                  </span>
                </span>
                <div className="flex gap-2">
                  {p.seat !== "permanent" ? (
                    <button
                      type="button"
                      className="bg-flood px-3 py-1.5 text-xs font-semibold text-pitch-deep"
                      onClick={async () => {
                        await fetch("/api/players", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: p.id,
                            seat: "permanent",
                            status: "active",
                          }),
                        });
                        flash(`${p.name} → regular`);
                        await refresh();
                      }}
                    >
                      Make regular
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="border border-line px-3 py-1.5 text-xs font-semibold text-muted"
                      onClick={async () => {
                        await fetch("/api/players", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: p.id, seat: "sub" }),
                        });
                        flash(`${p.name} → sub`);
                        await refresh();
                      }}
                    >
                      Make sub
                    </button>
                  )}
                  {!p.isAdmin ? (
                    <button
                      type="button"
                      className="text-xs text-danger"
                      onClick={async () => {
                        if (
                          !confirm(
                            `Delete ${p.name}? Their profile and related payments/events will be removed.`,
                          )
                        )
                          return;
                        const res = await fetch(`/api/players?id=${p.id}`, {
                          method: "DELETE",
                        });
                        if (!res.ok) {
                          const err = await res.json().catch(() => ({}));
                          flash(err.error || "Could not delete");
                          return;
                        }
                        flash(`Deleted ${p.name}`);
                        await refresh();
                      }}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-2xl text-chalk">Player ratings</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Set each player&apos;s overall (0–99). Shows on their profile and the
          players list.
        </p>
        <PlayerRatingsList
          players={active}
          onDone={async (msg) => {
            flash(msg);
            await refresh();
          }}
        />
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-2xl text-chalk">
          On-field / unregistered payment
        </h2>
        <p className="mt-2 text-sm text-muted">
          Cash from someone who has not created a profile yet.
        </p>
        <WalkInForm
          onDone={async () => {
            flash("Walk-in payment logged");
            await refresh();
          }}
        />
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-2xl text-chalk">Draft &amp; teams</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Permanent (₦5k) players get monthly seats. Shuffle balances them by
          Overall rating across Teams 1–4. Subs stay manual.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="bg-flood px-4 py-2.5 text-sm font-semibold text-pitch-deep"
            onClick={async () => {
              if (
                !confirm(
                  "Shuffle all regular (permanent) players into Teams 1–4 by Overall?",
                )
              )
                return;
              const res = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "shuffle" }),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                flash(data.error || "Shuffle failed");
                return;
              }
              flash(
                `Shuffled ${data.assigned ?? 0} regulars by Overall`,
              );
              await refresh();
            }}
          >
            Shuffle by Overall
          </button>
          <button
            type="button"
            className="border border-danger/50 px-4 py-2.5 text-sm font-semibold text-danger"
            onClick={async () => {
              if (
                !confirm(
                  "Reset all team assignments? Everyone will be unassigned.",
                )
              )
                return;
              const res = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reset" }),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                flash(data.error || "Reset failed");
                return;
              }
              flash(`Cleared ${data.cleared ?? 0} assignments`);
              await refresh();
            }}
          >
            Reset teams
          </button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="border border-line p-3 text-sm">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-flood">
              Permanent unassigned
            </p>
            <ul className="mt-2 space-y-1 text-muted">
              {permanents.filter((p) => !p.teamId).length === 0 ? (
                <li>All assigned</li>
              ) : (
                permanents
                  .filter((p) => !p.teamId)
                  .map((p) => <li key={p.id}>{p.name}</li>)
              )}
            </ul>
          </div>
          <div className="border border-line p-3 text-sm">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-flood">
              Subs
            </p>
            <ul className="mt-2 space-y-1 text-muted">
              {subs.length === 0 ? (
                <li>None</li>
              ) : (
                subs.map((p) => (
                  <li key={p.id}>
                    {p.name}
                    {p.team ? ` → ${p.team.name}` : ""}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {teams.map((team) => (
            <TeamDraftCard
              key={team.id}
              team={team}
              permanents={permanents}
              subs={subs}
              onChange={async () => {
                flash("Team updated");
                await refresh();
              }}
            />
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-2xl text-chalk">Log match result</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Enter the final score for a fixture. This feeds the league table on
          Tables.
        </p>
        <ResultForm
          onDone={async () => {
            flash("Result saved");
            await refresh();
          }}
        />
        <ul className="mt-6 max-h-48 overflow-y-auto border-t border-line">
          {results.length === 0 ? (
            <li className="py-3 text-sm text-muted">No results yet.</li>
          ) : (
            results.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 border-b border-line py-2 text-sm"
              >
                <span className="text-muted">
                  W{r.week} M{r.match} · {r.homeTeam.name} {r.homeGoals}–
                  {r.awayGoals} {r.awayTeam.name}
                </span>
                <button
                  type="button"
                  className="text-xs text-danger"
                  onClick={async () => {
                    await fetch(`/api/results?id=${r.id}`, { method: "DELETE" });
                    await refresh();
                  }}
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-2xl text-chalk">Log match event</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          For now, log goals / assists / cards here after (or during) the
          session. Live phone entry during games can come later — paper + admin
          update still works fine.
        </p>
        <EventForm
          players={active}
          onDone={async () => {
            flash("Event logged");
            await refresh();
          }}
        />
        <ul className="mt-6 max-h-64 overflow-y-auto border-t border-line">
          {events.slice(0, 30).map((ev) => (
            <li
              key={ev.id}
              className="flex items-center justify-between gap-3 border-b border-line py-2 text-sm"
            >
              <span className="text-muted">
                W{ev.week} M{ev.match} · {ev.player.name} · {ev.type} ×{ev.count}
              </span>
              <button
                type="button"
                className="text-xs text-danger"
                onClick={async () => {
                  await fetch(`/api/events?id=${ev.id}`, { method: "DELETE" });
                  await refresh();
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-2xl text-chalk">
          Suggestions &amp; complaints
        </h2>
        <ul className="mt-4 space-y-3">
          {feedback.length === 0 ? (
            <li className="text-muted">None yet</li>
          ) : (
            feedback.map((item) => (
              <li key={item.id} className="border border-line px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-flood">
                    {item.type}
                    {item.status !== "new" ? ` · ${item.status}` : ""}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-xs text-muted"
                      onClick={async () => {
                        await fetch("/api/feedback", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: item.id, status: "read" }),
                        });
                        await refresh();
                      }}
                    >
                      Mark read
                    </button>
                    <button
                      type="button"
                      className="text-xs text-flood"
                      onClick={async () => {
                        await fetch("/api/feedback", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: item.id,
                            status: "resolved",
                          }),
                        });
                        await refresh();
                      }}
                    >
                      Resolve
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-chalk">{item.message}</p>
                <p className="mt-1 text-xs text-muted">
                  {item.player?.name || item.name || "Anonymous"} ·{" "}
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-2xl text-chalk">Add expense</h2>
        <ExpenseForm
          onDone={async () => {
            flash("Expense added");
            await refresh();
          }}
        />
        <ul className="mt-6 border-t border-line">
          {expenses.map((ex) => (
            <li
              key={ex.id}
              className="flex items-center justify-between gap-3 border-b border-line py-3 text-sm"
            >
              <span>
                <span className="text-chalk">{ex.title}</span>
                <span className="text-muted">
                  {" "}
                  · {formatNaira(ex.amount)}
                </span>
              </span>
              <button
                type="button"
                className="text-xs text-danger"
                onClick={async () => {
                  await fetch(`/api/expenses?id=${ex.id}`, { method: "DELETE" });
                  await refresh();
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PlayerRatingsList({
  players,
  onDone,
}: {
  players: Player[];
  onDone: (msg: string) => Promise<void>;
}) {
  if (players.length === 0) {
    return <p className="mt-4 text-muted">No active players yet.</p>;
  }

  return (
    <ul className="mt-4 border-t border-line">
      {players.map((p) => (
        <PlayerRatingRow key={p.id} player={p} onDone={onDone} />
      ))}
    </ul>
  );
}

function PlayerRatingRow({
  player,
  onDone,
}: {
  player: Player;
  onDone: (msg: string) => Promise<void>;
}) {
  const [overall, setOverall] = useState(String(player.overall ?? 0));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setOverall(String(player.overall ?? 0));
  }, [player.overall]);

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3">
      <Link
        href={`/players/${player.id}`}
        className="font-semibold text-chalk hover:text-flood"
      >
        {player.name}
      </Link>
      <form
        className="flex items-center gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const res = await fetch("/api/players", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: player.id,
              overall: Number(overall),
            }),
          });
          setBusy(false);
          if (!res.ok) {
            await onDone("Could not save rating");
            return;
          }
          await onDone(`Updated ${player.name}`);
        }}
      >
        <label className="flex items-center gap-2 text-sm text-muted">
          OVR
          <input
            type="number"
            min={0}
            max={99}
            value={overall}
            onChange={(e) => setOverall(e.target.value)}
            className={`${field} w-20`}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="bg-flood px-3 py-2 text-sm font-semibold text-pitch-deep disabled:opacity-60"
        >
          {busy ? "…" : "Save"}
        </button>
      </form>
    </li>
  );
}

function WalkInForm({ onDone }: { onDone: () => Promise<void> }) {
  return (
    <form
      className="mt-4 grid max-w-3xl gap-3 sm:grid-cols-[1fr_7rem_1fr_auto]"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await fetch("/api/walk-ins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fd.get("name"),
            amount: Number(fd.get("amount")),
            note: fd.get("note") || undefined,
          }),
        });
        e.currentTarget.reset();
        await onDone();
      }}
    >
      <input
        name="name"
        placeholder="Name on the night"
        className={field}
        required
      />
      <input
        name="amount"
        type="number"
        min={1}
        placeholder="₦"
        className={field}
        required
      />
      <input
        name="note"
        placeholder="Note (optional)"
        className={field}
      />
      <button
        type="submit"
        className="bg-flood px-4 py-2 text-sm font-semibold text-pitch-deep"
      >
        Log
      </button>
    </form>
  );
}

function ClaimReviewList({
  payments,
  onDone,
}: {
  payments: PaymentRow[];
  onDone: (msg: string) => Promise<void>;
}) {
  const claims = payments.filter((p) => p.status === "claimed");
  if (claims.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-flood">
        Pending player claims
      </h3>
      <p className="mt-1 text-sm text-muted">
        Confirm against the bank statement, then Confirm or Reject.
      </p>
      <ul className="mt-4 border-t border-line">
        {claims.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3 text-sm"
          >
            <span className="text-muted">
              <span className="text-chalk">{p.player.name}</span>
              {" · "}
              {formatNaira(p.amount)} · {p.type.replace(/_/g, " ")}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="bg-flood px-3 py-1.5 text-xs font-semibold text-pitch-deep"
                onClick={async () => {
                  await fetch("/api/payments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "confirm", id: p.id }),
                  });
                  await onDone(`Confirmed ${p.player.name}`);
                }}
              >
                Confirm
              </button>
              <button
                type="button"
                className="text-xs text-danger"
                onClick={async () => {
                  await fetch("/api/payments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "reject", id: p.id }),
                  });
                  await onDone(`Rejected claim from ${p.player.name}`);
                }}
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PaymentEditList({
  payments,
  onDone,
}: {
  payments: PaymentRow[];
  onDone: (msg: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<
    "MONTHLY_5K" | "MONTHLY_INSTALMENT" | "VISITOR_1_5K"
  >("MONTHLY_INSTALMENT");

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-flood">
        Edit / remove logged payments
      </h3>
      <p className="mt-1 text-sm text-muted">
        Fix mistakes here — e.g. change ₦5,000 to ₦3,000 and set type to
        Instalment.
      </p>
      <ul className="mt-4 max-h-80 overflow-y-auto border-t border-line">
        {payments.length === 0 ? (
          <li className="py-3 text-sm text-muted">No payments logged yet.</li>
        ) : (
          payments.map((p) => (
            <li
              key={p.id}
              className="border-b border-line py-3 text-sm"
            >
              {editingId === p.id ? (
                <form
                  className="grid gap-2 sm:grid-cols-[1fr_auto_7rem_auto_auto]"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch("/api/payments", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        id: p.id,
                        amount: Number(amount),
                        type,
                        note:
                          type === "MONTHLY_INSTALMENT"
                            ? "Instalment"
                            : type === "MONTHLY_5K"
                              ? null
                              : p.note,
                      }),
                    });
                    if (!res.ok) return;
                    setEditingId(null);
                    await onDone(`Updated ${p.player.name}`);
                  }}
                >
                  <span className="flex items-center text-chalk">
                    {p.player.name}
                  </span>
                  <select
                    className={field}
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value as typeof type)
                    }
                  >
                    <option value="MONTHLY_5K">Full monthly</option>
                    <option value="MONTHLY_INSTALMENT">Instalment</option>
                    <option value="VISITOR_1_5K">Visitor</option>
                  </select>
                  <input
                    className={field}
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="bg-flood px-3 py-2 text-xs font-semibold text-pitch-deep"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="border border-line px-3 py-2 text-xs text-muted"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-muted">
                    <span className="text-chalk">{p.player.name}</span>
                    {" · "}
                    {formatNaira(p.amount)}
                    {" · "}
                    {p.type === "MONTHLY_INSTALMENT"
                      ? "Instalment"
                      : p.type === "MONTHLY_5K"
                        ? "Full monthly"
                        : "Visitor"}
                    {p.note ? ` · ${p.note}` : ""}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="border border-line px-3 py-1.5 text-xs font-semibold text-muted"
                      onClick={() => {
                        setEditingId(p.id);
                        setAmount(String(p.amount));
                        setType(
                          p.type as
                            | "MONTHLY_5K"
                            | "MONTHLY_INSTALMENT"
                            | "VISITOR_1_5K",
                        );
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-xs text-danger"
                      onClick={async () => {
                        if (!confirm(`Delete payment for ${p.player.name}?`))
                          return;
                        await fetch(`/api/payments?id=${p.id}`, {
                          method: "DELETE",
                        });
                        await onDone(`Removed payment for ${p.player.name}`);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function PaymentForm({
  players,
  payments,
  onDone,
}: {
  players: Player[];
  payments: PaymentRow[];
  onDone: () => Promise<void>;
}) {
  const [playerId, setPlayerId] = useState("");
  const [type, setType] = useState<
    "MONTHLY_5K" | "MONTHLY_INSTALMENT" | "VISITOR_1_5K"
  >("MONTHLY_5K");
  const [amount, setAmount] = useState("5000");

  const existingForPlayer = payments.filter((p) => p.player.id === playerId);
  const existingTotal = existingForPlayer.reduce((s, p) => s + p.amount, 0);

  return (
    <form
      className="mt-4 grid max-w-3xl gap-3 sm:grid-cols-[1fr_auto_7rem_auto]"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!playerId) return;
        const nextAmount = Number(amount);
        if (existingTotal > 0) {
          const ok = confirm(
            `This player already has ${formatNaira(existingTotal)} logged.\n\n` +
              `Adding ${formatNaira(nextAmount)} will make the total ${formatNaira(existingTotal + nextAmount)}.\n\n` +
              `To fix a wrong amount, Cancel and use Edit below instead of adding another payment.`,
          );
          if (!ok) return;
        }
        await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId,
            type,
            amount: nextAmount,
            note: type === "MONTHLY_INSTALMENT" ? "Instalment" : undefined,
          }),
        });
        setPlayerId("");
        await onDone();
      }}
    >
      <select
        className={field}
        value={playerId}
        onChange={(e) => setPlayerId(e.target.value)}
        required
      >
        <option value="">Select player</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select
        className={field}
        value={type}
        onChange={(e) => {
          const next = e.target.value as typeof type;
          setType(next);
          if (next === "MONTHLY_5K") setAmount("5000");
          if (next === "VISITOR_1_5K") setAmount("1500");
          if (next === "MONTHLY_INSTALMENT") setAmount("3000");
        }}
      >
        <option value="MONTHLY_5K">Full monthly ₦5k</option>
        <option value="MONTHLY_INSTALMENT">Instalment</option>
        <option value="VISITOR_1_5K">Visitor ₦1.5k</option>
      </select>
      <input
        className={field}
        type="number"
        min={1}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-flood px-4 py-2 text-sm font-semibold text-pitch-deep"
      >
        Log pay
      </button>
      {playerId && existingTotal > 0 ? (
        <p className="sm:col-span-4 text-sm text-flood-soft">
          Already logged for this player: {formatNaira(existingTotal)}
          {existingForPlayer.length > 1
            ? ` across ${existingForPlayer.length} entries`
            : ""}
          . Use <strong className="text-chalk">Edit</strong> below to change an
          amount — do not log again unless this is an extra instalment.
        </p>
      ) : null}
    </form>
  );
}

function TeamDraftCard({
  team,
  permanents,
  subs,
  onChange,
}: {
  team: Team;
  permanents: Player[];
  subs: Player[];
  onChange: () => Promise<void>;
}) {
  const [name, setName] = useState(team.name);
  const assignable = [...permanents, ...subs];

  return (
    <article className="border border-line p-4">
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await fetch("/api/teams", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: team.id, name }),
          });
          await onChange();
        }}
      >
        <input
          className={`${field} flex-1`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="border border-line px-3 text-xs text-muted">
          Save name
        </button>
      </form>

      <ul className="mt-4 space-y-1 text-sm">
        {team.players.length === 0 ? (
          <li className="text-muted">No players assigned</li>
        ) : (
          team.players.map((p) => (
            <li key={p.id} className="flex justify-between gap-2 text-chalk">
              <span>
                {p.name}{" "}
                <span className="text-muted">
                  ({p.seat}
                  {p.overall && p.overall > 0 ? ` · OVR ${p.overall}` : ""})
                </span>
              </span>
              <button
                type="button"
                className="text-xs text-danger"
                onClick={async () => {
                  await fetch("/api/players", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: p.id, teamId: null }),
                  });
                  await onChange();
                }}
              >
                Remove
              </button>
            </li>
          ))
        )}
      </ul>

      <form
        className="mt-4 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const playerId = String(fd.get("playerId") || "");
          if (!playerId) return;
          await fetch("/api/players", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: playerId, teamId: team.id }),
          });
          e.currentTarget.reset();
          await onChange();
        }}
      >
        <select name="playerId" className={`${field} flex-1`} required defaultValue="">
          <option value="" disabled>
            Add player
          </option>
          {assignable.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.seat})
              {p.teamId ? " *" : ""}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-flood px-3 text-xs font-semibold text-pitch-deep">
          Assign
        </button>
      </form>
    </article>
  );
}

function ResultForm({ onDone }: { onDone: () => Promise<void> }) {
  const [week, setWeek] = useState("1");
  const [match, setMatch] = useState("1");
  const label =
    fixtureLabel(Number(week), Number(match)) ?? "Select fixture";

  return (
    <form
      className="mt-4 grid max-w-3xl gap-3 sm:grid-cols-[auto_auto_1fr_5rem_5rem_auto]"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await fetch("/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            week: Number(fd.get("week")),
            match: Number(fd.get("match")),
            homeGoals: Number(fd.get("homeGoals")),
            awayGoals: Number(fd.get("awayGoals")),
          }),
        });
        e.currentTarget.reset();
        setWeek("1");
        setMatch("1");
        await onDone();
      }}
    >
      <select
        name="week"
        className={field}
        required
        value={week}
        onChange={(e) => setWeek(e.target.value)}
      >
        {[1, 2, 3, 4].map((w) => (
          <option key={w} value={w}>
            Week {w}
          </option>
        ))}
      </select>
      <select
        name="match"
        className={field}
        required
        value={match}
        onChange={(e) => setMatch(e.target.value)}
      >
        {[1, 2, 3, 4, 5, 6].map((m) => (
          <option key={m} value={m}>
            Match {m}
          </option>
        ))}
      </select>
      <p className="flex items-center text-sm text-chalk">{label}</p>
      <input
        name="homeGoals"
        type="number"
        min={0}
        placeholder="Home"
        className={field}
        required
      />
      <input
        name="awayGoals"
        type="number"
        min={0}
        placeholder="Away"
        className={field}
        required
      />
      <button
        type="submit"
        className="bg-flood px-3 text-sm font-semibold text-pitch-deep"
      >
        Save
      </button>
    </form>
  );
}

function fixtureLabel(week: number, match: number) {
  const w = week as 1 | 2 | 3 | 4;
  return fixturesByWeek[w]?.find((f) => f.match === match)?.fixture ?? null;
}

function EventForm({
  players,
  onDone,
}: {
  players: Player[];
  onDone: () => Promise<void>;
}) {
  return (
    <form
      className="mt-4 grid max-w-3xl gap-3 sm:grid-cols-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId: fd.get("playerId"),
            week: Number(fd.get("week")),
            match: Number(fd.get("match")),
            type: fd.get("type"),
            count: Number(fd.get("count") || 1),
          }),
        });
        e.currentTarget.reset();
        await onDone();
      }}
    >
      <select name="playerId" className={field} required defaultValue="">
        <option value="" disabled>
          Player
        </option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select name="week" className={field} required defaultValue="1">
        {[1, 2, 3, 4].map((w) => (
          <option key={w} value={w}>
            Week {w}
          </option>
        ))}
      </select>
      <select name="match" className={field} required defaultValue="1">
        {[1, 2, 3, 4, 5, 6].map((m) => (
          <option key={m} value={m}>
            Match {m}
          </option>
        ))}
      </select>
      <select name="type" className={field} required defaultValue="GOAL">
        <option value="GOAL">Goal</option>
        <option value="ASSIST">Assist</option>
        <option value="YC">Yellow</option>
        <option value="RC">Red</option>
      </select>
      <div className="flex gap-2">
        <input
          name="count"
          type="number"
          min={1}
          defaultValue={1}
          className={`${field} w-16`}
        />
        <button type="submit" className="bg-flood px-3 text-sm font-semibold text-pitch-deep">
          Add
        </button>
      </div>
    </form>
  );
}

function ExpenseForm({ onDone }: { onDone: () => Promise<void> }) {
  return (
    <form
      className="mt-4 grid max-w-2xl gap-3 sm:grid-cols-[1fr_8rem_auto]"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: fd.get("title"),
            amount: Number(fd.get("amount")),
            note: fd.get("note") || undefined,
          }),
        });
        e.currentTarget.reset();
        await onDone();
      }}
    >
      <input name="title" placeholder="What was spent" className={field} required />
      <input
        name="amount"
        type="number"
        min={1}
        placeholder="Amount"
        className={field}
        required
      />
      <button type="submit" className="bg-flood px-4 text-sm font-semibold text-pitch-deep">
        Add
      </button>
      <input
        name="note"
        placeholder="Note (optional)"
        className={`${field} sm:col-span-3`}
      />
    </form>
  );
}
