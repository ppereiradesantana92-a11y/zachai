import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  X,
  FileCode,
  ShieldCheck,
  Clock,
  Trash2,
  Plus,
  Layers,
  FolderTree,
  Sparkles,
  Check,
} from 'lucide-react';
import { projectMemoryService } from '../services/projectMemoryService';
import { ProjectMemoryState } from '../types';

interface ProjectMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectMemoryModal: React.FC<ProjectMemoryModalProps> = ({ isOpen, onClose }) => {
  const [memory, setMemory] = useState<ProjectMemoryState>(() => projectMemoryService.getMemory());
  const [newDecisionTitle, setNewDecisionTitle] = useState('');
  const [newDecisionDetails, setNewDecisionDetails] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedContext, setCopiedContext] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMemory(projectMemoryService.getMemory());
    }
  }, [isOpen]);

  useEffect(() => {
    const unsubscribe = projectMemoryService.subscribe((updated) => {
      setMemory(updated);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleAddDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecisionTitle.trim()) return;
    const updated = projectMemoryService.recordArchitecturalDecision(
      newDecisionTitle.trim(),
      newDecisionDetails.trim() || 'Definição arquitetural registrada pelo desenvolvedor.'
    );
    setMemory(updated);
    setNewDecisionTitle('');
    setNewDecisionDetails('');
    setShowAddForm(false);
  };

  const handleClear = () => {
    if (window.confirm('Tem certeza de que deseja limpar a memória de decisões deste projeto?')) {
      const reset = projectMemoryService.clearMemory();
      setMemory(reset);
    }
  };

  const handleCopyContext = () => {
    const text = projectMemoryService.getMemoryPromptContext();
    navigator.clipboard.writeText(text);
    setCopiedContext(true);
    setTimeout(() => setCopiedContext(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-cyan-500/40 bg-[#070c1a] shadow-2xl shadow-cyan-950/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#14203d] px-6 py-4 bg-[#081023]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/60 text-cyan-300">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Memória de Projeto do Alex</h3>
                <span className="rounded-full border border-cyan-400/40 bg-cyan-950/70 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  CONSISTÊNCIA ATIVA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Histórico persistente de decisões de arquitetura e arquivos rastreados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#14203d] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Project Summary Banner */}
          <div className="rounded-xl border border-cyan-500/30 bg-[#09142e] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">
                  PROJETO ATUAL
                </span>
                <span className="text-xs text-slate-400">• Atualizado às {memory.lastUpdated}</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                {memory.projectName}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {memory.architectureSummary || 'Sem resumo de arquitetura cadastrado.'}
              </p>
              {memory.primaryFramework && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded bg-[#0f2347] px-2 py-0.5 font-mono text-[11px] font-semibold text-cyan-200 border border-cyan-400/30">
                    {memory.primaryFramework}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyContext}
                className="flex items-center gap-1.5 rounded-lg border border-[#1b2b4d] bg-[#0c1833] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
              >
                {copiedContext ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>{copiedContext ? 'Copiado!' : 'Prompt Context'}</span>
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-950/20 px-3 py-1.5 text-xs text-red-300 hover:bg-red-950/40 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Limpar</span>
              </button>
            </div>
          </div>

          {/* Section: Architectural Decisions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  Decisões de Arquitetura Salvas ({memory.decisions.length})
                </h4>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-900/50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Adicionar Decisão</span>
              </button>
            </div>

            {showAddForm && (
              <form
                onSubmit={handleAddDecision}
                className="mb-4 rounded-xl border border-cyan-500/30 bg-[#081226] p-4 space-y-3 animate-in fade-in"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Título da Decisão Arquitetural
                  </label>
                  <input
                    type="text"
                    value={newDecisionTitle}
                    onChange={(e) => setNewDecisionTitle(e.target.value)}
                    placeholder="Ex: Utilizar Zustand para gerenciamento de estado global"
                    className="w-full rounded-lg border border-[#192748] bg-[#050a17] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Detalhes / Justificativa
                  </label>
                  <textarea
                    value={newDecisionDetails}
                    onChange={(e) => setNewDecisionDetails(e.target.value)}
                    placeholder="Explicação do porquê desta decisão e arquivos impactados..."
                    rows={2}
                    className="w-full rounded-lg border border-[#192748] bg-[#050a17] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-500"
                  >
                    Salvar na Memória
                  </button>
                </div>
              </form>
            )}

            {memory.decisions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#1a2846] p-6 text-center text-xs text-slate-400">
                Nenhuma decisão registrada ainda. Aprovar planos no Modo de Planejamento registrará decisões automaticamente!
              </div>
            ) : (
              <div className="space-y-2.5">
                {memory.decisions.map((dec) => (
                  <div
                    key={dec.id}
                    className="rounded-xl border border-[#14213d] bg-[#060c1d] p-3.5 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-400">
                          {dec.type === 'plan_approved' ? 'Plano Aprovado' : 'Decisão'}
                        </span>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-100">
                          {dec.title}
                        </h5>
                      </div>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        {dec.timestamp}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                      {dec.details}
                    </p>
                    {dec.relatedFiles && dec.relatedFiles.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        <span className="text-[10px] text-slate-500">Arquivos:</span>
                        {dec.relatedFiles.map((file, fi) => (
                          <span
                            key={fi}
                            className="rounded bg-[#0a152d] px-1.5 py-0.2 font-mono text-[10px] text-cyan-300 border border-cyan-500/20"
                          >
                            {file}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Tracked & Modified Files */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FolderTree className="h-4 w-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-slate-100">
                Arquivos Rastreados no Projeto ({memory.modifiedFiles.length})
              </h4>
            </div>

            {memory.modifiedFiles.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#1a2846] p-4 text-center text-xs text-slate-400">
                Nenhum arquivo modificado recentemente.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {memory.modifiedFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-[#14203a] bg-[#060b19] p-2.5 text-xs"
                  >
                    <FileCode className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-xs font-semibold text-slate-200 truncate">
                        {file.path}
                      </div>
                      {file.purpose && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {file.purpose}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#14203d] px-6 py-3.5 bg-[#081023] flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            O Alex consulta esta memória automaticamente em todas as respostas futuras para manter a consistência do seu código.
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-cyan-500 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
