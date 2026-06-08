"use client";

import { heightDisplay, positionColor, cn } from "@/lib/utils";

type RecruitInterest = {
  teamId: string;
  interestLevel: number;
  hasVisited: boolean;
};

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
  interests?: RecruitInterest[];
  // personality hints (0-100)
  prestigeDriven: number;
  playingTimeDriven: number;
  homesickness: number;
  championshipDriven: number;
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  UNCOMMITTED:  { label: "UNCOMMITTED",  color: "#9090a8" },
  SOFT_COMMIT:  { label: "SOFT COMMIT",  color: "#ff8c00" },
  COMMITTED:    { label: "COMMITTED",    color: "#39ff14" },
  SIGNED:       { label: "SIGNED",       color: "#ffd700" },
  ENROLLED:     { label: "ENROLLED",     color: "#c9960c" },
};

function PersonalityDot({ value, label }: { value: number; label: string }) {
  const filled = Math.round((value / 100) * 5);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: i < filled ? "var(--gold)" : "var(--border-glow)" }}
          />
        ))}
      </div>
      <span className="text-[8px] tracking-wide font-display" style={{ color: "var(--text-dim)" }}>
        {label}
      </span>
    </div>
  );
}

export default function RecruitCard({
  recruit,
  userTeamId,
  onOffer,
  onScout,
  compact = false,
}: {
  recruit: Recruit;
  userTeamId?: string;
  onOffer?: (id: string) => void;
  onScout?: (id: string) => void;
  compact?: boolean;
}) {
  const accentColor = positionColor(recruit.position);
  const status = STATUS_META[recruit.status] || STATUS_META.UNCOMMITTED;
  const userInterest = recruit.interests?.find((i) => i.teamId === userTeamId);
  const userInterestLevel = userInterest?.interestLevel || 0;

  return (
    <div
      className={cn("card-dark bracket-corners relative", compact ? "p-3" : "p-4")}
      style={{ borderColor: recruit.status === "COMMITTED" || recruit.status === "SIGNED" ? `${accentColor}60` : "var(--border)" }}
    >
      {/* Top color stripe */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: accentColor }} />

      {/* Status badge */}
      <div
        className="absolute top-2 right-2 font-display text-[9px] tracking-widest px-1.5 py-0.5"
        style={{
          background: `${status.color}15`,
          color: status.color,
          border: `1px solid ${status.color}40`,
        }}
      >
        {status.label}
        {recruit.committedTeamName && recruit.status === "COMMITTED" && (
          <span style={{ color: "var(--text-dim)" }}> · {recruit.committedTeamName}</span>
        )}
      </div>

      {/* Stars */}
      <div className={`mb-1 text-sm stars-${recruit.stars}`}>
        {"★".repeat(recruit.stars)}{"☆".repeat(5 - recruit.stars)}
      </div>

      {/* Name */}
      <div className="font-display text-sm leading-none" style={{ color: "var(--text-secondary)" }}>
        {recruit.firstName.toUpperCase()}
      </div>
      <div className={cn("font-display leading-none mb-1", compact ? "text-xl" : "text-2xl")} style={{ color: "var(--text-primary)" }}>
        {recruit.lastName.toUpperCase()}
      </div>

      {/* Position + location */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="font-display text-xs px-1.5 py-0.5 rounded-[1px]"
          style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}50` }}
        >
          {recruit.position}
        </span>
        <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>
          {recruit.hometown}, {recruit.homeState}
        </span>
      </div>

      {/* Rankings */}
      <div className="flex items-center gap-4 mb-3">
        <div className="text-center">
          <div className="font-display text-xl leading-none" style={{ color: "var(--gold)" }}>
            #{recruit.nationalRank}
          </div>
          <div className="text-[9px] tracking-widest" style={{ color: "var(--text-dim)" }}>NATL</div>
        </div>
        <div className="text-center">
          <div className="font-display text-xl leading-none" style={{ color: "var(--text-secondary)" }}>
            #{recruit.positionRank}
          </div>
          <div className="text-[9px] tracking-widest" style={{ color: "var(--text-dim)" }}>POS</div>
        </div>
        <div className="text-center">
          <div className="font-display text-lg leading-none" style={{ color: ratingBadgeColor(recruit.overallRating) }}>
            {recruit.overallRating}
          </div>
          <div className="text-[9px] tracking-widest" style={{ color: "var(--text-dim)" }}>OVR</div>
        </div>
        <div className="text-center">
          <div className="font-display text-lg leading-none" style={{ color: "#00bfff" }}>
            {recruit.speedRating}
          </div>
          <div className="text-[9px] tracking-widest" style={{ color: "var(--text-dim)" }}>SPD</div>
        </div>
      </div>

      {/* Physical */}
      {!compact && (
        <div className="flex gap-3 mb-3 text-[10px]" style={{ color: "var(--text-dim)" }}>
          <span>{heightDisplay(recruit.height)}</span>
          <span>·</span>
          <span>{recruit.weight} lbs</span>
          <span>·</span>
          <span>GPA {recruit.gpa.toFixed(1)}</span>
        </div>
      )}

      <div className="graffiti-divider mb-3" />

      {/* Personality matrix */}
      {!compact && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          <PersonalityDot value={recruit.prestigeDriven}    label="PRESTIGE" />
          <PersonalityDot value={recruit.playingTimeDriven} label="PT DRIVEN" />
          <PersonalityDot value={recruit.homesickness}      label="HOMESICK" />
          <PersonalityDot value={recruit.championshipDriven} label="CHAMPION" />
        </div>
      )}

      {/* User's interest bar */}
      {userTeamId && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-display tracking-wide" style={{ color: "var(--text-dim)" }}>
              YOUR INTEREST LEVEL
            </span>
            <span className="text-[10px] font-[family-name:var(--font-mono)]" style={{ color: userInterestLevel > 60 ? "var(--neon-green)" : "var(--text-dim)" }}>
              {userInterestLevel}/100
            </span>
          </div>
          <div className="stat-bar">
            <div
              className="stat-bar-fill"
              style={{
                width: `${userInterestLevel}%`,
                background: userInterestLevel >= 75
                  ? "linear-gradient(90deg, var(--neon-green), #00ff88)"
                  : userInterestLevel >= 40
                  ? "var(--gold)"
                  : "var(--neon-blue)",
              }}
            />
          </div>
        </div>
      )}

      {/* Action buttons */}
      {(onOffer || onScout) && (
        <div className="flex gap-2 mt-3">
          {onScout && (
            <button
              onClick={() => onScout(recruit.id)}
              className="flex-1 font-display text-xs py-1.5 tracking-widest transition-all hover:opacity-80"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-glow)",
                color: "var(--text-secondary)",
              }}
            >
              SCOUT
            </button>
          )}
          {onOffer && (
            <button
              onClick={() => onOffer(recruit.id)}
              className="flex-1 font-display text-xs py-1.5 tracking-widest transition-all"
              style={{
                background: `${accentColor}20`,
                border: `1px solid ${accentColor}80`,
                color: accentColor,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${accentColor}35`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${accentColor}20`; }}
            >
              OFFER
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ratingBadgeColor(r: number): string {
  if (r >= 90) return "#ffd700";
  if (r >= 80) return "#39ff14";
  if (r >= 70) return "#00bfff";
  return "#ff8c00";
}
