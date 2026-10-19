import React from 'react';
import { Plus, Menu, X, Cpu, Coins, Sparkles, Crown, User, ShieldCheck } from 'lucide-react';
import { NavigationTab, UserProfile } from '../types';
import { authService } from '../services/authService';

interface HeaderProps {
  currentTab: NavigationTab;
  onNewChat: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onNavigate: (tab: NavigationTab) => void;
  selectedLanguageName?: string;
  onOpenAuthModal?: () => void;
  onOpenCheckoutModal?: () => void;
}

const TAB_TITLES: Record<NavigationTab, string> = {
  home: 'Início',
  agent: 'Modo Agente (Subtarefas Sequenciais)',
  chat: 'Conversar com Alex',
  playground: 'Playground Web (Prévia ao Vivo)',
  generator: 'Gerador de Códigos por Arquivos',
  studio: 'Zach Code Studio (Editor)',
  practice: 'Testes e Práticas',
  projects: 'Projetos Práticos (Guia Estudante)',
  languages: 'Linguagens & Python Pesquisador',
  refactor: 'Refatoração Inteligente (Clean Code)',
  converter: 'Conversor de Código (Poliglota)',
  analyze: 'Analisar código',
  'fix-errors': 'Corrigir erros',
  history: 'Histórico',
  profile: 'Meu Perfil & Conquistas',
  admin: 'Seu Dashboard ADM (Dono Supremo)',
  settings: 'Configurações',
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNewChat,
  isMobileMenuOpen,
  onToggleMobileMenu,
  onNavigate,
  selectedLanguageName,
  onOpenAuthModal,
  onOpenCheckoutModal,
}) => {
  const [currentUser, setCurrentUser] = React.useState<UserProfile>(authService.getCurrentUser());

  React.useEffect(() => {
    const unsub = authService.subscribe((u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  return (
    <header className="sticky top-2 z-40 mx-2 sm:mx-4 my-2 flex h-14 items-center justify-between rounded-2xl border border-cyan-500/25 bg-[#050813]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_25px_rgba(6,182,212,0.18)] px-3 sm:px-5 transition-all">
      {/* Left Zone: Mobile toggle + Prominent Brand "Zach AI" */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <button
          onClick={onToggleMobileMenu}
          type="button"
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/30 bg-[#0a1022]/80 text-slate-300 md:hidden hover:border-cyan-400 transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group transition-all"
            title="Zach AI - Início"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500/30 via-blue-600/40 to-indigo-500/30 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.35)] group-hover:shadow-[0_0_22px_rgba(6,182,212,0.6)] transition-all">
              <Sparkles className="h-4 w-4 text-cyan-300 animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.45)]">
                Zach AI
              </span>
            </div>
          </button>
          <span className="text-slate-600 select-none hidden sm:inline">/</span>
          <span className="font-medium text-slate-300 truncate max-w-[140px] sm:max-w-none text-xs sm:text-sm hidden sm:inline">
            {TAB_TITLES[currentTab]}
          </span>
        </div>
      </div>

      {/* Center Zone: Futuristic Glass Pill Context */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-[11px] font-medium text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold tracking-wide">Alex IA Online</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300">Modo Alta Precisão</span>
        </div>

        {selectedLanguageName && (
          <button
            onClick={() => onNavigate('languages')}
            className="text-cyan-300 font-mono hover:underline flex items-center gap-1 text-[11px]"
            title="Mudar linguagem ativa"
          >
            <Cpu className="h-3 w-3 text-cyan-400" />
            <span>Linguagem: {selectedLanguageName}</span>
          </button>
        )}
      </div>

      {/* Right Zone: Credit Economy + Supreme Owner Badge + Primary CTA (No Entrar / Cadastrar buttons) */}
      <div className="flex items-center gap-2">
        {/* Supreme Owner Quick ADM Button */}
        {currentUser.isSupremeOwner && (
          <button
            onClick={() => onNavigate('admin')}
            type="button"
            className={`hidden sm:flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition-all ${
              currentTab === 'admin'
                ? 'border-amber-400 bg-amber-500/30 text-amber-200'
                : 'border-amber-500/40 bg-amber-950/40 text-amber-300 hover:border-amber-400'
            }`}
          >
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px]">Seu ADM</span>
          </button>
        )}

        {/* Credit Balance / Supreme Owner Exemption Badge */}
        {currentUser.isSupremeOwner ? (
          <div
            className="flex items-center gap-1.5 rounded-lg border border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-600/20 px-2.5 py-1 text-xs font-bold text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)] select-none"
            title="Dono Supremo: Isenção total e créditos infinitos"
          >
            <Crown className="h-3.5 w-3.5 text-amber-400 fill-amber-400/40 shrink-0 animate-pulse" />
            <span className="font-bold text-[11px] text-amber-200 hidden md:inline">
              Dono Supremo - Acesso Total Gratuito
            </span>
            <span className="font-bold text-[11px] text-amber-200 md:hidden">
              Dono Supremo
            </span>
            <span className="ml-0.5 rounded bg-amber-400/25 border border-amber-400/50 px-1.5 py-0.2 font-mono text-[11px] font-black text-amber-300">
              ∞ Créditos
            </span>
          </div>
        ) : (
          <button
            onClick={() => onOpenCheckoutModal?.()}
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-[#0c1630] px-2.5 py-1 text-xs font-bold text-cyan-200 hover:border-cyan-400 transition-all shadow-sm"
            title="Ver planos e recarregar créditos"
          >
            <Coins className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-mono text-cyan-300">
              {`${currentUser.credits}/${currentUser.maxCredits || 500} cr.`}
            </span>
            <span className="rounded bg-cyan-500/20 text-cyan-300 text-[10px] px-1 py-0.2 hidden sm:inline">
              +Recarregar
            </span>
          </button>
        )}

        {/* Primary CTA */}
        <button
          onClick={onNewChat}
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-500/25 transition-all hover:from-blue-500 hover:to-cyan-400 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Nova Conversa</span>
        </button>
      </div>
    </header>
  );
};
