export const dynamic = "force-dynamic";
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TAGLINES = [
  "EVERY RECRUIT. EVERY GAME. EVERY DYNASTY.",
  "BUILD IT FROM THE GROUND UP.",
  "RECRUIT THE BEST. COACH THE REST.",
  "THE CAROUSEL NEVER STOPS.",
];

type TeamEntry = {
  id: string;
  name: string;
  abbreviation: string;
  prestige: number;
  primaryColor: string;
  secondaryColor: string;
  conference: { abbreviation: string };
};

export default function LandingPage() {
  const router = useRouter();
  const [tagline, setTagline] = useState(0);
  const [teams, setTeams] = useState<TeamEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTagline((p) => (p + 1) % TAGLINES.length), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch("/api/teams").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setTeams(d); }).catch(() => {});
  }, []);

  async function initWorld() {
    setSeeding(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      const r = await fetch("/api/teams");
      const d = await r.json();
      if (Array.isArray(d)) setTeams(d);
    } finally {
      setSeeding(false);
    }
  }

  async function startDynasty(teamId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/dynasty/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      if (res.ok) router.push(`/dynasty/${teamId}`);
    } finally {
      setLoading(false);
    }
  }

  const elite = teams.filter((t) => t.prestige >= 9);
  const good  = teams.filter((t) => t.prestige >= 7 && t.prestige < 9);
  const mid   = teams.filter((t) => t.prestige < 7);

  return (
    <div className="min-h-screen relative overflow-hidden speed-lines">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,5,10,0.8)_100%)] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9960c] to-transparent" />

      <div className="relative z-10 flex flex-col items-center pt-16 pb-24 px-4">
        <div className="text-center mb-2 animate-fade-in">
          <div className="font-display leading-none text-glow-gold" style={{ color: "var(--gold)", fontSize: "clamp(3rem,12vw,9rem)" }}>
            GRIDIRON
          </div>
          <div className="font-display leading-none tracking-[0.3em]" style={{ color: "var(--text-secondary)", fontSize: "clamp(1.5rem,6vw,4rem)" }}>
            DYNASTY
          </div>
        </div>

        <div className="graffiti-divider w-64 my-6" />

        <div key={tagline} className="font-display text-sm tracking-widest mb-12 animate-fade-in" style={{ color: "var(--text-dim)" }}>
          {TAGLINES[tagline]}
        </div>

        {teams.length === 0 ? (
          <div className="text-center animate-slide-in-up">
            <div className="font-display text-2xl mb-4" style={{ color: "var(--gold)" }}>
              INITIALIZE YOUR WORLD
            </div>
            <p className="text-sm mb-8 max-w-sm" style={{ color: "var(--text-secondary)" }}>
              First launch detected. Seeds 130+ FBS programs with full rosters, coaching staffs, and a recruiting class.
            </p>
            <button
              onClick={initWorld}
              disabled={seeding}
              className="font-display text-xl px-12 py-4 bracket-corners tracking-widest transition-all"
              style={{
                background: "linear-gradient(135deg, var(--bg-elevated), var(--bg-card))",
                border: "1px solid var(--gold)",
                color: seeding ? "var(--text-dim)" : "var(--gold)",
                cursor: seeding ? "wait" : "pointer",
              }}
              onMouseEnter={(e) => { if (!seeding) (e.currentTarget as HTMLElement).classList.add("glow-gold"); }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).classList.remove("glow-gold"); }}
            >
              {seeding ? "BUILDING WORLD..." : "START A DYNASTY"}
            </button>
          </div>
        ) : (
          <div className="w-full max-w-5xl animate-slide-in-up">
            <div className="font-display text-2xl text-center mb-8 tracking-widest" style={{ color: "var(--text-secondary)" }}>
              CHOOSE YOUR PROGRAM
            </div>

            {elite.length > 0 && (
              <TeamGroup label="ELITE PROGRAMS" labelColor="var(--gold)" lineColor="var(--gold-dim)" teams={elite} onSelect={startDynasty} loading={loading} />
            )}
            {good.length > 0 && (
              <TeamGroup label="CONTENDERS" labelColor="var(--text-secondary)" lineColor="var(--border-glow)" teams={good} onSelect={startDynasty} loading={loading} />
            )}
            {mid.length > 0 && (
              <TeamGroup label="BUILDERS & MID-MAJORS" labelColor="var(--text-dim)" lineColor="var(--border)" teams={mid} onSelect={startDynasty} loading={loading} />
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border-glow)] to-transparent" />
    </div>
  );
}

function TeamGroup({
  label, labelColor, lineColor, teams, onSelect, loading,
}: {
  label: string;
  labelColor: string;
  lineColor: string;
  teams: TeamEntry[];
  onSelect: (id: string) => void;
  loading: boolean;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-px flex-1" style={{ background: lineColor }} />
        <span className="font-display text-xs tracking-[0.3em]" style={{ color: labelColor }}>{label}</span>
        <div className="h-px flex-1" style={{ background: lineColor }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {teams.map((t) => (
          <TeamTile key={t.id} team={t} onClick={() => onSelect(t.id)} loading={loading} />
        ))}
      </div>
    </div>
  );
}

function TeamTile({ team, onClick, loading }: { team: TeamEntry; onClick: () => void; loading: boolean }) {
  const stars = team.prestige >= 9 ? 5 : team.prestige >= 7 ? 4 : team.prestige >= 5 ? 3 : 2;
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="card-dark group relative p-3 text-left transition-all duration-200 hover:scale-[1.02]"
      style={{ cursor: loading ? "not-allowed" : "pointer" }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = team.primaryColor;
        el.style.boxShadow = `0 0 15px ${team.primaryColor}40, 0 0 30px ${team.primaryColor}15`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border)";
        el.style.boxShadow = "";
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: team.primaryColor }} />
      <div className="font-display text-lg leading-none mb-1" style={{ color: team.primaryColor }}>
        {team.abbreviation}
      </div>
      <div className="text-xs font-semibold truncate mb-1" style={{ color: "var(--text-primary)" }}>
        {team.name}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>{team.conference.abbreviation}</span>
        <span className={`text-[10px] stars-${stars}`}>{"★".repeat(stars)}</span>
      </div>
    </button>
  );
}
