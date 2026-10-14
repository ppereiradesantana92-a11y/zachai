import React, { useState } from 'react';
import {
  Languages,
  ArrowLeftRight,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  FileCode,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Layers,
  ShieldCheck,
  Code2,
  ExternalLink,
  BookOpen,
  Sliders,
  Terminal,
} from 'lucide-react';
import { CodeBlock } from '../CodeBlock';
import { LANGUAGES_LIST } from '../../data/languagesData';
import { convertCodeWithAlex } from '../../services/geminiService';
import { projectMemoryService } from '../../services/projectMemoryService';
import { CodeConversionResult, NavigationTab } from '../../types';

interface CodeConverterViewProps {
  selectedLanguageName: string;
  onSelectLanguage: (languageName: string) => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenInStudio?: (code: string, filename: string) => void;
  onOpenInPlayground?: (html?: string, css?: string, js?: string) => void;
}

const CONVERTER_LANGUAGES = [
  { id: 'python', name: 'Python', ext: '.py' },
  { id: 'typescript', name: 'TypeScript', ext: '.ts' },
  { id: 'java', name: 'Java', ext: '.java' },
  { id: 'javascript', name: 'JavaScript', ext: '.js' },
  { id: 'csharp', name: 'C#', ext: '.cs' },
  { id: 'go', name: 'Go', ext: '.go' },
  { id: 'rust', name: 'Rust', ext: '.rs' },
  { id: 'cpp', name: 'C++', ext: '.cpp' },
  { id: 'kotlin', name: 'Kotlin', ext: '.kt' },
  { id: 'php', name: 'PHP', ext: '.php' },
  { id: 'ruby', name: 'Ruby', ext: '.rb' },
  { id: 'swift', name: 'Swift', ext: '.swift' },
  { id: 'sql', name: 'SQL', ext: '.sql' },
];

const PRESET_CONVERSIONS: Record<
  string,
  {
    title: string;
    sourceLang: string;
    targetLang: string;
    badge: string;
    description: string;
    code: string;
  }
> = {
  pythonToTypeScript: {
    title: 'Python ➔ TypeScript: Processamento de Dados & Agregação',
    sourceLang: 'Python',
    targetLang: 'TypeScript',
    badge: 'PYTHON ➔ TS',
    description: 'Transforma list comprehensions, dicionários e cálculos com sum em interfaces tipadas e métodos funcionais de array.',
    code: `def processar_usuarios(usuarios: list[dict]) -> dict:
    # Filtra apenas usuários que possuem a flag ativa
    usuarios_ativos = [u for u in usuarios if u.get("ativo", False)]
    
    # Extrai a lista de nomes dos ativos
    nomes_ativos = [u["nome"] for u in usuarios_ativos]
    
    total_ativos = len(usuarios_ativos)
    
    # Calcula a média de pontos de forma segura
    if total_ativos > 0:
        media_pontos = sum(u.get("pontos", 0) for u in usuarios_ativos) / total_ativos
    else:
        media_pontos = 0.0
        
    return {
        "total_ativos": total_ativos,
        "media_pontos": round(media_pontos, 2),
        "nomes_ativos": nomes_ativos,
    }`,
  },
  pythonToJava: {
    title: 'Python ➔ Java: Modelo Orientado a Objetos & Streams',
    sourceLang: 'Python',
    targetLang: 'Java',
    badge: 'PYTHON ➔ JAVA',
    description: 'Converte funções imperativas e dicionários de Python em modelo POJO encapsulado com Java 17 Stream API.',
    code: `class ItemEstoque:
    def __init__(self, sku: str, preco: float, quantidade: int):
        self.sku = sku
        self.preco = preco
        self.quantidade = quantidade

    def valor_total_estoque(self) -> float:
        return self.preco * self.quantidade

def filtrar_itens_esgotados(itens: list[ItemEstoque]) -> list[str]:
    # Retorna lista com os códigos SKU dos itens zerados
    return [item.sku for item in itens if item.quantidade <= 0]`,
  },
  typeScriptToPython: {
    title: 'TypeScript ➔ Python: Interfaces e Manipulação Assíncrona',
    sourceLang: 'TypeScript',
    targetLang: 'Python',
    badge: 'TS ➔ PYTHON',
    description: 'Converte interfaces e métodos assíncronos em dataclasses tipadas e expressões idiomáticas de Python.',
    code: `export interface Pedido {
  id: string;
  cliente: string;
  itens: Array<{
    nome: string;
    preco: number;
    quantidade: number;
  }>;
  desconto: number;
}

export function calcularTotalPedido(pedido: Pedido): number {
  if (!pedido || !pedido.itens || pedido.itens.length === 0) {
    return 0;
  }

  const subtotal = pedido.itens.reduce(
    (acumulado, item) => acumulado + item.preco * item.quantidade,
    0
  );

  return Math.max(0, subtotal - (pedido.desconto || 0));
}`,
  },
  goToTypeScript: {
    title: 'Go ➔ TypeScript: Structs e Manipulação de Erros',
    sourceLang: 'Go',
    targetLang: 'TypeScript',
    badge: 'GO ➔ TS',
    description: 'Traduz structs, métodos com receivers e padrões de verificação de erro para TypeScript moderno.',
    code: `package main

type Transacao struct {
    ID     string  \`json:"id"\`
    Valor  float64 \`json:"valor"\`
    Status string  \`json:"status"\`
}

func FiltrarTransacoesAprovadas(transacoes []Transacao) []Transacao {
    var resultado []Transacao
    for _, t := range transacoes {
        if t.Status == "aprovada" && t.Valor > 0 {
            resultado = append(resultado, t)
        }
    }
    return resultado
}`,
  },
};

export const CodeConverterView: React.FC<CodeConverterViewProps> = ({
  selectedLanguageName,
  onSelectLanguage,
  onNavigate,
  onOpenInStudio,
  onOpenInPlayground,
}) => {
  const [sourceCode, setSourceCode] = useState(PRESET_CONVERSIONS.pythonToTypeScript.code);
  const [sourceLanguage, setSourceLanguage] = useState(PRESET_CONVERSIONS.pythonToTypeScript.sourceLang);
  const [targetLanguage, setTargetLanguage] = useState(PRESET_CONVERSIONS.pythonToTypeScript.targetLang);
  const [idiomaticConversion, setIdiomaticConversion] = useState(true);
  const [preserveComments, setPreserveComments] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CodeConversionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'sideBySide' | 'targetOnly' | 'sourceOnly'>('sideBySide');
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedToMemory, setSavedToMemory] = useState(false);

  const handleConvert = async () => {
    if (!sourceCode.trim() || isLoading) return;

    if (sourceLanguage === targetLanguage) {
      setErrorMessage('A linguagem de origem e a linguagem de destino devem ser diferentes para realizar a conversão.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSavedToMemory(false);

    try {
      const data = await convertCodeWithAlex({
        sourceCode: sourceCode.trim(),
        sourceLanguage,
        targetLanguage,
        idiomaticConversion,
        preserveComments,
      });

      setResult(data);

      // Save architectural note to project memory
      projectMemoryService.recordArchitecturalDecision(
        `Conversão de Código: ${sourceLanguage} ➔ ${targetLanguage}`,
        `Código traduzido com sucesso. ${data.summary}`,
        [`converted-module${CONVERTER_LANGUAGES.find((l) => l.name === targetLanguage)?.ext || '.ts'}`]
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao processar a tradução de código com o Alex.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    const prevSource = sourceLanguage;
    const prevTarget = targetLanguage;

    setSourceLanguage(prevTarget);
    setTargetLanguage(prevSource);

    // If we have a result, swap source code with converted code
    if (result?.convertedCode) {
      setSourceCode(result.convertedCode);
      setResult(null);
    }
  };

  const handleLoadPreset = (key: keyof typeof PRESET_CONVERSIONS) => {
    const preset = PRESET_CONVERSIONS[key];
    setSourceCode(preset.code);
    setSourceLanguage(preset.sourceLang);
    setTargetLanguage(preset.targetLang);
    setResult(null);
    setErrorMessage(null);
  };

  const handleCopyConverted = async () => {
    if (!result?.convertedCode) return;
    try {
      await navigator.clipboard.writeText(result.convertedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSaveToMemory = () => {
    if (!result) return;
    projectMemoryService.recordArchitecturalDecision(
      `Mapeamento de Linguagens: ${sourceLanguage} ➔ ${targetLanguage}`,
      `Decisão de conversão idiomática: ${result.notes.join(' | ')}`,
      [`traducao-${sourceLanguage.toLowerCase()}-${targetLanguage.toLowerCase()}`]
    );
    setSavedToMemory(true);
    setTimeout(() => setSavedToMemory(false), 2500);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#071329] via-[#091838] to-[#040d1f] p-6 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/60 px-3 py-1 text-xs font-semibold text-cyan-300">
              <Languages className="h-3.5 w-3.5 text-cyan-400" />
              <span>ALEX AI · MOTOR POLIGLOTA DE TRADUÇÃO DE CÓDIGO</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
              Conversor Automático entre Linguagens
            </h1>
            <p className="max-w-3xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Traduza trechos, algoritmos e classes de uma linguagem para outra (ex: <strong className="text-cyan-400">Python ➔ TypeScript</strong> ou <strong className="text-emerald-400">Java</strong>) mantendo a lógica de negócios, mapeando tipos e aplicando os padrões idiomáticos de cada ecossistema.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 text-xs font-semibold text-emerald-300 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Semântica e Lógica Garantidas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Conversions Quick Showcase */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Exemplos Práticos de Conversão Rápida</span>
          </span>
          <span className="text-slate-500 text-[11px]">Clique para carregar e experimentar</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(PRESET_CONVERSIONS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handleLoadPreset(key as any)}
              type="button"
              className="group flex flex-col rounded-xl border border-[#142347] bg-[#071126] p-3.5 text-left transition-all hover:border-cyan-500/50 hover:bg-[#0c1a3b] hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 line-clamp-1">
                  {preset.title}
                </span>
                <span className="rounded bg-cyan-950/80 border border-cyan-500/30 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-cyan-300">
                  {preset.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
              <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-cyan-400 opacity-80 group-hover:opacity-100">
                <span>Carregar no Editor</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Language Configuration & Direction Bar */}
      <div className="rounded-2xl border border-[#16274e] bg-[#071127] p-5 shadow-2xl space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-[#111f3d] pb-4">
          {/* Source & Target Selector */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Source Language */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">De:</span>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="rounded-lg border border-cyan-500/40 bg-[#091530] px-3 py-1.5 text-xs text-cyan-300 font-bold focus:border-cyan-400 focus:outline-none"
              >
                {CONVERTER_LANGUAGES.map((lang) => (
                  <option key={`src-${lang.id}`} value={lang.name}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwapLanguages}
              type="button"
              title="Inverter linguagens de origem e destino"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#213563] bg-[#0b1a3d] text-cyan-400 transition-all hover:border-cyan-400 hover:bg-cyan-950/40 active:scale-95"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>

            {/* Target Language */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Para:</span>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="rounded-lg border border-emerald-500/40 bg-[#071b26] px-3 py-1.5 text-xs text-emerald-300 font-bold focus:border-emerald-400 focus:outline-none"
              >
                {CONVERTER_LANGUAGES.map((lang) => (
                  <option key={`tgt-${lang.id}`} value={lang.name}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Options Toggles */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={idiomaticConversion}
                onChange={(e) => setIdiomaticConversion(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
              />
              <span className="text-[11px] sm:text-xs">Estilo Idiomático Nativo</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={preserveComments}
                onChange={(e) => setPreserveComments(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
              />
              <span className="text-[11px] sm:text-xs">Preservar Comentários</span>
            </label>

            <button
              onClick={() => {
                setSourceCode('');
                setResult(null);
                setErrorMessage(null);
              }}
              type="button"
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors ml-auto"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Limpar</span>
            </button>
          </div>
        </div>

        {/* Source Code Editor */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">
              Código Original em <strong className="text-cyan-300">{sourceLanguage}</strong>:
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              {sourceCode.split('\n').length} linhas · {sourceCode.length} caracteres
            </span>
          </div>

          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            placeholder={`// Cole seu código em ${sourceLanguage} aqui...`}
            rows={10}
            className="w-full resize-y rounded-xl border border-[#16274e] bg-[#030917] p-4 font-mono text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-400 focus:outline-none leading-relaxed"
          />
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-[11px] text-slate-400">
            O Alex analisará as estruturas sintáticas e traduzirá para o paradigma nativo de {targetLanguage}.
          </span>

          <button
            onClick={handleConvert}
            disabled={isLoading || !sourceCode.trim()}
            type="button"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Traduzindo para {targetLanguage}...</span>
              </>
            ) : (
              <>
                <Languages className="h-4 w-4" />
                <span>Traduzir para {targetLanguage}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Conversion Output Showcase */}
      {result && (
        <div className="space-y-8 animate-fadeIn">
          {/* Executive Summary Card */}
          <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-[#061821] via-[#04141c] to-[#020b10] p-4 sm:p-5 shadow-lg space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <h3 className="text-sm font-bold text-white">
                  Tradução Concluída com Sucesso ({result.sourceLanguage} ➔ {result.targetLanguage})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToMemory}
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/60 px-3 py-1.5 text-[11px] font-semibold text-cyan-300 transition-all hover:bg-cyan-900/60"
                >
                  <BrainCircuit className="h-3.5 w-3.5" />
                  <span>{savedToMemory ? 'Registrado na Memória!' : 'Salvar na Memória'}</span>
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Type Mappings & Equivalent Libraries */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Type Mappings */}
            {result.typeMappings && result.typeMappings.length > 0 && (
              <div className="rounded-xl border border-[#16274e] bg-[#071126] p-5 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Code2 className="h-4 w-4 text-cyan-400" />
                  <span>Mapeamento de Tipos & Estruturas de Dados</span>
                </div>
                <div className="space-y-2">
                  {result.typeMappings.map((tm, idx) => (
                    <div
                      key={`tm-${idx}`}
                      className="rounded-lg border border-[#122245] bg-[#040a17] p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                        <span className="rounded bg-cyan-950/80 px-2 py-0.5 text-cyan-300 font-semibold border border-cyan-500/30">
                          {tm.sourceType}
                        </span>
                        <ArrowRight className="h-3 w-3 text-slate-500 shrink-0" />
                        <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-emerald-300 font-semibold border border-emerald-500/30">
                          {tm.targetType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 pt-1">
                        {tm.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Idiomatic Notes & Libraries */}
            <div className="rounded-xl border border-[#16274e] bg-[#071126] p-5 shadow-lg space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span>Adaptações Idiomáticas & Melhores Práticas</span>
              </div>

              {result.notes && result.notes.length > 0 && (
                <ul className="space-y-2">
                  {result.notes.map((note, idx) => (
                    <li key={`note-${idx}`} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                      <span className="leading-relaxed">{note}</span>
                    </li>
                  ))}
                </ul>
              )}

              {result.equivalentLibraries && result.equivalentLibraries.length > 0 && (
                <div className="pt-2 border-t border-[#122245] space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Bibliotecas e Módulos Equivalentes
                  </div>
                  <div className="space-y-1.5">
                    {result.equivalentLibraries.map((lib, idx) => (
                      <div
                        key={`lib-${idx}`}
                        className="flex items-center justify-between gap-2 rounded bg-[#040a17] px-3 py-1.5 font-mono text-[11px] text-slate-300"
                      >
                        <span className="text-cyan-300">{lib.sourceLib}</span>
                        <span className="text-slate-500 text-[10px]">➔</span>
                        <span className="text-emerald-300 font-bold">{lib.targetLib}</span>
                        <span className="text-[10px] text-slate-500 italic hidden sm:inline">
                          ({lib.purpose})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Code Viewer View Modes Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>Código Traduzido em {result.targetLanguage}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-[#16274e] bg-[#071126] p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('sideBySide')}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    viewMode === 'sideBySide'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Lado a Lado
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('targetOnly')}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    viewMode === 'targetOnly'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Apenas {result.targetLanguage}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('sourceOnly')}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    viewMode === 'sourceOnly'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Original ({result.sourceLanguage})
                </button>
              </div>

              <button
                onClick={handleCopyConverted}
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-emerald-300 shadow-sm transition-all hover:bg-emerald-900/60"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? 'Copiado!' : 'Copiar Código'}</span>
              </button>

              {onOpenInStudio && (
                <button
                  onClick={() => {
                    const targetExt =
                      CONVERTER_LANGUAGES.find((l) => l.name === result.targetLanguage)?.ext || '.ts';
                    onOpenInStudio(result.convertedCode, `converted${targetExt}`);
                  }}
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/60 px-3 py-1.5 text-xs font-bold text-cyan-300 shadow-sm transition-all hover:bg-cyan-900/60"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Abrir no Studio</span>
                </button>
              )}

              {onOpenInPlayground &&
                (result.targetLanguage === 'JavaScript' || result.targetLanguage === 'TypeScript') && (
                  <button
                    onClick={() => onOpenInPlayground(undefined, undefined, result.convertedCode)}
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-950/60 px-3 py-1.5 text-xs font-bold text-blue-300 shadow-sm transition-all hover:bg-blue-900/60"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Playground Web</span>
                  </button>
                )}
            </div>
          </div>

          {/* Editors Layout */}
          {viewMode === 'sideBySide' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-mono">
                    <FileCode className="h-3.5 w-3.5" />
                    <span>Origem: {result.sourceLanguage}</span>
                  </span>
                </div>
                <CodeBlock
                  code={sourceCode}
                  language={result.sourceLanguage.toLowerCase()}
                  filename={`codigo-origem.${CONVERTER_LANGUAGES.find((l) => l.name === result.sourceLanguage)?.ext.replace('.', '') || 'txt'}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Traduzido: {result.targetLanguage}</span>
                  </span>
                </div>
                <CodeBlock
                  code={result.convertedCode}
                  language={result.targetLanguage.toLowerCase()}
                  filename={`codigo-traduzido.${CONVERTER_LANGUAGES.find((l) => l.name === result.targetLanguage)?.ext.replace('.', '') || 'txt'}`}
                />
              </div>
            </div>
          )}

          {viewMode === 'targetOnly' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 font-mono">
                <span>Código Traduzido em {result.targetLanguage}</span>
              </div>
              <CodeBlock
                code={result.convertedCode}
                language={result.targetLanguage.toLowerCase()}
                filename={`codigo-traduzido.${CONVERTER_LANGUAGES.find((l) => l.name === result.targetLanguage)?.ext.replace('.', '') || 'txt'}`}
              />
            </div>
          )}

          {viewMode === 'sourceOnly' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-cyan-400 font-mono">
                <span>Código Original ({result.sourceLanguage})</span>
              </div>
              <CodeBlock
                code={sourceCode}
                language={result.sourceLanguage.toLowerCase()}
                filename={`codigo-origem.${CONVERTER_LANGUAGES.find((l) => l.name === result.sourceLanguage)?.ext.replace('.', '') || 'txt'}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
