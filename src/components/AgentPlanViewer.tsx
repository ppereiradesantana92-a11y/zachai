import React, { useState } from 'react';
import {
  Bot,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  FileCode,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  Layers,
  Cpu,
  MonitorPlay,
  Code2,
  Workflow,
  ArrowRight,
} from 'lucide-react';
import { AgentExecutionPlan, AgentSubtask, GeneratedFile } from '../types';
import { CodeBlock } from './CodeBlock';

interface AgentPlanViewerProps {
  plan: AgentExecutionPlan;
  onExecuteAll: () => void;
  onExecuteNextStep: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onOpenInStudio?: (files: Array<{ name: string; content: string; language?: string }>) => void;
  onOpenInPlayground?: (html?: string, css?: string, js?: string) => void;
}

export const AgentPlanViewer: React.FC<AgentPlanViewerProps> = ({
  plan,
  onExecuteAll,
  onExecuteNextStep,
  onPause,
  onResume,
  onReset,
  onOpenInStudio,
  onOpenInPlayground,
}) => {
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [copiedTaskCodeId, setCopiedTaskCodeId] = useState<string | null>(null);

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: prev[taskId] === undefined ? false : !prev[taskId],
    }));
  };

  const isTaskExpanded = (taskId: string, isRunning: boolean) => {
    if (expandedTasks[taskId] !== undefined) return expandedTasks[taskId];
    return isRunning; // Default expanded if running
  };

  const handleCopyCode = async (taskId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedTaskCodeId(taskId);
      setTimeout(() => setCopiedTaskCodeId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const completedCount = plan.subtasks.filter((t) => t.status === 'completed').length;
  const totalCount = plan.subtasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isRunning = plan.status === 'running';
  const isCompleted = plan.status === 'completed' || (completedCount === totalCount && totalCount > 0);
  const isPaused = plan.status === 'paused';

  // Gather all generated files
  const allGeneratedFiles: Array<{ name: string; content: string; language?: string }> = plan.subtasks
    .filter((t) => t.outputSnippet && t.status === 'completed')
    .map((t) => ({
      name: t.outputSnippet!.filename.split('/').pop() || t.outputSnippet!.filename,
      content: t.outputSnippet!.code,
      language: t.outputSnippet!.language,
    }));

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'model':
        return { label: 'Modelos & Tipos', color: 'text-amber-400 bg-amber-950/40 border-amber-500/30' };
      case 'service':
        return { label: 'Serviço & API', color: 'text-purple-400 bg-purple-950/40 border-purple-500/30' };
      case 'ui':
        return { label: 'Interface (UI)', color: 'text-sky-400 bg-sky-950/40 border-sky-500/30' };
      case 'test':
        return { label: 'Testes & Auditoria', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' };
      case 'deploy':
        return { label: 'Deploy & DevOps', color: 'text-rose-400 bg-rose-950/40 border-rose-500/30' };
      default:
        return { label: 'Planejamento', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30' };
    }
  };

  return (
    <div className="w-full rounded-2xl border border-cyan-500/30 bg-[#070c1b] p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Top Header: Agent Mode Identity */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#14203d] pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/80 to-blue-950/80 text-cyan-300 shadow-lg shadow-cyan-500/10">
            <Cpu className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-cyan-400/40 bg-cyan-950/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                Modo Agente Autônomo
              </span>
              {isRunning && (
                <span className="flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-950/70 px-2.5 py-0.5 text-[10px] font-bold text-blue-300 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                  Executando Subtarefas
                </span>
              )}
              {isPaused && (
                <span className="rounded-full border border-amber-400/40 bg-amber-950/70 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                  Execução Pausada
                </span>
              )}
              {isCompleted && (
                <span className="flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-950/70 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Concluído com Êxito
                </span>
              )}
            </div>
            <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">
              {plan.title}
            </h2>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-2xl">
              {plan.summary}
            </p>
          </div>
        </div>

        {/* Global Progress Radial / Stats */}
        <div className="flex items-center gap-3 rounded-xl border border-[#172545] bg-[#050917] px-4 py-2.5">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400">Progresso Geral</div>
            <div className="text-lg font-extrabold text-cyan-300 font-mono">
              {progressPercentage}%
            </div>
          </div>
          <div className="h-8 w-px bg-[#14203d]" />
          <div>
            <div className="text-xs font-semibold text-slate-400">Subtarefas</div>
            <div className="text-sm font-bold text-slate-200">
              <span className="text-cyan-400">{completedCount}</span> / {totalCount}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Workflow className="h-3.5 w-3.5 text-cyan-400" />
            <span>Execução Sequencial por Etapas</span>
          </span>
          <span className="font-mono text-cyan-300 font-semibold">
            {completedCount} de {totalCount} concluídas ({progressPercentage}%)
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#0c142b] border border-[#152345]">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 transition-all duration-500 ease-out shadow-sm shadow-cyan-500/50"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#152347] bg-[#050916] p-3">
        <div className="flex flex-wrap items-center gap-2">
          {!isRunning && !isCompleted && (
            <button
              onClick={onExecuteAll}
              type="button"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Executar Todas Sequencialmente</span>
            </button>
          )}

          {!isRunning && !isCompleted && (
            <button
              onClick={onExecuteNextStep}
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-[#0c1836] px-3 py-2 text-xs font-semibold text-cyan-300 hover:border-cyan-300 hover:bg-[#102047] transition-all"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>Executar Próxima Etapa</span>
            </button>
          )}

          {isRunning && (
            <button
              onClick={onPause}
              type="button"
              className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-950/40 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-950/70 transition-all"
            >
              <Pause className="h-4 w-4 fill-amber-300" />
              <span>Pausar Agente</span>
            </button>
          )}

          {isPaused && (
            <button
              onClick={onResume}
              type="button"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Retomar Execução</span>
            </button>
          )}

          <button
            onClick={onReset}
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-[#1b2b4f] bg-[#070f24] px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
            title="Reiniciar progresso de todas as subtarefas"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>

        {/* Handoff Actions if files are generated */}
        {allGeneratedFiles.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {onOpenInStudio && (
              <button
                onClick={() => onOpenInStudio(allGeneratedFiles)}
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-blue-950/70 to-cyan-950/70 px-3 py-2 text-xs font-bold text-cyan-300 hover:border-cyan-400 hover:text-white transition-all shadow-sm"
              >
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                <span>Abrir no Zach Studio ({allGeneratedFiles.length})</span>
              </button>
            )}

            {onOpenInPlayground && (
              <button
                onClick={() => {
                  const htmlFile = allGeneratedFiles.find((f) => f.name.endsWith('.html'))?.content;
                  const cssFile = allGeneratedFiles.find((f) => f.name.endsWith('.css'))?.content;
                  const jsFile = allGeneratedFiles.find((f) => f.name.endsWith('.js') || f.name.endsWith('.ts'))?.content;
                  onOpenInPlayground(htmlFile, cssFile, jsFile);
                }}
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-950/50 px-3 py-2 text-xs font-bold text-purple-300 hover:border-purple-300 hover:text-white transition-all"
              >
                <MonitorPlay className="h-3.5 w-3.5 text-purple-400" />
                <span>Playground Web</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Subtasks Sequential Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Subtarefas Sequenciais ({plan.subtasks.length})</span>
          <span className="text-slate-500 text-[11px]">
            Clique em uma subtarefa para ver logs e código
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:bottom-3 before:left-3 before:top-3 before:w-0.5 before:bg-[#152345] sm:before:left-4">
          {plan.subtasks.map((task) => {
            const isTaskRunning = task.status === 'running';
            const isTaskCompleted = task.status === 'completed';
            const isTaskPending = task.status === 'pending';
            const isTaskFailed = task.status === 'failed';
            const categoryBadge = getCategoryBadge(task.category);
            const expanded = isTaskExpanded(task.id, isTaskRunning);

            return (
              <div
                key={task.id}
                className={`relative rounded-xl border transition-all ${
                  isTaskRunning
                    ? 'border-cyan-400/80 bg-[#091530] shadow-xl shadow-cyan-500/10'
                    : isTaskCompleted
                    ? 'border-emerald-500/30 bg-[#071324] hover:border-emerald-500/50'
                    : isTaskFailed
                    ? 'border-rose-500/40 bg-rose-950/30'
                    : 'border-[#15223e] bg-[#070d1e] opacity-80'
                }`}
              >
                {/* Stepper Node Indicator on Timeline */}
                <div
                  className={`absolute -left-9 sm:-left-11 top-4 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                    isTaskRunning
                      ? 'border-cyan-400 bg-cyan-950 text-cyan-300 ring-4 ring-cyan-500/20 animate-pulse'
                      : isTaskCompleted
                      ? 'border-emerald-500 bg-emerald-950 text-emerald-400'
                      : isTaskFailed
                      ? 'border-rose-500 bg-rose-950 text-rose-300'
                      : 'border-[#1e2f55] bg-[#080f24] text-slate-500'
                  }`}
                >
                  {isTaskCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : isTaskRunning ? (
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                  ) : (
                    <span>{task.number}</span>
                  )}
                </div>

                {/* Subtask Header Card */}
                <div
                  onClick={() => toggleTaskExpanded(task.id)}
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-4 select-none"
                >
                  <div className="flex flex-1 items-start gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          Etapa {task.number}:
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {task.title}
                        </h4>
                        <span
                          className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${categoryBadge.color}`}
                        >
                          {categoryBadge.label}
                        </span>

                        {isTaskRunning && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-300 animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                            Processando...
                          </span>
                        )}

                        {isTaskCompleted && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Finalizado
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Targeted files chips */}
                      {task.targetFiles && task.targetFiles.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-mono text-slate-500">Arquivos:</span>
                          {task.targetFiles.map((file) => (
                            <span
                              key={file}
                              className="rounded border border-[#1b2b4d] bg-[#050b18] px-2 py-0.5 font-mono text-[10px] text-cyan-300"
                            >
                              {file}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.durationMs && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>{(task.durationMs / 1000).toFixed(1)}s</span>
                      </span>
                    )}

                    <button
                      type="button"
                      className="rounded p-1 text-slate-400 hover:bg-[#121e3d] hover:text-white"
                      aria-label="Expandir detalhes"
                    >
                      {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Subtask Details: Logs, Code Artifact & Explanation */}
                {expanded && (
                  <div className="border-t border-[#14213f] bg-[#050917] p-4 space-y-4">
                    {/* Execution Logs Terminal */}
                    {task.logs && task.logs.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                            <span>Logs de Execução do Agente</span>
                          </span>
                          <span className="text-emerald-400 text-[10px]">● Conectado</span>
                        </div>
                        <div className="rounded-lg border border-[#172545] bg-[#030611] p-3 font-mono text-xs text-slate-300 space-y-1 max-h-40 overflow-y-auto">
                          {task.logs.map((log, idx) => (
                            <div key={idx} className="flex items-start gap-2 leading-tight">
                              <span className="text-cyan-500 select-none">&gt;</span>
                              <span className={log.includes('finalizada') || log.includes('sucesso') ? 'text-emerald-300 font-semibold' : 'text-slate-300'}>
                                {log}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Explanation if completed */}
                    {task.explanation && (
                      <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs text-slate-300">
                        <span className="font-semibold text-cyan-300">Resumo da Etapa: </span>
                        <span>{task.explanation}</span>
                      </div>
                    )}

                    {/* Code Snippet Box */}
                    {task.outputSnippet && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <FileCode className="h-3.5 w-3.5 text-cyan-400" />
                            <span className="font-mono text-slate-200 font-semibold text-xs">
                              {task.outputSnippet.filename}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyCode(task.id, task.outputSnippet!.code)}
                              type="button"
                              className="flex items-center gap-1 rounded bg-[#0e1b38] border border-[#1b2d55] px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:border-cyan-400 transition-colors"
                            >
                              {copiedTaskCodeId === task.id ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400" />
                                  <span className="text-emerald-300">Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 text-slate-400" />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>

                            {onOpenInStudio && (
                              <button
                                onClick={() =>
                                  onOpenInStudio([
                                    {
                                      name: task.outputSnippet!.filename.split('/').pop() || task.outputSnippet!.filename,
                                      content: task.outputSnippet!.code,
                                      language: task.outputSnippet!.language,
                                    },
                                  ])
                                }
                                type="button"
                                className="flex items-center gap-1 rounded bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-900/60 transition-colors"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>No Studio</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-[#142345]">
                          <CodeBlock
                            code={task.outputSnippet.code}
                            language={task.outputSnippet.language}
                            filename={task.outputSnippet.filename}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-[#071927] to-[#0a2336] p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Execução do Agente Concluída com Sucesso!
              </h3>
              <p className="text-xs text-slate-300">
                Todas as {totalCount} subtarefas foram finalizadas e os artefatos de código foram registrados na memória do projeto.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-500/20">
            {onOpenInStudio && allGeneratedFiles.length > 0 && (
              <button
                onClick={() => onOpenInStudio(allGeneratedFiles)}
                type="button"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <Terminal className="h-4 w-4" />
                <span>Abrir Todos os Arquivos no Zach Code Studio ({allGeneratedFiles.length})</span>
              </button>
            )}

            {onOpenInPlayground && (
              <button
                onClick={() => {
                  const htmlFile = allGeneratedFiles.find((f) => f.name.endsWith('.html'))?.content;
                  const cssFile = allGeneratedFiles.find((f) => f.name.endsWith('.css'))?.content;
                  const jsFile = allGeneratedFiles.find((f) => f.name.endsWith('.js') || f.name.endsWith('.ts'))?.content;
                  onOpenInPlayground(htmlFile, cssFile, jsFile);
                }}
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-purple-500/50 bg-purple-950/60 px-4 py-2 text-xs font-bold text-purple-300 hover:bg-purple-900/60 transition-all"
              >
                <MonitorPlay className="h-4 w-4" />
                <span>Testar no Playground Web</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
