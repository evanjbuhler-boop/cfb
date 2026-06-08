export const dynamic = "force-dynamic";
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PlayerCard from "@/components/PlayerCard";

type NewsItem = {
  id: string;
  category: string;
  headline: string;
  body: string;
  week: number;
  isBreaking: boolean;
  isNational: boolean;
  player?: { id: string; firstName: string; lastName: string; position: string } | null;
};

type SpotlightPlayer = {
  id: string;
  player: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    year: string;
    overall: number;
    speed: number;
    strength: number;
    agility: number;
    awareness: number;
    potential: number;
    devTrait: string;
    recruitStars: number;
    morale: number;
    height: number;
    weight: number;
    hometown: string;
    homeState: string;
    traits: { trait: string }[];
    jerseyNumber?: number | null;
    throwPower?: number | null;
    throwAccuracy?: number | null;
    catching?: number | null;
    routeRunning?: number | null;
    ballCarrying?: number | null;
    elusiveness?: number | null;
    tackling?: number | null;
    coverage?: number | null;
    runBlocking?: number | null;
    passBlocking?: number | null;
  };
  narrative?: string | null;
  assignedTrait?: string | null;
};

type Dynasty = {
  team: {
    id: string;
    name: string;
    abbreviation: string;
    primaryColor: string;
    secondaryColor: string;
    prestige: number;
    conference: { name: string; abbreviation: string };
  };
  currentYear: number;
  currentWeek: number;
  totalWins: number;
  totalLosses: number;
  titles: number;
  teamSeason?: { wins: number; losses: number; apRank?: number | null };
  upcomingGame?: {
    id: string;
    week: number;
    opponent: { name: string; abbreviation: string; primaryColor: string };
    isHome: boolean;
    gameType: string;
  } | null;
};

const CATEGORY_META: Record<string, { color: string; icon: string }> = {
  GAME_RESULT:        { color: "#39ff14", icon: "🏈" },
  RECRUITING:         { color: "#ffd700", icon: "🎯" },
  COACHING:           { color: "#ff6b35", icon: "📋" },
  PLAYER_DEVELOPMENT: { color: "#00bfff", icon: "📈" },
  TRANSFER:           { color: "#bf5fff", icon: "🔄" },
  INJURY:             { color: "#ff2244", icon: "🩹" },
  RANKINGS:           { color: "#ffd700", icon: "📊" },
  AWARD:              { color: "#ffd700", icon: "🏆" },
  SPOTLIGHT:          { color: "#c9960c", icon: "✦" },
  RIVALRY:            { color: "#ff2244", icon: "⚔" },
};

const NAV_ITEMS = [
  { label: "NEWS",       href: "",           icon: "📰" },
  { label: "ROSTER",     href: "/roster",    icon: "👥" },
  { label: "RECRUITING", href: "/recruiting",icon: "🎯" },
  { label: "SCHEDULE",   href: "/schedule",  icon: "📅" },
  { label: "COACHING",   href: "/coaching",  icon: "📋" },
];

export default function DynastyHub() {
  const { teamId } = useParams<{ teamId: string }>();
  const router = useRouter();
  const [dynasty, setDynasty] = useState<Dynasty | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [spotlights, setSpotlights] = useState<SpotlightPlayer[]>([]);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    Promise.all([
      fetch(`/api/dynasty/${teamId}`).then((r) => r.json()),
      fetch(`/api/dynasty/${teamId}/news`).then((r) => r.json()),
      fetch(`/api/dynasty/${teamId}/spotlights`).then((r) => r.json()),
    ]).then(([d, n, s]) => {
      if (d && !d.error) setDynasty(d);
      if (Array.isArray(n)) setNews(n);
      if (Array.isArray(s)) setSpotlights(s);
    }).catch(console.error);
  }, [teamId]);

  async function advanceWeek() {
    setAdvancing(true);
    try {
      const res = await fetch(`/api/dynasty/${teamId}/advance`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        // Refresh
        const [d, n, s] = await Promise.all([
          fetch(`/api/dynasty/${teamId}`).then((r) => r.json()),
          fetch(`/api/dynasty/${teamId}/news`).then((r) => r.json()),
          fetch(`/api/dynasty/${teamId}/spotlights`).then((r) => r.json()),
        ]);
        if (d && !d.error) setDynasty(d);
        if (Array.isArray(n)) setNews(n);
        if (Array.isArray(s)) setSpotlights(s);
        if (data.gameId) router.push(`/dynasty/${teamId}/game/${data.gameId}`);
      }
    } finally {
      setAdvancing(false);
    }
  }

  if (!dynasty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-display text-2xl text-glow-gold animate-pulse" style={{ color: "var(--gold)" }}>
          LOADING DYNASTY...
        </div>
      </div>
    );
  }

  const { team, currentYear, currentWeek, teamSeason, upcomingGame } = dynasty;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header
        className="relative flex items-center justify-between px-6 py-3 shrink-0"
        style={{
          background: "linear-gradient(135deg, var(--bg-dark) 0%, rgba(0,0,0,0.95) 100%)",
          borderBottom: `1px solid ${team.primaryColor}40`,
          boxShadow: `0 2px 20px ${team.primaryColor}20`,
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${team.primaryColor}, transparent)` }} />

        <div className="flex items-center gap-4">
          {/* Team badge */}
          <div
            className="font-display text-3xl text-glow-gold px-3 py-1"
            style={{
              color: team.primaryColor,
              textShadow: `0 0 20px ${team.primaryColor}80`,
              background: `${team.primaryColor}10`,
              border: `1px solid ${team.primaryColor}40`,
            }}
          >
            {team.abbreviation}
          </div>
          <div>
            <div className="font-display text-lg leading-none" style={{ color: "var(--text-primary)" }}>
              {team.name.toUpperCase()}
            </div>
            <div className="text-xs" style={{ color: "var(--text-dim)" }}>
              {team.conference.abbreviation} · {currentYear} SEASON
            </div>
          </div>
        </div>

        {/* Record + rank */}
        <div className="flex items-center gap-6">
          {teamSeason?.apRank && (
            <div className="text-center">
              <div className="font-display text-2xl" style={{ color: "var(--gold)" }}>
                #{teamSeason.apRank}
              </div>
              <div className="text-[9px] tracking-widest" style={{ color: "var(--text-dim)" }}>AP POLL</div>
            </div>
          )}
          <div className="text-center">
            <div className="font-display text-2xl" style={{ color: "var(--text-primary)" }}>
              {teamSeason?.wins ?? 0}-{teamSeason?.losses ?? 0}
            </div>
            <div className="text-[9px] tracking-widest" style={{ color: "var(--text-dim)" }}>RECORD</div>
          </div>
          <div className="text-center">
            <div className="font-display text-lg" style={{ color: "var(--gold)" }}>WK {currentWeek}</div>
            <div className="text-[9px] tracking-widest" style={{ color: "var(--text-dim)" }}>CURRENT</div>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left nav */}
        <nav
          className="w-[180px] shrink-0 flex flex-col pt-6 gap-1 px-3"
          style={{ borderRight: "1px solid var(--border)", background: "var(--bg-dark)" }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={`/dynasty/${teamId}${item.href}`}
              className="flex items-center gap-3 px-3 py-2.5 font-display text-sm tracking-widest transition-all rounded-[1px]"
              style={{ color: item.href === "" ? team.primaryColor : "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = team.primaryColor;
                (e.currentTarget as HTMLElement).style.background = `${team.primaryColor}10`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = item.href === "" ? team.primaryColor : "var(--text-secondary)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="mt-auto mb-6 px-3">
            <div className="graffiti-divider mb-4" />
            {/* Advance week button */}
            <button
              onClick={advanceWeek}
              disabled={advancing}
              className="w-full font-display text-sm py-3 tracking-widest transition-all bracket-corners"
              style={{
                background: advancing ? "var(--bg-elevated)" : `linear-gradient(135deg, ${team.primaryColor}30, ${team.primaryColor}10)`,
                border: `1px solid ${advancing ? "var(--border)" : team.primaryColor}`,
                color: advancing ? "var(--text-dim)" : team.primaryColor,
                cursor: advancing ? "wait" : "pointer",
              }}
              onMouseEnter={(e) => { if (!advancing) (e.currentTarget as HTMLElement).style.boxShadow = `0 0 15px ${team.primaryColor}40`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
            >
              {advancing ? "SIMULATING..." : upcomingGame ? "GAME WEEK" : "ADVANCE →"}
            </button>
          </div>
        </nav>

        {/* News Feed */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Masthead */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <div className="font-display text-xs tracking-[0.4em]" style={{ color: "var(--text-dim)" }}>
                {team.name.toUpperCase()} PROGRAM REPORT — WEEK {currentWeek}
              </div>
              <div className="font-[family-name:var(--font-mono)] text-[10px]" style={{ color: "var(--text-dim)" }}>
                {currentYear}
              </div>
            </div>
            <div className="graffiti-divider" />
          </div>

          {/* Upcoming game banner */}
          {upcomingGame && (
            <Link
              href={`/dynasty/${teamId}/game/${upcomingGame.id}`}
              className="block mb-6 card-dark bracket-corners p-4 transition-all hover:scale-[1.005]"
              style={{ borderColor: team.primaryColor }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${team.primaryColor}30`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${team.primaryColor}, ${upcomingGame.opponent.primaryColor})` }} />
              <div className="font-display text-[9px] tracking-[0.4em] mb-2" style={{ color: "var(--text-dim)" }}>
                {upcomingGame.gameType === "REGULAR_SEASON" ? `WEEK ${upcomingGame.week}` : upcomingGame.gameType.replace("_", " ")}
              </div>
              <div className="flex items-center gap-4">
                <div className="font-display text-3xl" style={{ color: team.primaryColor }}>{team.abbreviation}</div>
                <div className="font-display text-xl" style={{ color: "var(--text-dim)" }}>
                  {upcomingGame.isHome ? "vs" : "@"}
                </div>
                <div className="font-display text-3xl" style={{ color: upcomingGame.opponent.primaryColor }}>
                  {upcomingGame.opponent.abbreviation}
                </div>
                <div className="ml-auto font-display text-sm tracking-widest" style={{ color: "var(--gold)" }}>
                  GAME WEEK →
                </div>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main news column */}
            <div className="lg:col-span-2 space-y-3">
              {news.length === 0 ? (
                <div className="card-dark p-8 text-center">
                  <div className="font-display text-xl mb-2" style={{ color: "var(--text-dim)" }}>
                    NO NEWS YET
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                    Advance the week to generate program activity.
                  </p>
                </div>
              ) : (
                news.map((item, i) => {
                  const meta = CATEGORY_META[item.category] || { color: "#888", icon: "·" };
                  return (
                    <article
                      key={item.id}
                      className={`card-dark p-4 transition-all animate-slide-in-up ${item.isBreaking ? "breaking-pulse" : ""}`}
                      style={{
                        animationDelay: `${i * 50}ms`,
                        borderColor: item.isBreaking ? "#ff2244" : "var(--border)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs">{meta.icon}</span>
                        <span
                          className="font-display text-[9px] tracking-[0.3em] px-1.5 py-0.5"
                          style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30` }}
                        >
                          {item.category.replace("_", " ")}
                        </span>
                        {item.isBreaking && (
                          <span className="font-display text-[9px] tracking-widest px-1.5 py-0.5" style={{ background: "rgba(255,34,68,0.2)", color: "#ff2244", border: "1px solid #ff224450" }}>
                            BREAKING
                          </span>
                        )}
                        <span className="ml-auto text-[9px] font-[family-name:var(--font-mono)]" style={{ color: "var(--text-dim)" }}>
                          WK {item.week}
                        </span>
                      </div>
                      <h3 className="font-display text-base leading-tight mb-1.5" style={{ color: "var(--text-primary)" }}>
                        {item.headline}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {item.body}
                      </p>
                    </article>
                  );
                })
              )}
            </div>

            {/* Spotlight sidebar */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px flex-1" style={{ background: "var(--gold-dim)" }} />
                <span className="font-display text-xs tracking-[0.3em] text-glow-gold" style={{ color: "var(--gold)" }}>
                  SPOTLIGHT
                </span>
                <div className="h-px flex-1" style={{ background: "var(--gold-dim)" }} />
              </div>

              {spotlights.length === 0 ? (
                <div className="card-dark p-4 text-center">
                  <div className="font-display text-sm mb-2" style={{ color: "var(--text-dim)" }}>
                    NO SPOTLIGHT SET
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--text-dim)" }}>
                    Go to your roster to designate spotlight players for this season.
                  </p>
                  <Link
                    href={`/dynasty/${teamId}/roster`}
                    className="inline-block mt-3 font-display text-xs tracking-widest px-4 py-2 transition-all"
                    style={{ border: `1px solid ${team.primaryColor}`, color: team.primaryColor, background: `${team.primaryColor}10` }}
                  >
                    SET SPOTLIGHT →
                  </Link>
                </div>
              ) : (
                spotlights.map((s) => (
                  <div key={s.id}>
                    <PlayerCard
                      player={{ ...s.player, spotlighted: true }}
                      teamColor={team.primaryColor}
                      compact={false}
                      onClick={() => router.push(`/dynasty/${teamId}/roster`)}
                    />
                    {s.narrative && (
                      <div
                        className="mt-1 px-3 py-2 text-[11px] italic leading-relaxed"
                        style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", borderLeft: `2px solid ${team.primaryColor}` }}
                      >
                        {s.narrative}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
