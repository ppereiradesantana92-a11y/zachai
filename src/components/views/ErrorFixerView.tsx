import React, { useState, useRef } from 'react';
import {
  Wrench,
  AlertCircle,
  FileCode,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  HelpCircle,
  Bot,
  MessageSquareCode,
  ArrowRight,
  Terminal,
  FileText,
  Check,
  Loader2,
  X,
} from 'lucide-react';
import { COMMON_ERROR_PRESETS } from '../../data/initialData';
import { LANGUAGES_LIST } from '../../data/languagesData';
import { CodeBlock } from '../CodeBlock';
import { diagnoseErrorWithAlex } from '../../services/geminiService';
import { AlexDiagnosisResult } from '../../types';

interface ErrorFixerViewProps {
  selectedLanguageName: string;
  onSelectLanguage: (languageName: string) => void;
  onOpenInChat?: (promptText: string) => void;
}

interface SimulatedErrorImage {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  extractedError: string;
  associatedCode: string;
  language: string;
  previewColor: string;
}

const PRESET_SCREENSHOTS: SimulatedErrorImage[] = [
  {
    id: 'print-typeerror',
    title: 'Print do Console DevTools: TypeError',
    subtitle: 'Uncaught TypeError: Cannot read properties of undefined (reading \'map\')',
    category: 'Console do Navegador',
    extractedError: `Uncaught TypeError: Cannot read properties of undefined (reading 'map')
    at ListaProdutos (ProductList.tsx:14:21)
    at renderWithHooks (react-dom.development.js:16305:18)`,
    associatedCode: `export function ListaProdutos({ dados }: { dados?: { itens?: string[] } }) {
  // Erro: 'dados' ou 'dados.itens' ainda não chegaram da API
  return (
    <div>
      {dados.itens.map((item, i) => (
        <span key={i}>{item}</span>
      ))}
    </div>
  );
}`,
    language: 'TypeScript',
    previewColor: 'from-rose-950 to-[#0a0f26]',
  },
  {
    id: 'print-cors',
    title: 'Print da Aba Network: Falha de CORS',
    subtitle: 'Access to fetch has been blocked by CORS policy: No \'Access-Control-Allow-Origin\'',
    category: 'Rede & Requisição',
    extractedError: `Access to fetch at 'https://api.meusistema.com/v1/auth' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.`,
    associatedCode: `// Cliente (Frontend) fazendo requisição:
fetch('https://api.meusistema.com/v1/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: 'xyz' })
});`,
    language: 'JavaScript',
    previewColor: 'from-amber-950 to-[#0a0f26]',
  },
  {
    id: 'print-rerender',
    title: 'Print da Tela de Erro: Loop Infinito',
    subtitle: 'Error: Maximum update depth exceeded. Repeatedly calls setState',
    category: 'React Runtime',
    extractedError: `Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
    at checkForNestedUpdates (react-dom.development.js:27374)`,
    associatedCode: `import { useState, useEffect } from 'react';

export function ContadorInfinito() {
  const [contador, setContador] = useState(0);

  // Erro: sem array de dependências, chama setState a cada render
  useEffect(() => {
    setContador(contador + 1);
  });

  return <div>Contagem: {contador}</div>;
}`,
    language: 'TypeScript',
    previewColor: 'from-purple-950 to-[#0a0f26]',
  },
  {
    id: 'print-python',
    title: 'Print do Terminal: IndexError em Python',
    subtitle: 'IndexError: list index out of range at linha 8',
    category: 'Terminal / Script',
    extractedError: `Traceback (most recent call last):
  File "processador.py", line 8, in <module>
    primeiro_item = fila_pedidos[0]
IndexError: list index out of range`,
    associatedCode: `fila_pedidos = []

# Erro: acessa índice 0 em lista vazia sem checagem prévia
primeiro_item = fila_pedidos[0]
print(f"Processando: {primeiro_item}")`,
    language: 'Python',
    previewColor: 'from-blue-950 to-[#0a0f26]',
  },
];

export const ErrorFixerView: React.FC<ErrorFixerViewProps> = ({
  selectedLanguageName,
  onSelectLanguage,
  onOpenInChat,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [errorMessage, setErrorMessage] = useState(COMMON_ERROR_PRESETS[0].error);
  const [codeContext, setCodeContext] = useState(COMMON_ERROR_PRESETS[0].code);

  // Image Upload & Clipboard state
  const [activeImageDataUrl, setActiveImageDataUrl] = useState<string | null>(null);
  const [activeImageName, setActiveImageName] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [selectedPresetImage, setSelectedPresetImage] = useState<SimulatedErrorImage | null>(null);

  // Diagnosis state & results
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<AlexDiagnosisResult | null>(null);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert File to base64 DataURL
  const handleProcessImage = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setActiveImageDataUrl(result);
        setActiveImageName(file.name);
        setSelectedPresetImage(null);
        setActiveTab('image');
      }
    };
    reader.readAsDataURL(file);
  };

  // Clipboard Paste (Ctrl+V) handler
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleProcessImage(file);
          return;
        }
      }
    }
  };

  // Drag and Drop
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
      handleProcessImage(files[0]);
    }
  };

  // Select text preset
  const handleSelectTextPreset = (presetIndex: number) => {
    const selected = COMMON_ERROR_PRESETS[presetIndex];
    setErrorMessage(selected.error);
    setCodeContext(selected.code);
    onSelectLanguage(selected.language);
    setDiagnosisResult(null);
    setDiagnosisError(null);
    setActiveImageDataUrl(null);
    setActiveImageName(null);
  };

  // Select screenshot preset
  const handleSelectPresetImage = (preset: SimulatedErrorImage) => {
    setSelectedPresetImage(preset);
    setErrorMessage(preset.extractedError);
    setCodeContext(preset.associatedCode);
    onSelectLanguage(preset.language);
    setActiveImageDataUrl(null);
    setActiveImageName(null);
    setDiagnosisResult(null);
    setDiagnosisError(null);
  };

  // Run real diagnosis via backend API / Gemini
  const handleDiagnose = async () => {
    if (!errorMessage.trim() && !activeImageDataUrl && !selectedPresetImage) return;

    setIsDiagnosing(true);
    setDiagnosisError(null);

    try {
      const result = await diagnoseErrorWithAlex({
        errorMessage: errorMessage.trim() || undefined,
        codeContext: codeContext.trim() || undefined,
        language: selectedLanguageName,
        imageBase64: activeImageDataUrl || undefined,
      });

      setDiagnosisResult(result);
    } catch (err: any) {
      console.error('[Diagnose error]', err);
      setDiagnosisError(err?.message || 'Falha ao processar diagnóstico com o Alex.');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleClear = () => {
    setErrorMessage('');
    setCodeContext('');
    setActiveImageDataUrl(null);
    setActiveImageName(null);
    setSelectedPresetImage(null);
    setDiagnosisResult(null);
    setDiagnosisError(null);
  };

  return (
    <div
      onPaste={handlePaste}
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
          if (file) handleProcessImage(file);
        }}
        className="hidden"
      />

      {/* Alex Identity Banner */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-cyan-500/30 bg-[#070e24] p-5 shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-black shadow-md shadow-cyan-500/25">
            <Bot className="h-6 w-6 text-[#050813]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">
                Módulo Alex · Análise Multimodal
              </span>
              <span className="rounded border border-cyan-500/30 bg-cyan-950/60 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                Gemini 2.5 Flash Habilitado
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-xl">
              "Envie um print do seu terminal, cole uma captura de tela com Ctrl+V ou forneça o código para eu identificar a linha exata e explicar a causa raiz de forma simples."
            </p>
          </div>
        </div>

        {/* Synchronized Language Indicator */}
        <div className="flex items-center gap-2 rounded-lg border border-[#162544] bg-[#050a1b] px-3 py-2 text-xs">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400">Compilador / Sintaxe:</span>
            <span className="font-mono font-bold text-cyan-300">
              {selectedLanguageName}
            </span>
          </div>
          <select
            value={selectedLanguageName}
            onChange={(e) => onSelectLanguage(e.target.value)}
            className="rounded border border-[#1d2b4a] bg-[#091126] px-2 py-1 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
          >
            {LANGUAGES_LIST.map((lang) => (
              <option key={lang.id} value={lang.name}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#141e34] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'text'
                ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 shadow-sm'
                : 'border border-[#141e35] bg-[#070c1b] text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>1. Logs & Código Fonte</span>
          </button>

          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'image'
                ? 'border border-purple-500/40 bg-purple-500/20 text-purple-300 shadow-sm'
                : 'border border-[#141e35] bg-[#070c1b] text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
            <span>2. Enviar / Colar Print (Ctrl+V)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline">Dica:</span>
          <span>Pressione <kbd className="rounded bg-[#0d162e] border border-[#1b2b4e] px-1 py-0.5 font-mono text-[10px] text-cyan-300">Ctrl+V</kbd> para colar capturas de tela diretamente</span>
        </div>
      </div>

      {/* TAB 2: Image / Screenshot Upload & Simulation Panel */}
      {activeTab === 'image' && (
        <div className="mb-6 space-y-4 rounded-xl border border-purple-950/40 bg-[#080c1d] p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
              <ImageIcon className="h-4 w-4 text-purple-400" />
              <span>Capturas de Tela e Prints para Análise Multimodal</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Suporta PNG, JPG, WebP e colar do clipboard
            </span>
          </div>

          {/* Active Uploaded Image Preview */}
          {activeImageDataUrl ? (
            <div className="relative overflow-hidden rounded-xl border border-purple-500/50 bg-[#060a17] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-purple-200 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Print Carregado: {activeImageName || 'imagem-do-clipboard.png'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveImageDataUrl(null);
                    setActiveImageName(null);
                  }}
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-400 text-xs flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Remover imagem</span>
                </button>
              </div>

              <div className="flex justify-center bg-black/50 p-2 rounded-lg">
                <img
                  src={activeImageDataUrl}
                  alt="Print do erro para análise"
                  className="max-h-60 w-auto rounded border border-[#1b2745] object-contain shadow-lg"
                />
              </div>
            </div>
          ) : (
            /* Upload Dropzone */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#1f2b4c] bg-[#050814] p-6 text-center cursor-pointer transition-all hover:border-purple-500/50 hover:bg-[#070b1c]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
                <Upload className="h-6 w-6" />
              </div>
              <div className="text-sm font-semibold text-slate-200">
                Arraste um print aqui ou clique para selecionar
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Você também pode apenas pressionar <kbd className="font-mono text-cyan-300">Ctrl+V</kbd> em qualquer lugar da tela
              </p>
            </div>
          )}

          {/* Preset Screenshots for Quick Multimodal Testing */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Ou teste com prints de erros simulados:
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {PRESET_SCREENSHOTS.map((preset) => {
                const isSelected = selectedPresetImage?.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPresetImage(preset)}
                    type="button"
                    className={`flex flex-col text-left rounded-lg border p-3 transition-all ${
                      isSelected
                        ? 'border-purple-500/60 bg-purple-950/40 shadow-md ring-1 ring-purple-500/40'
                        : 'border-[#17223d] bg-[#060a17] hover:border-slate-700 hover:bg-[#0a1125]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-mono text-purple-400">{preset.category}</span>
                      <span className="font-mono text-cyan-400">{preset.language}</span>
                    </div>
                    <div className="font-semibold text-xs text-slate-200 leading-tight">
                      {preset.title.split(':')[1] || preset.title}
                    </div>
                    <div className="mt-2 line-clamp-2 rounded bg-black/40 p-1.5 font-mono text-[10px] text-rose-300/90 leading-tight">
                      {preset.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Preset Quick Selectors (when in text tab) */}
      {activeTab === 'text' && (
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Erros frequentes em texto:</span>
          {COMMON_ERROR_PRESETS.map((preset, idx) => (
            <button
              key={preset.name}
              onClick={() => handleSelectTextPreset(idx)}
              className="rounded border border-[#1b2744] bg-[#091125] px-2.5 py-1 text-slate-300 transition-colors hover:border-rose-500/40 hover:text-rose-300"
            >
              {preset.name.split(':')[0]}
            </button>
          ))}
        </div>
      )}

      {/* Main Dual Inputs Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Error / Stack Trace Input */}
        <div className="flex flex-col rounded-xl border border-rose-950/40 bg-[#090b1c] p-4 shadow-xl">
          <div className="mb-2 flex items-center justify-between text-xs text-rose-300">
            <span className="flex items-center gap-1.5 font-semibold">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              <span>Mensagem de Erro / Stack Trace Extraído:</span>
            </span>
            <span className="text-[11px] text-slate-500">Console / Logs</span>
          </div>

          <textarea
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            rows={8}
            placeholder="Cole aqui a mensagem de erro (ou deixe vazio se estiver enviando apenas um print para o Alex ler)..."
            className="w-full flex-1 resize-y rounded-lg border border-[#19223c] bg-[#050713] p-3 font-mono text-xs leading-relaxed text-rose-200 placeholder-slate-600 focus:border-rose-500/40 focus:outline-none"
          />
        </div>

        {/* Code Snippet Input */}
        <div className="flex flex-col rounded-xl border border-[#16233f] bg-[#080d21] p-4 shadow-xl">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-semibold">
              <FileCode className="h-4 w-4 text-cyan-400" />
              <span>Código-Fonte Onde a Falha Ocorre (Opcional):</span>
            </span>
            <span className="text-[11px] text-cyan-300 font-mono">
              {selectedLanguageName}
            </span>
          </div>

          <textarea
            value={codeContext}
            onChange={(e) => setCodeContext(e.target.value)}
            rows={8}
            placeholder="// Cole aqui o componente ou função para o Alex aplicar a correção..."
            className="w-full flex-1 resize-y rounded-lg border border-[#19223c] bg-[#050713] p-3 font-mono text-xs leading-relaxed text-slate-200 placeholder-slate-600 focus:border-cyan-500/40 focus:outline-none"
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handleClear}
          type="button"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Limpar campos</span>
        </button>

        <button
          onClick={handleDiagnose}
          disabled={(!errorMessage.trim() && !activeImageDataUrl && !selectedPresetImage) || isDiagnosing}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-md transition-all ${
            (errorMessage.trim() || activeImageDataUrl || selectedPresetImage) && !isDiagnosing
              ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:opacity-95 shadow-cyan-950/40 active:scale-95 text-black font-bold'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isDiagnosing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
              <span>
                {activeImageDataUrl || selectedPresetImage
                  ? 'Alex está a analisar o seu print...'
                  : 'Alex auditando sintaxe e causa raiz...'}
              </span>
            </>
          ) : (
            <>
              <Wrench className="h-3.5 w-3.5" />
              <span>Diagnosticar com Alex</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Loading State Banner */}
      {isDiagnosing && (
        <div className="mt-5 flex items-center gap-3.5 rounded-xl border border-cyan-500/40 bg-[#06122b] p-4 text-cyan-300 shadow-xl shadow-cyan-950/40 animate-pulse">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-white">
              {activeImageDataUrl || selectedPresetImage
                ? 'Alex está a analisar o seu print...'
                : `Alex está a analisar o erro e código em ${selectedLanguageName}...`}
            </span>
            <span className="text-xs text-slate-300">
              {activeImageDataUrl || selectedPresetImage
                ? 'Processando imagem multimodal no Gemini 2.5 Flash, identificando linha exata e sintetizando correção didática...'
                : 'Inspecionando sintaxe, causa raiz e formatando bloco de código com boas práticas...'}
            </span>
          </div>
        </div>
      )}

      {/* Error Message if API fails */}
      {diagnosisError && (
        <div className="mt-4 rounded-xl border border-rose-800/40 bg-rose-950/20 p-4 text-xs text-rose-300">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <span>Erro na comunicação com a API do Alex</span>
          </div>
          <p className="mt-1 text-slate-300">{diagnosisError}</p>
        </div>
      )}

      {/* Alex Didactic Multimodal Diagnostic Output */}
      {diagnosisResult && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#141e35] pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                A
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  Diagnóstico Multimodal de Alex
                </h2>
                <div className="text-[11px] text-slate-400">
                  Linguagem: <span className="text-cyan-300 font-mono">{selectedLanguageName}</span>
                  {diagnosisResult.identifiedLine && (
                    <>
                      <span className="mx-1.5 text-slate-600">·</span>
                      <span className="text-purple-300 font-mono">{diagnosisResult.identifiedLine}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <span className="font-mono text-xs text-emerald-400 self-start sm:self-auto flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Análise Concluída</span>
            </span>
          </div>

          {/* Root Cause Card */}
          <div className="rounded-xl border border-rose-900/40 bg-[#0d0f24] p-4 text-xs">
            <div className="flex items-center gap-2 font-semibold text-rose-300 text-sm">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              <span>1. Causa Raiz Identificada</span>
            </div>

            <div className="mt-2 font-medium text-white text-xs">
              {diagnosisResult.rootCause}
            </div>

            <p className="mt-2 text-slate-300 leading-relaxed text-xs">
              {diagnosisResult.explanation}
            </p>
          </div>

          {/* Corrected Code Block with Quick Copy */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>2. Código Corrigido & Resiliente</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Pronto para copiar e colar no seu projeto
              </span>
            </div>

            <CodeBlock
              language={diagnosisResult.correctedCode?.language || selectedLanguageName.toLowerCase()}
              filename={diagnosisResult.correctedCode?.filename || `solucao-alex.${selectedLanguageName.toLowerCase() === 'python' ? 'py' : 'tsx'}`}
              code={diagnosisResult.correctedCode?.code || codeContext}
            />
          </div>

          {/* Alex's Golden Tip */}
          <div className="rounded-xl border border-cyan-500/30 bg-[#070e22] p-4 text-xs">
            <div className="flex items-center gap-2 font-semibold text-cyan-300">
              <Sparkles className="h-4 w-4" />
              <span>3. Dica de Ouro do Alex para Iniciantes</span>
            </div>
            <p className="mt-2 text-slate-200 leading-relaxed text-xs">
              {diagnosisResult.goldenTip}
            </p>

            {/* Ask Alex in Chat */}
            {onOpenInChat && (
              <div className="mt-4 flex items-center justify-between border-t border-[#131d34] pt-3">
                <span className="text-slate-400 text-[11px]">
                  Ficou alguma dúvida sobre este erro ou print?
                </span>
                <button
                  onClick={() =>
                    onOpenInChat(
                      `Alex, sobre a causa raiz "${diagnosisResult.rootCause}": pode me explicar passo a passo como implementar essa solução no meu projeto em ${selectedLanguageName}?`
                    )
                  }
                  type="button"
                  className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                >
                  <span>Continuar com Alex no Chat</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
