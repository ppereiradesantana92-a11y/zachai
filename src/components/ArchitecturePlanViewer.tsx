import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  FileCode,
  FolderGit2,
  FolderTree,
  ArrowRight,
  Layers,
  Sparkles,
  Zap,
  Shield,
  Code2,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  Play,
  Terminal,
} from 'lucide-react';
import { ArchitecturePlan, PlanStep } from '../types';

interface ArchitecturePlanViewerProps {
  plan: ArchitecturePlan;
  onApprovePlan: (plan: ArchitecturePlan) => void;
  isExecuting?: boolean;
  onOpenInStudio?: (filesHint: string[]) => void;
}

export const ArchitecturePlanViewer: React.FC<ArchitecturePlanViewerProps> = ({
  plan,
  onApprovePlan,
  isExecuting = false,
  onOpenInStudio,
}) => {
  const [completedStepIds, setCompletedStepIds] = useState<number[]>([]);
  const [isFilesExpanded, setIsFilesExpanded] = useState(true);
  const [isRoadmapExpanded, setIsRoadmapExpanded] = useState(true);

  const toggleStepCompleted = (stepNumber: number) => {
    setCompletedStepIds((prev) =>
      prev.includes(stepNumber) ? prev.filter((id) => id !== stepNumber) : [...prev, stepNumber]
    );
  };

  const getLayerColor = (layer: string) => {
    switch (layer) {
      case 'ui':
        return 'text-sky-400 bg-sky-950/40 border-sky-500/30';
      case 'state':
        return 'text-purple-400 bg-purple-950/40 border-purple-500/30';
      case 'service':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
      case 'types':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
      case 'backend':
        return 'text-rose-400 bg-rose-950/40 border-rose-500/30';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  const totalSteps = plan.roadmapSteps.length;
  const completedCount = completedStepIds.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="w-full rounded-2xl border border-cyan-500/30 bg-[#070c1b] p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Top Banner: Mode Badge & Title */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#14203d] pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/50 text-cyan-300 shadow-lg shadow-cyan-500/10">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-cyan-400/40 bg-cyan-950/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                Architect / Modo Planejamento
              </span>
              {plan.status === 'approved' && (
                <span className="rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                  PLANO APROVADO
                </span>
              )}
            </div>
            <h3 className="mt-1 text-lg font-bold text-white">{plan.title}</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-relaxed">
              {plan.summary}
            </p>
          </div>
        </div>

        {/* Action Button: Approve & Code */}
        <div className="flex items-center gap-2">
          {plan.status !== 'approved' ? (
            <button
              onClick={() => onApprovePlan(plan)}
              disabled={isExecuting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <Zap className="h-4 w-4 text-emerald-200" />
              <span>{isExecuting ? 'Gerando Código...' : 'Aprovar Plano e Iniciar Programação'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Plano Validado</span>
              </div>
              {onOpenInStudio && (
                <button
                  onClick={() => onOpenInStudio(plan.fileArchitecture.map((f: { path: string }) => f.path))}
                  className="flex items-center gap-1.5 rounded-lg border border-[#1d2b4a] bg-[#0c152a] px-3 py-1.5 text-xs text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Ver no Studio</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Phase 1: Escopo & Requisitos */}
      <div className="rounded-xl border border-[#141f38] bg-[#050916] p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/20 text-blue-400 text-xs font-bold">
            1
          </div>
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
            Fase 1: Escopo, Requisitos & Tecnologias
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Objectives */}
          <div className="rounded-lg border border-[#16233f] bg-[#080e22] p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Objetivos Principais</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {plan.scope.objectives.map((obj: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Features */}
          <div className="rounded-lg border border-[#16233f] bg-[#080e22] p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <Layers className="h-3.5 w-3.5" />
              <span>Funcionalidades Centrais</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {plan.scope.coreFeatures.map((feat: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Tech */}
          <div className="rounded-lg border border-[#16233f] bg-[#080e22] p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
              <Shield className="h-3.5 w-3.5" />
              <span>Stack e Tecnologias</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {plan.scope.recommendedTech.map((tech: string, i: number) => (
                <span
                  key={i}
                  className="rounded-md border border-amber-500/20 bg-amber-950/30 px-2 py-0.5 text-[11px] font-medium text-amber-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Phase 2: Arquitetura de Pastas e Arquivos */}
      <div className="rounded-xl border border-[#141f38] bg-[#050916] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/20 text-purple-400 text-xs font-bold">
              2
            </div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
              Fase 2: Arquitetura e Diagrama de Arquivos ({plan.fileArchitecture.length} arquivos planejados)
            </h4>
          </div>
          <button
            onClick={() => setIsFilesExpanded(!isFilesExpanded)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span>{isFilesExpanded ? 'Ocultar' : 'Ver Todos'}</span>
            {isFilesExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {isFilesExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {plan.fileArchitecture.map((item: ArchitecturePlan['fileArchitecture'][number], idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-lg border border-[#16223d] bg-[#080e22] p-2.5 hover:border-cyan-500/30 transition-colors"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#0b142c] text-cyan-400 border border-[#192748]">
                  <FileCode className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-100 truncate">
                      {item.path}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-semibold border uppercase ${getLayerColor(
                        item.layer
                      )}`}
                    >
                      {item.layer}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400 leading-snug">
                    {item.purpose}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Phase 3: Passo a Passo de Desenvolvimento (Roadmap com Checklist) */}
      <div className="rounded-xl border border-[#141f38] bg-[#050916] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              3
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
                Fase 3: Roteiro de Execução Ordenado ({completedCount}/{totalSteps} concluídos)
              </h4>
            </div>
          </div>

          {/* Mini progress bar */}
          <div className="flex items-center gap-3">
            <div className="w-28 sm:w-36 h-2 rounded-full bg-[#11192d] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-emerald-300 font-mono">
              {progressPercent}%
            </span>
            <button
              onClick={() => setIsRoadmapExpanded(!isRoadmapExpanded)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
            >
              {isRoadmapExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {isRoadmapExpanded && (
          <div className="space-y-2.5 pt-1">
            {plan.roadmapSteps.map((step: PlanStep) => {
              const isChecked = completedStepIds.includes(step.stepNumber);
              return (
                <div
                  key={step.stepNumber}
                  onClick={() => toggleStepCompleted(step.stepNumber)}
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                    isChecked
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-[#16223e] bg-[#080e22] hover:border-slate-600'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-slate-400 hover:text-white transition-colors"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        Passo {step.stepNumber}:
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-semibold ${
                          isChecked ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      {step.description}
                    </p>

                    {step.targetFiles && step.targetFiles.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-medium">Arquivos impactados:</span>
                        {step.targetFiles.map((f: string, fi: number) => (
                          <span
                            key={fi}
                            className="rounded bg-[#0c162f] px-1.5 py-0.5 font-mono text-[10px] text-cyan-300 border border-cyan-500/20"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Student Pro-Tip Footer */}
      <div className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-950/20 px-4 py-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Dica do Arquiteto Zach:</strong> Validar o plano antes de programar previne retrabalho, reduz bugs de acoplamento e treina o pensamento sênior em engenharia de software!
          </span>
        </div>
      </div>
    </div>
  );
};
