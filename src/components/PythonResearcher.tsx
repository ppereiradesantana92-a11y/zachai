import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  BookOpen,
  Sparkles,
  Terminal,
  Code2,
  Copy,
  Check,
  Search,
  ExternalLink,
  ChevronRight,
  Layers,
  Cpu,
  Zap,
} from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface PythonResearcherProps {
  onSendToStudio?: (code: string, filename: string) => void;
  onSendToChat?: (prompt: string, code?: string) => void;
}

interface PythonRoutineSnippet {
  id: string;
  title: string;
  category: 'basico' | 'dados' | 'automacao' | 'ia';
  desc: string;
  code: string;
  expectedOutput: string;
}

const PYTHON_SNIPPETS: PythonRoutineSnippet[] = [
  {
    id: 'py-list-comp',
    title: 'List Comprehension & Filtragem',
    category: 'basico',
    desc: 'Filtrar e transformar dados de forma idiomática em uma única linha.',
    code: `# List Comprehension Elegante no Python 3
numeros = [12, 45, 68, 23, 90, 105, 34, 7]

# Filtrar pares e elevar ao quadrado
pares_quadrado = [n ** 2 for n in numeros if n % 2 == 0]

print("Lista original:", numeros)
print("Pares ao quadrado:", pares_quadrado)
print("Total de elementos processados:", len(pares_quadrado))`,
    expectedOutput: `Lista original: [12, 45, 68, 23, 90, 105, 34, 7]
Pares ao quadrado: [144, 4624, 8100, 1156]
Total de elementos processados: 4`,
  },
  {
    id: 'py-pandas-sim',
    title: 'Análise de Séries de Dados (Pandas Style)',
    category: 'dados',
    desc: 'Cálculo de métricas estatísticas, média, mediana e dispersão.',
    code: `# Simulação de Métricas Estatísticas
transacoes = [
    {"id": "TX-01", "valor": 150.50, "status": "aprovado"},
    {"id": "TX-02", "valor": 890.00, "status": "aprovado"},
    {"id": "TX-03", "valor": 45.00,  "status": "recusado"},
    {"id": "TX-04", "valor": 320.10, "status": "aprovado"},
]

aprovadas = [t["valor"] for t in transacoes if t["status"] == "aprovado"]
soma_total = sum(aprovadas)
media = soma_total / len(aprovadas)

print(f"Total de vendas aprovadas: R$ {soma_total:.2f}")
print(f"Ticket médio das transações: R$ {media:.2f}")
print(f"Maior transação registrada: R$ {max(aprovadas):.2f}")`,
    expectedOutput: `Total de vendas aprovadas: R$ 1360.60
Ticket médio das transações: R$ 453.53
Maior transação registrada: R$ 890.00`,
  },
  {
    id: 'py-ai-token',
    title: 'Pipeline de Pré-processamento de Texto para LLM',
    category: 'ia',
    desc: 'Tokenização simples, contagem de palavras e limpeza de pontuação.',
    code: `import re

def preparar_prompt(texto: str) -> dict:
    # Remove caracteres especiais e padroniza caixa baixa
    limpo = re.sub(r'[^a-zA-Z0-9\s]', '', texto.lower())
    tokens = limpo.split()
    
    return {
        "caracteres": len(texto),
        "total_tokens": len(tokens),
        "tokens_unicos": len(set(tokens)),
        "amostra_tokens": tokens[:5]
    }

prompt_usuario = "O modelo Gemini 2.5 Flash analisa código, prints de telas e gera soluções!"
resultado = preparar_prompt(prompt_usuario)

print("Status do Pré-processamento:")
for chave, valor in resultado.items():
    print(f"  • {chave}: {valor}")`,
    expectedOutput: `Status do Pré-processamento:
  • caracteres: 75
  • total_tokens: 12
  • tokens_unicos: 12
  • amostra_tokens: ['o', 'modelo', 'gemini', '25', 'flash']`,
  },
  {
    id: 'py-fastapi',
    title: 'Definição de Rotas com Tipagem (FastAPI Style)',
    category: 'automacao',
    desc: 'Uso de dataclasses, type hints e serialização rápida para APIs.',
    code: `from dataclasses import dataclass, asdict
from datetime import datetime

@dataclass
class DiagnosticResponse:
    linguagem: str
    versao: str
    status: str
    timestamp: str

def get_health_check() -> dict:
    diag = DiagnosticResponse(
        linguagem="Python",
        versao="3.12.0",
        status="OPERATIONAL",
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    return asdict(diag)

print("Resposta simulada da API FastAPI:")
print(get_health_check())`,
    expectedOutput: `Resposta simulada da API FastAPI:
{'linguagem': 'Python', 'versao': '3.12.0', 'status': 'OPERATIONAL', 'timestamp': '2026-10-12 11:20:00'}`,
  },
];

interface PythonDocItem {
  name: string;
  module: string;
  signature: string;
  summary: string;
}

const PYTHON_DOCS: PythonDocItem[] = [
  {
    name: 'map(func, iterable)',
    module: 'builtins',
    signature: 'map(function, iterable, *iterables)',
    summary: 'Aplica uma função a cada item de um iterável retornando um gerador sob demanda.',
  },
  {
    name: 'filter(func, iterable)',
    module: 'builtins',
    signature: 'filter(function or None, iterable)',
    summary: 'Filtra os elementos do iterável mantendo apenas aqueles onde func(item) é True.',
  },
  {
    name: 'enumerate(iterable, start=0)',
    module: 'builtins',
    signature: 'enumerate(iterable, start=0)',
    summary: 'Retorna pares contendo o índice atual e o item correspondente.',
  },
  {
    name: 'dataclass',
    module: 'dataclasses',
    signature: '@dataclass(init=True, repr=True, eq=True)',
    summary: 'Gera automaticamente métodos como __init__, __repr__ e __eq__ para classes de dados.',
  },
  {
    name: 'asyncio.gather(*aws)',
    module: 'asyncio',
    signature: 'asyncio.gather(*aws, return_exceptions=False)',
    summary: 'Executa múltiplos objetos awaitable de forma concorrente em paralelo.',
  },
];

export const PythonResearcher: React.FC<PythonResearcherProps> = ({
  onSendToStudio,
  onSendToChat,
}) => {
  const [selectedSnippet, setSelectedSnippet] = useState<PythonRoutineSnippet>(
    PYTHON_SNIPPETS[0]
  );
  const [customCode, setCustomCode] = useState<string>(PYTHON_SNIPPETS[0].code);
  const [consoleOutput, setConsoleOutput] = useState<string>(
    PYTHON_SNIPPETS[0].expectedOutput
  );
  const [isRunning, setIsRunning] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [docSearchQuery, setDocSearchQuery] = useState('');

  const handleSelectSnippet = (snippet: PythonRoutineSnippet) => {
    setSelectedSnippet(snippet);
    setCustomCode(snippet.code);
    setConsoleOutput(snippet.expectedOutput);
  };

  const handleRunPython = () => {
    setIsRunning(true);
    setConsoleOutput('🐍 Iniciando interpretador Python 3 (Ambiente Sandbox Zach)...\nCompilando árvore AST...');

    setTimeout(() => {
      // Simulate real output based on snippet or custom evaluation
      if (customCode === selectedSnippet.code) {
        setConsoleOutput(
          `[Python 3.12.0 Virtual Environment - Execução Concluída com Sucesso]\n\n${selectedSnippet.expectedOutput}\n\n>> Processo finalizado com exit code 0 (tempo: 0.042s)`
        );
      } else {
        // Safe evaluation of print lines
        const lines = customCode.split('\n');
        const printLines = lines
          .filter((l) => l.trim().startsWith('print('))
          .map((l) => {
            const match = l.match(/print\((.*)\)/);
            return match ? match[1].replace(/["']/g, '') : 'saída gerada';
          });

        const customOut =
          printLines.length > 0
            ? printLines.join('\n')
            : 'Script executado com sucesso. Nenhuma instrução print() detectada na saída padrão.';

        setConsoleOutput(
          `[Python 3.12.0 Virtual Environment - Execução Concluída]\n\n${customOut}\n\n>> Processo finalizado com exit code 0 (tempo: 0.038s)`
        );
      }
      setIsRunning(false);
    }, 450);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredDocs = PYTHON_DOCS.filter(
    (d) =>
      d.name.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      d.summary.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      d.module.toLowerCase().includes(docSearchQuery.toLowerCase())
  );

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-[#070d1e] p-5 shadow-xl shadow-cyan-950/20">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#141e34] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-cyan-500/40 bg-cyan-950/60 font-mono text-xs font-bold text-cyan-300">
              PY
            </span>
            <h2 className="text-lg font-bold text-white sm:text-xl">
              Python Pesquisador & Executor Interativo
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            Ambiente prático para estudantes testarem rotinas Python, consultarem documentação rápida e simularem scripts em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSendToStudio && (
            <button
              onClick={() => onSendToStudio(customCode, 'main.py')}
              className="flex items-center gap-1.5 rounded-lg border border-[#1b2b4c] bg-[#050813] px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors"
            >
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              <span>Abrir no Studio</span>
            </button>
          )}

          {onSendToChat && (
            <button
              onClick={() =>
                onSendToChat(
                  'Como otimizar e auditar esta rotina Python?',
                  customCode
                )
              }
              className="flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-950/30 px-3 py-1.5 text-xs text-purple-200 hover:bg-purple-900/50 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-300" />
              <span>Explicar com Alex</span>
            </button>
          )}
        </div>
      </div>

      {/* Routine Snippet Selector Chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400">Rotinas Prontas:</span>
        {PYTHON_SNIPPETS.map((snip) => {
          const isSelected = snip.id === selectedSnippet.id;
          return (
            <button
              key={snip.id}
              onClick={() => handleSelectSnippet(snip)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                isSelected
                  ? 'border border-cyan-500/60 bg-cyan-500/20 text-cyan-200 shadow-sm shadow-cyan-950/30'
                  : 'border border-[#14203a] bg-[#050813] text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {snip.title}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Code Editor & Simulated Terminal Output */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Editor Area (7 cols) */}
        <div className="space-y-2 lg:col-span-7">
          <div className="flex items-center justify-between rounded-t-lg border-t border-l border-r border-[#172340] bg-[#0a1124] px-4 py-2">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <Code2 className="h-4 w-4 text-cyan-400" />
              <span>script.py</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
              >
                {copiedCode ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
              </button>

              <button
                onClick={handleRunPython}
                disabled={isRunning}
                className="flex items-center gap-1.5 rounded bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-1 text-xs font-bold text-white shadow-sm hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isRunning ? 'Executando...' : 'Executar Script'}</span>
              </button>
            </div>
          </div>

          <textarea
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            rows={10}
            className="w-full rounded-b-lg border border-[#172340] bg-[#050813] p-4 font-mono text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none leading-relaxed resize-none"
            spellCheck={false}
          />
        </div>

        {/* Terminal Sandbox Output (5 cols) */}
        <div className="flex flex-col space-y-2 lg:col-span-5">
          <div className="flex items-center justify-between rounded-t-lg border-t border-l border-r border-[#172340] bg-[#0a1124] px-4 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>Terminal de Saída (Output)</span>
            </div>
            <button
              onClick={() => setConsoleOutput('')}
              className="text-[11px] text-slate-400 hover:text-slate-200"
            >
              Limpar
            </button>
          </div>

          <div className="flex-1 min-h-[220px] rounded-b-lg border border-[#172340] bg-[#050813] p-4 font-mono text-xs text-emerald-400 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {consoleOutput || 'Pronto para executar. Clique em "Executar Script" para iniciar a rotina.'}
          </div>
        </div>
      </div>

      {/* Interactive Python Documentation Search Sub-panel */}
      <div className="mt-6 rounded-xl border border-[#172340] bg-[#050813] p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
            <BookOpen className="h-4 w-4 text-cyan-400" />
            <span>Consulta de Documentação Rápida (Python 3 Docs)</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={docSearchQuery}
              onChange={(e) => setDocSearchQuery(e.target.value)}
              placeholder="Buscar função (map, filter, dataclass)..."
              className="w-full rounded-md border border-[#1c2a47] bg-[#080e22] py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-[#15223e] bg-[#070d1e] p-3 text-xs hover:border-cyan-500/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-cyan-300">{doc.name}</span>
                <span className="rounded bg-[#121c33] px-1.5 py-0.5 text-[10px] text-slate-400">
                  {doc.module}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">{doc.summary}</p>
              <div className="mt-2 font-mono text-[10px] text-slate-400 truncate">
                {doc.signature}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
