import React, { useState } from 'react';
import {
  ArrowRight,
  Code2,
  FileCode,
  Sparkles,
  Layers,
  Bug,
  BookOpen,
  CheckCircle2,
  Binary,
  GraduationCap,
  Terminal,
  User,
  Trophy,
  FolderTree,
  MonitorPlay,
  Cpu,
  Wand2,
  ArrowLeftRight,
  Crown,
  Coins,
} from 'lucide-react';
import { SUGGESTIONS } from '../../data/initialData';
import { LANGUAGES_LIST } from '../../data/languagesData';
import { NavigationTab } from '../../types';
import { authService } from '../../services/authService';

interface HomeViewProps {
  onSubmitPrompt: (prompt: string, codeSnippet?: string, language?: string) => void;
  onNavigate: (tab: NavigationTab) => void;
  selectedLanguageName: string;
  onSelectLanguage: (languageName: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSubmitPrompt,
  onNavigate,
  selectedLanguageName,
  onSelectLanguage,
}) => {
  const [prompt, setPrompt] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeContext, setCodeContext] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    onSubmitPrompt(
      prompt.trim(),
      showCodeInput && codeContext.trim() ? codeContext.trim() : undefined,
      selectedLanguageName
    );
  };

  const handleSuggestionClick = (suggestionPrompt: string) => {
    onSubmitPrompt(suggestionPrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-8 sm:px-6 lg:py-12">
      {/* Hero Section */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-cyan-400">
          <Sparkles className="h-4 w-4" />
          <span>ZACHAI CORE · ASSISTENTE DE ENGENHARIA</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
          Seu próximo projeto começa aqui.
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Arquitetura de sistemas, geração de código em React e TypeScript,
          análise estática profunda e diagnóstico imediato de erros.
        </p>
      </div>

      {/* Main Prompt Input Box */}
      <div className="relative mb-12 rounded-xl border border-[#1b2745] bg-[#080e21] p-4 shadow-2xl shadow-cyan-950/20 sm:p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#141e35] pb-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-300">Contexto técnico:</span>
              <select
                value={selectedLanguageName}
                onChange={(e) => onSelectLanguage(e.target.value)}
                className="rounded border border-[#1d2b4a] bg-[#0c142b] px-2.5 py-1 text-xs text-cyan-300 font-semibold focus:border-cyan-400 focus:outline-none"
              >
                {LANGUAGES_LIST.map((lang) => (
                  <option key={lang.id} value={lang.name}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onNavigate('languages')}
                className="text-[11px] text-slate-400 hover:text-cyan-300 hover:underline"
              >
                Ver todas (34)
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowCodeInput(!showCodeInput)}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                showCodeInput
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:bg-[#101934] hover:text-slate-200'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>{showCodeInput ? 'Ocultar código anexo' : '+ Anexar trecho de código'}</span>
            </button>
          </div>

          {/* Optional Code Input */}
          {showCodeInput && (
            <div className="rounded-lg border border-[#1d2b4a] bg-[#060a17] p-2.5">
              <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">Código fonte de referência:</span>
                <span>Cole aqui logs, componentes ou funções</span>
              </div>
              <textarea
                value={codeContext}
                onChange={(e) => setCodeContext(e.target.value)}
                placeholder="// Cole o código ou stack trace que deseja analisar ou refatorar..."
                rows={4}
                className="w-full resize-y bg-transparent font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
              />
            </div>
          )}

          {/* Main Prompt Textarea */}
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Descreva o que deseja construir, entender ou corrigir (ex: 'Crie uma API REST em Express com TypeScript' ou 'Explique o useEffect')..."
              rows={3}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Bottom Bar / Submit */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#141e35] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Pressione <kbd className="rounded bg-[#121c37] px-1 py-0.5 font-mono text-[10px] text-slate-300">Enter</kbd> para enviar</span>
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-[11px] text-slate-400">Shift+Enter para nova linha</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {prompt && (
                <button
                  type="button"
                  onClick={() => setPrompt('')}
                  className="rounded px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Limpar
                </button>
              )}

              <button
                type="submit"
                disabled={!prompt.trim()}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-md transition-all ${
                  prompt.trim()
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-cyan-500/25 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Enviar para ZachAI</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Suggestion Categories - Exact Requirement: Criar sites, explicar códigos e corrigir erros */}
      <div className="mb-14 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Sugestões e Comandos Rápidos
            </h2>
            <p className="text-xs text-slate-400">
              Selecione uma das opções abaixo para iniciar uma análise ou geração orientada.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Category 1: Criar sites */}
          <div className="flex flex-col rounded-xl border border-[#16223d] bg-[#080e22] p-4 transition-all hover:border-cyan-500/30">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <Layers className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-sm text-slate-200">
                Criar sites & aplicações
              </h3>
            </div>

            <div className="flex-1 space-y-2.5">
              {SUGGESTIONS.createSites.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSuggestionClick(item.prompt)}
                  type="button"
                  className="group flex w-full flex-col text-left rounded-lg border border-[#141e35] bg-[#0a1228] p-2.5 transition-all hover:border-cyan-500/40 hover:bg-[#0e1938]"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Category 2: Explicar códigos */}
          <div className="flex flex-col rounded-xl border border-[#16223d] bg-[#080e22] p-4 transition-all hover:border-cyan-500/30">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-sm text-slate-200">
                Explicar códigos
              </h3>
            </div>

            <div className="flex-1 space-y-2.5">
              {SUGGESTIONS.explainCode.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSuggestionClick(item.prompt)}
                  type="button"
                  className="group flex w-full flex-col text-left rounded-lg border border-[#141e35] bg-[#0a1228] p-2.5 transition-all hover:border-cyan-500/40 hover:bg-[#0e1938]"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Category 3: Corrigir erros */}
          <div className="flex flex-col rounded-xl border border-[#16223d] bg-[#080e22] p-4 transition-all hover:border-cyan-500/30">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                <Bug className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-sm text-slate-200">
                Corrigir erros
              </h3>
            </div>

            <div className="flex-1 space-y-2.5">
              {SUGGESTIONS.fixErrors.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSuggestionClick(item.prompt)}
                  type="button"
                  className="group flex w-full flex-col text-left rounded-lg border border-[#141e35] bg-[#0a1228] p-2.5 transition-all hover:border-rose-500/40 hover:bg-[#0e1938]"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-rose-300">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launchpad to Dedicated Tooling */}
      <div className="rounded-xl border border-[#16223d] bg-[#060b1c] p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">
              Ferramentas de Engenharia Integradas
            </h2>
            <p className="text-xs text-slate-400">
              Acesse diretamente os módulos de auditoria de código e depuração estruturada.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {authService.getCurrentUser().isSupremeOwner && (
            <button
              onClick={() => onNavigate('admin')}
              type="button"
              className="flex items-center gap-3 rounded-lg border border-amber-400/60 bg-gradient-to-r from-[#211604] via-[#1a1102] to-[#0c0801] p-3 text-left transition-all hover:border-amber-300 hover:scale-[1.02] shadow-md shadow-amber-950/50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Crown className="h-4 w-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <span>Seu Dashboard ADM</span>
                  <span className="rounded bg-gradient-to-r from-amber-500 to-yellow-400 px-1.5 py-0.2 text-[9px] font-black text-slate-950 shadow-sm">DONO SUPREMO</span>
                </div>
                <div className="text-[11px] text-amber-200">
                  Métricas de faturamento, clientes reais e gateways
                </div>
              </div>
            </button>
          )}

          <button
            onClick={() => onNavigate('agent')}
            type="button"
            className="flex items-center gap-3 rounded-lg border border-cyan-400/50 bg-gradient-to-r from-[#0d1f42] via-[#091736] to-[#061026] p-3 text-left transition-all hover:border-cyan-300 hover:scale-[1.02] shadow-md shadow-cyan-950/40"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Cpu className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <span>Modo Agente</span>
                <span className="rounded bg-gradient-to-r from-cyan-500 to-emerald-400 px-1.5 py-0.2 text-[9px] font-bold text-slate-950 shadow-sm">AUTÔNOMO</span>
              </div>
              <div className="text-[11px] text-cyan-200">
                Subtarefas sequenciais com execução visual
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('refactor')}
            type="button"
            className="flex items-center gap-3 rounded-lg border border-purple-500/40 bg-gradient-to-r from-[#170e30] via-[#110b24] to-[#0a0717] p-3 text-left transition-all hover:border-purple-300 hover:scale-[1.02] shadow-md shadow-purple-950/40"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <Wand2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <span>Refatoração Inteligente</span>
                <span className="rounded bg-gradient-to-r from-purple-500 to-pink-500 px-1.5 py-0.2 text-[9px] font-bold text-white shadow-sm">CLEAN CODE</span>
              </div>
              <div className="text-[11px] text-purple-200">
                Detecta melhorias e legibilidade com semântica idêntica
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('converter')}
            type="button"
            className="flex items-center gap-3 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-[#0b1a38] via-[#08152e] to-[#040e21] p-3 text-left transition-all hover:border-cyan-300 hover:scale-[1.02] shadow-md shadow-cyan-950/40"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <span>Conversor de Código</span>
                <span className="rounded bg-gradient-to-r from-cyan-500 to-emerald-400 px-1.5 py-0.2 text-[9px] font-bold text-slate-950 shadow-sm">POLIGLOTA</span>
              </div>
              <div className="text-[11px] text-cyan-200">
                Traduza trechos entre linguagens (Python ➔ TS/Java)
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('generator')}
            type="button"
            className="flex items-center gap-3 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-[#0c1836] to-[#08152e] p-3 text-left transition-all hover:border-cyan-300 hover:scale-[1.02]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <FolderTree className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <span>Gerador de Códigos</span>
                <span className="rounded bg-gradient-to-r from-blue-600 to-cyan-500 px-1.5 py-0.2 text-[9px] font-bold text-white shadow-sm">NOVO</span>
              </div>
              <div className="text-[11px] text-cyan-200">
                Gere projetos completos divididos por arquivos
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('studio')}
            type="button"
            className="flex items-center gap-3 rounded-lg border border-cyan-500/30 bg-[#0c1630] p-3 text-left transition-all hover:border-cyan-400 hover:bg-[#0f1d40]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-300">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
                <span>Zach Code Studio</span>
                <span className="rounded bg-cyan-500/30 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">NOVO</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Editor estilo VS Code com GitHub & Alex
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('practice')}
            type="button"
            className="flex items-center gap-3 rounded-lg border border-indigo-500/30 bg-[#0e142e] p-3 text-left transition-all hover:border-indigo-400 hover:bg-[#121c44]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-indigo-500/20 text-indigo-300">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
                <span>Testes e Práticas</span>
                <span className="rounded bg-indigo-500/30 px-1.5 py-0.2 text-[9px] font-bold text-indigo-300">NOVO</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Quizzes, lógica e desafios em 3 níveis
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('languages')}
            type="button"
            className="flex items-center gap-3 rounded-lg border border-[#141e35] bg-[#0a1126] p-3 text-left transition-all hover:border-cyan-500/30 hover:bg-[#0f1936]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-cyan-500/10 text-cyan-400">
              <Binary className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Linguagens
              </div>
              <div className="text-[11px] text-slate-400">
                34 tecnologias e sintaxes ativas
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('analyze')}
            type="button"
            className="flex items-center gap-3 rounded-lg border border-[#141e35] bg-[#0a1126] p-3 text-left transition-all hover:border-cyan-500/30 hover:bg-[#0f1936]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-cyan-500/10 text-cyan-400">
              <Code2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Analisar Código
              </div>
              <div className="text-[11px] text-slate-400">
                Auditoria de complexidade e segurança
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('fix-errors')}
            type="button"
            className="flex items-center gap-3 rounded-lg border border-[#141e35] bg-[#0a1126] p-3 text-left transition-all hover:border-rose-500/30 hover:bg-[#0f1936]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-rose-500/10 text-rose-400">
              <Bug className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Corrigir Erros
              </div>
              <div className="text-[11px] text-slate-400">
                Diagnóstico de stack trace com diff
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('projects')}
            type="button"
            className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-[#081525] p-3 text-left transition-all hover:border-emerald-400 hover:bg-[#0c1e36]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-emerald-500/20 text-emerald-300">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
                <span>Projetos Práticos</span>
                <span className="rounded bg-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">GUIADO</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Landing Page, Jogo 2D, Calculadora & API
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('playground')}
            type="button"
            className="flex items-center gap-3 rounded-lg border border-cyan-500/40 bg-[#08172c] p-3 text-left transition-all hover:border-cyan-400 hover:bg-[#0c2242]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-300">
              <MonitorPlay className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
                <span>Playground Web</span>
                <span className="rounded bg-cyan-500/30 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">LIVE</span>
              </div>
              <div className="text-[11px] text-slate-400">
                HTML, CSS & JS com Prévia ao Vivo
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('profile')}
            type="button"
            className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-[#161208] p-3 text-left transition-all hover:border-amber-400 hover:bg-[#221c0b]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-amber-500/20 text-amber-300">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
                <span>Meu Perfil & Conquistas</span>
                <span className="rounded bg-amber-500/30 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">XP</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Nível, Streak, Estatísticas e Medalhas
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
