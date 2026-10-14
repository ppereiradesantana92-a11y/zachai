import React from 'react';
import {
  Home,
  MessageSquareCode,
  Binary,
  FolderGit2,
  Code2,
  Bug,
  History,
  Settings,
  Terminal,
  ShieldCheck,
  GraduationCap,
  Layers,
  User,
  Trophy,
  FolderTree,
  MonitorPlay,
  Cpu,
  Wand2,
  ArrowLeftRight,
  Crown,
  Coins,
  Sparkles,
  Plus,
  LogIn,
} from 'lucide-react';
import { NavigationTab, UserProfile } from '../types';
import { authService } from '../services/authService';

interface SidebarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenAuthModal?: () => void;
  onOpenCheckoutModal?: () => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Início',
    icon: Home,
    description: 'Página inicial e solicitações rápidas',
  },
  {
    id: 'agent',
    label: 'Modo Agente',
    icon: Cpu,
    description: 'Subtarefas sequenciais e progresso de execução visual',
    badge: 'AGENTE',
  },
  {
    id: 'chat',
    label: 'Conversar com Alex',
    icon: MessageSquareCode,
    description: 'Chat com Alex (IA): Análise, correção de erros e prints',
  },
  {
    id: 'playground',
    label: 'Playground Web',
    icon: MonitorPlay,
    description: 'Editor HTML, CSS e JS com Live Preview e Alex IA',
    badge: 'LIVE',
  },
  {
    id: 'generator',
    label: 'Gerador de Códigos',
    icon: FolderTree,
    description: 'Geração completa por arquivos prontos para produção',
    badge: 'NOVO',
  },
  {
    id: 'studio',
    label: 'Zach Code Studio',
    icon: Terminal,
    description: 'Editor de código estilo VS Code com GitHub e Alex IA',
    badge: 'NOVO',
  },
  {
    id: 'practice',
    label: 'Testes e Práticas',
    icon: GraduationCap,
    description: 'Quizzes práticos, desafios e progresso por níveis',
    badge: 'NOVO',
  },
  {
    id: 'projects',
    label: 'Projetos Práticos',
    icon: FolderGit2,
    description: 'Roteiros guiados passo a passo para estudantes',
    badge: 'GUIADO',
  },
  {
    id: 'languages',
    label: 'Linguagens & Python',
    icon: Binary,
    description: 'Catálogo de tecnologias, Python Pesquisador e Executor',
  },
  {
    id: 'refactor',
    label: 'Refatoração Inteligente',
    icon: Wand2,
    description: 'Melhora legibilidade, Clean Code e SOLID mantendo o comportamento',
    badge: 'IA',
  },
  {
    id: 'converter',
    label: 'Conversor de Código',
    icon: ArrowLeftRight,
    description: 'Tradução automática entre linguagens (Python, TS, Java, etc.)',
    badge: 'NOVO',
  },
  {
    id: 'analyze',
    label: 'Analisar código',
    icon: Code2,
    description: 'Auditoria de segurança e performance',
  },
  {
    id: 'fix-errors',
    label: 'Corrigir erros',
    icon: Bug,
    description: 'Módulo Alex: Correção de prints e código',
  },
  {
    id: 'history',
    label: 'Histórico',
    icon: History,
    description: 'Sessões anteriores de código',
  },
  {
    id: 'profile',
    label: 'Meu Perfil',
    icon: User,
    description: 'XP, Nível, Streak e Conquistas desbloqueadas',
    badge: 'XP',
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    description: 'Parâmetros e status da API',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
  onOpenAuthModal,
  onOpenCheckoutModal,
}) => {
  const [currentUser, setCurrentUser] = React.useState<UserProfile>(authService.getCurrentUser());

  React.useEffect(() => {
    const unsub = authService.subscribe((u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  const handleItemClick = (tab: NavigationTab) => {
    onNavigate(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#141e34] bg-[#070c1b] transition-transform duration-200 md:static md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-0 max-md:-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-[#141e34] px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-0.5 shadow-md shadow-cyan-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#070c1b]">
              <Terminal className="h-4 w-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-white">
                ZachAI
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Assistente de Programação
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {/* SUPREME OWNER EXCLUSIVE TAB */}
          {currentUser.isSupremeOwner && (
            <div className="mb-2 pb-2 border-b border-amber-500/20">
              <div className="px-3 pb-1.5 text-[10px] font-extrabold tracking-wider text-amber-400 uppercase flex items-center gap-1">
                <Crown className="h-3 w-3 text-amber-400" />
                <span>Administração Suprema</span>
              </div>
              <button
                onClick={() => handleItemClick('admin')}
                type="button"
                className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-bold transition-all ${
                  currentTab === 'admin'
                    ? 'border border-amber-400/60 bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-amber-950/60 text-amber-200 shadow-md shadow-amber-950/50'
                    : 'border border-amber-500/30 bg-amber-950/20 text-amber-300 hover:border-amber-400 hover:bg-amber-950/40'
                }`}
              >
                <Crown className="h-4 w-4 shrink-0 text-amber-400 animate-pulse" />
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">Seu Dashboard ADM</span>
                  <span className="ml-1 rounded bg-amber-400 text-slate-950 px-1.5 py-0.2 text-[8px] font-black uppercase shadow-sm">
                    DONO
                  </span>
                </div>
              </button>
            </div>
          )}

          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Navegação Principal
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                type="button"
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-medium transition-all ${
                  isActive
                    ? 'border border-cyan-500/30 bg-[#0d162e] text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:bg-[#0c1328] hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-cyan-400'
                      : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-1.5 rounded bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer: Credit Economy & User Profile */}
        <div className="border-t border-[#141e34] bg-[#060a16] p-3 space-y-2.5">
          {/* Credit balance card */}
          {currentUser.isSupremeOwner ? (
            <div className="rounded-lg border border-amber-500/40 bg-gradient-to-r from-[#171206] via-[#221705] to-[#120a02] p-2.5 shadow-md shadow-amber-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-200 font-bold">
                  <Crown className="h-3.5 w-3.5 text-amber-400 fill-amber-400/30" />
                  <span>Dono Supremo</span>
                </div>
                <span className="rounded bg-amber-400/25 border border-amber-400/40 px-1.5 py-0.2 text-[9px] font-black uppercase text-amber-300">
                  Isento
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-sm font-black font-mono text-amber-200 flex items-center gap-1">
                  <span>∞ Créditos</span>
                  <span className="text-[10px] text-amber-300/80 font-normal">(Ilimitado)</span>
                </span>
                <span className="text-[10px] text-amber-400/70 font-mono">0 cr./ação</span>
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-amber-500/20 text-[10px] text-amber-300/90 font-medium flex items-center justify-between">
                <span>Acesso Total Gratuito</span>
                <span className="text-amber-400 text-[10px]">✨ Permanente</span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-cyan-500/20 bg-gradient-to-r from-[#0c1836] to-[#071126] p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <Coins className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Saldo de Créditos</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenCheckoutModal?.()}
                  className="flex items-center gap-1 rounded bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/30 transition-all"
                >
                  <Plus className="h-3 w-3" />
                  <span>Recarregar</span>
                </button>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-sm font-black font-mono text-cyan-200">
                  {`${currentUser.credits}/${currentUser.maxCredits || 300} cr.`}
                </span>
                <span className="text-[10px] text-slate-400">10 cr. / geração</span>
              </div>
            </div>
          )}

          {/* User Profile Mini Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-[11px] font-bold text-slate-950">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="truncate text-xs font-semibold text-white flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  {currentUser.isSupremeOwner && (
                    <Crown className="h-3 w-3 text-amber-400 shrink-0" />
                  )}
                </div>
                <div className="truncate text-[10px] text-slate-400 font-mono">
                  {currentUser.isSupremeOwner ? 'Dono Supremo' : currentUser.email}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenAuthModal?.()}
              title="Alternar conta ou entrar"
              className="flex h-6 w-6 items-center justify-center rounded border border-[#1d2d50] bg-[#0a1126] text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40"
            >
              <LogIn className="h-3 w-3" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
