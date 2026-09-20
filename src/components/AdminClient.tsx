"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatNaira } from "@/components/AppChrome";

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
  teamId: string | null;
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

type Expense = {
  id: string;
  title: string;
  amount: number;
  note: string | null;
  spentAt: string;
};

const field =
  "border border-line bg-transparent px-3 py-2 text-sm text-chalk outline-none focus:border-flood";
const label =
  "grid gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted";

export function AdminClient() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balance, setBalance] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [pRes, tRes, eRes, xRes] = await Promise.all([
      fetch("/api/players"),
      fetch("/api/teams"),
      fetch("/api/events"),
      fetch("/api/expenses"),
    ]);
    setPlayers(await pRes.json());
    setTeams(await tRes.json());
    const eventData = await eRes.json();
    setEvents(eventData.events ?? []);
    const purse = await xRes.json();
    setExpenses(purse.expenses ?? []);
    setBalance(purse.balance ?? 0);
  }, []);

  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then(async (data) => {
        setAuthed(!!data.authenticated);
        if (data.authenticated) await refresh();
      });
  }, [refresh]);

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
        <h1 className="font-display mt-8 text-3xl text-chalk">Admin login</h1>
        <form onSubmit={login} className="mt-6 max-w-sm space-y-4">
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
            className="bg-flood px-4 py-2.5 text-sm font-semibold text-pitch-deep"
          >
            Sign in
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
                <button
                  type="button"
                  className="bg-flood px-3 py-1.5 text-xs font-semibold text-pitch-deep"
                  onClick={async () => {
                    await fetch("/api/players", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: p.id, status: "active" }),
                    });
                    flash(`Approved ${p.name}`);
                    await refresh();
                  }}
                >
                  Approve
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-2xl text-chalk">Mark payment</h2>
        <PaymentForm players={active} onDone={async () => { flash("Payment logged"); await refresh(); }} />
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-2xl text-chalk">Draft &amp; teams</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Permanent (₦5k) players get monthly seats. Subs (₦1.5k) can be placed
          for the night but are not locked.
        </p>
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

function PaymentForm({
  players,
  onDone,
}: {
  players: Player[];
  onDone: () => Promise<void>;
}) {
  const [playerId, setPlayerId] = useState("");
  const [type, setType] = useState<"MONTHLY_5K" | "VISITOR_1_5K">("MONTHLY_5K");

  return (
    <form
      className="mt-4 grid max-w-2xl gap-3 sm:grid-cols-[1fr_auto_auto]"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!playerId) return;
        await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, type }),
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
        onChange={(e) => setType(e.target.value as typeof type)}
      >
        <option value="MONTHLY_5K">₦5,000 monthly (permanent)</option>
        <option value="VISITOR_1_5K">₦1,500 visitor (sub)</option>
      </select>
      <button type="submit" className="bg-flood px-4 py-2 text-sm font-semibold text-pitch-deep">
        Log pay
      </button>
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
                <span className="text-muted">({p.seat})</span>
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
