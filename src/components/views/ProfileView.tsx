import React, { useState } from 'react';
import {
  User,
  Trophy,
  Flame,
  Clock,
  Sparkles,
  Award,
  Zap,
  CheckCircle2,
  Lock,
  Star,
  BookOpen,
  Terminal,
  Bug,
  Rocket,
  Shield,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { INITIAL_USER_PROFILE, UserProfileState, Achievement } from '../../data/userProfileData';

interface ProfileViewProps {
  onNavigateToStudio?: () => void;
  onNavigateToPractice?: () => void;
  onNavigateToProjects?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onNavigateToStudio,
  onNavigateToPractice,
  onNavigateToProjects,
}) => {
  const [profile, setProfile] = useState<UserProfileState>(INITIAL_USER_PROFILE);
  const [filterCategory, setFilterCategory] = useState<'all' | 'unlocked' | 'locked'>('all');

  const nextLevelXp = profile.level * 600;
  const currentLevelProgress = Math.min(
    100,
    Math.round(((profile.totalXp % 600) / 600) * 100)
  );

  const unlockedCount = profile.achievements.filter((a) => a.unlocked).length;
  const totalAchievements = profile.achievements.length;

  const filteredAchievements = profile.achievements.filter((ach) => {
    if (filterCategory === 'unlocked') return ach.unlocked;
    if (filterCategory === 'locked') return !ach.unlocked;
    return true;
  });

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="h-5 w-5 text-amber-400" />;
      case 'Zap':
        return <Zap className="h-5 w-5 text-yellow-400" />;
      case 'Bug':
        return <Bug className="h-5 w-5 text-rose-400" />;
      case 'Rocket':
        return <Rocket className="h-5 w-5 text-cyan-400" />;
      case 'Flame':
        return <Flame className="h-5 w-5 text-orange-400" />;
      case 'Trophy':
        return <Trophy className="h-5 w-5 text-amber-300" />;
      case 'Layers':
        return <Layers className="h-5 w-5 text-indigo-400" />;
      default:
        return <Award className="h-5 w-5 text-cyan-400" />;
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-6 sm:px-6">
      {/* Header Profile Hero Card */}
      <div className="mb-6 rounded-2xl border border-[#172340] bg-gradient-to-r from-[#070d1e] via-[#09152e] to-[#070d1e] p-6 shadow-xl shadow-cyan-950/20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* User Info & Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-18 w-18 sm:h-20 sm:w-20 rounded-2xl border-2 border-cyan-500/50 object-cover shadow-lg shadow-cyan-500/20"
              />
              <div className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#050813] bg-gradient-to-r from-blue-600 to-cyan-500 text-xs font-bold text-white">
                {profile.level}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {profile.name}
                </h1>
                <span className="rounded-md border border-cyan-500/30 bg-cyan-950/50 px-2 py-0.5 text-xs font-semibold text-cyan-300">
                  Nível {profile.level}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">{profile.title}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-orange-400 font-semibold">
                  <Flame className="h-3.5 w-3.5" />
                  {profile.currentStreakDays} dias de ofensiva
                </span>
                <span>•</span>
                <span>Recorde: {profile.bestStreakDays} dias</span>
              </div>
            </div>
          </div>

          {/* XP & Level Progress Bar */}
          <div className="flex flex-col gap-2 rounded-xl border border-[#1b2b4c] bg-[#050813]/80 p-4 sm:w-72">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">XP Total Acumulado</span>
              <span className="font-bold text-cyan-400">{profile.totalXp} XP</span>
            </div>

            {/* Visual Bar */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#131d34]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${currentLevelProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Nível {profile.level}</span>
              <span>{currentLevelProgress}% para o Nível {profile.level + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Stat 1 */}
        <div className="rounded-xl border border-[#172340] bg-[#070c1b] p-4 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 mb-2">
            <Clock className="h-4 w-4" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">{profile.hoursPracticed}h</div>
          <div className="text-[11px] text-slate-400 font-medium">Horas Praticadas</div>
        </div>

        {/* Stat 2 */}
        <div className="rounded-xl border border-[#172340] bg-[#070c1b] p-4 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-950/40 text-orange-400 mb-2">
            <Flame className="h-4 w-4" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">{profile.currentStreakDays} Dias</div>
          <div className="text-[11px] text-slate-400 font-medium">Ofensiva (Streak)</div>
        </div>

        {/* Stat 3 */}
        <div className="rounded-xl border border-[#172340] bg-[#070c1b] p-4 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 mb-2">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">
            {profile.completedQuizzes + profile.completedChallenges}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Testes & Quizzes Feitos</div>
        </div>

        {/* Stat 4 */}
        <div className="rounded-xl border border-[#172340] bg-[#070c1b] p-4 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-950/40 text-purple-400 mb-2">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">{profile.completedProjects}</div>
          <div className="text-[11px] text-slate-400 font-medium">Projetos Reais Criados</div>
        </div>
      </div>

      {/* Gamification Achievements Section */}
      <div className="rounded-2xl border border-[#172340] bg-[#070c1b] p-6 shadow-lg shadow-cyan-950/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#141e34] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-yellow-400">
              <Trophy className="h-4 w-4" />
              <span>GALERIA DE CONQUISTAS & MEDALHAS</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Conquistas Desbloqueáveis ({unlockedCount}/{totalAchievements})
            </h2>
            <p className="text-xs text-slate-400">
              Ganhe XP completando roteiros de código, solucionando quizzes e usando o Alex para auditar bugs.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 rounded-lg border border-[#1b2b4b] bg-[#050813] p-1 text-xs">
            <button
              onClick={() => setFilterCategory('all')}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                filterCategory === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas ({totalAchievements})
            </button>
            <button
              onClick={() => setFilterCategory('unlocked')}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                filterCategory === 'unlocked'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Desbloqueadas ({unlockedCount})
            </button>
            <button
              onClick={() => setFilterCategory('locked')}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                filterCategory === 'locked'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bloqueadas ({totalAchievements - unlockedCount})
            </button>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {filteredAchievements.map((item) => {
            return (
              <div
                key={item.id}
                className={`relative flex items-start gap-4 rounded-xl border p-4 transition-all ${
                  item.unlocked
                    ? 'border-[#1e3256] bg-gradient-to-br from-[#081024] to-[#0a1532] shadow-md shadow-cyan-950/20'
                    : 'border-[#121c33] bg-[#050813]/60 opacity-60'
                }`}
              >
                {/* Icon Container */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                    item.unlocked
                      ? 'border-cyan-500/40 bg-cyan-950/50 shadow-md shadow-cyan-500/10'
                      : 'border-slate-800 bg-[#0d1424] text-slate-600'
                  }`}
                >
                  {item.unlocked ? (
                    getAchievementIcon(item.iconName)
                  ) : (
                    <Lock className="h-5 w-5 text-slate-500" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden space-y-1">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-sm font-bold truncate ${
                        item.unlocked ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        item.unlocked
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      +{item.xpReward} XP
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span
                      className={`font-medium ${
                        item.unlocked ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {item.unlocked ? `Desbloqueado • ${item.unlockedAt}` : 'Em progresso'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Launchpad to Earn More XP */}
        <div className="mt-8 rounded-xl border border-[#1a2b4d] bg-[#091126] p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              Quer subir para o Nível {profile.level + 1}?
            </span>
            <p className="text-xs text-slate-300">
              Pratique no Zach Code Studio, conclua etapas de projetos ou responda quizzes para ganhar até +500 XP.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToPractice && (
              <button
                onClick={onNavigateToPractice}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-[#0c1630] px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-950/40 transition-colors"
              >
                <span>Fazer Quizzes</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
            {onNavigateToProjects && (
              <button
                onClick={onNavigateToProjects}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:scale-105 transition-transform"
              >
                <span>Construir Projetos</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
