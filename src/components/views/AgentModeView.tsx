import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  ArrowRight,
  Workflow,
  Terminal,
  BrainCircuit,
  Bot,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  MonitorPlay,
} from 'lucide-react';
import { AgentExecutionPlan, AgentSubtask, NavigationTab } from '../../types';
import {
  AGENT_PRESET_PROMPTS,
  decomposeRequestWithAgent,
  executeAgentSubtask,
} from '../../services/agentService';
import { AgentPlanViewer } from '../AgentPlanViewer';
import { ProjectMemoryModal } from '../ProjectMemoryModal';
import { projectMemoryService } from '../../services/projectMemoryService';

interface AgentModeViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenInStudio?: (files: Array<{ name: string; content: string; language?: string }>) => void;
  onOpenInPlayground?: (html?: string, css?: string, js?: string) => void;
}

const FRAMEWORK_OPTIONS = [
  'React 19 + TypeScript + Tailwind CSS',
  'Fullstack (React 19 + Express API + TypeScript)',
  'Next.js 15 (App Router + Server Actions)',
  'Node.js + TypeScript + Clean Architecture',
  'Python + FastAPI + Pydantic',
];

export const AgentModeView: React.FC<AgentModeViewProps> = ({
  onNavigate,
  onOpenInStudio,
  onOpenInPlayground,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedFramework, setSelectedFramework] = useState(FRAMEWORK_OPTIONS[0]);
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [plan, setPlan] = useState<AgentExecutionPlan | null>(null);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);

  // Cancellation and pause flags
  const isPausedRef = React.useRef(false);

  const handleDecompose = async (promptToUse?: string) => {
    const text = promptToUse || prompt;
    if (!text.trim() || isDecomposing) return;

    setIsDecomposing(true);
    setErrorMessage(null);

    try {
      const generatedPlan = await decomposeRequestWithAgent(text.trim(), selectedFramework);
      setPlan(generatedPlan);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao decompor a solicitação com o Agente.');
    } finally {
      setIsDecomposing(false);
    }
  };

  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(presetPrompt);
    handleDecompose(presetPrompt);
  };

  // Execute a single task by ID
  const executeTask = async (
    currentPlan: AgentExecutionPlan,
    taskId: string
  ): Promise<AgentExecutionPlan> => {
    const taskIndex = currentPlan.subtasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return currentPlan;

    const task = currentPlan.subtasks[taskIndex];

    // Mark as running
    const updatedSubtasksRunning = [...currentPlan.subtasks];
    updatedSubtasksRunning[taskIndex] = {
      ...task,
      status: 'running',
      logs: [
        `[Agent] Iniciando orquestração da subtarefa #${task.number}: "${task.title}"`,
        `[Agent] Analisando dependências e contratos de domínio...`,
      ],
    };

    const runningPlan: AgentExecutionPlan = {
      ...currentPlan,
      status: 'running',
      activeTaskId: task.id,
      subtasks: updatedSubtasksRunning,
    };
    setPlan(runningPlan);

    try {
      const stepResult = await executeAgentSubtask(
        currentPlan.prompt,
        task,
        currentPlan.framework || selectedFramework
      );

      // Mark as completed
      const updatedSubtasksCompleted = [...runningPlan.subtasks];
      updatedSubtasksCompleted[taskIndex] = {
        ...task,
        status: 'completed',
        logs: stepResult.logs,
        outputSnippet: stepResult.outputSnippet,
        explanation: stepResult.explanation,
        durationMs: stepResult.durationMs,
      };

      const completedCount = updatedSubtasksCompleted.filter((t) => t.status === 'completed').length;
      const isAllDone = completedCount === updatedSubtasksCompleted.length;

      const nextPlan: AgentExecutionPlan = {
        ...runningPlan,
        status: isAllDone ? 'completed' : 'running',
        completedTasks: completedCount,
        subtasks: updatedSubtasksCompleted,
      };
      setPlan(nextPlan);
      return nextPlan;
    } catch (err: any) {
      const updatedSubtasksFailed = [...runningPlan.subtasks];
      updatedSubtasksFailed[taskIndex] = {
        ...task,
        status: 'failed',
        logs: [
          `[Agent] Falha na execução da subtarefa #${task.number}: ${err.message}`,
        ],
      };

      const failedPlan: AgentExecutionPlan = {
        ...runningPlan,
        status: 'failed',
        subtasks: updatedSubtasksFailed,
      };
      setPlan(failedPlan);
      throw err;
    }
  };

  // Execute all subtasks sequentially
  const handleExecuteAll = async () => {
    if (!plan || plan.status === 'running') return;
    isPausedRef.current = false;

    let current: AgentExecutionPlan = { ...plan, status: 'running' };
    setPlan(current);

    for (let i = 0; i < current.subtasks.length; i++) {
      if (isPausedRef.current) {
        setPlan((prev) => (prev ? { ...prev, status: 'paused' } : null));
        break;
      }

      const task = current.subtasks[i];
      if (task.status !== 'completed') {
        try {
          current = await executeTask(current, task.id);
        } catch {
          break;
        }
      }
    }
  };

  // Execute only next pending task
  const handleExecuteNextStep = async () => {
    if (!plan || plan.status === 'running') return;
    const nextPending = plan.subtasks.find((t) => t.status === 'pending');
    if (!nextPending) return;

    try {
      await executeTask(plan, nextPending.id);
    } catch {
      // Handled in executeTask
    }
  };

  const handlePause = () => {
    isPausedRef.current = true;
    if (plan) {
      setPlan({ ...plan, status: 'paused' });
    }
  };

  const handleResume = () => {
    isPausedRef.current = false;
    handleExecuteAll();
  };

  const handleReset = () => {
    if (!plan) return;
    isPausedRef.current = true;
    setPlan({
      ...plan,
      status: 'idle',
      completedTasks: 0,
      activeTaskId: undefined,
      subtasks: plan.subtasks.map((t) => ({
        ...t,
        status: 'pending',
        logs: [],
        outputSnippet: undefined,
        explanation: undefined,
        durationMs: undefined,
      })),
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:py-10">
      {/* Memory Modal */}
      <ProjectMemoryModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
      />

      {/* Hero Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#141e35] pb-6">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Cpu className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>ZACH AI · AUTONOMOUS AGENT ENGINE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl md:text-4xl">
            Modo Agente Autônomo
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
            Decomponha solicitações complexas de desenvolvimento em subtarefas sequenciais encadeadas.
            Acompanhe o progresso de execução em tempo real, visualize os logs do agente e inspecione os artefatos de código produzidos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMemoryModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-[#081329] px-3 py-2 text-xs font-bold text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/60 transition-colors"
          >
            <BrainCircuit className="h-4 w-4 text-cyan-400" />
            <span>Memória do Projeto</span>
          </button>
        </div>
      </div>

      {/* Preset Complex Prompts Grid */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Exemplos de Tarefas Complexas Prontas</span>
          </span>
          <span className="text-slate-500 text-[11px]">Clique para carregar e decompor com 1 clique</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {AGENT_PRESET_PROMPTS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset.prompt)}
              type="button"
              className="group flex flex-col rounded-xl border border-[#162444] bg-[#070e22] p-3.5 text-left transition-all hover:border-cyan-500/50 hover:bg-[#0c1838] hover:scale-[1.01]"
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
                <span>Decompor com Agente</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Request Form */}
      <div className="mb-8 rounded-2xl border border-[#18284c] bg-[#080f24] p-5 shadow-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDecompose();
          }}
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#14203d] pb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-semibold">Framework / Stack Alvo:</span>
              <select
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
                className="rounded-lg border border-[#1d2d50] bg-[#050b18] px-3 py-1.5 text-xs text-cyan-300 font-semibold focus:border-cyan-400 focus:outline-none"
              >
                {FRAMEWORK_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-slate-500 text-[11px]">
              O Agente subdivide em 4 a 6 subtarefas com arquivos e logs
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              Descreva sua solicitação complexa:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Crie um sistema completo de gestão de estoque em tempo real com autenticação JWT, cadastro de produtos, alertas de estoque baixo e relatórios em PDF..."
              rows={4}
              className="w-full resize-y rounded-xl border border-[#1d2d50] bg-[#050917] p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-400 focus:outline-none leading-relaxed"
            />
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-500">
              Pressione Ctrl+Enter para decompor
            </span>

            <button
              type="submit"
              disabled={isDecomposing || !prompt.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDecomposing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Decompondo com IA...</span>
                </>
              ) : (
                <>
                  <Workflow className="h-4 w-4" />
                  <span>Decompor em Subtarefas</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Plan & Sequential Execution View */}
      {plan && (
        <div className="space-y-6">
          <AgentPlanViewer
            plan={plan}
            onExecuteAll={handleExecuteAll}
            onExecuteNextStep={handleExecuteNextStep}
            onPause={handlePause}
            onResume={handleResume}
            onReset={handleReset}
            onOpenInStudio={onOpenInStudio}
            onOpenInPlayground={onOpenInPlayground}
          />
        </div>
      )}
    </div>
  );
};
