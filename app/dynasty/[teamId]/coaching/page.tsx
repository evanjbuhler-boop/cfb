"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Coach = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  age: number;
  personality: string;
  quote: string | null;
  offenseRating: number;
  defenseRating: number;
  recruitingRating: number;
  playerDev: number;
  gameManagement: number;
  motivation: number;
  offScheme: string | null;
  defScheme: string | null;
  careerWins: number;
  careerLosses: number;
  contractYears: number;
  salary: number;
  reputation: number;
  hotSeat: number;
  seasonRecord: { wins: number; losses: number };
};

type DynastyData = {
  team: {
    id: string;
    name: string;
    abbreviation: string;
    primaryColor: string;
    secondaryColor: string;
    conference: { name: string; abbreviation: string };
  };
  currentYear: number;
};

type RatingBarProps = {
  label: string;
  value: number;
  color: string;
};

function RatingBar({ label, value, color }: RatingBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-display text-[10px] tracking-[0.3em]" style={{ color: "var(--text-dim)" }}>
          {label}
        </span>
        <span className="font-display text-lg" style={{ color }}>
          {value}
        </span>
      </div>
      <div
        className="h-1.5 rounded-[1px] overflow-hidden"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
      >
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}

function ratingColor(v: number): string {
  if (v >= 90) return "#ffd700";
  if (v >= 80) return "#39ff14";
  if (v >= 70) return "#00bfff";
  if (v >= 60) return "#ff8c00";
  return "#ff4444";
}

const PERSONALITY_META: Record<string, { label: string; color: string }> = {
  AGGRESSIVE:   { label: "AGGRESSIVE",   color: "#ff2244" },
  CALM:         { label: "COMPOSED",     color: "#00bfff" },
  DISCIPLINED:  { label: "DISCIPLINED",  color: "#39ff14" },
  PLAYER_DEV:   { label: "DEVELOPER",    color: "#ffd700" },
  RECRUITER:    { label: "RECRUITER",    color: "#ff6b35" },
  MOTIVATOR:    { label: "MOTIVATOR",    color: "#bf5fff" },
  TACTICIAN:    { label: "TACTICIAN",    color: "#4ecdc4" },
};

export default function CoachingPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [dynasty, setDynasty] = useState<DynastyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;
    Promise.all([
      fetch(`/api/dynasty/${teamId}/coach`).then((r) => r.json()),
      fetch(`/api/dynasty/${teamId}`).then((r) => r.json()),
    ]).then(([c, d]) => {
      if (c && !c.error) setCoach(c);
      else setError(c?.error ?? "No coach found");
      if (d && !d.error) setDynasty(d);
    }).catch(() => setError("Network error"));
  }, [teamId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-dark p-8 text-center">
          <div className="font-display text-2xl mb-2" style={{ color: "#ff2244" }}>ERROR</div>
          <p style={{ color: "var(--text-secondary)" }}>{error}</p>
          <Link href={`/dynasty/${teamId}`} className="inline-block mt-4 font-display text-xs tracking-widest" style={{ color: "var(--text-dim)" }}>
            ← DYNASTY
          </Link>
        </div>
      </div>
    );
  }

  if (!coach || !dynasty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-display text-2xl animate-pulse" style={{ color: "var(--gold)" }}>
          LOADING STAFF...
        </div>
      </div>
    );
  }

  const { team, currentYear } = dynasty;
  const primaryColor = team.primaryColor;
  const personalityMeta = PERSONALITY_META[coach.personality] ?? { label: coach.personality, color: "#888" };

  const ratings = [
    { label: "OFFENSE",     value: coach.offenseRating,   color: ratingColor(coach.offenseRating) },
    { label: "DEFENSE",     value: coach.defenseRating,   color: ratingColor(coach.defenseRating) },
    { label: "RECRUITING",  value: coach.recruitingRating, color: ratingColor(coach.recruitingRating) },
    { label: "PLAYER DEV",  value: coach.playerDev,       color: ratingColor(coach.playerDev) },
    { label: "GAME MGT",    value: coach.gameManagement,  color: ratingColor(coach.gameManagement) },
    { label: "MOTIVATION",  value: coach.motivation,      color: ratingColor(coach.motivation) },
  ];

  const salaryFormatted = coach.salary >= 1_000_000
    ? `$${(coach.salary / 1_000_000).toFixed(1)}M`
    : `$${(coach.salary / 1_000).toFixed(0)}K`;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-dark)" }}>
      {/* Header */}
      <header
        className="relative flex items-center justify-between px-6 py-3 shrink-0"
        style={{
          borderBottom: `1px solid ${primaryColor}30`,
          background: "linear-gradient(135deg, var(--bg-dark) 0%, rgba(0,0,0,0.95) 100%)",
          boxShadow: `0 2px 20px ${primaryColor}15`,
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` }} />

        <div className="flex items-center gap-4">
          <Link
            href={`/dynasty/${teamId}`}
            className="font-display text-xs tracking-widest transition-opacity hover:opacity-60"
            style={{ color: "var(--text-dim)" }}
          >
            ← DYNASTY
          </Link>
          <div className="w-px h-4" style={{ background: "var(--border)" }} />
          <div className="font-display text-sm tracking-widest" style={{ color: "var(--text-secondary)" }}>
            COACHING STAFF
          </div>
        </div>

        <div className="font-display text-xs tracking-widest" style={{ color: "var(--text-dim)" }}>
          {team.name.toUpperCase()} · {currentYear}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Coach identity */}
        <div
          className="card-dark bracket-corners p-8 mb-8 animate-slide-in-up relative overflow-hidden"
          style={{ borderColor: `${primaryColor}40` }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at top left, ${primaryColor}06 0%, transparent 60%)` }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span
                    className="font-display text-[9px] tracking-[0.4em] px-2 py-0.5"
                    style={{
                      background: `${primaryColor}15`,
                      border: `1px solid ${primaryColor}40`,
                      color: primaryColor,
                    }}
                  >
                    HEAD COACH
                  </span>
                  <span
                    className="font-display text-[9px] tracking-[0.3em] px-2 py-0.5"
                    style={{
                      background: `${personalityMeta.color}15`,
                      border: `1px solid ${personalityMeta.color}40`,
                      color: personalityMeta.color,
                    }}
                  >
                    {personalityMeta.label}
                  </span>
                </div>

                <h1
                  className="font-display leading-none mb-1"
                  style={{
                    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                    color: "var(--text-primary)",
                  }}
                >
                  {coach.firstName.toUpperCase()} {coach.lastName.toUpperCase()}
                </h1>

                <div className="font-display text-sm tracking-widest" style={{ color: "var(--text-dim)" }}>
                  AGE {coach.age}
                </div>
              </div>

              {/* Season / career record */}
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="font-display text-3xl" style={{ color: "var(--text-primary)" }}>
                    <span style={{ color: "#39ff14" }}>{coach.seasonRecord.wins}</span>
                    <span style={{ color: "var(--text-dim)" }}>-</span>
                    <span style={{ color: "#ff2244" }}>{coach.seasonRecord.losses}</span>
                  </div>
                  <div className="font-display text-[9px] tracking-[0.3em] mt-0.5" style={{ color: "var(--text-dim)" }}>
                    THIS SEASON
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-display text-3xl" style={{ color: "var(--text-secondary)" }}>
                    {coach.careerWins}-{coach.careerLosses}
                  </div>
                  <div className="font-display text-[9px] tracking-[0.3em] mt-0.5" style={{ color: "var(--text-dim)" }}>
                    CAREER
                  </div>
                </div>
              </div>
            </div>

            {coach.quote && (
              <blockquote
                className="mt-6 pt-6 text-sm italic leading-relaxed"
                style={{
                  color: "var(--text-secondary)",
                  borderTop: `1px solid ${primaryColor}20`,
                }}
              >
                &ldquo;{coach.quote}&rdquo;
              </blockquote>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ratings column */}
          <div
            className="lg:col-span-2 card-dark p-6 animate-slide-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <div className="font-display text-xs tracking-[0.4em] mb-6" style={{ color: "var(--text-dim)" }}>
              COACHING RATINGS
            </div>

            {ratings.map((r) => (
              <RatingBar key={r.label} label={r.label} value={r.value} color={r.color} />
            ))}
          </div>

          {/* Details column */}
          <div className="space-y-4 animate-slide-in-up" style={{ animationDelay: "150ms" }}>
            {/* Scheme card */}
            <div className="card-dark p-5">
              <div className="font-display text-[9px] tracking-[0.4em] mb-4" style={{ color: "var(--text-dim)" }}>
                SCHEME
              </div>
              <div className="space-y-3">
                <div>
                  <div className="font-display text-[9px] tracking-[0.2em] mb-1" style={{ color: "var(--text-dim)" }}>
                    OFFENSE
                  </div>
                  <div className="font-display text-base" style={{ color: primaryColor }}>
                    {coach.offScheme ?? "MULTIPLE"}
                  </div>
                </div>
                <div className="h-px" style={{ background: "var(--border)" }} />
                <div>
                  <div className="font-display text-[9px] tracking-[0.2em] mb-1" style={{ color: "var(--text-dim)" }}>
                    DEFENSE
                  </div>
                  <div className="font-display text-base" style={{ color: primaryColor }}>
                    {coach.defScheme ?? "MULTIPLE"}
                  </div>
                </div>
              </div>
            </div>

            {/* Contract card */}
            <div className="card-dark p-5">
              <div className="font-display text-[9px] tracking-[0.4em] mb-4" style={{ color: "var(--text-dim)" }}>
                CONTRACT
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-display text-[10px] tracking-widest" style={{ color: "var(--text-dim)" }}>
                    YEARS LEFT
                  </span>
                  <span className="font-display text-xl" style={{ color: "var(--text-primary)" }}>
                    {coach.contractYears}
                  </span>
                </div>
                <div className="h-px" style={{ background: "var(--border)" }} />
                <div className="flex justify-between items-center">
                  <span className="font-display text-[10px] tracking-widest" style={{ color: "var(--text-dim)" }}>
                    SALARY
                  </span>
                  <span className="font-display text-xl" style={{ color: "var(--gold)" }}>
                    {salaryFormatted}
                  </span>
                </div>
                <div className="h-px" style={{ background: "var(--border)" }} />
                <div className="flex justify-between items-center">
                  <span className="font-display text-[10px] tracking-widest" style={{ color: "var(--text-dim)" }}>
                    REPUTATION
                  </span>
                  <span
                    className="font-display text-xl"
                    style={{ color: ratingColor(coach.reputation) }}
                  >
                    {coach.reputation}
                  </span>
                </div>
              </div>
            </div>

            {/* Hot seat indicator */}
            {coach.hotSeat > 0 && (
              <div
                className="card-dark p-4 animate-slide-in-up"
                style={{
                  borderColor: coach.hotSeat >= 7 ? "#ff2244" : coach.hotSeat >= 4 ? "#ff8c00" : "var(--border)",
                  animationDelay: "200ms",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-display text-[9px] tracking-[0.3em]" style={{ color: "var(--text-dim)" }}>
                    HOT SEAT
                  </div>
                  <div
                    className="font-display text-lg"
                    style={{ color: coach.hotSeat >= 7 ? "#ff2244" : coach.hotSeat >= 4 ? "#ff8c00" : "#39ff14" }}
                  >
                    {coach.hotSeat >= 7 ? "🔥 CRITICAL" : coach.hotSeat >= 4 ? "⚠ ELEVATED" : "STABLE"}
                  </div>
                </div>
                <div
                  className="mt-2 h-1 rounded-[1px] overflow-hidden"
                  style={{ background: "var(--bg-elevated)" }}
                >
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${(coach.hotSeat / 10) * 100}%`,
                      background: coach.hotSeat >= 7 ? "#ff2244" : coach.hotSeat >= 4 ? "#ff8c00" : "#39ff14",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
