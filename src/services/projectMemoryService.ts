import { ArchitecturePlan, ProjectMemoryEntry, ProjectMemoryState } from '../types';

const STORAGE_KEY = 'zach_project_memory_v1';

const DEFAULT_MEMORY: ProjectMemoryState = {
  projectName: 'Projeto Ativo Zach AI',
  architectureSummary: 'Arquitetura modular orientada a componentes, serviços desacoplados e tipagem estrita com TypeScript.',
  primaryFramework: 'React 18 + Vite + Tailwind CSS',
  decisions: [
    {
      id: 'dec-init-1',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'architecture_decision',
      title: 'Design System & Estilização',
      details: 'Adoção da paleta futurista escura (#050813, ciano, esmeralda) com Tailwind CSS e zero dependências pesadas de UI.',
      relatedFiles: ['src/App.tsx', 'src/types.ts'],
    },
    {
      id: 'dec-init-2',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'architecture_decision',
      title: 'Modo de Planejamento (Architect Mode)',
      details: 'Validação em 3 fases (Escopo, Arquitetura de Arquivos e Checklist Ordenado) antes da geração de código.',
      relatedFiles: ['src/components/ArchitecturePlanViewer.tsx'],
    },
  ],
  modifiedFiles: [
    { path: 'src/App.tsx', purpose: 'Hub central de navegação e renderização de abas', lastModified: 'Agora' },
    { path: 'src/types.ts', purpose: 'Contratos e tipos centrais da aplicação', lastModified: 'Agora' },
    { path: 'src/components/views/ChatView.tsx', purpose: 'Interface do assistente Alex com suporte a prints e modo planejamento', lastModified: 'Agora' },
    { path: 'src/components/views/CodeGeneratorView.tsx', purpose: 'Gerador estruturado multi-arquivos com Architect Mode', lastModified: 'Agora' },
  ],
  lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
};

type MemoryListener = (state: ProjectMemoryState) => void;
const listeners = new Set<MemoryListener>();

function notifyListeners(state: ProjectMemoryState) {
  listeners.forEach((listener) => {
    try {
      listener(state);
    } catch (e) {
      console.error('Error notifying memory listener:', e);
    }
  });
}

export const projectMemoryService = {
  getMemory(): ProjectMemoryState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read project memory from localStorage:', e);
    }
    return DEFAULT_MEMORY;
  },

  saveMemory(state: ProjectMemoryState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save project memory to localStorage:', e);
    }
    notifyListeners(state);
  },

  recordArchitecturalDecision(
    title: string,
    details: string,
    relatedFiles?: string[]
  ): ProjectMemoryState {
    const current = this.getMemory();
    const newEntry: ProjectMemoryEntry = {
      id: `dec-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'architecture_decision',
      title,
      details,
      relatedFiles,
    };

    const updated: ProjectMemoryState = {
      ...current,
      decisions: [newEntry, ...current.decisions.slice(0, 30)],
      lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    this.saveMemory(updated);
    return updated;
  },

  recordFileModified(path: string, purpose?: string): ProjectMemoryState {
    const current = this.getMemory();
    const existingIndex = current.modifiedFiles.findIndex((f) => f.path === path);
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let updatedFiles = [...current.modifiedFiles];
    if (existingIndex >= 0) {
      updatedFiles[existingIndex] = {
        path,
        purpose: purpose || updatedFiles[existingIndex].purpose,
        lastModified: timeStr,
      };
    } else {
      updatedFiles.unshift({
        path,
        purpose: purpose || 'Módulo do projeto',
        lastModified: timeStr,
      });
    }

    const updated: ProjectMemoryState = {
      ...current,
      modifiedFiles: updatedFiles.slice(0, 40),
      lastUpdated: timeStr,
    };

    this.saveMemory(updated);
    return updated;
  },

  recordApprovedPlan(plan: ArchitecturePlan): ProjectMemoryState {
    const current = this.getMemory();
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newDecision: ProjectMemoryEntry = {
      id: `plan-${plan.id}`,
      timestamp: timeStr,
      type: 'plan_approved',
      title: `Plano Aprovado: ${plan.title}`,
      details: `${plan.summary} (${plan.scope.recommendedTech.join(', ')})`,
      relatedFiles: plan.fileArchitecture.map((f) => f.path),
    };

    // Also register files from the plan
    const fileMap = new Map<string, { path: string; purpose?: string; lastModified: string }>();
    current.modifiedFiles.forEach((f) => fileMap.set(f.path, f));
    plan.fileArchitecture.forEach((f) => {
      fileMap.set(f.path, {
        path: f.path,
        purpose: f.purpose,
        lastModified: timeStr,
      });
    });

    const updated: ProjectMemoryState = {
      ...current,
      projectName: plan.title,
      architectureSummary: plan.summary,
      primaryFramework: plan.scope.recommendedTech.slice(0, 3).join(' + ') || current.primaryFramework,
      decisions: [newDecision, ...current.decisions.slice(0, 30)],
      modifiedFiles: Array.from(fileMap.values()).slice(0, 40),
      lastUpdated: timeStr,
    };

    this.saveMemory(updated);
    return updated;
  },

  recordProjectMetadata(projectName?: string, framework?: string, summary?: string): ProjectMemoryState {
    const current = this.getMemory();
    const updated: ProjectMemoryState = {
      ...current,
      projectName: projectName || current.projectName,
      primaryFramework: framework || current.primaryFramework,
      architectureSummary: summary || current.architectureSummary,
      lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    this.saveMemory(updated);
    return updated;
  },

  clearMemory(): ProjectMemoryState {
    const reset: ProjectMemoryState = {
      ...DEFAULT_MEMORY,
      decisions: [],
      modifiedFiles: [],
      lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    this.saveMemory(reset);
    return reset;
  },

  /**
   * Generates a context injection string to be passed into AI model prompts (Alex Chat & Code Generator)
   * so that responses strictly maintain architectural consistency and remember modified files.
   */
  getMemoryPromptContext(): string {
    const memory = this.getMemory();
    const decisionsText = memory.decisions.slice(0, 5)
      .map((d) => `- [${d.type}] ${d.title}: ${d.details}`)
      .join('\n');
    const filesText = memory.modifiedFiles.slice(0, 8)
      .map((f) => `- ${f.path}${f.purpose ? ` (${f.purpose})` : ''}`)
      .join('\n');

    return `\n--- [MEMÓRIA ATIVA DO PROJETO - ALEX ENGINE] ---
Projeto: ${memory.projectName}
Framework Principal: ${memory.primaryFramework || 'Não especificado'}
Resumo da Arquitetura: ${memory.architectureSummary || 'Nenhum definido'}

Decisões de Arquitetura Recentes:
${decisionsText || 'Nenhuma decisão registrada'}

Arquivos Existentes / Modificados no Projeto:
${filesText || 'Nenhum arquivo registrado'}
--------------------------------------------------\n`;
  },

  subscribe(listener: MemoryListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
