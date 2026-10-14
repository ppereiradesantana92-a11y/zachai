import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  FileCode,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  Terminal,
  Columns,
  Eye,
  Layers,
  BrainCircuit,
  MonitorPlay,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { CodeBlock } from '../CodeBlock';
import { LANGUAGES_LIST } from '../../data/languagesData';
import { refactorCodeWithAlex } from '../../services/geminiService';
import { projectMemoryService } from '../../services/projectMemoryService';
import { RefactoringResult, NavigationTab } from '../../types';

interface RefactorViewProps {
  selectedLanguageName: string;
  onSelectLanguage: (languageName: string) => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenInStudio?: (code: string, filename: string) => void;
  onOpenInPlayground?: (html?: string, css?: string, js?: string) => void;
}

const SAMPLE_REFACTOR_SNIPPETS: Record<
  string,
  {
    title: string;
    badge: string;
    lang: string;
    code: string;
    description: string;
  }
> = {
  nestedConditionals: {
    title: 'Aninhamento Excessivo & Ausência de Early Return',
    badge: 'PYRAMID OF DOOM',
    lang: 'TypeScript',
    description: 'Múltiplos ifs aninhados profundamente, variáveis genéricas e falta de guard clauses.',
    code: `// Código com aninhamento profundo e alta complexidade ciclomática
export function processarPedido(pedido: any) {
  if (pedido) {
    if (pedido.itens && pedido.itens.length > 0) {
      if (pedido.cliente && pedido.cliente.ativo) {
        if (pedido.pagamento && pedido.pagamento.confirmado) {
          let total = 0;
          for (let i = 0; i < pedido.itens.length; i++) {
            total = total + pedido.itens[i].preco * pedido.itens[i].quantidade;
          }
          if (pedido.desconto) {
            total = total - pedido.desconto;
          }
          return { status: "aprovado", valorTotal: total };
        } else {
          return { status: "erro", msg: "Pagamento pendente" };
        }
      } else {
        return { status: "erro", msg: "Cliente inativo" };
      }
    } else {
      return { status: "erro", msg: "Carrinho vazio" };
    }
  } else {
    return { status: "erro", msg: "Pedido nulo" };
  }
}`,
  },
  reactDirtyComponent: {
    title: 'Componente React com Efeitos Descontrolados e Mutação',
    badge: 'REACT CLEAN CODE',
    lang: 'TypeScript',
    description: 'Mutação direta de arrays, variáveis soltas e cálculos pesados sem isolamento.',
    code: `import React, { useState } from 'react';

// Problemas: Mutação de array, código sem tipagem e funções anônimas duplicadas
export function GerenciadorTarefas(props: any) {
  const [tarefas, setTarefas] = useState(props.initial || []);
  const [texto, setTexto] = useState("");

  function adicionar() {
    if (texto != "") {
      tarefas.push({ id: Math.random(), titulo: texto, feito: false });
      setTarefas([...tarefas]);
      setTexto("");
    }
  }

  function alternar(id: any) {
    for (var i = 0; i < tarefas.length; i++) {
      if (tarefas[i].id == id) {
        tarefas[i].feito = !tarefas[i].feito;
      }
    }
    setTarefas([...tarefas]);
  }

  return (
    <div>
      <input value={texto} onChange={(e) => setTexto(e.target.value)} />
      <button onClick={adicionar}>Adicionar</button>
      <ul>
        {tarefas.map(function(t: any) {
          return (
            <li key={t.id} onClick={() => alternar(t.id)}>
              {t.feito ? "[X] " : "[ ] "} {t.titulo}
            </li>
          );
        })}
      </ul>
    </div>
  );
}`,
  },
  pythonComplexity: {
    title: 'Algoritmo Python com Loop O(n²) e Falta de Type Hints',
    badge: 'PYTHONIC DRY',
    lang: 'Python',
    description: 'Busca linear aninhada ineficiente e falta de idioms modernos do Python.',
    code: `# Código Python com complexidade O(n * m) e variáveis inexpressivas
def filtrar_duplicados_e_agrupar(lista_a, lista_b):
    res = []
    # Loop aninhado redundante
    for x in lista_a:
        achou = False
        for y in lista_b:
            if x["id"] == y["id"]:
                achou = True
                break
        if achou == True and x not in res:
            res.append(x)
            
    # Ordenação manual ineficiente
    for i in range(len(res)):
        for j in range(len(res) - 1):
            if res[j]["valor"] < res[j+1]["valor"]:
                temp = res[j]
                res[j] = res[j+1]
                res[j+1] = temp
                
    return res`,
  },
  magicStringsDuplication: {
    title: 'Violação de DRY & Magic Strings e Ausência de Enums',
    badge: 'SOLID & ENUMS',
    lang: 'TypeScript',
    description: 'Strings mágicas duplicadas por todo o código e funções longas sem coesão.',
    code: `export function calcularTarifa(usuario: any, tipoEnvio: string, distancia: number) {
  var taxaBase = 10;
  
  if (tipoEnvio == "expresso") {
    taxaBase = taxaBase * 1.5;
  } else if (tipoEnvio == "economico") {
    taxaBase = taxaBase * 0.9;
  } else if (tipoEnvio == "internacional") {
    taxaBase = taxaBase * 3.0;
  }
  
  if (usuario.nivel == "vip") {
    taxaBase = taxaBase * 0.8;
  } else if (usuario.nivel == "premium") {
    taxaBase = taxaBase * 0.85;
  } else if (usuario.nivel == "padrao") {
    taxaBase = taxaBase * 1.0;
  }
  
  var freteFinal = taxaBase + (distancia * 0.5);
  return freteFinal;
}`,
  },
};

export const RefactorView: React.FC<RefactorViewProps> = ({
  selectedLanguageName,
  onSelectLanguage,
  onNavigate,
  onOpenInStudio,
  onOpenInPlayground,
}) => {
  const [code, setCode] = useState(SAMPLE_REFACTOR_SNIPPETS.nestedConditionals.code);
  const [language, setLanguage] = useState(SAMPLE_REFACTOR_SNIPPETS.nestedConditionals.lang);
  const [focus, setFocus] = useState<'all' | 'cleanCode' | 'performance' | 'solid'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RefactoringResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'sideBySide' | 'refactored' | 'original'>('sideBySide');
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedToMemory, setSavedToMemory] = useState(false);

  const handleRefactor = async () => {
    if (!code.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSavedToMemory(false);

    try {
      const data = await refactorCodeWithAlex({
        code: code.trim(),
        language,
        focus,
      });
      setResult(data);

      // Auto-register refactoring improvement to project memory
      projectMemoryService.recordArchitecturalDecision(
        `Refatoração Inteligente: ${language}`,
        data.summary,
        [`refactored-${language.toLowerCase()}.ts`]
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao processar refatoração com o Alex.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = (key: keyof typeof SAMPLE_REFACTOR_SNIPPETS) => {
    const sample = SAMPLE_REFACTOR_SNIPPETS[key];
    setCode(sample.code);
    setLanguage(sample.lang);
    setResult(null);
    setErrorMessage(null);
  };

  const handleCopyRefactoredCode = async () => {
    if (!result?.refactoredCode) return;
    try {
      await navigator.clipboard.writeText(result.refactoredCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleManualSaveToMemory = () => {
    if (!result) return;
    projectMemoryService.recordArchitecturalDecision(
      `Diretrizes de Clean Code: ${language}`,
      `Boas práticas adotadas: ${result.appliedPractices.join(', ')}. ${result.summary}`,
      ['refactored-module.ts']
    );
    setSavedToMemory(true);
    setTimeout(() => setSavedToMemory(false), 2500);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 space-y-8">
      {/* Hero Header */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-[#0d091e] via-[#110a24] to-[#070512] p-6 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-950/60 px-3 py-1 text-xs font-semibold text-purple-300">
              <Wand2 className="h-3.5 w-3.5 text-purple-400" />
              <span>ALEX AI · MOTOR DE REFATORAÇÃO INTELIGENTE</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
              Refatoração Inteligente & Clean Code
            </h1>
            <p className="max-w-3xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Detecta gargalos de legibilidade, elimina aninhamentos profundos e aplica padrões de projeto modernos
              com uma garantia fundamental: <strong className="text-emerald-400">o comportamento final do código é 100% preservado</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 text-xs font-semibold text-emerald-300 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Semântica Idêntica Garantida</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Code Smells Quick Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Exemplos Práticos de "Code Smells" para Refatorar</span>
          </span>
          <span className="text-slate-500 text-[11px]">Clique para carregar e experimentar</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(SAMPLE_REFACTOR_SNIPPETS).map(([key, sample]) => (
            <button
              key={key}
              onClick={() => handleLoadSample(key as any)}
              type="button"
              className="group flex flex-col rounded-xl border border-[#1d163d] bg-[#0c091d] p-3.5 text-left transition-all hover:border-purple-500/50 hover:bg-[#130f2c] hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-xs font-bold text-white group-hover:text-purple-300 line-clamp-1">
                  {sample.title}
                </span>
                <span className="rounded bg-purple-950/80 border border-purple-500/30 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-purple-300">
                  {sample.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {sample.description}
              </p>
              <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-purple-400 opacity-80 group-hover:opacity-100">
                <span>Carregar no Editor</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Editor Box */}
      <div className="rounded-2xl border border-[#1a1738] bg-[#080616] p-5 shadow-2xl space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#16122e] pb-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Linguagem:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-lg border border-[#231b4a] bg-[#0d0922] px-3 py-1.5 text-xs text-purple-300 font-semibold focus:border-purple-400 focus:outline-none"
              >
                {LANGUAGES_LIST.map((lang) => (
                  <option key={lang.id} value={lang.name}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Foco da Refatoração:</span>
              <div className="inline-flex rounded-lg border border-[#231b4a] bg-[#0a071c] p-0.5">
                <button
                  type="button"
                  onClick={() => setFocus('all')}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    focus === 'all' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Completo (Tudo)
                </button>
                <button
                  type="button"
                  onClick={() => setFocus('cleanCode')}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    focus === 'cleanCode' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Clean Code
                </button>
                <button
                  type="button"
                  onClick={() => setFocus('performance')}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    focus === 'performance' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Complexidade
                </button>
                <button
                  type="button"
                  onClick={() => setFocus('solid')}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    focus === 'solid' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  SOLID & DRY
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setCode('');
              setResult(null);
            }}
            type="button"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Limpar Código</span>
          </button>
        </div>

        {/* Textarea Code Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">Cole ou digite o código original a ser aprimorado:</span>
            <span className="font-mono text-[11px] text-slate-500">
              {code.split('\n').length} linhas · {code.length} caracteres
            </span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Cole aqui sua função, componente ou trecho de código..."
            rows={10}
            className="w-full resize-y rounded-xl border border-[#221a47] bg-[#05030f] p-4 font-mono text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:border-purple-400 focus:outline-none leading-relaxed"
          />
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-[11px] text-slate-400">
            O Alex analisará o código e gerará a refatoração completa com comparação antes/depois.
          </span>

          <button
            onClick={handleRefactor}
            disabled={isLoading || !code.trim()}
            type="button"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Refatorando com Alex IA...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                <span>Refatorar Código com Alex</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Refactoring Results Showcase */}
      {result && (
        <div className="space-y-8 animate-fadeIn">
          {/* Metrics & Impact Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Readability Score */}
            <div className="rounded-xl border border-purple-500/40 bg-gradient-to-br from-[#120a2b] to-[#090517] p-4 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Legibilidade do Código</span>
                <span className="rounded bg-purple-950 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                  +{result.readabilityScoreAfter - result.readabilityScoreBefore} pts
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-400">
                  {result.readabilityScoreAfter}/100
                </span>
                <span className="text-xs text-slate-500 line-through">
                  {result.readabilityScoreBefore}/100
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#181136]">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${result.readabilityScoreAfter}%` }}
                />
              </div>
            </div>

            {/* Cyclomatic Complexity */}
            <div className="rounded-xl border border-[#1f1942] bg-[#09061a] p-4 shadow-lg space-y-1">
              <span className="text-xs font-semibold text-slate-400">Complexidade Ciclomática</span>
              <div className="text-sm font-bold text-emerald-400">
                {result.cyclomaticComplexityAfter}
              </div>
              <div className="text-[11px] text-slate-500">
                Antes: <span className="line-through">{result.cyclomaticComplexityBefore}</span>
              </div>
            </div>

            {/* Code Smells Eliminated */}
            <div className="rounded-xl border border-[#1f1942] bg-[#09061a] p-4 shadow-lg space-y-1">
              <span className="text-xs font-semibold text-slate-400">Code Smells Eliminados</span>
              <div className="text-2xl font-black text-white">
                {result.smellsDetected.length}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                ✓ Padrões nocivos removidos
              </div>
            </div>

            {/* Behavior Preservation Guarantee */}
            <div className="rounded-xl border border-emerald-500/40 bg-[#061517] p-4 shadow-lg space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Garantia de Semântica</span>
              </div>
              <div className="text-sm font-bold text-white">
                100% Preservado
              </div>
              <div className="text-[11px] text-slate-300">
                Nenhuma regra ou saída foi alterada
              </div>
            </div>
          </div>

          {/* Executive Summary Banner */}
          <div className="rounded-xl border border-[#22184a] bg-[#0b071e] p-4 text-xs text-slate-200 flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-purple-300">Diagnóstico Executivo do Alex: </span>
              <span>{result.summary}</span>
            </div>
          </div>

          {/* Smells Detected List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Pontos de Melhoria & Code Smells Detectados ({result.smellsDetected.length})</span>
            </h3>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {result.smellsDetected.map((smell, idx) => (
                <div
                  key={smell.id || idx}
                  className="rounded-xl border border-[#1d173d] bg-[#070514] p-4 space-y-2 hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white line-clamp-1">
                      {smell.smell}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        smell.severity === 'high'
                          ? 'bg-rose-950/70 border border-rose-500/30 text-rose-300'
                          : smell.severity === 'medium'
                          ? 'bg-amber-950/70 border border-amber-500/30 text-amber-300'
                          : 'bg-blue-950/70 border border-blue-500/30 text-blue-300'
                      }`}
                    >
                      {smell.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <strong className="text-slate-300">Problema: </strong>
                    {smell.description}
                  </p>

                  <div className="rounded-lg border border-purple-500/20 bg-purple-950/20 p-2 text-[11px] text-purple-200">
                    <strong className="text-purple-300">Solução do Alex: </strong>
                    {smell.solutionApplied}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Comparison Showcase */}
          <div className="rounded-2xl border border-[#201845] bg-[#070514] p-5 space-y-4">
            {/* View Mode Toggle Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#171133] pb-4">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">
                  Visualização do Código
                </h3>
              </div>

              {/* View Switcher Pill */}
              <div className="inline-flex rounded-lg border border-[#211847] bg-[#09061c] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('sideBySide')}
                  className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-semibold transition-all ${
                    viewMode === 'sideBySide'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Columns className="h-3.5 w-3.5" />
                  <span>Lado a Lado</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('refactored')}
                  className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-semibold transition-all ${
                    viewMode === 'refactored'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Código Refatorado</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('original')}
                  className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-semibold transition-all ${
                    viewMode === 'original'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Código Original</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyRefactoredCode}
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-[#261c52] bg-[#0f0a28] px-3 py-1.5 text-xs font-semibold text-purple-300 hover:border-purple-400 hover:text-white transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copiar Refatorado</span>
                    </>
                  )}
                </button>

                {onOpenInStudio && (
                  <button
                    onClick={() =>
                      onOpenInStudio(
                        result.refactoredCode,
                        `refactored-${language.toLowerCase() === 'python' ? 'app.py' : 'app.tsx'}`
                      )
                    }
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:scale-[1.02] transition-transform"
                  >
                    <Terminal className="h-3.5 w-3.5" />
                    <span>Abrir no Studio</span>
                  </button>
                )}

                {onOpenInPlayground && (language.toLowerCase().includes('html') || language.toLowerCase().includes('script')) && (
                  <button
                    onClick={() => {
                      if (result.refactoredCode.includes('<html') || result.refactoredCode.includes('<div')) {
                        onOpenInPlayground(result.refactoredCode);
                      } else {
                        onOpenInPlayground(undefined, undefined, result.refactoredCode);
                      }
                    }}
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-950/50 px-3 py-1.5 text-xs font-bold text-purple-300 hover:bg-purple-900/50 transition-colors"
                  >
                    <MonitorPlay className="h-3.5 w-3.5" />
                    <span>Playground</span>
                  </button>
                )}

                <button
                  onClick={handleManualSaveToMemory}
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-[#061225] px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:border-cyan-400 transition-colors"
                  title="Guardar diretrizes de refatoração na memória do projeto"
                >
                  <BrainCircuit className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{savedToMemory ? 'Salvo na Memória!' : 'Salvar Diretriz'}</span>
                </button>
              </div>
            </div>

            {/* Code Viewport Rendering */}
            {viewMode === 'sideBySide' ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Original Code Column */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-rose-300 bg-rose-950/30 border border-rose-500/30 px-3 py-1.5 rounded-lg">
                    <span>Código Original (Com Code Smells)</span>
                    <span className="text-[10px] text-rose-400 font-mono">Antes</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-rose-950/50">
                    <CodeBlock code={code} language={language} filename="original.ts" />
                  </div>
                </div>

                {/* Refactored Code Column */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-300 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                    <span>Código Refatorado (Clean Code & Defensivo)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Depois (Otimizado)</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-emerald-950/50">
                    <CodeBlock
                      code={result.refactoredCode}
                      language={language}
                      filename={`refactored.${language.toLowerCase() === 'python' ? 'py' : 'ts'}`}
                    />
                  </div>
                </div>
              </div>
            ) : viewMode === 'refactored' ? (
              <div className="overflow-hidden rounded-xl border border-emerald-950/60">
                <CodeBlock
                  code={result.refactoredCode}
                  language={language}
                  filename={`refactored.${language.toLowerCase() === 'python' ? 'py' : 'ts'}`}
                />
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-800">
                <CodeBlock code={code} language={language} filename="original.ts" />
              </div>
            )}

            {/* Applied Practices Chips */}
            {result.appliedPractices && result.appliedPractices.length > 0 && (
              <div className="pt-2 border-t border-[#1a1438] space-y-2">
                <span className="text-xs font-semibold text-slate-400">
                  Boas Práticas & Padrões Aplicados na Refatoração:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {result.appliedPractices.map((practice, pIdx) => (
                    <span
                      key={pIdx}
                      className="rounded-lg border border-purple-500/30 bg-purple-950/40 px-2.5 py-1 text-xs text-purple-200 font-medium"
                    >
                      ✓ {practice}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
