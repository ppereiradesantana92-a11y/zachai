import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Loader2,
  Trash2,
  FileCode,
  AlertCircle,
  RotateCcw,
  Download,
  Info,
  Image as ImageIcon,
  X,
  Upload,
  Bot,
  Sparkles,
  Compass,
  Code2,
  BrainCircuit,
  Zap,
  Cpu,
} from 'lucide-react';
import {
  ChatMessage,
  ExecutionMode,
  ArchitecturePlan,
  AgentExecutionPlan,
  ProjectMemoryState,
} from '../../types';
import { CodeBlock } from '../CodeBlock';
import { ArchitecturePlanViewer } from '../ArchitecturePlanViewer';
import { AgentPlanViewer } from '../AgentPlanViewer';
import { ProjectMemoryModal } from '../ProjectMemoryModal';
import { projectMemoryService } from '../../services/projectMemoryService';
import { executeAgentSubtask } from '../../services/agentService';
import { resolveExecutionMode } from '../../utils/languageDetector';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (
    content: string,
    codeSnippet?: string,
    imageAttachment?: { dataUrl: string; name?: string; mimeType?: string },
    mode?: ExecutionMode
  ) => Promise<void>;
  onClearChat: () => void;
  isLoading: boolean;
  isImageAnalyzing?: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  selectedLanguageName: string;
  onNavigateToLanguages: () => void;
  onApprovePlanInChat?: (plan: ArchitecturePlan) => Promise<void>;
  onOpenInStudio?: (files: Array<{ name: string; content: string; language?: string }>) => void;
  onOpenInPlayground?: (html?: string, css?: string, js?: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  isImageAnalyzing,
  errorMessage,
  onRetry,
  selectedLanguageName,
  onNavigateToLanguages,
  onApprovePlanInChat,
  onOpenInStudio,
  onOpenInPlayground,
}) => {
  const [inputText, setInputText] = useState('');
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('direct');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeContext, setCodeContext] = useState('');
  const [attachedImage, setAttachedImage] = useState<{
    dataUrl: string;
    name: string;
    mimeType: string;
  } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [approvingPlanId, setApprovingPlanId] = useState<string | null>(null);
  const [agentPlansState, setAgentPlansState] = useState<Record<string, AgentExecutionPlan>>({});
  const pausedAgentsRef = useRef<Record<string, boolean>>({});
  const [memoryState, setMemoryState] = useState<ProjectMemoryState>(() =>
    projectMemoryService.getMemory()
  );

  const updatePlanInState = (plan: AgentExecutionPlan) => {
    setAgentPlansState((prev) => ({
      ...prev,
      [plan.id]: plan,
    }));
  };

  const handleRunAgentStep = async (
    plan: AgentExecutionPlan,
    taskId: string
  ): Promise<AgentExecutionPlan> => {
    const taskIndex = plan.subtasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return plan;
    const task = plan.subtasks[taskIndex];

    const updatedRunning = [...plan.subtasks];
    updatedRunning[taskIndex] = {
      ...task,
      status: 'running',
      logs: [`[Agent] Executando subtarefa #${task.number}: "${task.title}"...`],
    };
    const runningPlan: AgentExecutionPlan = {
      ...plan,
      status: 'running',
      activeTaskId: task.id,
      subtasks: updatedRunning,
    };
    updatePlanInState(runningPlan);

    try {
      const res = await executeAgentSubtask(plan.prompt, task, selectedLanguageName);
      const updatedDone = [...runningPlan.subtasks];
      updatedDone[taskIndex] = {
        ...task,
        status: 'completed',
        logs: res.logs,
        outputSnippet: res.outputSnippet,
        explanation: res.explanation,
        durationMs: res.durationMs,
      };
      const completedCount = updatedDone.filter((t) => t.status === 'completed').length;
      const isAll = completedCount === updatedDone.length;
      const donePlan: AgentExecutionPlan = {
        ...runningPlan,
        status: isAll ? 'completed' : 'running',
        completedTasks: completedCount,
        subtasks: updatedDone,
      };
      updatePlanInState(donePlan);
      return donePlan;
    } catch (err: any) {
      const updatedFailed = [...runningPlan.subtasks];
      updatedFailed[taskIndex] = {
        ...task,
        status: 'failed',
        logs: [`[Agent] Erro na execução da etapa: ${err.message}`],
      };
      const failPlan: AgentExecutionPlan = {
        ...runningPlan,
        status: 'failed',
        subtasks: updatedFailed,
      };
      updatePlanInState(failPlan);
      throw err;
    }
  };

  const handleRunAgentPlan = async (planToRun: AgentExecutionPlan) => {
    pausedAgentsRef.current[planToRun.id] = false;
    let curr = agentPlansState[planToRun.id] || planToRun;

    for (let i = 0; i < curr.subtasks.length; i++) {
      if (pausedAgentsRef.current[curr.id]) {
        updatePlanInState({ ...curr, status: 'paused' });
        break;
      }
      const t = curr.subtasks[i];
      if (t.status !== 'completed') {
        try {
          curr = await handleRunAgentStep(curr, t.id);
        } catch {
          break;
        }
      }
    }
  };

  const handleRunNextAgentStep = async (planToRun: AgentExecutionPlan) => {
    const curr = agentPlansState[planToRun.id] || planToRun;
    const nextPending = curr.subtasks.find((t) => t.status === 'pending');
    if (nextPending) {
      await handleRunAgentStep(curr, nextPending.id);
    }
  };

  const handlePauseAgentPlan = (planId: string) => {
    pausedAgentsRef.current[planId] = true;
    setAgentPlansState((prev) => {
      const existing = prev[planId];
      if (!existing) return prev;
      return { ...prev, [planId]: { ...existing, status: 'paused' } };
    });
  };

  const handleResumeAgentPlan = (planId: string) => {
    pausedAgentsRef.current[planId] = false;
    const p = agentPlansState[planId];
    if (p) handleRunAgentPlan(p);
  };

  const handleResetAgentPlan = (planId: string) => {
    pausedAgentsRef.current[planId] = true;
    setAgentPlansState((prev) => {
      const existing = prev[planId];
      if (!existing) return prev;
      return {
        ...prev,
        [planId]: {
          ...existing,
          status: 'idle',
          completedTasks: 0,
          activeTaskId: undefined,
          subtasks: existing.subtasks.map((t) => ({
            ...t,
            status: 'pending',
            logs: [],
            outputSnippet: undefined,
            explanation: undefined,
            durationMs: undefined,
          })),
        },
      };
    });
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, errorMessage]);

  useEffect(() => {
    const unsub = projectMemoryService.subscribe((mem) => {
      setMemoryState(mem);
    });
    return unsub;
  }, []);

  // Global Paste listener (Ctrl+V) across ChatView
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

  // Process image file to base64 DataURL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setAttachedImage({
          dataUrl,
          name: file.name || 'captura-de-tela.png',
          mimeType: file.type || 'image/png',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Clipboard Paste handler (Ctrl+V) for textarea
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachedImage) || isLoading) return;

    const text = inputText.trim() || (attachedImage ? 'Analise este print e explique o erro/código.' : '');
    const snippet = showCodeInput && codeContext.trim() ? codeContext.trim() : undefined;
    const imagePayload = attachedImage || undefined;

    // Roteamento inteligente de modo: solicitações simples de código executam imediatamente no Modo Código Direto
    const targetMode = resolveExecutionMode(text, executionMode);
    if (executionMode === 'planning' && targetMode === 'direct') {
      setExecutionMode('direct');
    }

    setInputText('');
    setCodeContext('');
    setShowCodeInput(false);
    setAttachedImage(null);

    await onSendMessage(text, snippet, imagePayload, targetMode);
  };

  const handleApprovePlan = async (plan: ArchitecturePlan) => {
    setApprovingPlanId(plan.id);
    try {
      if (onApprovePlanInChat) {
        await onApprovePlanInChat(plan);
      } else {
        // Fallback: save to memory and trigger generation
        projectMemoryService.recordApprovedPlan(plan);
        await onSendMessage(
          `Plano de Arquitetura Aprovado: "${plan.title}"!\nPor favor, escreva agora a implementação do código baseada nas decisões planejadas.`,
          undefined,
          undefined,
          'direct'
        );
      }
    } finally {
      setApprovingPlanId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleExport = () => {
    const formatted = messages
      .map((m) => {
        const sender = m.sender === 'user' ? 'Usuário' : 'ZachAI';
        const code = m.codeSnippet ? `\n\`\`\`${m.codeSnippet.language}\n${m.codeSnippet.code}\n\`\`\`\n` : '';
        const imgInfo = m.imageAttachment ? `\n*[Imagem Anexada: ${m.imageAttachment.name || 'print'} ]*\n` : '';
        const planInfo = m.plan ? `\n*[Plano Arquitetural: ${m.plan.title} - ${m.plan.summary} ]*\n` : '';
        return `### [${m.timestamp}] ${sender}\n\n${m.content}${imgInfo}${planInfo}\n${code}\n`;
      })
      .join('\n---\n\n');

    const blob = new Blob([formatted], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alex-chat-sessao-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-[#050813]">
      {/* Hidden File Input for Image Upload */}
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

      {/* Project Memory Modal */}
      <ProjectMemoryModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
      />

      {/* Chat Sub-Header with Alex AI Specialist Banner */}
      <div className="border-b border-[#141e34] bg-[#070c1b]/95 backdrop-blur-sm">
        {/* Top Feature Subtitle Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#121a2f] px-4 py-2 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-sm shadow-cyan-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#070c1b]">
                <Bot className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-tight text-white sm:text-sm">
                  Alex AI
                </span>
                <span className="flex items-center gap-1 rounded bg-cyan-950/70 border border-cyan-500/30 px-1.5 py-0.2 text-[10px] font-semibold text-cyan-300">
                  <Sparkles className="h-2.5 w-2.5" />
                  Multimodal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Alex AI — Especialista em Análise, Correção de Erros e Prints de Código
              </p>
            </div>
          </div>

          {/* Top Actions: Mode Selector & Project Memory */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Code vs Planning vs Agent Toggle */}
            <div className="inline-flex rounded-lg border border-[#172646] bg-[#050917] p-0.5 shadow-inner">
              <button
                type="button"
                onClick={() => setExecutionMode('agent')}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-bold transition-all ${
                  executionMode === 'agent'
                    ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Modo Agente: decompõe a tarefa em subtarefas sequenciais com logs e progresso visual"
              >
                <Cpu className="h-3 w-3" />
                <span>Modo Agente</span>
              </button>
              <button
                type="button"
                onClick={() => setExecutionMode('planning')}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-bold transition-all ${
                  executionMode === 'planning'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Modo de Planejamento: a IA projeta escopo, arquivos e roteiro antes de codificar"
              >
                <Compass className="h-3 w-3" />
                <span>Modo Planejamento</span>
              </button>
              <button
                type="button"
                onClick={() => setExecutionMode('direct')}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-bold transition-all ${
                  executionMode === 'direct'
                    ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Modo Código Direto: gera trechos de código imediatamente"
              >
                <Code2 className="h-3 w-3" />
                <span>Código Direto</span>
              </button>
            </div>

            {/* Project Memory Button */}
            <button
              type="button"
              onClick={() => setIsMemoryModalOpen(true)}
              className="flex items-center gap-1.5 rounded border border-cyan-500/30 bg-[#081329] px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/60 transition-colors"
              title="Ver histórico de decisões de arquitetura e arquivos modificados salvos pelo Alex"
            >
              <BrainCircuit className="h-3.5 w-3.5 text-cyan-400" />
              <span>Memória ({memoryState.decisions.length})</span>
            </button>

            {/* Language badge */}
            <button
              onClick={onNavigateToLanguages}
              type="button"
              className="flex items-center gap-1 rounded border border-[#1a2b4b] bg-[#0c1630] px-2.5 py-1 font-mono text-[11px] text-cyan-300 hover:border-cyan-400 transition-colors"
              title="Clique para alternar a linguagem ativa"
            >
              <span className="text-slate-400">Stack:</span>
              <span className="font-bold text-white">{selectedLanguageName}</span>
            </button>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between px-4 py-1.5 sm:px-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-slate-300">
              {executionMode === 'planning'
                ? 'Architect Mode ativo — As respostas estruturam Escopo, Diagrama de Pastas e Roteiro de Execução'
                : 'Pronto para texto, trechos de código e prints (Ctrl+V)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 1 && (
              <button
                onClick={handleExport}
                type="button"
                className="flex items-center gap-1.5 rounded bg-[#0e162d] px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-cyan-950 hover:text-cyan-300"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exportar Markdown</span>
              </button>
            )}

            <button
              onClick={onClearChat}
              type="button"
              className="flex items-center gap-1.5 rounded bg-[#0e162d] px-2.5 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-rose-950/60 hover:text-rose-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Limpar conversa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {messages.map((message) => {
            const isUser = message.sender === 'user';

            return (
              <div
                key={message.id}
                className={`flex gap-3.5 sm:gap-4 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 text-xs font-bold text-black shadow-md shadow-cyan-500/20">
                    Z
                  </div>
                )}

                <div
                  className={`flex max-w-[94%] sm:max-w-[85%] flex-col rounded-xl border p-4 ${
                    isUser
                      ? 'border-blue-500/30 bg-[#0d1733] text-slate-100 shadow-md'
                      : 'border-[#172340] bg-[#080e22] text-slate-200 shadow-lg'
                  }`}
                >
                  {/* Sender Metadata Bar */}
                  <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {isUser ? 'Você' : 'ZachAI · Alex Multimodal'}
                    </span>
                    <span className="font-mono text-slate-500">
                      {message.timestamp}
                    </span>
                  </div>

                  {/* Attached Image inside User Message Bubble */}
                  {message.imageAttachment && (
                    <div className="mb-3 overflow-hidden rounded-lg border border-[#1b2745] bg-[#060a17]">
                      <div className="flex items-center gap-1.5 border-b border-[#1b2745] bg-[#091024] px-2.5 py-1 text-[11px] text-slate-400 font-mono">
                        <ImageIcon className="h-3 w-3 text-cyan-400" />
                        <span>Print de Código/Erro ({message.imageAttachment.name || 'captura'})</span>
                      </div>
                      <img
                        src={message.imageAttachment.dataUrl}
                        alt="Print anexado"
                        className="max-h-64 w-auto object-contain p-1 rounded"
                      />
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                    {message.content}
                  </div>

                  {/* Interactive Architecture Plan Viewer (Planning Mode Output) */}
                  {message.plan && (
                    <div className="mt-4">
                      <ArchitecturePlanViewer
                        plan={message.plan}
                        onApprovePlan={handleApprovePlan}
                        isExecuting={approvingPlanId === message.plan.id}
                        onOpenInStudio={(filesHint) => onNavigateToLanguages()}
                      />
                    </div>
                  )}

                  {/* Interactive Agent Plan Viewer (Agent Mode Output) */}
                  {message.agentPlan && (() => {
                    const agentPlan = message.agentPlan;
                    const planToRender = agentPlansState[agentPlan.id] || agentPlan;
                    return (
                      <div className="mt-4">
                        <AgentPlanViewer
                          plan={planToRender}
                          onExecuteAll={() => handleRunAgentPlan(planToRender)}
                          onExecuteNextStep={() => handleRunNextAgentStep(planToRender)}
                          onPause={() => handlePauseAgentPlan(agentPlan.id)}
                          onResume={() => handleResumeAgentPlan(agentPlan.id)}
                          onReset={() => handleResetAgentPlan(agentPlan.id)}
                          onOpenInStudio={onOpenInStudio}
                          onOpenInPlayground={onOpenInPlayground}
                        />
                      </div>
                    );
                  })()}

                  {/* Code Snippet (if any) */}
                  {message.codeSnippet && (
                    <div className="mt-3">
                      <CodeBlock
                        code={message.codeSnippet.code}
                        language={message.codeSnippet.language}
                        filename={message.codeSnippet.filename}
                      />
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#142345] text-xs font-semibold text-cyan-300">
                    DEV
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading State with Multimodal Distinction */}
          {isLoading && (
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 text-xs font-bold text-black shadow-md shadow-cyan-500/20">
                Z
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-[#172340] bg-[#080e22] px-4 py-3 text-sm text-cyan-300">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                <span>
                  {isImageAnalyzing
                    ? 'Alex está analisando o seu print de código/erro...'
                    : executionMode === 'planning'
                    ? 'Alex está projetando o plano de arquitetura (Escopo, Pastas e Roteiro)...'
                    : 'ZachAI analisando parâmetros técnicos e formatando resposta...'}
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {errorMessage && (
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-900/40 text-xs font-bold text-rose-300">
                !
              </div>
              <div className="flex flex-col gap-2 rounded-xl border border-rose-800/40 bg-rose-950/20 p-4 text-sm text-rose-200">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                  <span>Falha ao processar solicitação</span>
                </div>
                <p className="text-xs text-rose-300/80">{errorMessage}</p>
                <button
                  onClick={onRetry}
                  type="button"
                  className="mt-1 flex w-fit items-center gap-1.5 rounded bg-rose-900/60 px-3 py-1 text-xs font-medium text-white hover:bg-rose-800"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Tentar novamente</span>
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Composer Area with Drag & Drop & Paste Support */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-t border-[#141e34] bg-[#070c1b] p-4 sm:px-6 transition-colors ${
          isDraggingOver ? 'bg-cyan-950/30 border-cyan-500/50' : ''
        }`}
      >
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
          {/* Active Mode Notice Banner & Direct Mode Switcher */}
          <div className="mb-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-lg border border-[#172545] bg-[#081024] p-2 text-xs">
            <div className="flex items-center gap-2">
              {executionMode === 'agent' ? (
                <>
                  <Cpu className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                  <span className="text-cyan-300 font-semibold">Modo Agente Autônomo:</span>
                  <span className="text-slate-300 hidden sm:inline text-[11px]">
                    Subtarefas encadeadas com logs de execução em tempo real.
                  </span>
                </>
              ) : executionMode === 'planning' ? (
                <>
                  <Compass className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-amber-300 font-semibold">Modo Planejamento (Projetos Complexos):</span>
                  <span className="text-slate-300 hidden sm:inline text-[11px]">
                    Alex projeta Escopo, Arquitetura e Roadmap antes de codificar.
                  </span>
                </>
              ) : (
                <>
                  <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">Modo Código Direto (Padrão):</span>
                  <span className="text-slate-300 hidden sm:inline text-[11px]">
                    Gera e entrega o código solicitado imediatamente na linguagem indicada.
                  </span>
                </>
              )}
            </div>

            {/* Segmented Mode Selector Buttons */}
            <div className="flex items-center gap-1 self-end sm:self-auto bg-slate-950/80 p-0.5 rounded-md border border-slate-800">
              <button
                type="button"
                onClick={() => setExecutionMode('direct')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  executionMode === 'direct'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Gera código instantaneamente sem exigir planejamento"
              >
                Código Direto
              </button>
              <button
                type="button"
                onClick={() => setExecutionMode('planning')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  executionMode === 'planning'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Para projetos e arquiteturas complexas em 3 fases"
              >
                Planejamento
              </button>
              <button
                type="button"
                onClick={() => setExecutionMode('agent')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  executionMode === 'agent'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Orquestração autônoma de tarefas sequenciais"
              >
                Agente
              </button>
            </div>
          </div>

          {/* Image Thumbnail Preview before send */}
          {attachedImage && (
            <div className="mb-2.5 flex items-center justify-between rounded-lg border border-purple-500/40 bg-[#080d22] p-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={attachedImage.dataUrl}
                  alt="Anexo"
                  className="h-10 w-10 rounded border border-[#1d2b4a] object-cover"
                />
                <div>
                  <div className="text-xs font-semibold text-purple-200">
                    Print de Erro / Código Anexado
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {attachedImage.name} (Pronto para envio multimodal)
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                aria-label="Remover imagem"
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Optional attached code area */}
          {showCodeInput && (
            <div className="mb-3 rounded-lg border border-[#1d2b4a] bg-[#050814] p-2.5">
              <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">Anexo de Código Fonte:</span>
                <button
                  type="button"
                  onClick={() => setShowCodeInput(false)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  Remover anexo
                </button>
              </div>
              <textarea
                value={codeContext}
                onChange={(e) => setCodeContext(e.target.value)}
                placeholder="// Cole aqui o trecho de código para análise conjunta..."
                rows={3}
                className="w-full resize-y bg-transparent font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
              />
            </div>
          )}

          <div className="flex flex-col rounded-xl border border-[#1a2642] bg-[#090f23] p-3 shadow-xl focus-within:border-cyan-500/50">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={
                executionMode === 'planning'
                  ? 'Descreva a funcionalidade ou sistema que deseja planejar com o Alex (ex: "Quero criar um módulo de autenticação com JWT")...'
                  : 'Pergunte ao Alex ou cole um print com Ctrl+V (ou arraste a imagem aqui)...'
              }
              rows={2}
              className="w-full resize-none bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            />

            <div className="mt-2 flex items-center justify-between border-t border-[#141e35] pt-2">
              <div className="flex items-center gap-2">
                {/* Image upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
                    attachedImage
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-slate-400 hover:bg-[#101934] hover:text-slate-200'
                  }`}
                  title="Anexar captura de tela / print de erro"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
                  <span className="hidden sm:inline">
                    {attachedImage ? 'Print Anexado' : 'Anexar Print (ou Ctrl+V)'}
                  </span>
                </button>

                {/* Code snippet toggle button */}
                <button
                  type="button"
                  onClick={() => setShowCodeInput(!showCodeInput)}
                  className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
                    showCodeInput
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-slate-400 hover:bg-[#101934] hover:text-slate-200'
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">
                    {showCodeInput ? 'Código anexado' : 'Anexar código'}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden text-[11px] text-slate-500 sm:inline">
                  Pressione <kbd className="font-mono text-slate-400">Enter</kbd> para enviar
                </span>

                <button
                  type="submit"
                  disabled={(!inputText.trim() && !attachedImage) || isLoading}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    (inputText.trim() || attachedImage) && !isLoading
                      ? executionMode === 'planning'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25 hover:scale-105'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25 hover:from-blue-500 hover:to-cyan-400'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>{executionMode === 'planning' ? 'Planejar com Alex' : 'Enviar'}</span>
                  {executionMode === 'planning' ? (
                    <Compass className="h-3.5 w-3.5" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
