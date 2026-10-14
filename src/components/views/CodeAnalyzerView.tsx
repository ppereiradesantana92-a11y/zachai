import React, { useState, useRef, useEffect } from 'react';
import {
  Code2,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Check,
  FileCode,
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { CodeBlock } from '../CodeBlock';
import { LANGUAGES_LIST } from '../../data/languagesData';
import { analyzeCodeWithAlex } from '../../services/geminiService';
import { CodeAnalysisResult } from '../../types';

const SAMPLE_CODE_SNIPPETS: Record<string, { title: string; code: string; lang: string }> = {
  reactFetch: {
    title: 'Componente com Fetch sem Cleanup e sem AbortController',
    lang: 'TypeScript',
    code: `import React, { useState, useEffect } from 'react';

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Problema: Sem AbortController, causa memory leak se desmontar rápido
  useEffect(() => {
    fetch('https://api.empresa.com/users/' + userId)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Carregando...</div>;
  return <div>{user.name} - {user.email}</div>;
}`,
  },
  sqlInjection: {
    title: 'Função com Risco de SQL Injection e Concatenação',
    lang: 'SQL',
    code: `// Risco crítico de segurança: query construída por concatenação direta
async function buscarUsuario(conexao, email, status) {
  const sql = "SELECT id, nome, senha_hash FROM usuarios WHERE email = '" + email + "' AND status = '" + status + "'";
  const [linhas] = await conexao.query(sql);
  return linhas[0];
}`,
  },
  complexityLoop: {
    title: 'Algoritmo com Complexidade O(n²) e Busca Linear Redundante',
    lang: 'Python',
    code: `def encontrar_intersecao(lista_a: list[int], lista_b: list[int]) -> list[int]:
    resultado = []
    # Loop aninhado redundante: O(n * m)
    for a in lista_a:
        for b in lista_b:
            if a == b and a not in resultado:
                resultado.append(a)
    return resultado`,
  },
};

interface CodeAnalyzerViewProps {
  selectedLanguageName: string;
  onSelectLanguage: (languageName: string) => void;
}

export const CodeAnalyzerView: React.FC<CodeAnalyzerViewProps> = ({
  selectedLanguageName,
  onSelectLanguage,
}) => {
  const [code, setCode] = useState(SAMPLE_CODE_SNIPPETS.reactFetch.code);
  const [analysisMode, setAnalysisMode] = useState<'all' | 'security' | 'performance' | 'cleanCode'>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CodeAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Multimodal image state
  const [attachedImage, setAttachedImage] = useState<{
    dataUrl: string;
    name: string;
    mimeType: string;
  } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process image file to base64 DataURL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setAttachedImage({
          dataUrl,
          name: file.name || 'print-codigo.png',
          mimeType: file.type || 'image/png',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Clipboard Paste handler (Ctrl+V) across window
  useEffect(() => {
    const handleWindowPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processImageFile(file);
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, []);

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      processImageFile(files[0]);
    }
  };

  const handleRunAnalysis = async () => {
    if (!code.trim() && !attachedImage) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await analyzeCodeWithAlex({
        code: code.trim() || undefined,
        language: selectedLanguageName,
        analysisMode,
        imageBase64: attachedImage?.dataUrl,
        mimeType: attachedImage?.mimeType,
      });

      setAnalysisResult(result);
    } catch (err: any) {
      console.error('[Analyze Code Error]', err);
      setAnalysisError(err?.message || 'Falha ao analisar código com o Alex.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (key: keyof typeof SAMPLE_CODE_SNIPPETS) => {
    const preset = SAMPLE_CODE_SNIPPETS[key];
    setCode(preset.code);
    onSelectLanguage(preset.lang);
    setAnalysisResult(null);
    setAnalysisError(null);
    setAttachedImage(null);
  };

  const handleReset = () => {
    setCode('');
    setAnalysisResult(null);
    setAnalysisError(null);
    setAttachedImage(null);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`mx-auto flex w-full max-w-5xl flex-col px-4 py-8 sm:px-6 transition-colors ${
        isDraggingOver ? 'bg-cyan-950/20' : ''
      }`}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processImageFile(file);
        }}
        className="hidden"
      />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-1 border-b border-[#141e34] pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
          <Code2 className="h-4 w-4" />
          <span>MOTOR DE AUDITORIA & ANÁLISE MULTIMODAL</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Analisar Código Fonte & Prints
        </h1>
        <p className="text-sm text-slate-300">
          Submeta código ou envie prints de IDE/código para o Alex inspecionar segurança, complexidade e padrões limpos.
        </p>
      </div>

      {/* Preset Quick Selectors */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium">Exemplos rápidos:</span>
          <button
            onClick={() => handleSelectPreset('reactFetch')}
            className="rounded border border-[#1b2744] bg-[#091125] px-2.5 py-1 text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
          >
            React Memory Leak (TS)
          </button>
          <button
            onClick={() => handleSelectPreset('sqlInjection')}
            className="rounded border border-[#1b2744] bg-[#091125] px-2.5 py-1 text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
          >
            Segurança SQL
          </button>
          <button
            onClick={() => handleSelectPreset('complexityLoop')}
            className="rounded border border-[#1b2744] bg-[#091125] px-2.5 py-1 text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
          >
            O(n²) Otimização (Python)
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span>Dica: Use <kbd className="font-mono text-cyan-300">Ctrl+V</kbd> para colar print direto</span>
        </div>
      </div>

      {/* Code Editor & Multimodal Panel */}
      <div className="rounded-xl border border-[#182440] bg-[#070d1e] p-4 shadow-xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#141e35] pb-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-300">
              <FileCode className="h-3.5 w-3.5 text-cyan-400" />
              <span>Linguagem Ativa:</span>
            </div>
            <select
              value={selectedLanguageName}
              onChange={(e) => onSelectLanguage(e.target.value)}
              className="rounded border border-[#1d2c4c] bg-[#0c152d] px-2.5 py-1 text-cyan-300 font-semibold focus:outline-none"
            >
              {LANGUAGES_LIST.map((lang) => (
                <option key={lang.id} value={lang.name}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Modo de Auditoria:</span>
            <div className="flex rounded-md border border-[#1a2744] bg-[#091024] p-0.5">
              <button
                onClick={() => setAnalysisMode('all')}
                className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  analysisMode === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Completo
              </button>
              <button
                onClick={() => setAnalysisMode('security')}
                className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  analysisMode === 'security'
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Segurança
              </button>
              <button
                onClick={() => setAnalysisMode('performance')}
                className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  analysisMode === 'performance'
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Performance
              </button>
            </div>
          </div>
        </div>

        {/* Attached Image Preview if available */}
        {attachedImage && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-purple-500/40 bg-[#060a18] p-2.5">
            <div className="flex items-center gap-3">
              <img
                src={attachedImage.dataUrl}
                alt="Print de código"
                className="h-12 w-12 rounded border border-[#1e2c4d] object-cover"
              />
              <div>
                <div className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
                  <span>Print de Código Anexado: {attachedImage.name}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Alex extrairá e auditará a sintaxe visualmente
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
              title="Remover print"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Textarea */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={9}
          placeholder="// Cole aqui o código que deseja inspecionar (ou anexe um print abaixo com o botão ou Ctrl+V)..."
          className="w-full resize-y bg-transparent font-mono text-xs leading-relaxed text-slate-100 placeholder-slate-600 focus:outline-none"
        />

        {/* Action Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#141e35] pt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              type="button"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Limpar editor</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors ${
                attachedImage
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-slate-400 hover:bg-[#101934] hover:text-slate-200'
              }`}
              title="Anexar print de código ou IDE"
            >
              <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
              <span>{attachedImage ? 'Print Anexado' : '+ Anexar Print (ou Ctrl+V)'}</span>
            </button>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={(!code.trim() && !attachedImage) || isAnalyzing}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-md transition-all ${
              (code.trim() || attachedImage) && !isAnalyzing
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-cyan-500/20 active:scale-95 text-black font-bold'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
                <span>
                  {attachedImage
                    ? 'Alex está a analisar o seu print...'
                    : 'Alex analisando código com auditoria estática...'}
                </span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Executar Análise com Alex</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Loading State Banner */}
      {isAnalyzing && (
        <div className="mt-5 flex items-center gap-3.5 rounded-xl border border-cyan-500/40 bg-[#06122b] p-4 text-cyan-300 shadow-xl shadow-cyan-950/40 animate-pulse">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-white">
              {attachedImage
                ? 'Alex está a analisar o seu print...'
                : `Alex está a auditar o código em ${selectedLanguageName}...`}
            </span>
            <span className="text-xs text-slate-300">
              {attachedImage
                ? 'Inspecionando captura de tela via Gemini 2.5 Flash, identificando padrões de segurança e formulando refatoração...'
                : 'Avaliando vulnerabilidades, complexidade assintótica e otimizando código...'}
            </span>
          </div>
        </div>
      )}

      {/* Error Message if API fails */}
      {analysisError && (
        <div className="mt-4 rounded-xl border border-rose-800/40 bg-rose-950/20 p-4 text-xs text-rose-300">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <span>Erro na comunicação com a API do Alex</span>
          </div>
          <p className="mt-1 text-slate-300">{analysisError}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                A
              </div>
              <h2 className="text-lg font-bold text-white">
                Relatório de Auditoria Técnica de Alex
              </h2>
            </div>
            <span className="font-mono text-xs text-cyan-400">
              Linguagem: {selectedLanguageName}
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-[#172442] bg-[#080f24] p-3 text-center">
              <span className="text-[11px] text-slate-400">Nota de Qualidade</span>
              <div className="mt-1 font-mono text-2xl font-bold text-amber-400 tabular-nums">
                {analysisResult.score}<span className="text-xs text-slate-500">/100</span>
              </div>
            </div>

            <div className="rounded-lg border border-[#172442] bg-[#080f24] p-3 text-center">
              <span className="text-[11px] text-slate-400">Vulnerabilidades</span>
              <div className="mt-1 font-mono text-2xl font-bold text-rose-400 tabular-nums">
                {analysisResult.metrics.securityIssues} Alerta(s)
              </div>
            </div>

            <div className="rounded-lg border border-[#172442] bg-[#080f24] p-3 text-center">
              <span className="text-[11px] text-slate-400">Complexidade</span>
              <div className="mt-1 font-mono text-sm font-bold text-cyan-400 mt-2 truncate">
                {analysisResult.metrics.complexity}
              </div>
            </div>

            <div className="rounded-lg border border-[#172442] bg-[#080f24] p-3 text-center">
              <span className="text-[11px] text-slate-400">Manutenibilidade</span>
              <div className="mt-1 font-mono text-sm font-bold text-emerald-400 mt-2 truncate">
                {analysisResult.metrics.maintainability}
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          {analysisResult.summary && (
            <div className="rounded-lg border border-[#182440] bg-[#080e22] p-3 text-xs text-slate-300">
              <span className="font-semibold text-cyan-300">Resumo da Auditoria: </span>
              {analysisResult.summary}
            </div>
          )}

          {/* Finding Items */}
          <div className="space-y-3">
            {analysisResult.recommendations.map((rec, index) => {
              const isCrit = rec.severity === 'critical';
              const isWarn = rec.severity === 'warning';
              return (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${
                    isCrit
                      ? 'border-rose-900/40 bg-[#0d1022]'
                      : isWarn
                      ? 'border-amber-900/40 bg-[#0d1022]'
                      : 'border-cyan-900/30 bg-[#070e22]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs">
                    {isCrit ? (
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                    ) : isWarn ? (
                      <Zap className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                    )}
                    <span
                      className={
                        isCrit
                          ? 'text-rose-400'
                          : isWarn
                          ? 'text-amber-400'
                          : 'text-cyan-400'
                      }
                    >
                      [{rec.severity.toUpperCase()}] {rec.title}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Refactored Code Suggestion */}
          {analysisResult.optimizedCode && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Código Otimizado & Refatorado por Alex ({selectedLanguageName})</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Pronto para copiar com botão de cópia rápida
                </span>
              </div>
              <CodeBlock
                language={selectedLanguageName.toLowerCase()}
                filename={`solucao-alex.${selectedLanguageName.toLowerCase() === 'python' ? 'py' : selectedLanguageName.toLowerCase() === 'sql' ? 'sql' : 'ts'}`}
                code={analysisResult.optimizedCode}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
