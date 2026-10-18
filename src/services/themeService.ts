/**
 * themeService.ts
 * Sistema Oficial de Customização Visual, Temas Dinâmicos e Borda LED RGB
 * Permite alteração instantânea de paleta cromática e controle total de iluminação de borda
 */

import { AppTheme } from '../types';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  tagline: string;
  desc: string;
  gradient: string;
  previewBg: string;
  accentColor: string;
  glowColor: string;
  selectionClass: string;
  badgeBg: string;
  badgeText: string;
  borderActive: string;
  ambientLedGradient: {
    left: string;
    right: string;
    top: string;
    bottom: string;
    glowShadow: string;
  };
}

export const THEME_REGISTRY: Record<AppTheme, ThemeConfig> = {
  'neon-blue': {
    id: 'neon-blue',
    name: 'Azul Neon',
    tagline: 'Clássico Zach AI',
    desc: 'Ciano elétrico e azul tecnológico futurista de alta densidade.',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    previewBg: 'bg-cyan-500',
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.7)',
    selectionClass: 'selection:bg-cyan-500/30 selection:text-cyan-200',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30',
    badgeText: 'text-cyan-400',
    borderActive: 'border-cyan-500 shadow-cyan-950/40',
    ambientLedGradient: {
      left: 'bg-gradient-to-b from-cyan-400 via-blue-500 to-teal-400',
      right: 'bg-gradient-to-b from-teal-400 via-blue-500 to-cyan-400',
      top: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-400',
      bottom: 'bg-gradient-to-r from-teal-400 via-blue-500 to-cyan-400',
      glowShadow: 'shadow-[0_0_12px_rgba(6,182,212,0.7)]',
    },
  },
  'cyber-purple': {
    id: 'cyber-purple',
    name: 'Roxo Cyberpunk',
    tagline: 'Estética Night City',
    desc: 'Violeta vibrante, fúcsia e índigo profundo para programadores noturnos.',
    gradient: 'from-purple-600 via-fuchsia-500 to-indigo-500',
    previewBg: 'bg-purple-500',
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.7)',
    selectionClass: 'selection:bg-purple-500/30 selection:text-purple-200',
    badgeBg: 'bg-purple-500/10 border-purple-500/30',
    badgeText: 'text-purple-400',
    borderActive: 'border-purple-500 shadow-purple-950/40',
    ambientLedGradient: {
      left: 'bg-gradient-to-b from-purple-500 via-fuchsia-500 to-indigo-400',
      right: 'bg-gradient-to-b from-indigo-400 via-fuchsia-500 to-purple-500',
      top: 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-400',
      bottom: 'bg-gradient-to-r from-indigo-400 via-fuchsia-500 to-purple-500',
      glowShadow: 'shadow-[0_0_12px_rgba(168,85,247,0.7)]',
    },
  },
  'emerald-green': {
    id: 'emerald-green',
    name: 'Verde Esmeralda',
    tagline: 'Terminal Bio-Sintético',
    desc: 'Estilo terminal bio-sintético com menta, esmeralda e neon verde.',
    gradient: 'from-emerald-500 via-teal-400 to-green-500',
    previewBg: 'bg-emerald-500',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.7)',
    selectionClass: 'selection:bg-emerald-500/30 selection:text-emerald-200',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
    badgeText: 'text-emerald-400',
    borderActive: 'border-emerald-500 shadow-emerald-950/40',
    ambientLedGradient: {
      left: 'bg-gradient-to-b from-emerald-400 via-teal-400 to-green-500',
      right: 'bg-gradient-to-b from-green-500 via-teal-400 to-emerald-400',
      top: 'bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500',
      bottom: 'bg-gradient-to-r from-green-500 via-teal-400 to-emerald-400',
      glowShadow: 'shadow-[0_0_12px_rgba(16,185,129,0.7)]',
    },
  },
  'crimson-lava': {
    id: 'crimson-lava',
    name: 'Vermelho Crimson / Lava',
    tagline: 'Cyberpunk Avermelhado',
    desc: 'Estética cyberpunk avermelhada vibrante com tons quentes de magma e rubi.',
    gradient: 'from-red-600 via-rose-500 to-orange-600',
    previewBg: 'bg-red-500',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.7)',
    selectionClass: 'selection:bg-red-500/30 selection:text-red-200',
    badgeBg: 'bg-red-500/10 border-red-500/30',
    badgeText: 'text-red-400',
    borderActive: 'border-red-500 shadow-red-950/40',
    ambientLedGradient: {
      left: 'bg-gradient-to-b from-red-500 via-rose-500 to-amber-500',
      right: 'bg-gradient-to-b from-amber-500 via-rose-500 to-red-500',
      top: 'bg-gradient-to-r from-red-500 via-rose-500 to-amber-500',
      bottom: 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-500',
      glowShadow: 'shadow-[0_0_12px_rgba(239,68,68,0.7)]',
    },
  },
  'amber-sunset': {
    id: 'amber-sunset',
    name: 'Laranja Âmbar / Sunset',
    tagline: 'Iluminação Solar & Magma',
    desc: 'Tons amarelados e alaranjados de iluminação quentes e acolhedores.',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    previewBg: 'bg-orange-500',
    accentColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.7)',
    selectionClass: 'selection:bg-orange-500/30 selection:text-orange-200',
    badgeBg: 'bg-orange-500/10 border-orange-500/30',
    badgeText: 'text-orange-400',
    borderActive: 'border-orange-500 shadow-orange-950/40',
    ambientLedGradient: {
      left: 'bg-gradient-to-b from-orange-500 via-amber-400 to-yellow-400',
      right: 'bg-gradient-to-b from-yellow-400 via-amber-400 to-orange-500',
      top: 'bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400',
      bottom: 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500',
      glowShadow: 'shadow-[0_0_12px_rgba(249,115,22,0.7)]',
    },
  },
  'gold-volts': {
    id: 'gold-volts',
    name: 'Amarelo Ouro / Volts',
    tagline: 'Neon Elétrico Intenso',
    desc: 'Estética neon elétrica intensa com tons dourados e voltagem brilhante.',
    gradient: 'from-yellow-400 via-amber-400 to-lime-400',
    previewBg: 'bg-yellow-400',
    accentColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.7)',
    selectionClass: 'selection:bg-yellow-500/30 selection:text-yellow-200',
    badgeBg: 'bg-yellow-500/10 border-yellow-500/30',
    badgeText: 'text-yellow-400',
    borderActive: 'border-yellow-400 shadow-yellow-950/40',
    ambientLedGradient: {
      left: 'bg-gradient-to-b from-yellow-300 via-amber-400 to-lime-300',
      right: 'bg-gradient-to-b from-lime-300 via-amber-400 to-yellow-300',
      top: 'bg-gradient-to-r from-yellow-300 via-amber-400 to-lime-300',
      bottom: 'bg-gradient-to-r from-lime-300 via-amber-400 to-yellow-300',
      glowShadow: 'shadow-[0_0_12px_rgba(234,179,8,0.7)]',
    },
  },
  'fuchsia-synthwave': {
    id: 'fuchsia-synthwave',
    name: 'Rosa Fuchsia / Synthwave',
    tagline: 'Retrô Synthwave Anos 80',
    desc: 'Estética retrô anos 80 em rosa choque, magenta e neon ultravioleta.',
    gradient: 'from-pink-500 via-fuchsia-500 to-purple-600',
    previewBg: 'bg-pink-500',
    accentColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.7)',
    selectionClass: 'selection:bg-pink-500/30 selection:text-pink-200',
    badgeBg: 'bg-pink-500/10 border-pink-500/30',
    badgeText: 'text-pink-400',
    borderActive: 'border-pink-500 shadow-pink-950/40',
    ambientLedGradient: {
      left: 'bg-gradient-to-b from-pink-400 via-fuchsia-500 to-purple-500',
      right: 'bg-gradient-to-b from-purple-500 via-fuchsia-500 to-pink-400',
      top: 'bg-gradient-to-r from-pink-400 via-fuchsia-500 to-purple-500',
      bottom: 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-400',
      glowShadow: 'shadow-[0_0_12px_rgba(236,72,153,0.7)]',
    },
  },
  'frost-white': {
    id: 'frost-white',
    name: 'Branco Neon / Frost',
    tagline: 'Minimalista Clean Icy',
    desc: 'Estética minimalista clean icy white com brilho prateado acetinado.',
    gradient: 'from-slate-100 via-cyan-100 to-slate-300',
    previewBg: 'bg-slate-100',
    accentColor: '#f8fafc',
    glowColor: 'rgba(248, 250, 252, 0.7)',
    selectionClass: 'selection:bg-slate-200/30 selection:text-white',
    badgeBg: 'bg-slate-200/10 border-slate-200/30',
    badgeText: 'text-slate-100',
    borderActive: 'border-slate-200 shadow-slate-200/20',
    ambientLedGradient: {
      left: 'bg-gradient-to-b from-white via-cyan-100 to-slate-300',
      right: 'bg-gradient-to-b from-slate-300 via-cyan-100 to-white',
      top: 'bg-gradient-to-r from-white via-cyan-100 to-slate-300',
      bottom: 'bg-gradient-to-r from-slate-300 via-cyan-100 to-white',
      glowShadow: 'shadow-[0_0_12px_rgba(248,250,252,0.6)]',
    },
  },
};

export const ALL_THEMES = Object.values(THEME_REGISTRY);

export function getThemeConfig(theme?: AppTheme): ThemeConfig {
  if (theme && THEME_REGISTRY[theme]) {
    return THEME_REGISTRY[theme];
  }
  return THEME_REGISTRY['neon-blue'];
}

/**
 * Atualiza propriedades CSS no elemento raiz (:root) em tempo real
 */
export function applyThemeGlobalStyles(theme: AppTheme, enableRgbBorder: boolean): void {
  if (typeof document === 'undefined') return;

  const config = getThemeConfig(theme);
  const root = document.documentElement;

  root.setAttribute('data-theme', config.id);
  root.setAttribute('data-rgb-border', enableRgbBorder ? 'true' : 'false');

  root.style.setProperty('--theme-accent', config.accentColor);
  root.style.setProperty('--theme-glow', config.glowColor);
}
