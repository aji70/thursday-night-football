export const benefits = [
  {
    title: "Guaranteed game time",
    copy: "Every team locks in exactly 33 minutes of play per session, independent of scorelines.",
  },
  {
    title: "No pitch hogging",
    copy: "Hot streaks and visitor groups can no longer park regulars on the sideline for 20–30 minutes.",
  },
  {
    title: "Fitness stays live",
    copy: "Shorter idle gaps keep heart rates up and cut muscle-cooling injuries.",
  },
  {
    title: "Monthly stakes",
    copy: "A live leaderboard adds structure, prestige, and something to chase every kick.",
  },
] as const;

/** Detailed proposal copy for the Rules executive summary. */
export const proposalStory = {
  eyebrow: "01 — Executive summary",
  title: "The death of winner stays on",
  intro:
    "This is a new proposal for Thursday Night Football at Kadwell Pitch (Thursdays, 7:00–8:30 PM). It replaces the old winner-stays-on habit with a time-capped league so every paid player gets a fair night.",
  problemTitle: "What was broken",
  problem: [
    "Turnout swings hard — sometimes ~12 players, sometimes close to 30. About 15 people show up most weeks; visitors can be 20–70% of the night.",
    "Winner-stays-on (and short 7-minute hard stops) rewarded hot teams and stacked visitor groups. Regulars who paid and showed up could sit 20–30 minutes while the same sides kept the pitch.",
    "Long sideline waits cooled legs, killed fitness, and made the night feel unfair even when people had paid.",
  ],
  proposalTitle: "What we are proposing",
  proposal: [
    "Four teams play a fixed rotation of short matches. When the match clock ends, both sides leave — win, draw, or lose. Nobody “earns” extra pitch time by winning.",
    "Each team gets the same total minutes in a session (about 33 minutes of play). Paying and showing up guarantees game time, not a lottery.",
    "Resting teams supply the matchday panel (refs / table). Peer officiating keeps the night moving and the stats honest.",
    "The month is a four-week league cycle with a live table (3 points for a win, 1 for a draw). Clean sheets, goal difference, and the rest of the tiebreakers decide close races.",
    "₦5,000 / month buys a regular (permanent) seat for the cycle. ₦1,500 / week is a visitor sub for that night only. Proof of payment goes to the WhatsApp group or to Aji.",
  ],
  nightTitle: "How a Thursday runs",
  night: [
    "Kick-off window: 7:00–8:30 PM at Kadwell Pitch.",
    "Six short fixtures per night (about 11 minutes each, with quick turnarounds).",
    "Teams rotate on and off the pitch on a published fixture list — no arguing for “one more game.”",
    "While two teams play, the other two rest and help run the panel / log.",
  ],
  cycleTitle: "The four-week cycle",
  cycle: [
    "Week 1 is a live balancing window: management can reshuffle if a draft looks unfair.",
    "After Matchday 1, regulars lock to their team for the rest of the month.",
    "Points and stats accumulate on the Tables page. Accolades (Golden Boot, Assist King, etc.) follow the month.",
    "After each cycle we can audit rules, fines, and match lengths — this is a living document, not a forever PDF.",
  ],
  askTitle: "What we need from the squad",
  ask: "Read the full rules below, register on the site, pay into the published account, and send proof with your full name on WhatsApp. Show up on time. Respect the panel. Chase the table — not the pitch.",
} as const;

export const rosterRules = [
  {
    title: "Team names",
    copy: "Sides start as Team 1–4. Each team can suggest a name for the month. Management confirms the final names when rosters settle after Matchday 1.",
  },
  {
    title: "Live balancing window",
    copy: "Active until the end of Matchday 1. If a side looks underpowered or dominant, management reallocates after the session. After Matchday 1, rosters lock for the rest of the month.",
  },
  {
    title: "Visitors & big nights",
    copy: "₦5,000 payers are draft-assigned to a permanent team. ₦1,500 visitors are subs only and fill gaps on the night. At 24+ players, squads grow to 7–8 with captain-managed rolling subs.",
  },
  {
    title: "Living document",
    copy: "Rules, fines, and match lengths can be audited after any four-week cycle. The framework evolves with the squad.",
  },
] as const;

export const venue = {
  name: "Kadwell Pitch",
  session: "Thursdays, 7:00–8:30 PM",
} as const;

export const fees = [
  {
    title: "Permanent seat",
    amount: "₦5,000 / month",
    detail:
      "Regulars who pay ₦5,000 get a permanent team for the month. Send proof of payment with your name to the WhatsApp group or to Aji. Management can mark you regular before payment clears.",
  },
  {
    title: "Visitor sub",
    amount: "₦1,500 / week",
    detail:
      "Added as a sub on the night — not locked to a monthly roster. Can be placed on a team for that session only.",
  },
] as const;

export const pointsSystem = [
  { result: "Win", points: "3" },
  { result: "Draw", points: "1" },
  { result: "Loss", points: "0" },
] as const;

export const tiebreakers = [
  {
    rank: "01",
    title: "Points",
    copy: "Highest points after the four-week cycle.",
  },
  {
    rank: "02",
    title: "Clean sheets",
    copy: "Most clean sheets. First tiebreaker when teams finish level on points.",
  },
  {
    rank: "03",
    title: "Goal difference",
    copy: "Goals scored minus goals conceded across the month.",
  },
  {
    rank: "04",
    title: "Goals scored",
    copy: "Highest goals for.",
  },
  {
    rank: "05",
    title: "Head-to-head",
    copy: "Points taken in matches between the tied teams.",
  },
  {
    rank: "06",
    title: "Discipline",
    copy: "Fewest cards across the month. If still level, management draws lots.",
  },
] as const;

export const panelLaws = [
  {
    title: "No conflict of interest",
    copy: "Panelists never officiate or log stats for their own team.",
  },
  {
    title: "Assist standard",
    copy: "Only the final intentional pass that leads directly to a goal. No deflections, saves, or solo runs.",
  },
  {
    title: "Clean sheet primacy",
    copy: "Clean sheets are the first tiebreaker when teams finish level on points — then goal difference, goals scored, head-to-head, and discipline.",
  },
  {
    title: "No arguments — panel is final",
    copy: "No arguing with the panel, players, or management. Dissent, yelling, or arguing is an immediate red card. The panel's logged decision stands.",
  },
] as const;

export const pitchRules = [
  {
    title: "Foul in the box = penalty",
    copy: "Any foul committed inside the box is a penalty. No debate.",
  },
  {
    title: "Penalty kick",
    copy: "Taken as usual — one foot on the ball. Wait for the referee's signal before the kick.",
  },
  {
    title: "Free-kick wall — one stride",
    copy: "On a free kick, the gap between the ball and the defending wall is one stride (wall distance). The wall must retreat that far before the kick. Encroaching = retake or a card if it continues.",
  },
  {
    title: "Goalkeeper",
    copy: "Anyone can play as GK. The keeper may be changed during open play by notifying the referee / panel first. Exception: if a penalty is awarded and the GK is not injured, that same keeper must stay in goal for the kick — no bringing on a new GK just for the pen.",
  },
  {
    title: "Kick-off arc",
    copy: "Only the team kicking off at the start, or restarting after a goal, may be in the arc. Everyone else stays out until the ball is in play.",
  },
  {
    title: "No direct goals from throw-ins",
    copy: "A throw-in must touch another player before it can count as a goal. If it goes straight in without a touch, the other team restarts with a goal kick.",
  },
  {
    title: "No arguments",
    copy: "Play the whistle. No arguing with the panel, opponents, or teammates during the match. Arguments trigger the disciplinary code — yellow or red as logged.",
  },
] as const;

export const fines = [
  {
    infraction: "Yellow card",
    consequence: "Official warning. Logged on the match sheet. Counts toward monthly accumulation.",
    amount: "₦500",
  },
  {
    infraction: "Red card",
    consequence:
      "Immediate ejection. Team plays a man down for the rest of that game. Automatic suspension applies.",
    amount: "₦1,000",
  },
  {
    infraction: "Serious offence",
    consequence:
      "Violent conduct, repeated dissent, fighting, or other gross misconduct. Attracts suspension and/or a fine as set by management.",
    amount: "Up to ₦5,000",
  },
] as const;

export const yellowAccumulation = [
  {
    title: "Two yellows, same match",
    copy: "Equals a red card. Player is sent off, the team finishes that game a man down, and the red-card fine + suspension apply (not a separate double yellow fine on top of the red).",
  },
  {
    title: "3 yellows in the month",
    copy: "Automatic 1-match suspension. Served on the player's next scheduled match.",
  },
  {
    title: "5 yellows in the month",
    copy: "Automatic 2-match suspension (replaces the 3-yellow ban if not yet served, or adds the remaining games).",
  },
  {
    title: "Reset",
    copy: "Yellow counts reset at the start of each new four-week month. Suspensions still being served carry into the next month until completed.",
  },
] as const;

export const redCardRules = [
  {
    title: "Straight red",
    copy: "Ejected from that match. ₦1,000 fine. Minimum 1-match suspension (next match).",
  },
  {
    title: "Red via two yellows",
    copy: "Same as a straight red for suspension and the ₦1,000 fine. The two yellows still count on the monthly yellow tally.",
  },
  {
    title: "Serious red / violent conduct",
    copy: "Minimum 2-match suspension. Fine up to ₦5,000 as set by management. May be longer for fighting or assault.",
  },
  {
    title: "Serving the ban",
    copy: "A suspended player cannot play any match until the ban is served and all fines are paid. The team fields one fewer if no substitute is available.",
  },
] as const;

export const awards = [
  {
    name: "Monthly Champions",
    copy: "Team top of the four-week leaderboard.",
  },
  {
    name: "Golden Boot",
    copy: "Highest verified goal tally.",
  },
  {
    name: "Assist King",
    copy: "Highest verified assist tally.",
  },
  {
    name: "Player of the Month",
    copy: "Cumulative MVP votes from the officiating panels.",
  },
] as const;

export type Fixture = {
  match: number;
  time: string;
  fixture: string;
  officiating: string;
};

export const fixturesByWeek: Record<1 | 2 | 3 | 4, Fixture[]> = {
  1: [
    { match: 1, time: "7:00–7:11", fixture: "Team 1 vs Team 2", officiating: "Team 3 & 4" },
    { match: 2, time: "7:14–7:25", fixture: "Team 3 vs Team 4", officiating: "Team 1 & 2" },
    { match: 3, time: "7:28–7:39", fixture: "Team 1 vs Team 3", officiating: "Team 2 & 4" },
    { match: 4, time: "7:42–7:53", fixture: "Team 2 vs Team 4", officiating: "Team 1 & 3" },
    { match: 5, time: "7:56–8:07", fixture: "Team 1 vs Team 4", officiating: "Team 2 & 3" },
    { match: 6, time: "8:10–8:21", fixture: "Team 2 vs Team 3", officiating: "Team 1 & 4" },
  ],
  2: [
    { match: 1, time: "7:00–7:11", fixture: "Team 3 vs Team 4", officiating: "Team 1 & 2" },
    { match: 2, time: "7:14–7:25", fixture: "Team 1 vs Team 2", officiating: "Team 3 & 4" },
    { match: 3, time: "7:28–7:39", fixture: "Team 2 vs Team 4", officiating: "Team 1 & 3" },
    { match: 4, time: "7:42–7:53", fixture: "Team 1 vs Team 3", officiating: "Team 2 & 4" },
    { match: 5, time: "7:56–8:07", fixture: "Team 2 vs Team 3", officiating: "Team 1 & 4" },
    { match: 6, time: "8:10–8:21", fixture: "Team 1 vs Team 4", officiating: "Team 2 & 3" },
  ],
  3: [
    { match: 1, time: "7:00–7:11", fixture: "Team 1 vs Team 3", officiating: "Team 2 & 4" },
    { match: 2, time: "7:14–7:25", fixture: "Team 2 vs Team 4", officiating: "Team 1 & 3" },
    { match: 3, time: "7:28–7:39", fixture: "Team 1 vs Team 4", officiating: "Team 2 & 3" },
    { match: 4, time: "7:42–7:53", fixture: "Team 2 vs Team 3", officiating: "Team 1 & 4" },
    { match: 5, time: "7:56–8:07", fixture: "Team 1 vs Team 2", officiating: "Team 3 & 4" },
    { match: 6, time: "8:10–8:21", fixture: "Team 3 vs Team 4", officiating: "Team 1 & 2" },
  ],
  4: [
    { match: 1, time: "7:00–7:11", fixture: "Team 2 vs Team 4", officiating: "Team 1 & 3" },
    { match: 2, time: "7:14–7:25", fixture: "Team 1 vs Team 3", officiating: "Team 2 & 4" },
    { match: 3, time: "7:28–7:39", fixture: "Team 2 vs Team 3", officiating: "Team 1 & 4" },
    { match: 4, time: "7:42–7:53", fixture: "Team 1 vs Team 4", officiating: "Team 2 & 3" },
    { match: 5, time: "7:56–8:07", fixture: "Team 3 vs Team 4", officiating: "Team 1 & 2" },
    { match: 6, time: "8:10–8:21", fixture: "Team 1 vs Team 2", officiating: "Team 3 & 4" },
  ],
};

/** Returns [homeTeamNumber, awayTeamNumber] for a scheduled fixture. */
export function fixtureTeamNumbers(
  week: number,
  match: number,
): [number, number] | null {
  const w = week as 1 | 2 | 3 | 4;
  const row = fixturesByWeek[w]?.find((f) => f.match === match);
  if (!row) return null;
  const m = row.fixture.match(/Team\s+(\d)\s+vs\s+Team\s+(\d)/i);
  if (!m) return null;
  return [Number(m[1]), Number(m[2])];
}
