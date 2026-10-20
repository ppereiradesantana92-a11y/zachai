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
    <div className="flex flex-1 h-full min-h-0 flex-col bg-[#050813] relative overflow-hidden">
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

      {/* Gemini-Style Clean Header Bar */}
      <header className="shrink-0 flex items-center justify-between border-b border-[#141e34]/80 bg-[#070c1b]/95 px-4 py-2.5 sm:px-6 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-sm shadow-cyan-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#070c1b]">
              <Bot className="h-4 w-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">Alex AI</span>
              <button
                type="button"
                onClick={onNavigateToLanguages}
                className="text-xs text-cyan-400/90 hover:text-cyan-300 font-mono transition-colors"
                title="Clique para alternar a linguagem / stack ativa"
              >
                · {selectedLanguageName}
              </button>
            </div>
          </div>
        </div>

        {/* Compact Right Controls */}
        <div className="flex items-center gap-2">
          {/* Direct Code vs Planning vs Agent Segmented Pill */}
          <div className="inline-flex rounded-lg border border-[#172646] bg-[#050917] p-0.5">
            <button
              type="button"
              onClick={() => setExecutionMode('direct')}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-all ${
                executionMode === 'direct'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Modo Código Direto: gera e entrega código imediatamente"
            >
              <Code2 className="h-3 w-3" />
              <span className="hidden sm:inline">Código Direto</span>
            </button>
            <button
              type="button"
              onClick={() => setExecutionMode('planning')}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-all ${
                executionMode === 'planning'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Modo Planejamento: arquitetura em fases antes de codificar"
            >
              <Compass className="h-3 w-3" />
              <span className="hidden sm:inline">Planejamento</span>
            </button>
            <button
              type="button"
              onClick={() => setExecutionMode('agent')}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-all ${
                executionMode === 'agent'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Modo Agente: execução com subtarefas sequenciais"
            >
              <Cpu className="h-3 w-3" />
              <span className="hidden sm:inline">Agente</span>
            </button>
          </div>

          {/* Project Memory Button */}
          <button
            type="button"
            onClick={() => setIsMemoryModalOpen(true)}
            className="flex items-center gap-1 rounded-md border border-cyan-500/20 bg-[#081329] px-2 py-1 text-xs text-cyan-300 hover:border-cyan-400/50 transition-colors"
            title="Memória do Projeto"
          >
            <BrainCircuit className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden md:inline">Memória</span>
            <span className="rounded-full bg-cyan-950 px-1 text-[10px] font-mono text-cyan-300">
              {memoryState.decisions.length}
            </span>
          </button>

          {/* Export & Clear Actions */}
          {messages.length > 1 && (
            <button
              onClick={handleExport}
              type="button"
              aria-label="Exportar Markdown"
              title="Exportar conversa em Markdown"
              className="rounded p-1.5 text-slate-400 hover:bg-[#0e162d] hover:text-cyan-300 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={onClearChat}
            type="button"
            aria-label="Limpar conversa"
            title="Limpar conversa"
            className="rounded p-1.5 text-slate-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Messages Thread Container (Gemini-Style with Generous Bottom Padding) */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 scroll-smooth">
        <div className="mx-auto max-w-3xl space-y-6 pb-48 sm:pb-56">
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
                      {isUser ? 'Você' : 'Alex AI'}
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
                  {message.content && message.content.trim() ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                      {message.content}
                    </div>
                  ) : null}

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

      {/* Floating Gemini-Style Input Composer */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`absolute bottom-0 left-0 right-0 z-20 pointer-events-none px-3 pb-3 sm:px-6 sm:pb-5 pt-6 bg-gradient-to-t from-[#050813] via-[#050813]/95 to-transparent transition-colors ${
          isDraggingOver ? 'from-cyan-950/80' : ''
        }`}
      >
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl pointer-events-auto">
          {/* Image Thumbnail Preview before send */}
          {attachedImage && (
            <div className="mb-2 flex items-center justify-between rounded-xl border border-purple-500/40 bg-[#080d22]/95 backdrop-blur-md p-2 shadow-lg">
              <div className="flex items-center gap-2.5">
                <img
                  src={attachedImage.dataUrl}
                  alt="Anexo"
                  className="h-10 w-10 rounded-lg border border-[#1d2b4a] object-cover"
                />
                <div>
                  <div className="text-xs font-semibold text-purple-200">
                    Print Anexado
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {attachedImage.name}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                aria-label="Remover imagem"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Optional attached code area */}
          {showCodeInput && (
            <div className="mb-2 rounded-xl border border-[#1d2b4a] bg-[#050814]/95 backdrop-blur-md p-2.5 shadow-lg">
              <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono text-cyan-300">Anexo de Código Fonte:</span>
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

          {/* Gemini-Style Rounded Input Card */}
          <div className="flex flex-col rounded-2xl border border-[#1c2a4a] bg-[#080e22]/95 backdrop-blur-md p-3 shadow-2xl shadow-black/60 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={
                executionMode === 'planning'
                  ? 'Descreva a arquitetura ou sistema para planejar em fases com o Alex...'
                  : 'Pergunte algo ou solicite código (Ctrl+V para colar prints)...'
              }
              rows={2}
              className="w-full resize-none bg-transparent px-1 text-sm text-slate-100 placeholder-slate-500 focus:outline-none max-h-36"
            />

            <div className="mt-2 flex items-center justify-between border-t border-[#141e35]/80 pt-2">
              <div className="flex items-center gap-1.5">
                {/* Image upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    attachedImage
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:bg-[#101934] hover:text-slate-200'
                  }`}
                  title="Anexar captura de tela / print de erro"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
                  <span className="hidden sm:inline">
                    {attachedImage ? 'Print Anexado' : 'Print'}
                  </span>
                </button>

                {/* Code snippet toggle button */}
                <button
                  type="button"
                  onClick={() => setShowCodeInput(!showCodeInput)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    showCodeInput
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-[#101934] hover:text-slate-200'
                  }`}
                  title="Anexar trecho de código fonte"
                >
                  <FileCode className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">
                    {showCodeInput ? 'Código Anexo' : 'Código'}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden text-[11px] text-slate-500 lg:inline">
                  Pressione <kbd className="font-mono text-slate-400">Enter</kbd> para enviar
                </span>

                <button
                  type="submit"
                  disabled={(!inputText.trim() && !attachedImage) || isLoading}
                  className={`flex h-8 sm:h-auto items-center justify-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    (inputText.trim() || attachedImage) && !isLoading
                      ? executionMode === 'planning'
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 hover:bg-amber-500'
                        : 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30 hover:bg-cyan-400'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span className="hidden sm:inline">
                    {executionMode === 'planning' ? 'Planejar' : 'Enviar'}
                  </span>
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
