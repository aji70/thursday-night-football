"use client";

import { useEffect, useState } from "react";
import { AppChrome } from "@/components/AppChrome";
import type { PlayerStatRow } from "@/lib/league-db";

type StatsPayload = {
  monthKey: string;
  goals: PlayerStatRow[];
  assists: PlayerStatRow[];
  cards: PlayerStatRow[];
  overall: PlayerStatRow[];
};

type Tab = "goals" | "assists" | "cards" | "overall";

export function TablesClient() {
  const [data, setData] = useState<StatsPayload | null>(null);
  const [tab, setTab] = useState<Tab>("goals");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("Could not load tables"));
  }, []);

  const rows = data?.[tab] ?? [];

  return (
    <AppChrome title="Monthly tables">
      <p className="text-muted">
        Goals, assists, cards, and overall for{" "}
        <span className="text-chalk">{data?.monthKey ?? "…"}</span>. Overall =
        goals + assists − (0.5 × yellows) − reds.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["goals", "Goals"],
            ["assists", "Assists"],
            ["cards", "Cards"],
            ["overall", "Overall"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] ${
              tab === key
                ? "bg-flood text-pitch-deep"
                : "border border-line text-muted hover:text-chalk"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="mt-6 text-danger">{error}</p> : null}

      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-flood/30 bg-black/20 text-[0.7rem] uppercase tracking-[0.12em] text-flood">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">G</th>
              <th className="px-4 py-3">A</th>
              <th className="px-4 py-3">YC</th>
              <th className="px-4 py-3">RC</th>
              <th className="px-4 py-3">Overall</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-muted">
                  No events logged yet this month.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row.playerId} className="border-b border-line">
                  <td className="px-4 py-3 font-display text-flood">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-chalk">{row.name}</td>
                  <td className="px-4 py-3 text-muted">{row.teamName ?? "—"}</td>
                  <td className="px-4 py-3">{row.goals}</td>
                  <td className="px-4 py-3">{row.assists}</td>
                  <td className="px-4 py-3">{row.yc}</td>
                  <td className="px-4 py-3">{row.rc}</td>
                  <td className="px-4 py-3 text-flood-soft">{row.overall}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppChrome>
  );
}
