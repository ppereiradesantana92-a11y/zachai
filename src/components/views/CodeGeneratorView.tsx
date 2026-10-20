import React, { useState, useEffect } from 'react';
import {
  Code2,
  Sparkles,
  Layers,
  FolderTree,
  FileCode,
  Copy,
  Check,
  Send,
  Loader2,
  Terminal,
  Settings2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Flame,
  Cpu,
  RefreshCw,
  Folder,
  Compass,
  BrainCircuit,
  Zap,
} from 'lucide-react';
import {
  GeneratedProjectStructure,
  GeneratedFile,
  ArchitecturePlan,
  AgentExecutionPlan,
  ExecutionMode,
  ProjectMemoryState,
} from '../../types';
import {
  generateFullProject,
  planArchitectureProject,
} from '../../services/geminiService';
import {
  decomposeRequestWithAgent,
  executeAgentSubtask,
} from '../../services/agentService';
import { projectMemoryService } from '../../services/projectMemoryService';
import { ArchitecturePlanViewer } from '../ArchitecturePlanViewer';
import { AgentPlanViewer } from '../AgentPlanViewer';
import { ProjectMemoryModal } from '../ProjectMemoryModal';
import { CodeBlock } from '../CodeBlock';

import {
  detectLanguageFromPrompt,
  isSimpleCodeRequest,
  resolveExecutionMode,
} from '../../utils/languageDetector';

interface CodeGeneratorViewProps {
  onOpenProjectInStudio?: (files: Array<{ name: string; content: string; language?: string }>) => void;
  onOpenSingleFileInStudio?: (code: string, filename: string) => void;
  onOpenInChat?: (prompt: string, code?: string) => void;
}

const FRAMEWORK_OPTIONS = [
  'HTML5 + CSS3 + JavaScript Puro (Vanilla Web)',
  'HTML5 Semântico + Tailwind CSS',
  'React 19 + Tailwind CSS + TypeScript',
  'Next.js (App Router) + TypeScript + Tailwind',
  'Node.js + Express + TypeScript (Clean Architecture)',
  'Fullstack (React + Node.js Express API)',
  'Python + FastAPI + SQLAlchemy',
  'Vue 3 + Vite + Tailwind CSS',
];

const ARCHITECTURE_OPTIONS = [
  'Modular / Clean Architecture',
  'Feature-First (Por Funcionalidades)',
  'MVC (Model-View-Controller)',
  'Hexagonal / Ports & Adapters',
  'Monorepo Simples (client/server)',
];

const SEPARATION_OPTIONS = [
  'Separado por componentes, serviços, tipos e rotas',
  'Arquivos atômicos e isolados de alta manutenibilidade',
  'Estrutura enxuta para prototipagem rápida',
];

const QUICK_PROMPT_EXAMPLES = [
  {
    title: 'Sistema de Login com JWT e Tailwind',
    prompt: 'Crie um sistema completo de login em React com Tailwind CSS, formulário defensivo, validação de inputs e backend Express com autenticação JWT simulada.',
  },
  {
    title: 'Dashboard de Finanças Pessoais',
    prompt: 'Construa um dashboard financeiro com resumo de saldo, gráfico SVG de despesas, tabela filtrável de extratos bancários e mock service em TypeScript.',
  },
  {
    title: 'API REST de E-commerce com Carrinho',
    prompt: 'Desenvolva uma API REST em Node.js e TypeScript com rotas de produtos, validação Zod, manipulação de itens no carrinho e regras de desconto.',
  },
  {
    title: 'Task Manager Kanban Drag-and-Drop',
    prompt: 'Crie uma aplicação Kanban em React com colunas (A Fazer, Em Progresso, Concluído), persistência em localStorage e tipos estritos TypeScript.',
  },
];

export const CodeGeneratorView: React.FC<CodeGeneratorViewProps> = ({
  onOpenProjectInStudio,
  onOpenSingleFileInStudio,
  onOpenInChat,
}) => {
  const [prompt, setPrompt] = useState('');
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('direct');
  const [selectedFramework, setSelectedFramework] = useState(FRAMEWORK_OPTIONS[2] || FRAMEWORK_OPTIONS[0]);
  const [selectedArchitecture, setSelectedArchitecture] = useState(ARCHITECTURE_OPTIONS[0]);
  const [selectedSeparation, setSelectedSeparation] = useState(SEPARATION_OPTIONS[0]);
  const [includeBackend, setIncludeBackend] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Planning mode state
  const [currentPlan, setCurrentPlan] = useState<ArchitecturePlan | null>(null);
  const [isExecutingPlan, setIsExecutingPlan] = useState(false);

  // Agent mode state
  const [currentAgentPlan, setCurrentAgentPlan] = useState<AgentExecutionPlan | null>(null);

  // Generation status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedProject, setGeneratedProject] = useState<GeneratedProjectStructure | null>(null);

  // Memory modal state
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [memoryState, setMemoryState] = useState<ProjectMemoryState>(() => projectMemoryService.getMemory());

  // Active viewing file
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    const unsub = projectMemoryService.subscribe((mem) => {
      setMemoryState(mem);
    });
    return unsub;
  }, []);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    // Detecção inteligente de linguagem solicitada no prompt
    let effectiveFramework = selectedFramework;
    const detectedLang = detectLanguageFromPrompt(prompt.trim());
    if (detectedLang.detected) {
      const dName = detectedLang.name;
      if (dName === 'HTML') {
        effectiveFramework = 'HTML5 + CSS3 + JavaScript Puro (Vanilla Web)';
      } else if (dName === 'CSS') {
        effectiveFramework = 'HTML5 Semântico + Tailwind CSS';
      } else if (dName === 'JavaScript') {
        effectiveFramework = 'HTML5 + CSS3 + JavaScript Puro (Vanilla Web)';
      } else if (dName === 'Python') {
        effectiveFramework = 'Python + FastAPI + SQLAlchemy';
      } else if (dName === 'TypeScript') {
        effectiveFramework = 'React 19 + Tailwind CSS + TypeScript';
      } else {
        effectiveFramework = `${dName} + Clean Architecture`;
      }
    }

    // Roteamento inteligente de modo: código simples avança direto sem planejamento
    const effectiveMode: ExecutionMode = resolveExecutionMode(prompt.trim(), executionMode);
    if (executionMode === 'planning' && effectiveMode === 'direct') {
      setExecutionMode('direct');
    }

    try {
      if (effectiveMode === 'agent') {
        // Agent Mode: Decompose into sequential subtasks
        const agentPlan = await decomposeRequestWithAgent(prompt.trim(), effectiveFramework);
        setCurrentAgentPlan(agentPlan);
        setCurrentPlan(null);
        setGeneratedProject(null);
      } else if (effectiveMode === 'planning') {
        // Planning Mode: Reservado para arquiteturas e tarefas complexas.
        const plan = await planArchitectureProject(prompt.trim(), effectiveFramework);
        setCurrentPlan(plan);
        setCurrentAgentPlan(null);
        setGeneratedProject(null);
      } else {
        // Direct Code Mode: Gera arquivos e código imediatamente sem exigir planejamento
        const memoryContext = projectMemoryService.getMemoryPromptContext();
        const result = await generateFullProject({
          prompt: prompt.trim(),
          framework: effectiveFramework,
          architecture: selectedArchitecture,
          includeBackend,
          fileSeparation: selectedSeparation,
        });

        // Register files into project memory
        result.files.forEach((f) => {
          projectMemoryService.recordFileModified(f.path || f.filename, f.description);
        });

        setGeneratedProject(result);
        setCurrentPlan(null);
        setCurrentAgentPlan(null);
        setActiveFileIndex(0);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao processar solicitação com a IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAgentTask = async (
    targetPlan: AgentExecutionPlan,
    taskId: string
  ): Promise<AgentExecutionPlan> => {
    const idx = targetPlan.subtasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return targetPlan;
    const task = targetPlan.subtasks[idx];

    const updatedRunning = [...targetPlan.subtasks];
    updatedRunning[idx] = {
      ...task,
      status: 'running',
      logs: [`[Agent] Executando subtarefa #${task.number}: "${task.title}"...`],
    };
    const runningPlan: AgentExecutionPlan = {
      ...targetPlan,
      status: 'running',
      activeTaskId: task.id,
      subtasks: updatedRunning,
    };
    setCurrentAgentPlan(runningPlan);

    try {
      const res = await executeAgentSubtask(targetPlan.prompt, task, selectedFramework);
      const updatedDone = [...runningPlan.subtasks];
      updatedDone[idx] = {
        ...task,
        status: 'completed',
        logs: res.logs,
        outputSnippet: res.outputSnippet,
        explanation: res.explanation,
        durationMs: res.durationMs,
      };
      const doneCount = updatedDone.filter((t) => t.status === 'completed').length;
      const donePlan: AgentExecutionPlan = {
        ...runningPlan,
        status: doneCount === updatedDone.length ? 'completed' : 'running',
        completedTasks: doneCount,
        subtasks: updatedDone,
      };
      setCurrentAgentPlan(donePlan);
      return donePlan;
    } catch (err: any) {
      const updatedFailed = [...runningPlan.subtasks];
      updatedFailed[idx] = {
        ...task,
        status: 'failed',
        logs: [`[Agent] Erro na execução da etapa: ${err.message}`],
      };
      const failPlan: AgentExecutionPlan = {
        ...runningPlan,
        status: 'failed',
        subtasks: updatedFailed,
      };
      setCurrentAgentPlan(failPlan);
      throw err;
    }
  };

  const handleExecuteAllAgent = async () => {
    if (!currentAgentPlan) return;
    let curr = currentAgentPlan;
    for (let i = 0; i < curr.subtasks.length; i++) {
      const t = curr.subtasks[i];
      if (t.status !== 'completed') {
        try {
          curr = await handleExecuteAgentTask(curr, t.id);
        } catch {
          break;
        }
      }
    }
  };

  const handleExecuteNextAgentStep = async () => {
    if (!currentAgentPlan) return;
    const nextPending = currentAgentPlan.subtasks.find((t) => t.status === 'pending');
    if (nextPending) {
      await handleExecuteAgentTask(currentAgentPlan, nextPending.id);
    }
  };

  const handleApprovePlan = async (planToApprove: ArchitecturePlan) => {
    if (!prompt.trim() && !planToApprove.title) return;
    setIsExecutingPlan(true);
    setErrorMessage(null);

    try {
      // 1. Mark plan as approved and save to memory
      const updatedPlan: ArchitecturePlan = {
        ...planToApprove,
        status: 'approved',
      };
      setCurrentPlan(updatedPlan);
      projectMemoryService.recordApprovedPlan(updatedPlan);

      // 2. Authorize Code Engine to generate code based on approved architecture
      const fullPrompt = `${prompt.trim() || planToApprove.title}\n\n[PLANO DE ARQUITETURA APROVADO]\nResumo: ${planToApprove.summary}\nArquivos Planejados:\n${planToApprove.fileArchitecture.map((f) => `- ${f.path}: ${f.purpose} (camada: ${f.layer})`).join('\n')}\nObjetivos:\n${planToApprove.scope.objectives.join('; ')}`;

      const result = await generateFullProject({
        prompt: fullPrompt,
        framework: selectedFramework,
        architecture: selectedArchitecture,
        includeBackend: planToApprove.fileArchitecture.some((f) => f.layer === 'backend'),
        fileSeparation: selectedSeparation,
      });

      // 3. Register generated files into memory
      result.files.forEach((f) => {
        projectMemoryService.recordFileModified(f.path || f.filename, f.description);
      });

      setGeneratedProject(result);
      setActiveFileIndex(0);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao gerar os códigos do plano aprovado.');
    } finally {
      setIsExecutingPlan(false);
    }
  };

  const handleQuickPrompt = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const handleCopyCurrentFile = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleCopyAllFiles = () => {
    if (!generatedProject) return;
    const combined = generatedProject.files
      .map(
        (f) =>
          `// ==========================================\n// Arquivo: ${f.path || f.filename}\n// Descrição: ${f.description}\n// ==========================================\n\n${f.content}`
      )
      .join('\n\n\n');

    navigator.clipboard.writeText(combined);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleSendProjectToStudio = () => {
    if (!generatedProject) return;
    if (onOpenProjectInStudio) {
      onOpenProjectInStudio(
        generatedProject.files.map((f) => ({
          name: f.filename,
          content: f.content,
          language: f.language,
        }))
      );
    } else if (onOpenSingleFileInStudio && generatedProject.files.length > 0) {
      onOpenSingleFileInStudio(
        generatedProject.files[0].content,
        generatedProject.files[0].filename
      );
    }
  };

  const activeFile: GeneratedFile | undefined =
    generatedProject?.files[activeFileIndex] || generatedProject?.files[0];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6">
      {/* Project Memory Inspection Modal */}
      <ProjectMemoryModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
      />

      {/* Header Banner */}
      <div className="mb-6 rounded-2xl border border-[#172340] bg-gradient-to-r from-[#070d1e] via-[#09152e] to-[#070d1e] p-6 shadow-xl shadow-cyan-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
              <FolderTree className="h-3.5 w-3.5 text-cyan-400" />
              <span>MOTOR DE ARQUITETURA MULTI-ARQUIVOS</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Gerador de Códigos Completo por Arquivos
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-300">
              Planeje a arquitetura em 3 etapas com o Architect Mode ou gere a estrutura completa de arquivos diretamente com tipagem estrita e exportação para o Zach Code Studio.
            </p>
          </div>

          {/* Action buttons on header */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMemoryModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-[#081329] px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/60 transition-colors shadow-sm"
              title="Ver histórico de decisões de arquitetura e arquivos modificados"
            >
              <BrainCircuit className="h-4 w-4 text-cyan-400" />
              <span>Memória do Projeto ({memoryState.decisions.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Selector Toggle: Agent vs Planning vs Direct Code */}
      <div className="mb-6 rounded-2xl border border-[#172340] bg-[#070c1b] p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/50 text-cyan-300">
              {executionMode === 'agent' ? (
                <Cpu className="h-5 w-5 animate-pulse" />
              ) : executionMode === 'planning' ? (
                <Compass className="h-5 w-5" />
              ) : (
                <Code2 className="h-5 w-5" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Modo de Operação da IA
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {executionMode === 'agent'
                  ? 'Modo Agente Autônomo (Subtarefas Sequenciais)'
                  : executionMode === 'planning'
                  ? 'Modo de Planejamento (Architect Mode)'
                  : 'Modo Código Direto'}
              </h3>
            </div>
          </div>

          {/* Tri-Toggle Pill Buttons */}
          <div className="inline-flex rounded-xl border border-[#172646] bg-[#050917] p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setExecutionMode('agent')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                executionMode === 'agent'
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Modo Agente</span>
            </button>
            <button
              type="button"
              onClick={() => setExecutionMode('planning')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                executionMode === 'planning'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Planejamento</span>
            </button>
            <button
              type="button"
              onClick={() => setExecutionMode('direct')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                executionMode === 'direct'
                  ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Código Direto</span>
            </button>
          </div>
        </div>

        {/* Informative notice on current mode */}
        <div className="mt-3.5 rounded-xl border border-[#14213d] bg-[#081024] p-3 text-xs text-slate-300 flex items-center gap-2.5">
          {executionMode === 'agent' ? (
            <>
              <Cpu className="h-4 w-4 text-cyan-400 shrink-0 animate-pulse" />
              <span>
                <strong>Modo Agente Ativo:</strong> O Agente subdividirá a solicitação em 4 a 6 subtarefas encadeadas e exibirá os logs e o código gerado em tempo real com barra de progresso.
              </span>
            </>
          ) : executionMode === 'planning' ? (
            <>
              <Compass className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Architect Mode Ativo:</strong> A IA <strong>NÃO</strong> gerará código imediatamente. Ela criará o plano em 3 fases (Escopo, Diagrama de Pastas/Arquivos e Roteiro) e aguardará sua aprovação antes de codificar.
              </span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 text-teal-400 shrink-0" />
              <span>
                <strong>Código Direto Ativo:</strong> A IA sintetizará todos os arquivos do projeto diretamente a partir da sua descrição.
              </span>
            </>
          )}
        </div>
      </div>

      {/* Input Prompt Card */}
      <div className="mb-8 rounded-2xl border border-[#172340] bg-[#070c1b] p-6 shadow-lg shadow-cyan-950/10">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
              O que você deseja construir? (Descreva requisitos, telas, entidades ou regras)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Crie um sistema de autenticação completo em React com Tailwind CSS, formulário responsivo com validação, serviço de autenticação com tokens e servidor backend em Node.js Express..."
              rows={3}
              className="w-full rounded-xl border border-[#1a2b4b] bg-[#050813] p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Quick Examples */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Sugestões Rápidas:</span>
            {QUICK_PROMPT_EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(ex.prompt)}
                className="rounded-lg border border-[#14203b] bg-[#091126] px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
              >
                {ex.title}
              </button>
            ))}
          </div>

          {/* Config Controls Toggle */}
          <div className="border-t border-[#141e34] pt-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                <Settings2 className="h-4 w-4" />
                <span>Configurações de Arquitetura & Frameworks</span>
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${isAdvancedOpen ? 'rotate-90' : ''}`}
                />
              </button>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBackend}
                    onChange={(e) => setIncludeBackend(e.target.checked)}
                    className="rounded border-[#1b2b4c] bg-[#050813] text-cyan-500 focus:ring-0"
                  />
                  <span>Incluir Servidor / Backend (API)</span>
                </label>
              </div>
            </div>

            {/* Collapsible Config Options */}
            {isAdvancedOpen && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-[#121c33] pt-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Framework / Stack Principal
                  </label>
                  <select
                    value={selectedFramework}
                    onChange={(e) => setSelectedFramework(e.target.value)}
                    className="w-full rounded-lg border border-[#192849] bg-[#050813] p-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  >
                    {FRAMEWORK_OPTIONS.map((fw, idx) => (
                      <option key={idx} value={fw}>
                        {fw}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Padrão de Arquitetura
                  </label>
                  <select
                    value={selectedArchitecture}
                    onChange={(e) => setSelectedArchitecture(e.target.value)}
                    className="w-full rounded-lg border border-[#192849] bg-[#050813] p-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  >
                    {ARCHITECTURE_OPTIONS.map((arch, idx) => (
                      <option key={idx} value={arch}>
                        {arch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Separação de Arquivos
                  </label>
                  <select
                    value={selectedSeparation}
                    onChange={(e) => setSelectedSeparation(e.target.value)}
                    className="w-full rounded-lg border border-[#192849] bg-[#050813] p-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  >
                    {SEPARATION_OPTIONS.map((sep, idx) => (
                      <option key={idx} value={sep}>
                        {sep}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {executionMode === 'planning'
                      ? 'Projetando Arquitetura com a IA...'
                      : 'Gerando Arquivos com a IA...'}
                  </span>
                </>
              ) : (
                <>
                  {executionMode === 'agent' ? (
                    <Cpu className="h-4 w-4" />
                  ) : executionMode === 'planning' ? (
                    <Compass className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>
                    {executionMode === 'agent'
                      ? 'Decompor com Modo Agente'
                      : executionMode === 'planning'
                      ? 'Projetar Plano Arquitetural (Architect)'
                      : 'Gerar Arquivos do Projeto'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Agent Mode Sequential Execution Section */}
      {currentAgentPlan && (
        <div className="mb-8">
          <AgentPlanViewer
            plan={currentAgentPlan}
            onExecuteAll={handleExecuteAllAgent}
            onExecuteNextStep={handleExecuteNextAgentStep}
            onPause={() => setCurrentAgentPlan({ ...currentAgentPlan, status: 'paused' })}
            onResume={() => handleExecuteAllAgent()}
            onReset={() =>
              setCurrentAgentPlan({
                ...currentAgentPlan,
                status: 'idle',
                completedTasks: 0,
                activeTaskId: undefined,
                subtasks: currentAgentPlan.subtasks.map((t) => ({
                  ...t,
                  status: 'pending',
                  logs: [],
                  outputSnippet: undefined,
                  explanation: undefined,
                  durationMs: undefined,
                })),
              })
            }
            onOpenInStudio={(files) => {
              if (onOpenProjectInStudio) onOpenProjectInStudio(files);
            }}
          />
        </div>
      )}

      {/* Visual Planning Architecture Section (Fase 1, 2, 3) */}
      {currentPlan && (
        <div className="mb-8">
          <ArchitecturePlanViewer
            plan={currentPlan}
            onApprovePlan={handleApprovePlan}
            isExecuting={isExecutingPlan}
            onOpenInStudio={(filesHint) => {
              if (onOpenProjectInStudio) {
                onOpenProjectInStudio(
                  filesHint.map((path) => ({
                    name: path.split('/').pop() || path,
                    content: `// Arquivo: ${path}\n// Projetado no Modo de Planejamento Zach AI\n\nexport const placeholder = true;\n`,
                    language: path.endsWith('.py') ? 'python' : 'typescript',
                  }))
                );
              }
            }}
          />
        </div>
      )}

      {/* Generated Project Showcase */}
      {generatedProject && (
        <div className="space-y-6">
          {/* Project Summary Banner */}
          <div className="rounded-2xl border border-cyan-500/30 bg-[#070d1e] p-6 shadow-xl shadow-cyan-950/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-[#141e34] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-300">
                    {generatedProject.projectName}
                  </span>
                  <span className="rounded bg-[#0c1a36] px-2 py-0.5 text-xs text-slate-300">
                    {generatedProject.files.length} arquivos gerados
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  {generatedProject.summary}
                </h2>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-slate-400">Stack:</span>
                  <span className="rounded bg-[#0f2142] px-2 py-0.5 text-xs text-cyan-200 font-mono">
                    {generatedProject.framework}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-400 font-mono">
                    {generatedProject.architecture}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAllFiles}
                  className="flex items-center gap-1.5 rounded-xl border border-[#1b2b4d] bg-[#0c1833] px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
                >
                  {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedAll ? 'Tudo Copiado!' : 'Copiar Todos'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendProjectToStudio}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Abrir no Zach Code Studio</span>
                </button>
              </div>
            </div>

            {/* Features Pill List */}
            {generatedProject.features && generatedProject.features.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Funcionalidades:</span>
                {generatedProject.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/20 bg-cyan-950/30 px-2.5 py-1 text-xs text-cyan-200"
                  >
                    <CheckCircle2 className="h-3 w-3 text-cyan-400" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Files Explorer Tabs & Active Code Viewer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar List of Files */}
            <div className="lg:col-span-4 rounded-2xl border border-[#172340] bg-[#070c1b] p-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between border-b border-[#141e35] pb-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-cyan-400" />
                  <span>Arquivos do Projeto</span>
                </div>
                <span className="font-mono text-cyan-300">{generatedProject.files.length}</span>
              </div>

              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {generatedProject.files.map((file, idx) => {
                  const isActive = idx === activeFileIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveFileIndex(idx)}
                      className={`flex w-full items-start gap-2.5 rounded-xl p-2.5 text-left transition-all ${
                        isActive
                          ? 'border border-cyan-500/40 bg-[#0c1833] text-white shadow-sm'
                          : 'border border-transparent text-slate-400 hover:border-[#192849] hover:bg-[#081022] hover:text-slate-200'
                      }`}
                    >
                      <FileCode
                        className={`h-4 w-4 mt-0.5 shrink-0 ${
                          isActive ? 'text-cyan-400' : 'text-slate-500'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-xs font-semibold truncate">
                            {file.path || file.filename}
                          </span>
                          <span className="rounded bg-[#050914] px-1.5 py-0.2 font-mono text-[10px] text-slate-400 uppercase">
                            {file.language || 'code'}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-400 truncate">
                          {file.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Center Code Block Display */}
            <div className="lg:col-span-8 flex flex-col rounded-2xl border border-[#172340] bg-[#070c1b] p-4 sm:p-6 shadow-lg">
              {activeFile ? (
                <>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#141e35] pb-3">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-cyan-400" />
                      <span className="font-mono text-sm font-bold text-white">
                        {activeFile.path || activeFile.filename}
                      </span>
                      <span className="rounded bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 font-mono text-[11px] text-cyan-300 uppercase">
                        {activeFile.language}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyCurrentFile(activeFile.content)}
                        className="flex items-center gap-1.5 rounded-lg border border-[#1a2b4b] bg-[#0b162f] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-cyan-500/40"
                      >
                        {copiedFile ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedFile ? 'Copiado!' : 'Copiar Código'}</span>
                      </button>

                      {onOpenSingleFileInStudio && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenSingleFileInStudio(activeFile.content, activeFile.filename)
                          }
                          className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900/60"
                        >
                          <Terminal className="h-3.5 w-3.5" />
                          <span>Abrir no Studio</span>
                        </button>
                      )}

                      {onOpenInChat && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenInChat(
                              `Alex, analise e sugira melhorias para o arquivo ${activeFile.filename}:`,
                              activeFile.content
                            )
                          }
                          className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-950/40 px-3 py-1.5 text-xs font-medium text-purple-300 hover:bg-purple-900/60"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Refinar com Alex</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mb-3 text-xs text-slate-300 leading-relaxed">
                    <strong>Propósito deste arquivo:</strong> {activeFile.description}
                  </p>

                  <div className="flex-1 overflow-hidden rounded-xl border border-[#16223d]">
                    <CodeBlock
                      code={activeFile.content}
                      language={activeFile.language}
                      filename={activeFile.filename}
                    />
                  </div>
                </>
              ) : (
                <div className="flex h-64 items-center justify-center text-xs text-slate-500">
                  Nenhum arquivo selecionado.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
