import React, { useState } from 'react';
import {
  FolderGit2,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Code2,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  Clock,
  Layers,
  Award,
  ExternalLink,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  GUIDED_STUDENT_PROJECTS,
  GuidedStudentProject,
  ProjectStep,
} from '../../data/guidedProjectsData';
import { CodeBlock } from '../CodeBlock';

interface ProjectsViewProps {
  onSelectProjectPrompt: (prompt: string) => void;
  onOpenInStudio?: (code: string, filename: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onSelectProjectPrompt,
  onOpenInStudio,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    GUIDED_STUDENT_PROJECTS[0].id
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({
    'landing-page': [0],
  });
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedProject =
    GUIDED_STUDENT_PROJECTS.find((p) => p.id === selectedProjectId) ||
    GUIDED_STUDENT_PROJECTS[0];

  const currentStep: ProjectStep =
    selectedProject.steps[currentStepIndex] || selectedProject.steps[0];

  const projectCompletedSteps = completedSteps[selectedProject.id] || [];
  const progressPercent = Math.round(
    (projectCompletedSteps.length / selectedProject.steps.length) * 100
  );

  const handleCompleteStep = (stepIdx: number) => {
    setCompletedSteps((prev) => {
      const currentList = prev[selectedProject.id] || [];
      if (!currentList.includes(stepIdx)) {
        return {
          ...prev,
          [selectedProject.id]: [...currentList, stepIdx],
        };
      }
      return prev;
    });

    if (stepIdx < selectedProject.steps.length - 1) {
      setCurrentStepIndex(stepIdx + 1);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTestInStudio = () => {
    if (onOpenInStudio) {
      onOpenInStudio(currentStep.code, currentStep.filename);
    } else {
      onSelectProjectPrompt(
        `Gostaria de testar e expandir o código do projeto "${selectedProject.title}", etapa "${currentStep.title}":\n\nArquivo: ${currentStep.filename}\n\`\`\`${currentStep.language}\n${currentStep.code}\n\`\`\``
      );
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6">
      {/* Header Banner */}
      <div className="mb-6 rounded-2xl border border-[#172340] bg-gradient-to-r from-[#070d1e] via-[#09142b] to-[#070d1e] p-6 shadow-xl shadow-cyan-950/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
              <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
              <span>MÓDULO DE PROJETOS GUIADOS • GUIA PASSO A PASSO</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Projetos Práticos para Estudantes
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-300">
              Aprenda a construir aplicações reais do zero com roteiros estruturados, códigos modelo testados e execução no Zach Code Studio.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#1b2a4c] bg-[#050813] px-4 py-3 text-right">
              <span className="block text-[10px] font-semibold uppercase text-slate-400">Progresso Geral</span>
              <span className="text-lg font-bold text-cyan-400">{progressPercent}% Concluído</span>
            </div>
          </div>
        </div>

        {/* Project Selector Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-[#141e34] pt-4">
          {GUIDED_STUDENT_PROJECTS.map((project) => {
            const isSelected = project.id === selectedProjectId;
            const stepsDone = (completedSteps[project.id] || []).length;
            const isDone = stepsDone === project.steps.length;

            return (
              <button
                key={project.id}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setCurrentStepIndex(0);
                }}
                className={`group flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-xs transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-md shadow-cyan-500/10'
                    : 'border-[#172340] bg-[#070c1b] text-slate-300 hover:border-cyan-500/40 hover:bg-[#0c142b]'
                }`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#1e2e4e] bg-[#060b19]">
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <FolderGit2 className={`h-4 w-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-white">{project.title}</div>
                  <div className="text-[11px] text-slate-400">
                    {stepsDone}/{project.steps.length} etapas • {project.difficulty}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column View: Steps Navigator & Code Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Project Overview & Step List (4 cols) */}
        <div className="space-y-4 lg:col-span-4">
          {/* Project Details Card */}
          <div className="rounded-xl border border-[#172340] bg-[#070c1b] p-4">
            <h2 className="text-base font-bold text-white">{selectedProject.title}</h2>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">{selectedProject.description}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {selectedProject.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="rounded bg-[#0c1428] border border-[#1c2c4d] px-2 py-0.5 text-[11px] font-medium text-cyan-300"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#141e34] pt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                {selectedProject.estimatedTime}
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-yellow-400" />
                Nível {selectedProject.difficulty}
              </span>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="rounded-xl border border-[#172340] bg-[#070c1b] p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Roteiro de Etapas ({selectedProject.steps.length})
            </h3>

            <div className="space-y-2">
              {selectedProject.steps.map((step, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isStepFinished = projectCompletedSteps.includes(idx);

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                      isCurrent
                        ? 'border-cyan-500 bg-cyan-950/30 text-white shadow-sm shadow-cyan-950/30'
                        : isStepFinished
                        ? 'border-[#182944] bg-[#080f24] text-slate-300 hover:border-cyan-500/30'
                        : 'border-[#121c33] bg-[#050813] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isStepFinished
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isCurrent
                          ? 'bg-cyan-500 text-black'
                          : 'bg-[#15213b] text-slate-400'
                      }`}
                    >
                      {isStepFinished ? '✓' : step.stepNumber}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="truncate text-xs font-semibold text-slate-200">
                        {step.title}
                      </div>
                      <div className="truncate text-[11px] text-slate-400">
                        {step.filename}
                      </div>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        isCurrent ? 'translate-x-0.5 text-cyan-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Step Details & Code Studio Tester (8 cols) */}
        <div className="space-y-4 lg:col-span-8">
          {/* Step Objective & Explanation Card */}
          <div className="rounded-xl border border-[#172340] bg-[#070c1b] p-5 shadow-lg shadow-cyan-950/10">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141e34] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Etapa {currentStep.stepNumber} de {selectedProject.steps.length}
                </span>
                <h3 className="text-lg font-bold text-white">{currentStep.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestInStudio}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:scale-105 transition-transform"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Testar no Zach Code Studio</span>
                </button>
              </div>
            </div>

            {/* Objective & Explanation */}
            <div className="mt-4 space-y-3 text-xs sm:text-sm">
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-3 text-cyan-200">
                <strong className="block text-xs font-semibold text-cyan-300 mb-1">
                  🎯 Objetivo desta etapa:
                </strong>
                {currentStep.objective}
              </div>

              <p className="text-slate-300 leading-relaxed">{currentStep.explanation}</p>

              {/* Tips */}
              {currentStep.tips && currentStep.tips.length > 0 && (
                <div className="rounded-lg border border-[#1a2b4b] bg-[#091126] p-3 text-slate-300">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-yellow-400 mb-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Dicas Técnicas e Boas Práticas:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                    {currentStep.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Code Header Bar */}
            <div className="mt-6 flex items-center justify-between rounded-t-lg border-t border-l border-r border-[#172340] bg-[#0b1227] px-4 py-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                <Code2 className="h-4 w-4 text-cyan-400" />
                <span>{currentStep.filename}</span>
                <span className="rounded bg-[#14203d] px-2 py-0.5 text-[10px] uppercase text-slate-400">
                  {currentStep.language}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(currentStep.code)}
                  className="flex items-center gap-1.5 rounded border border-[#1e2f50] bg-[#091126] px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Block Container */}
            <div className="overflow-hidden rounded-b-lg border-b border-l border-r border-[#172340]">
              <CodeBlock code={currentStep.code} language={currentStep.language} />
            </div>

            {/* Action Footer: Mark Complete / Next Step */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#141e34] pt-4">
              <button
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                className="rounded-lg border border-[#1a2846] bg-[#080e22] px-3.5 py-2 text-xs text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
              >
                ← Etapa Anterior
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCompleteStep(currentStepIndex)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                    projectCompletedSteps.includes(currentStepIndex)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-cyan-500 text-black hover:bg-cyan-400'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {projectCompletedSteps.includes(currentStepIndex)
                      ? 'Etapa Concluída ✓'
                      : 'Validar e Concluir Etapa'}
                  </span>
                </button>

                {currentStepIndex < selectedProject.steps.length - 1 && (
                  <button
                    onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                    className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-[#09122a] px-3.5 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-950/40 transition-colors"
                  >
                    <span>Próxima Etapa</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
