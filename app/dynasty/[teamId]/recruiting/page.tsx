export const dynamic = "force-dynamic";
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RecruitCard from "@/components/RecruitCard";
import Link from "next/link";

type Recruit = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  hometown: string;
  homeState: string;
  height: number;
  weight: number;
  stars: number;
  nationalRank: number;
  positionRank: number;
  overallRating: number;
  speedRating: number;
  athleticismScore: number;
  devTrait: string;
  status: string;
  committedTeamName?: string | null;
  gpa: number;
  prestigeDriven: number;
  playingTimeDriven: number;
  homesickness: number;
  championshipDriven: number;
  interests?: { teamId: string; interestLevel: number; hasVisited: boolean }[];
};

const POSITIONS = ["ALL", "QB", "RB", "WR", "TE", "OL", "DL", "LB", "CB", "S"];
const STARS_FILTER = ["ALL", "5★", "4★", "3★"];

export default function RecruitingPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [loading, setLoading] = useState(true);
  const [posFilter, setPosFilter] = useState("ALL");
  const [starsFilter, setStarsFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [team, setTeam] = useState<{ name: string; abbreviation: string; primaryColor: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/dynasty/${teamId}/recruits`).then((r) => r.json()),
      fetch(`/api/dynasty/${teamId}`).then((r) => r.json()),
    ]).then(([r, d]) => {
      if (Array.isArray(r)) setRecruits(r);
      if (d?.team) setTeam(d.team);
    }).catch(console.error).finally(() => setLoading(false));
  }, [teamId]);

  async function offerRecruit(recruitId: string) {
    await fetch(`/api/dynasty/${teamId}/recruits/${recruitId}/offer`, { method: "POST" });
    const updated = await fetch(`/api/dynasty/${teamId}/recruits`).then((r) => r.json());
    if (Array.isArray(updated)) setRecruits(updated);
  }

  async function scoutRecruit(recruitId: string) {
    await fetch(`/api/dynasty/${teamId}/recruits/${recruitId}/scout`, { method: "POST" });
    const updated = await fetch(`/api/dynasty/${teamId}/recruits`).then((r) => r.json());
    if (Array.isArray(updated)) setRecruits(updated);
  }

  const filtered = recruits.filter((r) => {
    if (posFilter !== "ALL" && r.position !== posFilter) return false;
    if (starsFilter !== "ALL" && r.stars !== parseInt(starsFilter)) return false;
    if (search && !`${r.firstName} ${r.lastName} ${r.hometown}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const primaryColor = team?.primaryColor || "#c9960c";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 px-6 py-4" style={{ background: "var(--bg-dark)", borderBottom: `1px solid ${primaryColor}30` }}>
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/dynasty/${teamId}`} className="font-display text-sm tracking-widest transition-opacity hover:opacity-60" style={{ color: "var(--text-dim)" }}>
            ← DYNASTY
          </Link>
          <div className="h-4 w-px" style={{ background: "var(--border)" }} />
          <div className="font-display text-2xl tracking-widest text-glow-gold" style={{ color: primaryColor }}>
            RECRUITING BOARD
          </div>
          <div className="ml-auto font-display text-sm" style={{ color: "var(--text-dim)" }}>
            {recruits.filter(r => r.status === "COMMITTED").length} COMMITS · {recruits.filter(r => r.status === "UNCOMMITTED").length} OPEN
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH RECRUITS..."
            className="font-display text-xs px-3 py-2 w-48 tracking-widest"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-glow)",
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
          {POSITIONS.map((p) => (
            <button
              key={p}
              onClick={() => setPosFilter(p)}
              className="font-display text-xs px-3 py-2 tracking-widest transition-all"
              style={{
                background: posFilter === p ? `${primaryColor}20` : "var(--bg-elevated)",
                border: `1px solid ${posFilter === p ? primaryColor : "var(--border)"}`,
                color: posFilter === p ? primaryColor : "var(--text-secondary)",
              }}
            >
              {p}
            </button>
          ))}
          <div className="h-8 w-px self-center" style={{ background: "var(--border)" }} />
          {STARS_FILTER.map((s) => (
            <button
              key={s}
              onClick={() => setStarsFilter(s === "ALL" ? "ALL" : s.charAt(0))}
              className="font-display text-xs px-3 py-2 tracking-widest transition-all"
              style={{
                background: starsFilter === (s === "ALL" ? "ALL" : s.charAt(0)) ? "rgba(201,150,12,0.2)" : "var(--bg-elevated)",
                border: `1px solid ${starsFilter === (s === "ALL" ? "ALL" : s.charAt(0)) ? "var(--gold)" : "var(--border)"}`,
                color: starsFilter === (s === "ALL" ? "ALL" : s.charAt(0)) ? "var(--gold)" : "var(--text-secondary)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="font-display text-2xl animate-pulse" style={{ color: "var(--gold)" }}>
              LOADING BOARD...
            </div>
          </div>
        ) : (
          <>
            <div className="font-display text-xs tracking-[0.3em] mb-4" style={{ color: "var(--text-dim)" }}>
              SHOWING {filtered.length} OF {recruits.length} RECRUITS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((r) => (
                <RecruitCard
                  key={r.id}
                  recruit={r}
                  userTeamId={teamId}
                  onOffer={offerRecruit}
                  onScout={scoutRecruit}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
