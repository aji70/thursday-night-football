"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppChrome } from "@/components/AppChrome";

type PlayerRow = {
  id: string;
  name: string;
  phone: string;
  status: string;
  seat: string;
  team: { name: string } | null;
};

export function PlayersClient() {
  const [q, setQ] = useState("");
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      fetch(`/api/players?${params.toString()}`)
        .then((r) => r.json())
        .then(setPlayers)
        .catch(() => setError("Could not load players"));
    }, 200);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <AppChrome title="Players">
      <p className="max-w-xl text-muted">
        Search the squad by name or phone. Profiles become active after admin
        verification.
      </p>

      <label className="mt-6 grid max-w-md gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
        Search
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name or phone"
          className="border border-line bg-transparent px-3 py-2.5 text-base font-normal normal-case tracking-normal text-chalk outline-none focus:border-flood"
        />
      </label>

      {error ? <p className="mt-6 text-danger">{error}</p> : null}

      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-flood/30 bg-black/20 text-[0.7rem] uppercase tracking-[0.12em] text-flood">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Seat</th>
              <th className="px-4 py-3">Team</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-muted">
                  No players found.
                </td>
              </tr>
            ) : (
              players.map((p) => (
                <tr key={p.id} className="border-b border-line">
                  <td className="px-4 py-3 font-semibold text-chalk">{p.name}</td>
                  <td className="px-4 py-3 text-muted">{p.phone}</td>
                  <td className="px-4 py-3 capitalize text-muted">{p.status}</td>
                  <td className="px-4 py-3 capitalize text-muted">{p.seat}</td>
                  <td className="px-4 py-3 text-muted">
                    {p.team?.name ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-muted">
        Your own record lives on{" "}
        <Link href="/me" className="text-flood hover:underline">
          My profile
        </Link>
        .
      </p>
    </AppChrome>
  );
}
