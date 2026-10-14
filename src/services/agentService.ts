import { AgentExecutionPlan, AgentSubtask, GeneratedFile } from '../types';
import { projectMemoryService } from './projectMemoryService';

export interface ExecuteStepResult {
  logs: string[];
  outputSnippet?: {
    filename: string;
    language: string;
    code: string;
  };
  explanation: string;
  durationMs: number;
}

export const AGENT_PRESET_PROMPTS = [
  {
    id: 'saas-billing',
    title: 'SaaS com Assinaturas Stripe e JWT',
    description: 'Sistema completo de monetização com planos mensais/anuais, webhooks seguros e dashboard de cliente.',
    badge: 'FULLSTACK',
    prompt: 'Crie uma plataforma SaaS completa com autenticação JWT, planos de assinatura com integração Stripe, webhook para checkout.session.completed e dashboard de cliente com controle de acessos.',
  },
  {
    id: 'realtime-chat',
    title: 'Chat Multimodal em Tempo Real com WebSockets',
    description: 'Servidor WebSocket com reconexão automática, canais de mensagem, uploads de imagens e feed fluido.',
    badge: 'WEBSOCKET',
    prompt: 'Desenvolva uma aplicação de chat em tempo real utilizando WebSockets com reconexão resiliente, histórico de conversas, envio de fotos em base64 e lista de usuários online.',
  },
  {
    id: 'ecommerce-cart',
    title: 'E-Commerce com Catálogo e Carrinho Reativo',
    description: 'Loja virtual com filtros de busca, carrinho persistente com LocalStorage, cálculo de frete e checkout.',
    badge: 'E-COMMERCE',
    prompt: 'Construa um e-commerce moderno com catálogo de produtos, filtros por categoria e preço, carrinho reativo persistido, cálculo de frete e resumo de checkout.',
  },
  {
    id: 'course-platform',
    title: 'Plataforma de Cursos com Quizzes e Certificados',
    description: 'Sistema educacional com trilhas de estudo, reprodutor de vídeo, quizzes avaliativos e emissão de certificados.',
    badge: 'EDTECH',
    prompt: 'Implemente uma plataforma educacional com módulos de aula, trilha de progresso do aluno, sistema de quizzes com pontuação imediata e geração de certificado de conclusão.',
  },
];

export async function decomposeRequestWithAgent(
  prompt: string,
  framework = 'React 19 + TypeScript + Tailwind CSS'
): Promise<AgentExecutionPlan> {
  const response = await fetch('/api/agent/decompose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, framework }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao decompor tarefa com o Agente.');
  }

  const plan: AgentExecutionPlan = await response.json();
  return plan;
}

export async function executeAgentSubtask(
  prompt: string,
  subtask: AgentSubtask,
  framework = 'React 19 + TypeScript + Tailwind CSS'
): Promise<ExecuteStepResult> {
  const response = await fetch('/api/agent/execute-step', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, subtask, framework }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Falha na execução da subtarefa #${subtask.number}`);
  }

  const result: ExecuteStepResult = await response.json();

  // Automatically record to project memory
  if (result.outputSnippet) {
    projectMemoryService.recordFileModified(
      result.outputSnippet.filename,
      `Gerado pela Subtarefa #${subtask.number} do Agente: ${subtask.title}`
    );
  }

  projectMemoryService.recordArchitecturalDecision(
    `Subtarefa #${subtask.number} Concluída: ${subtask.title}`,
    result.explanation,
    result.outputSnippet ? [result.outputSnippet.filename] : []
  );

  return result;
}

export function extractGeneratedFilesFromPlan(plan: AgentExecutionPlan): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  plan.subtasks.forEach((task) => {
    if (task.outputSnippet && task.status === 'completed') {
      files.push({
        filename: task.outputSnippet.filename.split('/').pop() || task.outputSnippet.filename,
        path: task.outputSnippet.filename,
        language: task.outputSnippet.language,
        description: task.explanation || task.description,
        content: task.outputSnippet.code,
      });
    }
  });

  return files;
}
