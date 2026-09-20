import { fixtureTeamNumbers, fixturesByWeek } from "@/data/league";
import { PAYMENT_CYCLE } from "@/lib/league-db";

export type NextMatchInfo = {
  week: number;
  match: number;
  date: string;
  dateLabel: string;
  time: string;
  fixture: string;
  opponentLabel: string;
  officiating: string;
  teamSide: "home" | "away";
} | null;

function parseYmd(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateLabel(ymd: string) {
  return parseYmd(ymd).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Next match for a rostered team: first fixture on/after today whose week
 * still has no logged result for this team.
 *
 * Note: if a result is logged late for an earlier week, we still walk from
 * today's cycle week forward so we don't surface a stale past fixture as "next".
 */
export function findNextMatch(
  teamNumber: number,
  playedKeys: Set<string>,
  today = new Date(),
): NextMatchInfo {
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  for (const week of [1, 2, 3, 4] as const) {
    const ymd = PAYMENT_CYCLE.weekDates[week];
    const weekDate = parseYmd(ymd);
    // Skip fully past weeks by calendar (edge: late-logged results won't revive them).
    if (weekDate < startOfToday) continue;

    for (const row of fixturesByWeek[week]) {
      const pair = fixtureTeamNumbers(week, row.match);
      if (!pair) continue;
      const [home, away] = pair;
      if (home !== teamNumber && away !== teamNumber) continue;

      const key = `${week}-${row.match}`;
      if (playedKeys.has(key)) continue;

      const teamSide = home === teamNumber ? "home" : "away";
      const opponent = teamSide === "home" ? away : home;

      return {
        week,
        match: row.match,
        date: ymd,
        dateLabel: formatDateLabel(ymd),
        time: row.time,
        fixture: row.fixture,
        opponentLabel: `Team ${opponent}`,
        officiating: row.officiating,
        teamSide,
      };
    }
  }

  // Fallback: first unplayed fixture for this team in the cycle
  for (const week of [1, 2, 3, 4] as const) {
    for (const row of fixturesByWeek[week]) {
      const pair = fixtureTeamNumbers(week, row.match);
      if (!pair) continue;
      const [home, away] = pair;
      if (home !== teamNumber && away !== teamNumber) continue;
      const key = `${week}-${row.match}`;
      if (playedKeys.has(key)) continue;
      const teamSide = home === teamNumber ? "home" : "away";
      const opponent = teamSide === "home" ? away : home;
      const ymd = PAYMENT_CYCLE.weekDates[week];
      return {
        week,
        match: row.match,
        date: ymd,
        dateLabel: formatDateLabel(ymd),
        time: row.time,
        fixture: row.fixture,
        opponentLabel: `Team ${opponent}`,
        officiating: row.officiating,
        teamSide,
      };
    }
  }

  return null;
}

export type NextSessionInfo = {
  week: 1 | 2 | 3 | 4;
  date: string;
  dateLabel: string;
  fixtures: {
    match: number;
    time: string;
    fixture: string;
    officiating: string;
  }[];
};

/** Next Thursday session in the cycle (calendar), with that night's fixtures. */
export function findNextSession(today = new Date()): NextSessionInfo | null {
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  for (const week of [1, 2, 3, 4] as const) {
    const ymd = PAYMENT_CYCLE.weekDates[week];
    const weekDate = parseYmd(ymd);
    if (weekDate < startOfToday) continue;
    return {
      week,
      date: ymd,
      dateLabel: formatDateLabel(ymd),
      fixtures: fixturesByWeek[week].map((row) => ({
        match: row.match,
        time: row.time,
        fixture: row.fixture,
        officiating: row.officiating,
      })),
    };
  }
  return null;
}
