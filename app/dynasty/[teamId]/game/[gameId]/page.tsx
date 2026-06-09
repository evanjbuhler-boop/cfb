"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PlayerCard from "@/components/PlayerCard";

type MotivationOption = {
  id: string;
  text: string;
  effect: string;
  boosts: Record<string, number>;
  style: "FIRE" | "CALM" | "UNITY" | "CHALLENGE";
};

type GameData = {
  id: string;
  week: number;
  gameType: string;
  homeTeam: { id: string; name: string; abbreviation: string; primaryColor: string; prestige: number };
  awayTeam: { id: string; name: string; abbreviation: string; primaryColor: string; prestige: number };
  isHome: boolean;
  simulated: boolean;
  homeScore?: number | null;
  awayScore?: number | null;
  headline?: string | null;
  gameNarrative?: string | null;
  mvpPlayer?: {
    id: string; firstName: string; lastName: string; position: string; year: string; overall: number;
    speed: number; strength: number; agility: number; awareness: number;
    potential: number; devTrait: string; recruitStars: number; morale: number;
    height: number; weight: number; hometown: string; homeState: string;
    traits: { trait: string }[];
  } | null;
};

const MOTIVATION_OPTIONS: Record<string, MotivationOption[]> = {
  DEFAULT: [
    {
      id: "fire",
      text: "\"They've been sleeping on us all week. WAKE 'EM UP.\"",
      effect: "+Pass Rush Intensity. Risk: Penalties.",
      boosts: { defRating: 5, offRating: -2 },
      style: "FIRE",
    },
    {
      id: "calm",
      text: "\"Execute the game plan. Trust the process. Let the work speak.\"",
      effect: "+Team Composure. Fewer turnovers.",
      boosts: { turnovers: -2, offRating: 3 },
      style: "CALM",
    },
    {
      id: "unity",
      text: "\"Sixty men. One heartbeat. Every one of you matters today.\"",
      effect: "+All players small boost. Stronger late-game.",
      boosts: { offRating: 2, defRating: 2, morale: 10 },
      style: "UNITY",
    },
    {
      id: "challenge",
      text: "\"Prove you deserve to be here. This is your moment — don't let it pass.\"",
      effect: "+Spotlight player explodes. Boom or bust.",
      boosts: { spotlightBoost: 15, variance: 8 },
      style: "CHALLENGE",
    },
  ],
  RIVALRY: [
    {
      id: "fire",
      text: "\"They remember last year. Make them remember THIS year too.\"",
      effect: "+Intensity across the board. Home crowd roars.",
      boosts: { offRating: 5, defRating: 5 },
      style: "FIRE",
    },
    {
      id: "respect",
      text: "\"Earn their respect. The only way. Play your game.\"",
      effect: "+Sustained performance. No letdowns.",
      boosts: { offRating: 3, defRating: 3, morale: 5 },
      style: "CALM",
    },
    {
      id: "legacy",
      text: "\"They own this rivalry. For now. Change that today.\"",
      effect: "+Senior players get massive boost.",
      boosts: { seniorBoost: 12, morale: 8 },
      style: "CHALLENGE",
    },
  ],
};

const STYLE_META: Record<string, { color: string; label: string }> = {
  FIRE: { color: "#ff2244", label: "HIGH INTENSITY" },
  CALM: { color: "#00bfff", label: "COMPOSURE" },
  UNITY: { color: "#39ff14", label: "TEAM FIRST" },
  CHALLENGE: { color: "#ffd700", label: "BOOM / BUST" },
};

export default function GameWeekPage() {
  const { teamId, gameId } = useParams<{ teamId: string; gameId: string }>();
  const router = useRouter();
  const [game, setGame] = useState<GameData | null>(null);
  const [phase, setPhase] = useState<"LOCKER_ROOM" | "SIMULATING" | "RESULT">("LOCKER_ROOM");
  const [chosen, setChosen] = useState<MotivationOption | null>(null);
  const [simResult, setSimResult] = useState<{ won: boolean; homeScore: number; awayScore: number; headline: string; narrative: string } | null>(null);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    fetch(`/api/dynasty/${teamId}/game/${gameId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) {
          setGame(d);
          if (d.simulated) setPhase("RESULT");
        }
      }).catch(console.error);
  }, [teamId, gameId]);

  async function advanceWeek() {
    setAdvancing(true);
    try {
      const res = await fetch(`/api/dynasty/${teamId}/advance`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        if (data.gameId) {
          router.push(`/dynasty/${teamId}/game/${data.gameId}`);
        } else {
          router.push(`/dynasty/${teamId}`);
        }
      }
    } finally {
      setAdvancing(false);
    }
  }

  async function simulate(option: MotivationOption) {
    setChosen(option);
    setPhase("SIMULATING");

    const res = await fetch(`/api/dynasty/${teamId}/game/${gameId}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivationChoice: option.id, boosts: option.boosts }),
    });
    const data = await res.json();
    if (data.success) {
      setSimResult(data);
      setGame((prev) => prev ? { ...prev, homeScore: data.homeScore, awayScore: data.awayScore, simulated: true, headline: data.headline, mvpPlayer: data.mvpPlayer } : prev);
      setPhase("RESULT");
    }
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-display text-2xl animate-pulse" style={{ color: "var(--gold)" }}>GAME LOADING...</div>
      </div>
    );
  }

  const userTeam = game.isHome ? game.homeTeam : game.awayTeam;
  const opponent = game.isHome ? game.awayTeam : game.homeTeam;
  const options = MOTIVATION_OPTIONS[game.gameType === "RIVALRY" ? "RIVALRY" : "DEFAULT"];

  const userScore = game.isHome ? (game.homeScore ?? 0) : (game.awayScore ?? 0);
  const oppScore = game.isHome ? (game.awayScore ?? 0) : (game.homeScore ?? 0);
  const won = userScore > oppScore;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Atmospheric background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: phase === "RESULT" && won
            ? `radial-gradient(ellipse at center, ${userTeam.primaryColor}15 0%, transparent 60%)`
            : phase === "RESULT"
            ? "radial-gradient(ellipse at center, rgba(255,34,68,0.08) 0%, transparent 60%)"
            : `radial-gradient(ellipse at center, ${userTeam.primaryColor}08 0%, transparent 70%)`,
        }}
      />
      <div className="absolute inset-0 speed-lines pointer-events-none opacity-30" />

      {/* Top nav */}
      <div className="relative z-10 flex items-center gap-4 px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <Link href={`/dynasty/${teamId}`} className="font-display text-xs tracking-widest hover:opacity-60 transition-opacity" style={{ color: "var(--text-dim)" }}>
          ← DYNASTY
        </Link>
        <div className="font-display text-xs tracking-widest" style={{ color: "var(--text-dim)" }}>
          {game.gameType.replace("_", " ")} · WEEK {game.week}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Matchup header */}
        <div className="text-center mb-12">
          <div className="font-display text-xs tracking-[0.5em] mb-6" style={{ color: "var(--text-dim)" }}>
            {game.isHome ? "HOME" : "AWAY"} · WEEK {game.week}
          </div>

          <div className="flex items-center justify-center gap-8">
            <div className="text-right">
              <div className="font-display leading-none" style={{ fontSize: "clamp(3rem,8vw,6rem)", color: userTeam.primaryColor, textShadow: `0 0 40px ${userTeam.primaryColor}60` }}>
                {userTeam.abbreviation}
              </div>
              <div className="font-display text-lg" style={{ color: "var(--text-secondary)" }}>{userTeam.name}</div>
            </div>

            <div className="text-center">
              {phase === "RESULT" ? (
                <div>
                  <div className="font-display text-5xl" style={{ color: "var(--text-primary)" }}>
                    <span style={{ color: userTeam.primaryColor }}>{userScore}</span>
                    {" — "}
                    <span style={{ color: opponent.primaryColor }}>{oppScore}</span>
                  </div>
                  <div
                    className="font-display text-sm tracking-widest mt-2"
                    style={{ color: won ? "var(--neon-green)" : "var(--neon-red)" }}
                  >
                    {won ? "VICTORY" : "DEFEAT"}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-display text-3xl" style={{ color: "var(--text-dim)" }}>VS</div>
                  <div className="font-display text-xs tracking-widest mt-1" style={{ color: "var(--text-dim)" }}>
                    {phase === "SIMULATING" ? "SIMULATING..." : "KICKOFF"}
                  </div>
                </div>
              )}
            </div>

            <div className="text-left">
              <div className="font-display leading-none" style={{ fontSize: "clamp(3rem,8vw,6rem)", color: opponent.primaryColor, textShadow: `0 0 40px ${opponent.primaryColor}60` }}>
                {opponent.abbreviation}
              </div>
              <div className="font-display text-lg" style={{ color: "var(--text-secondary)" }}>{opponent.name}</div>
            </div>
          </div>
        </div>

        {phase === "LOCKER_ROOM" && (
          <div className="animate-slide-in-up">
            <div className="graffiti-divider mb-8" />

            {/* Scene setter */}
            <div className="text-center mb-8">
              <div className="font-display text-3xl mb-3" style={{ color: "var(--text-primary)" }}>
                LOCKER ROOM
              </div>
              <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
                Your team is ready. The crowd is loud. Before you send them out there — what do you say?
              </p>
            </div>

            {/* Motivation choices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((opt, i) => {
                const styleMeta = STYLE_META[opt.style];
                return (
                  <button
                    key={opt.id}
                    onClick={() => simulate(opt)}
                    className="card-dark bracket-corners p-5 text-left transition-all hover:scale-[1.02] animate-slide-in-up"
                    style={{ animationDelay: `${i * 100}ms`, cursor: "pointer" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = styleMeta.color;
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${styleMeta.color}30`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "";
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: styleMeta.color }} />
                    <div
                      className="font-display text-[9px] tracking-[0.3em] mb-3 inline-block px-2 py-0.5"
                      style={{ background: `${styleMeta.color}15`, color: styleMeta.color, border: `1px solid ${styleMeta.color}40` }}
                    >
                      {styleMeta.label}
                    </div>
                    <p className="font-display text-xl leading-snug mb-3" style={{ color: "var(--text-primary)" }}>
                      {opt.text}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {opt.effect}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {phase === "SIMULATING" && (
          <div className="text-center py-12 animate-fade-in">
            <div className="font-display text-4xl mb-4 text-glow-gold" style={{ color: "var(--gold)" }}>
              GAME IN PROGRESS
            </div>
            {chosen && (
              <div className="mb-6 card-dark inline-block px-6 py-3">
                <div className="font-display text-sm" style={{ color: STYLE_META[chosen.style].color }}>
                  {STYLE_META[chosen.style].label}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{chosen.text}</div>
              </div>
            )}
            <div className="flex justify-center gap-2 mt-8">
              {[0,1,2,3,4].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: "var(--gold)", animationDelay: `${i*150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {phase === "RESULT" && (
          <div className="animate-slide-in-up">
            {/* Headline */}
            <div className="text-center mb-8">
              <h2
                className="font-display text-3xl md:text-4xl leading-tight mb-4"
                style={{ color: won ? userTeam.primaryColor : "var(--neon-red)" }}
              >
                {game.headline || (won ? `${userTeam.abbreviation} WINS` : `${opponent.abbreviation} WINS`)}
              </h2>
              {game.gameNarrative && (
                <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {game.gameNarrative}
                </p>
              )}
            </div>

            {/* MVP */}
            {game.mvpPlayer && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1" style={{ background: "var(--gold-dim)" }} />
                  <span className="font-display text-xs tracking-[0.3em] text-glow-gold" style={{ color: "var(--gold)" }}>GAME MVP</span>
                  <div className="h-px flex-1" style={{ background: "var(--gold-dim)" }} />
                </div>
                <div className="max-w-xs mx-auto">
                  <PlayerCard player={game.mvpPlayer} teamColor={userTeam.primaryColor} />
                </div>
              </div>
            )}

            <div className="graffiti-divider mb-8" />

            <div className="flex justify-center gap-4">
              <Link
                href={`/dynasty/${teamId}`}
                className="font-display text-lg px-8 py-3 tracking-widest transition-all bracket-corners"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                ← DYNASTY
              </Link>
              <button
                onClick={advanceWeek}
                disabled={advancing}
                className="font-display text-lg px-8 py-3 tracking-widest transition-all bracket-corners"
                style={{
                  background: advancing ? "var(--bg-elevated)" : `linear-gradient(135deg, ${userTeam.primaryColor}40, ${userTeam.primaryColor}20)`,
                  border: `1px solid ${advancing ? "var(--border)" : userTeam.primaryColor}`,
                  color: advancing ? "var(--text-dim)" : userTeam.primaryColor,
                  cursor: advancing ? "wait" : "pointer",
                  boxShadow: advancing ? "" : `0 0 20px ${userTeam.primaryColor}30`,
                }}
                onMouseEnter={(e) => { if (!advancing) (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${userTeam.primaryColor}50`; }}
                onMouseLeave={(e) => { if (!advancing) (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${userTeam.primaryColor}30`; }}
              >
                {advancing ? "ADVANCING..." : "NEXT WEEK →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
