import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function rng(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function weightedRandom(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export function ratingColor(rating: number): string {
  if (rating >= 90) return "#FFD700";
  if (rating >= 80) return "#39FF14";
  if (rating >= 70) return "#00BFFF";
  if (rating >= 60) return "#FF8C00";
  return "#FF4444";
}

export function starsToColor(stars: number): string {
  if (stars === 5) return "#FFD700";
  if (stars === 4) return "#C0C0C0";
  if (stars === 3) return "#CD7F32";
  return "#666";
}

export function heightDisplay(inches: number): string {
  const ft = Math.floor(inches / 12);
  const ins = inches % 12;
  return `${ft}'${ins}"`;
}

export function positionColor(pos: string): string {
  const map: Record<string, string> = {
    QB: "#FF6B35",
    RB: "#4ECDC4",
    WR: "#45B7D1",
    TE: "#96CEB4",
    OL: "#DDA0DD",
    DL: "#FF6B6B",
    LB: "#F7B731",
    CB: "#FD9644",
    S: "#FC5C65",
    K: "#A8E6CF",
    P: "#A8E6CF",
    ATH: "#ffffff",
  };
  return map[pos] || "#ffffff";
}

export function devTraitLabel(trait: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    ELITE: { label: "ELITE", color: "#FFD700" },
    STAR: { label: "STAR", color: "#C0C0C0" },
    IMPACT: { label: "IMPACT", color: "#39FF14" },
    NORMAL: { label: "NORMAL", color: "#888" },
  };
  return map[trait] || { label: trait, color: "#888" };
}
