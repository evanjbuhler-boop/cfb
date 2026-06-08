"use client";

import { ratingColor, heightDisplay, positionColor, devTraitLabel, cn } from "@/lib/utils";

type Trait = { trait: string };

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
  traits: Trait[];
  spotlighted?: boolean;
  clutch?: number | null;
  // position stats (optional)
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

const YEAR_LABEL: Record<string, string> = {
  FR: "FRESHMAN",
  SO: "SOPHOMORE",
  JR: "JUNIOR",
  SR: "SENIOR",
  GR: "GRADUATE",
};

const TRAIT_META: Record<string, { label: string; color: string; icon: string }> = {
  COACHES_FAVORITE: { label: "Coach's Fav", color: "#ff6b35", icon: "❤" },
  CLUTCH_GENE:      { label: "Clutch",      color: "#ffd700", icon: "⚡" },
  FILM_ROOM_RAT:    { label: "Film Rat",    color: "#00bfff", icon: "📽" },
  MOTOR:            { label: "Motor",       color: "#39ff14", icon: "🔥" },
  SHOWBOAT:         { label: "Showboat",    color: "#bf5fff", icon: "✦" },
  LOCKER_ROOM_LEADER:{ label: "Leader",     color: "#ffd700", icon: "👑" },
  RAW:              { label: "Raw",         color: "#888",    icon: "⬦" },
  COMEBACK_KID:     { label: "Comeback",    color: "#39ff14", icon: "↑" },
  WORKHORSE:        { label: "Workhorse",   color: "#ff8c00", icon: "⚙" },
  ELUSIVE_BACK:     { label: "Elusive",     color: "#00bfff", icon: "〜" },
  FIELD_GENERAL:    { label: "Field Gen.",  color: "#ffd700", icon: "★" },
  HOT_HEAD:         { label: "Hot Head",    color: "#ff2244", icon: "⚠" },
  POSSESSION_RECEIVER:{ label: "Possession", color: "#c0c0c0", icon: "○" },
  PRESSURE_COOKER:  { label: "Pressure",   color: "#ff2244", icon: "▲" },
};

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] w-16 shrink-0 font-[family-name:var(--font-mono)] tracking-wide" style={{ color: "var(--text-dim)" }}>
        {label}
      </span>
      <div className="stat-bar flex-1">
        <div
          className="stat-bar-fill"
          style={{ width: `${((value - 40) / 59) * 100}%`, background: color }}
        />
      </div>
      <span className="text-[11px] w-6 text-right font-[family-name:var(--font-mono)] font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function PositionStats({ player }: { player: Player }) {
  const pos = player.position;
  if (pos === "QB") return (
    <>
      <StatBar label="THP"  value={player.throwPower    || 60} color="#ff6b35" />
      <StatBar label="THA"  value={player.throwAccuracy || 60} color="#ff6b35" />
      <StatBar label="CLT"  value={player.clutch         || 60} color="#ffd700" />
    </>
  );
  if (pos === "RB") return (
    <>
      <StatBar label="CAR"  value={player.ballCarrying   || 60} color="#4ecdc4" />
      <StatBar label="ELU"  value={player.elusiveness    || 60} color="#4ecdc4" />
    </>
  );
  if (pos === "WR" || pos === "TE") return (
    <>
      <StatBar label="CTH"  value={player.catching       || 60} color="#45b7d1" />
      <StatBar label="RTE"  value={player.routeRunning   || 60} color="#45b7d1" />
    </>
  );
  if (pos === "DL" || pos === "LB") return (
    <>
      <StatBar label="TAK"  value={player.tackling       || 60} color="#ff6b6b" />
    </>
  );
  if (pos === "CB" || pos === "S") return (
    <>
      <StatBar label="COV"  value={player.coverage       || 60} color="#fc5c65" />
    </>
  );
  if (pos === "OL") return (
    <>
      <StatBar label="RBL"  value={player.runBlocking    || 60} color="#dda0dd" />
      <StatBar label="PBL"  value={player.passBlocking   || 60} color="#dda0dd" />
    </>
  );
  return null;
}

export default function PlayerCard({
  player,
  teamColor,
  compact = false,
  onClick,
}: {
  player: Player;
  teamColor?: string;
  compact?: boolean;
  onClick?: () => void;
}) {
  const accentColor = teamColor || positionColor(player.position);
  const ovr = player.overall;
  const ovrColor = ratingColor(ovr);
  const { label: devLabel, color: devColor } = devTraitLabel(player.devTrait);
  const isElite = player.devTrait === "ELITE";

  return (
    <div
      className={cn(
        "card-dark bracket-corners relative transition-all duration-200 select-none",
        player.spotlighted && "ring-1",
        onClick && "cursor-pointer hover:scale-[1.02]",
        compact ? "p-3" : "p-4",
      )}
      style={{
        borderColor: player.spotlighted ? "var(--gold)" : "var(--border)",
      }}
      onClick={onClick}
    >
      {/* Top color stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: isElite
            ? "linear-gradient(90deg, var(--gold-dim), var(--gold-bright), var(--gold-dim))"
            : accentColor,
        }}
      />

      {/* Spotlight indicator */}
      {player.spotlighted && (
        <div
          className="absolute top-2 right-2 font-display text-[9px] tracking-widest px-1.5 py-0.5"
          style={{ background: "rgba(201,150,12,0.15)", color: "var(--gold)", border: "1px solid var(--gold-dim)" }}
        >
          SPOTLIGHT
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          {/* Jersey number */}
          {player.jerseyNumber && (
            <div
              className="font-display text-[40px] leading-none absolute opacity-[0.06] -top-2 right-4 pointer-events-none"
              style={{ color: accentColor, fontSize: compact ? "2rem" : "3.5rem" }}
            >
              {player.jerseyNumber}
            </div>
          )}

          {/* Name */}
          <div className="font-display text-sm tracking-wide leading-none mb-0.5" style={{ color: "var(--text-secondary)" }}>
            {player.firstName.toUpperCase()}
          </div>
          <div className={cn("font-display leading-none", compact ? "text-xl" : "text-2xl")} style={{ color: "var(--text-primary)" }}>
            {player.lastName.toUpperCase()}
          </div>

          {/* Position + Year */}
          <div className="flex items-center gap-2 mt-1">
            <span
              className="font-display text-xs px-1.5 py-0.5 rounded-[1px]"
              style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}50` }}
            >
              {player.position}
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>
              {YEAR_LABEL[player.year] || player.year}
            </span>
          </div>
        </div>

        {/* OVR badge */}
        <div className="text-right">
          <div
            className={cn("font-display leading-none", isElite ? "rating-elite" : "")}
            style={{
              fontSize: compact ? "2rem" : "2.5rem",
              color: isElite ? undefined : ovrColor,
              textShadow: isElite ? undefined : `0 0 15px ${ovrColor}80`,
            }}
          >
            {ovr}
          </div>
          <div className="text-[9px] tracking-widest font-display" style={{ color: "var(--text-dim)" }}>OVR</div>

          {/* Dev trait */}
          <div
            className="font-display text-[9px] tracking-[0.2em] mt-1"
            style={{ color: devColor }}
          >
            {devLabel}
          </div>
        </div>
      </div>

      {/* Physical */}
      {!compact && (
        <div className="flex items-center gap-3 mb-3 text-[10px]" style={{ color: "var(--text-dim)" }}>
          <span>{heightDisplay(player.height)}</span>
          <span style={{ color: "var(--border-glow)" }}>·</span>
          <span>{player.weight} lbs</span>
          <span style={{ color: "var(--border-glow)" }}>·</span>
          <span>{player.hometown}, {player.homeState}</span>
        </div>
      )}

      {/* Divider */}
      <div className="graffiti-divider mb-3" />

      {/* Core stats */}
      <div className="space-y-1.5 mb-3">
        <StatBar label="SPD"  value={player.speed}    color={ratingColor(player.speed)} />
        <StatBar label="STR"  value={player.strength} color={ratingColor(player.strength)} />
        <StatBar label="AGI"  value={player.agility}  color={ratingColor(player.agility)} />
        <StatBar label="AWR"  value={player.awareness} color={ratingColor(player.awareness)} />
        <PositionStats player={player} />
      </div>

      {/* Traits */}
      {player.traits.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {player.traits.slice(0, 3).map((t) => {
            const meta = TRAIT_META[t.trait] || { label: t.trait, color: "#888", icon: "·" };
            return (
              <span
                key={t.trait}
                className="text-[9px] font-display tracking-wide px-1.5 py-0.5"
                style={{
                  background: `${meta.color}15`,
                  color: meta.color,
                  border: `1px solid ${meta.color}40`,
                }}
              >
                {meta.icon} {meta.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Stars + morale row */}
      {!compact && (
        <div className="flex items-center justify-between mt-3">
          <span className={`text-xs stars-${player.recruitStars}`}>
            {"★".repeat(player.recruitStars)}{"☆".repeat(5 - player.recruitStars)}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>MORALE</span>
            <div className="stat-bar w-16">
              <div
                className="stat-bar-fill"
                style={{
                  width: `${player.morale}%`,
                  background: player.morale >= 70 ? "var(--neon-green)" : player.morale >= 40 ? "#ff8c00" : "var(--neon-red)",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
