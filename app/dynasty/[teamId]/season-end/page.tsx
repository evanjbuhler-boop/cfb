"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Recruit = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  stars: number;
  hometown: string;
  homeState: string;
  nationalRank: number;
};

type Player = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  year: string;
  overall: number;
};

type NewsItem = {
  id: string;
  category: string;
  headline: string;
  week: number;
  isBreaking: boolean;
};

type Team = {
  id: string;
  name: string;
  abbreviation: string;
  primaryColor: string;
  secondaryColor: string;
  conference: { name: string; abbreviation: string };
};

type SeasonEndData = {
  year: number;
  team: Team;
  record: { wins: number; losses: number };
  apRank: number | null;
  topPlayers: Player[];
  news: NewsItem[];
  committedRecruits: Recruit[];
  totalWins: number;
  totalLosses: number;
};

type DynastyData = {
  team: Team;
  currentYear: number;
};

function StarDisplay({ stars }: { stars: number }) {
  return (
    <span style={{ color: "#ffd700", letterSpacing: "1px" }}>
      {"★".repeat(stars)}{"☆".repeat(Math.max(0, 5 - stars))}
    </span>
  );
}

export default function SeasonEndPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const router = useRouter();
  const [data, setData] = useState<SeasonEndData | null>(null);
  const [dynasty, setDynasty] = useState<DynastyData | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;
    Promise.all([
      fetch(`/api/dynasty/${teamId}/season-end`).then((r) => r.json()),
      fetch(`/api/dynasty/${teamId}`).then((r) => r.json()),
    ]).then(([seasonData, dynastyData]) => {
      if (seasonData && !seasonData.error) setData(seasonData);
      else setError(seasonData?.error ?? "Failed to load");
      if (dynastyData && !dynastyData.error) setDynasty(dynastyData);
    }).catch(() => setError("Network error"));
  }, [teamId]);

  async function enterNextSeason() {
    setAdvancing(true);
    try {
      const res = await fetch(`/api/dynasty/${teamId}/next-season`, { method: "POST" });
      const result = await res.json();
      if (result.success) {
        router.push(`/dynasty/${teamId}`);
      } else {
        setError(result.error ?? "Failed to advance season");
        setAdvancing(false);
      }
    } catch {
      setError("Network error");
      setAdvancing(false);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-dark p-8 text-center">
          <div className="font-display text-2xl mb-2" style={{ color: "#ff2244" }}>ERROR</div>
          <p style={{ color: "var(--text-secondary)" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-display text-2xl animate-pulse" style={{ color: "var(--gold)" }}>
          LOADING SEASON RECAP...
        </div>
      </div>
    );
  }

  const { team, year, record, apRank, topPlayers, news, committedRecruits } = data;
  const nextYear = year + 1;
  const primaryColor = team.primaryColor;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--bg-dark)" }}>
      {/* Background atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 20%, ${primaryColor}18 0%, transparent 60%)`,
        }}
      />
      <div className="absolute inset-0 speed-lines pointer-events-none opacity-20" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {/* Season wrap-up header */}
        <div className="text-center mb-12 animate-slide-in-up">
          <div
            className="font-display text-[11px] tracking-[0.6em] mb-4"
            style={{ color: "var(--text-dim)" }}
          >
            {team.name.toUpperCase()} · {team.conference.abbreviation}
          </div>

          <div
            className="font-display leading-none mb-2"
            style={{
              fontSize: "clamp(4rem, 12vw, 9rem)",
              color: primaryColor,
              textShadow: `0 0 60px ${primaryColor}60, 0 0 120px ${primaryColor}30`,
            }}
          >
            {year}
          </div>

          <div
            className="font-display text-xl tracking-[0.4em] mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            SEASON COMPLETE
          </div>

          <div className="graffiti-divider mb-8" />

          {/* Record + rank */}
          <div className="flex items-center justify-center gap-12">
            <div className="text-center">
              <div
                className="font-display leading-none"
                style={{ fontSize: "clamp(3rem, 8vw, 5rem)", color: "var(--text-primary)" }}
              >
                <span style={{ color: "#39ff14" }}>{record.wins}</span>
                <span style={{ color: "var(--text-dim)" }}>-</span>
                <span style={{ color: "#ff2244" }}>{record.losses}</span>
              </div>
              <div
                className="font-display text-[10px] tracking-[0.4em] mt-1"
                style={{ color: "var(--text-dim)" }}
              >
                FINAL RECORD
              </div>
            </div>

            {apRank && (
              <div className="text-center">
                <div
                  className="font-display leading-none"
                  style={{ fontSize: "clamp(3rem, 8vw, 5rem)", color: "var(--gold)" }}
                >
                  #{apRank}
                </div>
                <div
                  className="font-display text-[10px] tracking-[0.4em] mt-1"
                  style={{ color: "var(--text-dim)" }}
                >
                  FINAL AP RANK
                </div>
              </div>
            )}

            <div className="text-center">
              <div
                className="font-display leading-none"
                style={{ fontSize: "clamp(3rem, 8vw, 5rem)", color: "var(--text-secondary)" }}
              >
                {data.totalWins}-{data.totalLosses}
              </div>
              <div
                className="font-display text-[10px] tracking-[0.4em] mt-1"
                style={{ color: "var(--text-dim)" }}
              >
                ALL-TIME RECORD
              </div>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Incoming class */}
          <div className="lg:col-span-2 animate-slide-in-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1" style={{ background: `${primaryColor}40` }} />
              <span
                className="font-display text-xs tracking-[0.3em]"
                style={{ color: primaryColor }}
              >
                INCOMING CLASS {nextYear}
              </span>
              <div className="h-px flex-1" style={{ background: `${primaryColor}40` }} />
            </div>

            {committedRecruits.length === 0 ? (
              <div className="card-dark p-6 text-center">
                <div className="font-display text-sm mb-1" style={{ color: "var(--text-dim)" }}>
                  NO COMMITS YET
                </div>
                <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                  Keep recruiting to build your next class.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {committedRecruits.map((r, i) => (
                  <div
                    key={r.id}
                    className="card-dark px-4 py-3 flex items-center gap-4 animate-slide-in-up"
                    style={{
                      animationDelay: `${150 + i * 60}ms`,
                      borderColor: r.stars >= 5 ? "#ffd700" : r.stars >= 4 ? "var(--border)" : "var(--border)",
                    }}
                  >
                    {r.stars >= 5 && (
                      <div
                        className="absolute top-0 left-0 right-0 h-[1px]"
                        style={{ background: "linear-gradient(90deg, transparent, #ffd700, transparent)" }}
                      />
                    )}
                    <div
                      className="font-display text-lg w-8 text-center shrink-0"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {i + 1}
                    </div>
                    <div className="shrink-0">
                      <StarDisplay stars={r.stars} />
                    </div>
                    <div
                      className="font-display text-xs px-1.5 py-0.5 shrink-0"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {r.position}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-base leading-none truncate" style={{ color: "var(--text-primary)" }}>
                        {r.firstName} {r.lastName}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--text-dim)" }}>
                        {r.hometown}, {r.homeState} · #{r.nationalRank} national
                      </div>
                    </div>
                    <div
                      className="font-display text-xs tracking-widest px-2 py-1 shrink-0"
                      style={{
                        background: `${primaryColor}15`,
                        border: `1px solid ${primaryColor}40`,
                        color: primaryColor,
                      }}
                    >
                      COMMITTED
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top players sidebar */}
          <div className="animate-slide-in-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1" style={{ background: "var(--gold-dim)" }} />
              <span className="font-display text-xs tracking-[0.3em]" style={{ color: "var(--gold)" }}>
                TOP PLAYERS
              </span>
              <div className="h-px flex-1" style={{ background: "var(--gold-dim)" }} />
            </div>

            <div className="space-y-2">
              {topPlayers.map((p, i) => (
                <div
                  key={p.id}
                  className="card-dark px-4 py-3 flex items-center gap-3 animate-slide-in-up"
                  style={{ animationDelay: `${250 + i * 60}ms` }}
                >
                  <div
                    className="font-display text-sm w-6 text-center shrink-0"
                    style={{ color: "var(--text-dim)" }}
                  >
                    {i + 1}
                  </div>
                  <div
                    className="font-display text-xs px-1.5 py-0.5 shrink-0"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {p.position}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-sm leading-none truncate" style={{ color: "var(--text-primary)" }}>
                      {p.firstName} {p.lastName}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: "var(--text-dim)" }}>{p.year}</div>
                  </div>
                  <div
                    className="font-display text-lg shrink-0"
                    style={{
                      color: p.overall >= 90 ? "#ffd700" : p.overall >= 80 ? "#39ff14" : p.overall >= 70 ? "#00bfff" : "var(--text-secondary)",
                    }}
                  >
                    {p.overall}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* News recap */}
        {news.length > 0 && (
          <div className="mb-10 animate-slide-in-up" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1" style={{ background: "var(--border)" }} />
              <span className="font-display text-xs tracking-[0.3em]" style={{ color: "var(--text-dim)" }}>
                SEASON HEADLINES
              </span>
              <div className="h-px flex-1" style={{ background: "var(--border)" }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {news.map((item, i) => (
                <div
                  key={item.id}
                  className="card-dark px-4 py-3 animate-slide-in-up"
                  style={{
                    animationDelay: `${350 + i * 50}ms`,
                    borderColor: item.isBreaking ? "#ff224430" : "var(--border)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-display text-[9px] tracking-[0.2em]"
                      style={{ color: "var(--text-dim)" }}
                    >
                      WK {item.week}
                    </span>
                    {item.isBreaking && (
                      <span
                        className="font-display text-[9px] tracking-widest px-1 py-0.5"
                        style={{ background: "rgba(255,34,68,0.15)", color: "#ff2244", border: "1px solid #ff224430" }}
                      >
                        BREAKING
                      </span>
                    )}
                  </div>
                  <p className="font-display text-sm leading-snug" style={{ color: "var(--text-primary)" }}>
                    {item.headline}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center animate-slide-in-up" style={{ animationDelay: "400ms" }}>
          <div className="graffiti-divider mb-8" />

          <div className="font-display text-xs tracking-[0.5em] mb-6" style={{ color: "var(--text-dim)" }}>
            THE {year} SEASON IS OVER. A NEW CHAPTER BEGINS.
          </div>

          <button
            onClick={enterNextSeason}
            disabled={advancing}
            className="font-display text-2xl px-12 py-5 tracking-widest transition-all bracket-corners"
            style={{
              background: advancing
                ? "var(--bg-elevated)"
                : `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}15)`,
              border: `2px solid ${advancing ? "var(--border)" : primaryColor}`,
              color: advancing ? "var(--text-dim)" : primaryColor,
              cursor: advancing ? "wait" : "pointer",
              boxShadow: advancing ? "" : `0 0 30px ${primaryColor}30, 0 0 60px ${primaryColor}15`,
              textShadow: advancing ? "" : `0 0 20px ${primaryColor}80`,
            }}
            onMouseEnter={(e) => {
              if (!advancing) {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${primaryColor}50, 0 0 80px ${primaryColor}25`;
                (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
              }
            }}
            onMouseLeave={(e) => {
              if (!advancing) {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${primaryColor}30, 0 0 60px ${primaryColor}15`;
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }
            }}
          >
            {advancing ? "BUILDING ROSTER..." : `ENTER ${nextYear} SEASON →`}
          </button>
        </div>
      </div>
    </div>
  );
}
