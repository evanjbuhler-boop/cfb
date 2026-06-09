"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type GameEntry = {
  id: string;
  week: number;
  gameType: string;
  isHome: boolean;
  homeTeam: { id: string; name: string; abbreviation: string; primaryColor: string; prestige: number };
  awayTeam: { id: string; name: string; abbreviation: string; primaryColor: string; prestige: number };
  homeScore: number | null;
  awayScore: number | null;
  simulated: boolean;
};

type ScheduleData = {
  games: GameEntry[];
  record: { wins: number; losses: number };
  currentWeek: number;
  year: number;
};

export default function SchedulePage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [data, setData] = useState<ScheduleData | null>(null);
  const [team, setTeam] = useState<{ name: string; abbreviation: string; primaryColor: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/dynasty/${teamId}/schedule`).then((r) => r.json()),
      fetch(`/api/dynasty/${teamId}`).then((r) => r.json()),
    ]).then(([s, d]) => {
      if (s && !s.error) setData(s);
      if (d?.team) setTeam(d.team);
    }).catch(console.error);
  }, [teamId]);

  if (!data || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-display text-2xl animate-pulse" style={{ color: "var(--gold)" }}>LOADING SCHEDULE...</div>
      </div>
    );
  }

  const primaryColor = team.primaryColor;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header
        className="flex items-center gap-4 px-6 py-4 shrink-0"
        style={{ borderBottom: `1px solid ${primaryColor}40`, background: "var(--bg-dark)" }}
      >
        <Link
          href={`/dynasty/${teamId}`}
          className="font-display text-xs tracking-widest hover:opacity-60 transition-opacity"
          style={{ color: "var(--text-dim)" }}
        >
          ← DYNASTY
        </Link>
        <div className="h-4 w-px" style={{ background: "var(--border)" }} />
        <div className="font-display text-xs tracking-widest" style={{ color: "var(--text-dim)" }}>SCHEDULE</div>
        <div className="ml-auto flex items-center gap-6">
          <div className="text-center">
            <div className="font-display text-xl" style={{ color: primaryColor }}>
              {data.record.wins}-{data.record.losses}
            </div>
            <div className="text-[9px] tracking-widest" style={{ color: "var(--text-dim)" }}>RECORD</div>
          </div>
          <div className="text-center">
            <div className="font-display text-lg" style={{ color: "var(--text-secondary)" }}>
              WK {data.currentWeek}
            </div>
            <div className="text-[9px] tracking-widest" style={{ color: "var(--text-dim)" }}>{data.year}</div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        {/* Season header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-px flex-1" style={{ background: `${primaryColor}40` }} />
            <span className="font-display text-xs tracking-[0.4em]" style={{ color: primaryColor }}>
              {data.year} SEASON
            </span>
            <div className="h-px flex-1" style={{ background: `${primaryColor}40` }} />
          </div>
          <div className="text-center">
            <div className="font-display text-4xl" style={{ color: "var(--text-primary)" }}>
              {team.abbreviation}
            </div>
            <div className="font-display text-lg" style={{ color: "var(--text-secondary)" }}>{team.name}</div>
          </div>
        </div>

        {data.games.length === 0 ? (
          <div className="card-dark p-8 text-center">
            <div className="font-display text-xl mb-2" style={{ color: "var(--text-dim)" }}>NO SCHEDULE YET</div>
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>Start your dynasty to generate a schedule.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.games.map((game) => {
              const userTeam = game.isHome ? game.homeTeam : game.awayTeam;
              const opponent = game.isHome ? game.awayTeam : game.homeTeam;
              const userScore = game.isHome ? game.homeScore : game.awayScore;
              const oppScore = game.isHome ? game.awayScore : game.homeScore;
              const won = game.simulated && userScore !== null && oppScore !== null && userScore > oppScore;
              const lost = game.simulated && userScore !== null && oppScore !== null && userScore < oppScore;
              const isCurrentWeek = game.week === data.currentWeek + 1;
              const isPast = game.week <= data.currentWeek;

              let resultColor = "var(--text-dim)";
              let resultLabel = "";
              if (game.simulated) {
                resultColor = won ? "var(--neon-green)" : "var(--neon-red)";
                resultLabel = won ? "W" : "L";
              } else if (isCurrentWeek) {
                resultColor = "var(--gold)";
                resultLabel = "NEXT";
              } else if (!isPast) {
                resultLabel = "UPCOMING";
              }

              return (
                <Link
                  key={game.id}
                  href={game.simulated || isCurrentWeek ? `/dynasty/${teamId}/game/${game.id}` : "#"}
                  className={`block card-dark p-4 transition-all ${game.simulated || isCurrentWeek ? "hover:scale-[1.01]" : "opacity-60 cursor-default"}`}
                  style={isCurrentWeek ? { borderColor: primaryColor, boxShadow: `0 0 15px ${primaryColor}20` } : {}}
                  onClick={(e) => { if (!game.simulated && !isCurrentWeek) e.preventDefault(); }}
                >
                  <div className="flex items-center gap-4">
                    {/* Week number */}
                    <div className="w-10 text-center shrink-0">
                      <div className="font-display text-xl" style={{ color: game.week <= data.currentWeek ? "var(--text-dim)" : "var(--text-secondary)" }}>
                        {game.week}
                      </div>
                      <div className="text-[8px] tracking-widest" style={{ color: "var(--text-dim)" }}>WK</div>
                    </div>

                    {/* Location badge */}
                    <div
                      className="font-display text-[9px] tracking-widest px-2 py-0.5 shrink-0"
                      style={{
                        background: game.isHome ? `${primaryColor}20` : "var(--bg-elevated)",
                        color: game.isHome ? primaryColor : "var(--text-dim)",
                        border: `1px solid ${game.isHome ? primaryColor + "40" : "var(--border)"}`,
                      }}
                    >
                      {game.isHome ? "HOME" : "AWAY"}
                    </div>

                    {/* Matchup */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="font-display text-2xl shrink-0"
                        style={{ color: userTeam.primaryColor, textShadow: `0 0 10px ${userTeam.primaryColor}40` }}
                      >
                        {userTeam.abbreviation}
                      </div>
                      <div className="font-display text-sm" style={{ color: "var(--text-dim)" }}>vs</div>
                      <div
                        className="font-display text-2xl shrink-0"
                        style={{ color: opponent.primaryColor, textShadow: `0 0 10px ${opponent.primaryColor}30` }}
                      >
                        {opponent.abbreviation}
                      </div>
                      <div className="text-xs truncate min-w-0" style={{ color: "var(--text-dim)" }}>
                        {opponent.name}
                      </div>
                    </div>

                    {/* Result / score */}
                    <div className="text-right shrink-0">
                      {game.simulated && userScore !== null && oppScore !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="font-display text-xl" style={{ color: resultColor }}>
                            {resultLabel}
                          </div>
                          <div className="font-display text-base" style={{ color: "var(--text-secondary)" }}>
                            {userScore}–{oppScore}
                          </div>
                        </div>
                      ) : (
                        <div className="font-display text-xs tracking-widest" style={{ color: resultColor }}>
                          {resultLabel}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Game type chip */}
                  {game.gameType !== "REGULAR_SEASON" && (
                    <div className="mt-2 ml-14">
                      <span
                        className="font-display text-[8px] tracking-widest px-1.5 py-0.5"
                        style={{ background: "rgba(255,34,68,0.15)", color: "#ff2244", border: "1px solid rgba(255,34,68,0.3)" }}
                      >
                        {game.gameType.replace("_", " ")}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
