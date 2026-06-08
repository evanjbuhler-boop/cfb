"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PlayerCard from "@/components/PlayerCard";

type Player = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  year: string;
  jerseyNumber?: number | null;
  hometown: string;
  homeState: string;
  height: number;
  weight: number;
  overall: number;
  speed: number;
  strength: number;
  agility: number;
  awareness: number;
  potential: number;
  devTrait: string;
  recruitStars: number;
  morale: number;
  traits: { trait: string }[];
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
  spotlighted?: boolean;
};

type SpotlightPlayer = { playerId: string };

const POSITIONS = ["ALL","QB","RB","WR","TE","OL","DL","LB","CB","S"];
const YEARS_FILTER = ["ALL","FR","SO","JR","SR","GR"];

export default function RosterPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [spotlights, setSpotlights] = useState<SpotlightPlayer[]>([]);
  const [team, setTeam] = useState<{ name: string; abbreviation: string; primaryColor: string } | null>(null);
  const [posFilter, setPosFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [spotlightMode, setSpotlightMode] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/dynasty/${teamId}/roster`).then((r) => r.json()),
      fetch(`/api/dynasty/${teamId}/spotlights`).then((r) => r.json()),
      fetch(`/api/dynasty/${teamId}`).then((r) => r.json()),
    ]).then(([p, s, d]) => {
      if (Array.isArray(p)) setPlayers(p);
      if (Array.isArray(s)) setSpotlights(s.map((sp: { playerId: string }) => ({ playerId: sp.playerId })));
      if (d?.team) setTeam(d.team);
    }).catch(console.error).finally(() => setLoading(false));
  }, [teamId]);

  async function toggleSpotlight(playerId: string) {
    const isSpotlighted = spotlights.some((s) => s.playerId === playerId);
    if (isSpotlighted) {
      await fetch(`/api/dynasty/${teamId}/spotlight/${playerId}`, { method: "DELETE" });
      setSpotlights((prev) => prev.filter((s) => s.playerId !== playerId));
    } else if (spotlights.length < 5) {
      await fetch(`/api/dynasty/${teamId}/spotlight/${playerId}`, { method: "POST" });
      setSpotlights((prev) => [...prev, { playerId }]);
    }
  }

  const filtered = players.filter((p) => {
    if (posFilter !== "ALL" && p.position !== posFilter) return false;
    if (yearFilter !== "ALL" && p.year !== yearFilter) return false;
    return true;
  }).sort((a, b) => b.overall - a.overall);

  const primaryColor = team?.primaryColor || "#c9960c";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 px-6 py-4" style={{ background: "var(--bg-dark)", borderBottom: `1px solid ${primaryColor}30` }}>
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/dynasty/${teamId}`} className="font-display text-sm tracking-widest hover:opacity-60 transition-opacity" style={{ color: "var(--text-dim)" }}>
            ← DYNASTY
          </Link>
          <div className="h-4 w-px" style={{ background: "var(--border)" }} />
          <div className="font-display text-2xl tracking-widest" style={{ color: primaryColor }}>
            ROSTER
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="font-display text-xs" style={{ color: "var(--text-dim)" }}>
              {spotlights.length}/5 SPOTLIGHT
            </span>
            <button
              onClick={() => setSpotlightMode((p) => !p)}
              className="font-display text-xs px-4 py-2 tracking-widest transition-all"
              style={{
                background: spotlightMode ? "rgba(201,150,12,0.2)" : "var(--bg-elevated)",
                border: `1px solid ${spotlightMode ? "var(--gold)" : "var(--border)"}`,
                color: spotlightMode ? "var(--gold)" : "var(--text-secondary)",
              }}
            >
              {spotlightMode ? "DONE" : "SET SPOTLIGHT"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((p) => (
            <button key={p} onClick={() => setPosFilter(p)}
              className="font-display text-xs px-3 py-1.5 tracking-widest transition-all"
              style={{
                background: posFilter===p ? `${primaryColor}20` : "var(--bg-elevated)",
                border: `1px solid ${posFilter===p ? primaryColor : "var(--border)"}`,
                color: posFilter===p ? primaryColor : "var(--text-secondary)",
              }}
            >{p}</button>
          ))}
          <div className="h-6 w-px self-center" style={{ background: "var(--border)" }} />
          {YEARS_FILTER.map((y) => (
            <button key={y} onClick={() => setYearFilter(y)}
              className="font-display text-xs px-3 py-1.5 tracking-widest transition-all"
              style={{
                background: yearFilter===y ? `${primaryColor}20` : "var(--bg-elevated)",
                border: `1px solid ${yearFilter===y ? primaryColor : "var(--border)"}`,
                color: yearFilter===y ? primaryColor : "var(--text-secondary)",
              }}
            >{y}</button>
          ))}
        </div>
      </header>

      <div className="p-6">
        {spotlightMode && (
          <div className="mb-4 p-3 font-display text-sm tracking-widest text-center"
            style={{ background: "rgba(201,150,12,0.1)", border: "1px solid var(--gold-dim)", color: "var(--gold)" }}>
            SELECT UP TO 5 PLAYERS TO SPOTLIGHT THIS SEASON. THEY&apos;LL GET FEATURED COVERAGE & BONUS DEVELOPMENT.
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="font-display text-2xl animate-pulse" style={{ color: primaryColor }}>LOADING ROSTER...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => {
              const isSpotlighted = spotlights.some((s) => s.playerId === p.id);
              return (
                <div key={p.id} className="relative">
                  {spotlightMode && (
                    <button
                      onClick={() => toggleSpotlight(p.id)}
                      className="absolute -top-2 -right-2 z-10 w-7 h-7 font-display text-xs flex items-center justify-center transition-all"
                      style={{
                        background: isSpotlighted ? "var(--gold)" : "var(--bg-elevated)",
                        border: `1px solid ${isSpotlighted ? "var(--gold-bright)" : "var(--border-glow)"}`,
                        color: isSpotlighted ? "#000" : "var(--text-dim)",
                      }}
                    >
                      {isSpotlighted ? "✓" : "+"}
                    </button>
                  )}
                  <PlayerCard
                    player={{ ...p, spotlighted: isSpotlighted }}
                    teamColor={primaryColor}
                    compact={false}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
