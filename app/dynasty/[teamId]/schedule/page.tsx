"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type GameEntry = {
  id: string;
  week: number;
  gameType: string;
  isHome: boolean;
  homeTeam: { id: string; name: string; abbreviation: string; primaryColor: string };
  awayTeam: { id: string; name: string; abbreviation: string; primaryColor: string };
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

  const color = team.primaryColor;

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="flex items-center gap-4 px-6 py-4 shrink-0"
        style={{ borderBottom: `1px solid ${color}40`, background: "var(--bg-dark)" }}
      >
        <Link href={`/dynasty/${teamId}`} className="font-display text-xs tracking-widest hover:opacity-60 transition-opacity" style={{ color: "var(--text-dim)" }}>
          ← DYNASTY
        </Link>
        <div className="h-4 w-px" style={{ background: "var(--border)" }} />
        <div className="font-display text-xs tracking-widest" style={{ color: "var(--text-dim)" }}>SCHEDULE</div>
        <div className="ml-auto flex items-center gap-6">
          <div className="text-center">
            <div className="font-display text-xl" style={{ color }}>
              {data.record.wins}-{data.record.losses}
            </div>
            <div className="text-[9px] tracking-widest" style={{ color: "var(--text-dim)" }}>RECORD</div>
          </div>
          <div className="text-center">
            <div className="font-display text-lg" style={{ color: "var(--text-secondary)" }}>WK {data.currentWeek}</div>
            <div className="text-[9px] tracking-widest" style={{ color: "var(--text-dim)" }}>{data.year}</div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        <div className="mb-8 text-center">
          <div className="font-display text-4xl" style={{ color }}>{team.abbreviation}</div>
          <div className="font-display text-lg" style={{ color: "var(--text-secondary)" }}>{team.name}</div>
          <div className="font-display text-xs tracking-[0.4em] mt-1" style={{ color: "var(--text-dim)" }}>{data.year} SEASON</div>
        </div>

        {data.games.length === 0 ? (
          <div className="card-dark p-8 text-center">
            <div className="font-display text-xl mb-2" style={{ color: "var(--text-dim)" }}>NO SCHEDULE YET</div>
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>Advance through preseason to generate your schedule.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.games.map((game) => {
              const userTeam = game.isHome ? game.homeTeam : game.awayTeam;
              const opponent = game.isHome ? game.awayTeam : game.homeTeam;
              const userScore = game.isHome ? game.homeScore : game.awayScore;
              const oppScore = game.isHome ? game.awayScore : game.homeScore;
              const won = game.simulated && userScore !== null && oppScore !== null && userScore > oppScore;
              const isNext = game.week === data.currentWeek + 1 && !game.simulated;
              const canClick = game.simulated || isNext;

              const content = (
                <div
                  className={`card-dark p-4 transition-all ${canClick ? "hover:scale-[1.01] cursor-pointer" : "opacity-50"}`}
                  style={isNext ? { borderColor: color, boxShadow: `0 0 15px ${color}20` } : {}}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 text-center shrink-0">
                      <div className="font-display text-xl" style={{ color: game.simulated ? "var(--text-dim)" : "var(--text-secondary)" }}>{game.week}</div>
                      <div className="text-[8px] tracking-widest" style={{ color: "var(--text-dim)" }}>WK</div>
                    </div>

                    <div
                      className="font-display text-[9px] tracking-widest px-2 py-0.5 shrink-0"
                      style={{
                        background: game.isHome ? `${color}20` : "var(--bg-elevated)",
                        color: game.isHome ? color : "var(--text-dim)",
                        border: `1px solid ${game.isHome ? color + "40" : "var(--border)"}`,
                      }}
                    >
                      {game.isHome ? "HOME" : "AWAY"}
                    </div>

                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="font-display text-2xl shrink-0" style={{ color: userTeam.primaryColor }}>{userTeam.abbreviation}</div>
                      <div className="font-display text-sm" style={{ color: "var(--text-dim)" }}>vs</div>
                      <div className="font-display text-2xl shrink-0" style={{ color: opponent.primaryColor }}>{opponent.abbreviation}</div>
                      <div className="text-xs truncate" style={{ color: "var(--text-dim)" }}>{opponent.name}</div>
                    </div>

                    <div className="text-right shrink-0">
                      {game.simulated && userScore !== null && oppScore !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="font-display text-xl" style={{ color: won ? "var(--neon-green)" : "var(--neon-red)" }}>
                            {won ? "W" : "L"}
                          </div>
                          <div className="font-display text-base" style={{ color: "var(--text-secondary)" }}>
                            {userScore}–{oppScore}
                          </div>
                        </div>
                      ) : (
                        <div className="font-display text-xs tracking-widest" style={{ color: isNext ? color : "var(--text-dim)" }}>
                          {isNext ? "NEXT →" : "UPCOMING"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );

              return canClick ? (
                <Link key={game.id} href={`/dynasty/${teamId}/game/${game.id}`}>{content}</Link>
              ) : (
                <div key={game.id}>{content}</div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
