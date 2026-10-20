/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  NavigationTab,
  ChatMessage,
  ChatSession,
  AppSettings,
  ArchitecturePlan,
  AgentExecutionPlan,
  ExecutionMode,
} from './types';
import { INITIAL_CHAT_SESSIONS } from './data/initialData';
import { sendChatMessage } from './services/geminiService';
import { projectMemoryService } from './services/projectMemoryService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { IntegrationBanner } from './components/IntegrationBanner';
import { HomeView } from './components/views/HomeView';
import { ChatView } from './components/views/ChatView';
import { AgentModeView } from './components/views/AgentModeView';
import { CodeAnalyzerView } from './components/views/CodeAnalyzerView';
import { LanguagesView } from './components/views/LanguagesView';
import { ErrorFixerView } from './components/views/ErrorFixerView';
import { ProjectsView } from './components/views/ProjectsView';
import { HistoryView } from './components/views/HistoryView';
import { SettingsView } from './components/views/SettingsView';
import { PracticeView } from './components/views/PracticeView';
import { CodeStudioView } from './components/views/CodeStudioView';
import { ProfileView } from './components/views/ProfileView';
import { CodeGeneratorView } from './components/views/CodeGeneratorView';
import { WebPlaygroundView } from './components/views/WebPlaygroundView';
import { RefactorView } from './components/views/RefactorView';
import { CodeConverterView } from './components/views/CodeConverterView';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { PaymentNotificationToast } from './components/PaymentNotificationToast';
import { authService } from './services/authService';
import { getThemeConfig, applyThemeGlobalStyles } from './services/themeService';
import {
  detectLanguageFromPrompt,
  isSimpleCodeRequest,
  isComplexArchitecturalRequest,
  resolveExecutionMode,
  getExtensionForLanguage,
  getCodeHighlightLang,
} from './utils/languageDetector';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('TypeScript');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_CHAT_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>(INITIAL_CHAT_SESSIONS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageAnalyzing, setIsImageAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSubmittedPrompt, setLastSubmittedPrompt] = useState<{
    text: string;
    code?: string;
  } | null>(null);
  const [lastSubmittedImage, setLastSubmittedImage] = useState<{
    dataUrl: string;
    name?: string;
    mimeType?: string;
  } | null>(null);
  const [studioInitialCode, setStudioInitialCode] = useState<string | undefined>(undefined);
  const [studioInitialFilename, setStudioInitialFilename] = useState<string | undefined>(undefined);
  const [studioInitialFiles, setStudioInitialFiles] = useState<
    Array<{ name: string; content: string; language?: string }> | undefined
  >(undefined);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlanIdForCheckout, setSelectedPlanIdForCheckout] = useState('monthly');
  const [creditNotice, setCreditNotice] = useState<string | null>(null);

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem('zach_app_settings_v3');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {
      preferredModel: 'ZachAI Core Engine (Etapa 1)',
      responseDetail: 'balanced',
      indentSize: 2,
      showLineNumbers: true,
      autoCopyCode: false,
      highContrast: false,
      language: 'pt-BR',
      theme: 'neon-blue',
      enableRgbBorder: true,
    };
  });

  // Aplicação instantânea dos estilos e acentos cromáticos globais
  useEffect(() => {
    applyThemeGlobalStyles(settings.theme, settings.enableRgbBorder);
  }, [settings.theme, settings.enableRgbBorder]);

  const activeThemeConfig = getThemeConfig(settings.theme);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Helper to generate context-rich responses for prompt intent
  const generateStructuredAssistantReply = (
    userPrompt: string,
    attachedCode?: string,
    mode: ExecutionMode = 'direct',
    targetLang: string = selectedLanguage
  ): ChatMessage => {
    const lower = userPrompt.toLowerCase();
    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Agent Mode: Decompose into sequential subtasks with live progress
    if (mode === 'agent') {
      const isSaas = lower.includes('saas') || lower.includes('stripe') || lower.includes('pagamento');
      const isChat = lower.includes('chat') || lower.includes('tempo real') || lower.includes('socket');

      const subtasks = isSaas
        ? [
            {
              id: 'task-1',
              number: 1,
              title: 'Modelagem de Dados e Tipos de Assinatura',
              description: 'Definir interfaces de planos, faturas e clientes em TypeScript strict.',
              status: 'pending' as const,
              category: 'model' as const,
              targetFiles: ['src/types/billing.ts'],
              logs: [],
            },
            {
              id: 'task-2',
              number: 2,
              title: 'Serviço de Integração Stripe & Checkout',
              description: 'Implementar checkout sessions e tratamento de sessões de pagamento.',
              status: 'pending' as const,
              category: 'service' as const,
              targetFiles: ['src/services/stripeService.ts'],
              logs: [],
            },
            {
              id: 'task-3',
              number: 3,
              title: 'Tabela de Preços e Componentes de UI',
              description: 'Desenvolver componente de planos com seleção mensal/anual e feedback.',
              status: 'pending' as const,
              category: 'ui' as const,
              targetFiles: ['src/components/PricingTable.tsx'],
              logs: [],
            },
            {
              id: 'task-4',
              number: 4,
              title: 'Auditoria de Webhooks e Testes de Checkout',
              description: 'Configurar verificação de assinaturas digitais e testes de ponta a ponta.',
              status: 'pending' as const,
              category: 'test' as const,
              targetFiles: ['tests/billing.test.ts'],
              logs: [],
            },
          ]
        : isChat
        ? [
            {
              id: 'task-1',
              number: 1,
              title: 'Protocolo de Mensagens e Tipagem de Eventos',
              description: 'Declarar payloads de mensagem, status de digitação e histórico.',
              status: 'pending' as const,
              category: 'model' as const,
              targetFiles: ['src/types/chatEvents.ts'],
              logs: [],
            },
            {
              id: 'task-2',
              number: 2,
              title: 'Gerenciador de Conexão WebSocket Resiliente',
              description: 'Singleton com reconexão exponencial e buffer offline.',
              status: 'pending' as const,
              category: 'service' as const,
              targetFiles: ['src/services/socketService.ts'],
              logs: [],
            },
            {
              id: 'task-3',
              number: 3,
              title: 'Feed de Mensagens e Componentes de Chat',
              description: 'Interface de conversa fluida com autoscroll e indicador de presença.',
              status: 'pending' as const,
              category: 'ui' as const,
              targetFiles: ['src/components/ChatFeed.tsx'],
              logs: [],
            },
            {
              id: 'task-4',
              number: 4,
              title: 'Testes de Concorrência e Diagnóstico de Latência',
              description: 'Simulação de envio contínuo e validação de tempo de resposta.',
              status: 'pending' as const,
              category: 'test' as const,
              targetFiles: ['tests/socketStress.test.ts'],
              logs: [],
            },
          ]
        : [
            {
              id: 'task-1',
              number: 1,
              title: 'Fase 1: Especificação de Domínio e Contratos',
              description: `Definir interfaces estritas para "${userPrompt.slice(0, 35)}..." em ${selectedLanguage}.`,
              status: 'pending' as const,
              category: 'model' as const,
              targetFiles: [`src/types/models.${selectedLanguage.toLowerCase() === 'python' ? 'py' : 'ts'}`],
              logs: [],
            },
            {
              id: 'task-2',
              number: 2,
              title: 'Fase 2: Serviços Centrais e Operações Assíncronas',
              description: 'Construir rotinas de dados, comunicação e validação defensiva.',
              status: 'pending' as const,
              category: 'service' as const,
              targetFiles: [`src/services/apiService.${selectedLanguage.toLowerCase() === 'python' ? 'py' : 'ts'}`],
              logs: [],
            },
            {
              id: 'task-3',
              number: 3,
              title: 'Fase 3: Camada de Apresentação e Componentes (UI)',
              description: 'Desenvolver telas e widgets com layout moderno, acessibilidade e microinterações.',
              status: 'pending' as const,
              category: 'ui' as const,
              targetFiles: [`src/components/MainView.${selectedLanguage.toLowerCase() === 'python' ? 'py' : 'tsx'}`],
              logs: [],
            },
            {
              id: 'task-4',
              number: 4,
              title: 'Fase 4: Testes de Integridade e Validação de Produção',
              description: 'Verificar integridade com tsc --noEmit, conformidade e compilação.',
              status: 'pending' as const,
              category: 'test' as const,
              targetFiles: ['package.json'],
              logs: [],
            },
          ];

      const agentPlan: AgentExecutionPlan = {
        id: `agent-${Date.now()}`,
        prompt: userPrompt,
        title: `Orquestração de Agente: ${userPrompt.slice(0, 45)}...`,
        summary: `O Agente Autônomo Zach dividiu sua solicitação em ${subtasks.length} subtarefas sequenciais encadeadas. Você pode executar todas automaticamente ou avançar passo a passo inspecionando logs e código em tempo real.`,
        framework: selectedLanguage,
        totalTasks: subtasks.length,
        completedTasks: 0,
        status: 'idle',
        subtasks,
      };

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        content: `⚡ **Modo Agente Autônomo Ativado**\n\nDecompus sua solicitação complexa em **${subtasks.length} subtarefas sequenciais encadeadas**.\n\nAcompanhe o progresso de cada etapa visualmente no painel do agente abaixo e clique em **"Executar Todas Sequencialmente"** para iniciar a orquestração autônoma!`,
        agentPlan,
      };
    }

    const isHtml =
      targetLang.toLowerCase() === 'html' ||
      /\b(html5?|c[oó]digo html|arquivo html|p[aá]gina html|tag html|tabela html|formul[aá]rio html|bot[aã]o html|web vanilla)\b/i.test(userPrompt);

    // Planning Mode (Architect Mode): Reservado exclusivamente para tarefas comprovadamente complexas ou pedidos explícitos de plano.
    // Tarefas simples de código NUNCA exigem planejamento e avançam para a entrega direta de código.
    const resolvedMode = resolveExecutionMode(userPrompt, mode);
    if (resolvedMode === 'planning') {
      const plan: ArchitecturePlan = {
        id: `plan-${Date.now()}`,
        title: `Plano Arquitetural: ${userPrompt.slice(0, 50)}...`,
        summary: `Estruturação técnica projetada pelo Alex. Arquitetura orientada a camadas desacopladas e padrões modernos em ${targetLang}.`,
        scope: {
          objectives: [
            `Construir arquitetura escalável e defensiva para ${targetLang}`,
            'Garantir isolamento estrito entre regras de negócio, dados e apresentação',
            'Facilitar testes unitários e manutenibilidade através de desacoplamento',
          ],
          coreFeatures: [
            'Contratos e interfaces tipadas com validação de dados',
            'Serviços desacoplados e funções puras',
            'Componentes modulares com tratamento de loading e erro',
            'Persistência e estado previsível',
          ],
          recommendedTech: [targetLang, 'Clean Architecture', 'Modular Design'],
        },
        fileArchitecture: [
          {
            path: `src/types/models.${targetLang.toLowerCase() === 'python' ? 'py' : targetLang.toLowerCase() === 'html' ? 'html' : 'ts'}`,
            purpose: 'Tipos e contratos essenciais',
            layer: 'types',
          },
          {
            path: `src/services/apiService.${targetLang.toLowerCase() === 'python' ? 'py' : 'ts'}`,
            purpose: 'Camada de comunicação e regras de negócio',
            layer: 'service',
          },
          {
            path: `src/components/MainView.${targetLang.toLowerCase() === 'python' ? 'py' : targetLang.toLowerCase() === 'html' ? 'html' : 'tsx'}`,
            purpose: 'Interface principal responsiva com feedback visual',
            layer: 'ui',
          },
        ],
        roadmapSteps: [
          {
            stepNumber: 1,
            title: 'Definição de Tipos e Contratos',
            description: 'Declarar interfaces e contratos essenciais.',
            targetFiles: [],
          },
          {
            stepNumber: 2,
            title: 'Implementação da Camada de Negócio',
            description: 'Criar funções de serviço e regras de validação defensivas.',
            targetFiles: [],
          },
          {
            stepNumber: 3,
            title: 'Construção da Camada Visual/Rotas',
            description: 'Montar componentes com tratamento de erros e feedbacks.',
            targetFiles: [],
          },
        ],
        status: 'draft',
        createdAt: new Date().toISOString(),
      };

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        content: `🎯 **Modo de Planejamento Ativado (Architect Mode)**\n\nAnalisei o seu pedido para **${targetLang}**: "${userPrompt}".\n\nConforme a diretriz do Arquiteto Zach para projetos complexos, projetei a especificação técnica em 3 fases abaixo:\n\n1. **Fase 1: Escopo e Requisitos** (Objetivos, funcionalidades e stack);\n2. **Fase 2: Arquitetura de Pastas e Arquivos** (Diagrama de responsabilidades);\n3. **Fase 3: Roteiro Ordenado de Execução** (Passos de desenvolvimento ordenados).\n\nRevise a estrutura e clique em **"Aprovar Plano e Iniciar Programação"** para eu escrever a implementação completa de código!`,
        plan,
      };
    }

    // Se o usuário solicitou código HTML, entrega o HTML5 completo imediatamente sem exigir planejamento
    if (isHtml) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        content: '',
        codeSnippet: {
          language: 'html',
          filename: 'index.html',
          code: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Página Simples - Zach AI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #050813;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: rgba(11, 18, 36, 0.85);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 16px;
      padding: 36px 32px;
      max-width: 460px;
      width: 100%;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(6, 182, 212, 0.15);
      backdrop-filter: blur(12px);
    }
    .tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      color: #38bdf8;
      background: rgba(14, 165, 233, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #ffffff, #38bdf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: linear-gradient(135deg, #0284c7, #06b6d4);
      color: #030712;
      font-weight: 700;
      font-size: 13px;
      padding: 12px 28px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
      transition: all 0.2s ease;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(6, 182, 212, 0.45);
    }
    .btn:active {
      transform: translateY(0);
    }
    #counter {
      margin-top: 14px;
      font-size: 12px;
      color: #38bdf8;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="tag">HTML5 Puro</span>
    <h1>Estrutura HTML Simples</h1>
    <p>Esta é uma página HTML5 limpa, sem dependências externas e com design responsivo, gerada diretamente pelo Zach AI.</p>
    <button class="btn" onclick="handleClick()">
      <span>Clique Aqui</span>
    </button>
    <div id="counter"></div>
  </div>

  <script>
    let clicks = 0;
    function handleClick() {
      clicks++;
      const counter = document.getElementById('counter');
      counter.textContent = 'Cliques registrados: ' + clicks;
    }
  </script>
</body>
</html>`,
        },
      };
    }

    // Se a linguagem solicitada for Python
    if (targetLang.toLowerCase() === 'python' || /\b(python3?|py|script python|c[oó]digo python)\b/i.test(userPrompt)) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        content: '',
        codeSnippet: {
          language: 'python',
          filename: 'main.py',
          code: `"""
Script funcional em Python gerado pelo ZachAI
Demonstração limpa com funções puras e tratamento defensivo
"""
from typing import List, Dict, Any
import sys

def process_data(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Processa uma lista de registros estruturados e calcula métricas."""
    if not items:
        return {"total": 0, "status": "empty"}
    
    total_processed = len(items)
    print(f"[ZachAI] Processando {total_processed} registros com sucesso.")
    return {
        "total": total_processed,
        "items": items,
        "status": "success"
    }

if __name__ == "__main__":
    sample_data = [
        {"id": 1, "name": "Módulo de Entrada", "active": True},
        {"id": 2, "name": "Serviço de Processamento", "active": True},
    ]
    result = process_data(sample_data)
    print(f"Resultado final: {result}")
`,
        },
      };
    }

    // Se a linguagem solicitada for CSS
    if (targetLang.toLowerCase() === 'css' || /\b(css3?|estilo css|folha de estilo)\b/i.test(userPrompt)) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        content: '',
        codeSnippet: {
          language: 'css',
          filename: 'styles.css',
          code: `:root {
  --bg-primary: #050813;
  --bg-card: rgba(11, 18, 36, 0.85);
  --border-cyan: rgba(6, 182, 212, 0.3);
  --text-primary: #f8fafc;
  --text-muted: #94a3b8;
  --accent-cyan: #38bdf8;
  --radius-md: 12px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.container {
  background: var(--bg-card);
  border: 1px solid var(--border-cyan);
  border-radius: var(--radius-md);
  padding: 32px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
}
`,
        },
      };
    }

    // Se a linguagem solicitada for JavaScript
    if (targetLang.toLowerCase() === 'javascript' || /\b(javascript|vanilla js|js puro|\bjs\b)\b/i.test(userPrompt)) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        content: '',
        codeSnippet: {
          language: 'javascript',
          filename: 'script.js',
          code: `/**
 * Utilitário JavaScript Moderno (ES6+)
 * Gerado pelo ZachAI
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('[ZachAI] DOM carregado e pronto para execução.');

  const appState = {
    counter: 0,
    items: []
  };

  function updateDisplay() {
    const el = document.getElementById('output');
    if (el) {
      el.textContent = \`Estado atualizado: \${appState.counter} cliques\`;
    }
  }

  window.handleAction = function() {
    appState.counter++;
    updateDisplay();
  };
});
`,
        },
      };
    }

    // Se a linguagem solicitada for SQL
    if (targetLang.toLowerCase() === 'sql' || /\b(sql|query sql|consulta sql|postgresql|mysql)\b/i.test(userPrompt)) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        content: '',
        codeSnippet: {
          language: 'sql',
          filename: 'query.sql',
          code: `-- Schema de Banco de Dados Relacional - ZachAI
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Exemplo de consulta com ordenação e paginação
SELECT id, name, email, created_at
FROM users
ORDER BY created_at DESC
LIMIT 20;
`,
        },
      };
    }

    // Se a linguagem solicitada for JSON
    if (targetLang.toLowerCase() === 'json' || /\b(json|arquivo json|payload json)\b/i.test(userPrompt)) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        content: '',
        codeSnippet: {
          language: 'json',
          filename: 'data.json',
          code: `{
  "apiVersion": "1.0.0",
  "name": "ZachAI Payload",
  "status": "success",
  "data": {
    "totalRecords": 3,
    "items": [
      { "id": 1, "title": "Módulo Front-end", "completed": true },
      { "id": 2, "title": "Serviço de Autenticação", "completed": true },
      { "id": 3, "title": "Banco de Dados e Índices", "completed": false }
    ]
  }
}
`,
        },
      };
    }

    // Category 1: Criar sites / landing page / API em React e TypeScript (somente se TypeScript for a linguagem)
    if (targetLang.toLowerCase() === 'typescript' && (lower.includes('site') || lower.includes('landing') || lower.includes('dashboard') || lower.includes('api'))) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        content: '',
        codeSnippet: {
          language: 'typescript',
          filename: 'src/components/ModernHero.tsx',
          code: `import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function ModernHero() {
  return (
    <section className="relative overflow-hidden bg-[#050813] py-20 px-6 text-slate-100">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
          Desenvolvimento acelerado com precisão arquitetural.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
          Crie aplicações web escaláveis com tipagem estrita e sem dependências supérfluas.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:bg-cyan-400">
            <span>Começar Agora</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}`,
        },
      };
    }

    // Category 2: Explicar código / hooks / arquitetura
    if (lower.includes('expli') || lower.includes('debounce') || lower.includes('useeffect') || lower.includes('solid')) {
      const ext = getExtensionForLanguage(targetLang);
      const codeLang = getCodeHighlightLang(targetLang);
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        content: `Conceito e padrão recomendado em **${targetLang}**:\n- **Princípio**: Isolamento de efeitos colaterais e garantia de estado idempotente;\n- **Padrão**: Funções puras e tipagem defensiva.`,
        codeSnippet: {
          language: codeLang,
          filename: `exemplo${ext}`,
          code: targetLang.toLowerCase() === 'python'
            ? `def execute_with_safety(task_fn, fallback_value):\n    """Execução defensiva com tratamento de exceções em Python."""\n    try:\n        return task_fn()\n    except Exception as err:\n        print(f"[ZachAI Guard] Erro capturado: {err}")\n        return fallback_value\n`
            : targetLang.toLowerCase() === 'javascript'
            ? `export async function executeWithSafety(task, fallbackValue) {\n  try {\n    return await task();\n  } catch (error) {\n    console.warn('[ZachAI Safety Guard] Falha interceptada:', error);\n    return fallbackValue;\n  }\n}\n`
            : `export async function executeWithSafety<T>(task: () => Promise<T>, fallbackValue: T): Promise<T> {\n  try {\n    return await task();\n  } catch (error) {\n    console.warn('[ZachAI Safety Guard] Falha interceptada:', error);\n    return fallbackValue;\n  }\n}\n`,
        },
      };
    }

    // Category 3: Corrigir erros / TypeError / CORS / loops
    if (lower.includes('erro') || lower.includes('corrig') || lower.includes('cors') || lower.includes('undefined') || lower.includes('depur')) {
      const ext = getExtensionForLanguage(targetLang);
      const codeLang = getCodeHighlightLang(targetLang);
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        content: `Correção recomendada para **${targetLang}**:\n- Causa: referência nula ou validação pendente de payload;\n- Solução: barreira defensiva com fallback seguro.`,
        codeSnippet: {
          language: codeLang,
          filename: `safePatch${ext}`,
          code: targetLang.toLowerCase() === 'python'
            ? `def safe_transformer(data_list):\n    """Filtra valores nulos com segurança em Python."""\n    if not isinstance(data_list, list):\n        return []\n    return [item for item in data_list if item is not None]\n`
            : `export function safeDataTransformer<T>(inputData: T[] | null | undefined): T[] {\n  if (!Array.isArray(inputData) || inputData.length === 0) {\n    return [];\n  }\n  return inputData.filter(Boolean);\n}\n`,
        },
      };
    }

    // Default general technical response - respeita estritamente a linguagem targetLang
    const ext = getExtensionForLanguage(targetLang);
    const codeLang = getCodeHighlightLang(targetLang);
    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp,
      content: '',
      codeSnippet: attachedCode
        ? {
            language: codeLang,
            filename: `referencia${ext}`,
            code: attachedCode,
          }
        : {
            language: codeLang,
            filename: `solucao${ext}`,
            code: `// Código limpo e funcional em ${targetLang} gerado pelo ZachAI\n// Solicitação: ${userPrompt}\n`,
          },
    };
  };

  const handleSendMessage = async (
    content: string,
    codeSnippet?: string,
    imageAttachment?: { dataUrl: string; name?: string; mimeType?: string },
    mode: ExecutionMode = 'direct'
  ) => {
    if (!content.trim() && !imageAttachment) return;

    // Check credits economy (10 credits per creation/generation, 0 for Supreme Owner)
    const consumption = authService.consumeCredits(10);
    if (!consumption.success) {
      setErrorMessage(consumption.message || 'Créditos insuficientes! Recarregue seus créditos para continuar.');
      setSelectedPlanIdForCheckout('monthly');
      setIsCheckoutModalOpen(true);
      return;
    }

    if (consumption.exempt || authService.getCurrentUser().isSupremeOwner) {
      setCreditNotice('⚡ Dono Supremo: Acesso Total Gratuito (0 créditos consumidos)');
      setTimeout(() => setCreditNotice(null), 3500);
    } else {
      setCreditNotice('-10 créditos consumidos');
      setTimeout(() => setCreditNotice(null), 3000);
    }

    setErrorMessage(null);
    setLastSubmittedPrompt({ text: content, code: codeSnippet });
    setLastSubmittedImage(imageAttachment || null);

    // 1. Detecção e respeito rigoroso à linguagem solicitada (prevalece imediatamente sobre qualquer padrão)
    const detectedLang = detectLanguageFromPrompt(content, selectedLanguage);
    const effectiveLanguage = detectedLang.detected ? detectedLang.name : selectedLanguage;
    if (detectedLang.detected && detectedLang.name !== selectedLanguage) {
      setSelectedLanguage(detectedLang.name);
    }

    // 2. Roteamento Inteligente de Modo (Modo Código Direto vs. Modo Planejamento)
    // O Modo Código Direto é o padrão para solicitações de geração, criação ou trechos de código simples.
    // O Modo Planejamento só é acionado se explicitamente solicitado ou tarefa comprovadamente complexa.
    const effectiveMode: ExecutionMode = resolveExecutionMode(content, mode);

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      content: content || 'Análise de captura de tela / print solicitado ao Alex.',
      imageAttachment,
      codeSnippet: codeSnippet
        ? {
            language: effectiveLanguage.toLowerCase(),
            code: codeSnippet,
            filename: `anexo-codigo.${effectiveLanguage.toLowerCase() === 'python' ? 'py' : effectiveLanguage.toLowerCase() === 'html' ? 'html' : 'ts'}`,
          }
        : undefined,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    // Update active session with user message
    const updatedMessages = [...activeSession.messages, userMessage];
    const updatedSessions = sessions.map((s) =>
      s.id === activeSession.id
        ? {
            ...s,
            messages: updatedMessages,
            lastUpdated: 'Agora',
            preview: content ? content.slice(0, 60) : 'Print de código anexado',
          }
        : s
    );
    setSessions(updatedSessions);
    setIsLoading(true);
    setIsImageAnalyzing(Boolean(imageAttachment));

    try {
      const memoryContext = projectMemoryService.getMemoryPromptContext();
      const response = await sendChatMessage({
        message: content || 'Analise visualmente o código ou erro no print anexado e forneça solução.',
        language: effectiveLanguage,
        codeSnippet,
        imageBase64: imageAttachment?.dataUrl,
        mimeType: imageAttachment?.mimeType,
        mode: effectiveMode,
        projectMemoryContext: memoryContext,
      });

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        content: response.content,
        codeSnippet: response.codeSnippet,
        plan: response.plan,
      };

      // Record modified files into project memory
      if (response.codeSnippet?.filename) {
        projectMemoryService.recordFileModified(
          response.codeSnippet.filename,
          `Gerado pelo Alex (${effectiveLanguage})`
        );
      }

      setSessions((prevSessions) =>
        prevSessions.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                messages: [...s.messages, assistantMessage],
                lastUpdated: 'Agora',
              }
            : s
        )
      );
    } catch (err: any) {
      console.error('[Chat API Error]', err);
      // Fallback gracefully so the experience is never broken
      const fallbackAssistantMessage = generateStructuredAssistantReply(
        content,
        codeSnippet,
        effectiveMode,
        effectiveLanguage
      );
      setSessions((prevSessions) =>
        prevSessions.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                messages: [...s.messages, fallbackAssistantMessage],
                lastUpdated: 'Agora',
              }
            : s
        )
      );
    } finally {
      setIsLoading(false);
      setIsImageAnalyzing(false);
    }
  };

  const handleApprovePlanInChat = async (plan: ArchitecturePlan) => {
    // 1. Mark plan as approved in active session messages
    setSessions((prevSessions) =>
      prevSessions.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              messages: s.messages.map((m) =>
                m.plan?.id === plan.id ? { ...m, plan: { ...plan, status: 'approved' } } : m
              ),
            }
          : s
      )
    );

    // 2. Persist in projectMemoryService
    projectMemoryService.recordApprovedPlan(plan);

    // 3. Authorize Alex to generate actual code implementation
    await handleSendMessage(
      `Plano Aprovado: "${plan.title}"!\nPor favor, escreva a implementação do código estruturado seguindo as decisões e arquivos definidos no plano.`,
      undefined,
      undefined,
      'direct'
    );
  };

  const handleRetry = () => {
    if (lastSubmittedPrompt) {
      handleSendMessage(
        lastSubmittedPrompt.text,
        lastSubmittedPrompt.code,
        lastSubmittedImage || undefined
      );
    }
  };

  const handleStartNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'Nova Conversa Técnica',
      category: 'general',
      lastUpdated: 'Agora',
      preview: 'Sessão iniciada',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          content: 'Nova sessão iniciada com o ZachAI. O que vamos programar ou analisar hoje?',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSessionId);
    setCurrentTab('chat');
  };

  const handleClearActiveChat = () => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              messages: [
                {
                  id: `msg-${Date.now()}`,
                  sender: 'assistant',
                  content: 'Conversa limpa. Envie uma nova solicitação técnica quando quiser.',
                  timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            }
          : s
      )
    );
  };

  const handlePromptFromHome = (
    promptText: string,
    codeSnippet?: string,
    language?: string,
    imageAttachment?: { dataUrl: string; name?: string; mimeType?: string }
  ) => {
    // A linguagem mencionada explicitamente no prompt prevalece sobre a seleção padrão
    const detected = detectLanguageFromPrompt(promptText, language || selectedLanguage);
    const effectiveLang = detected.detected ? detected.name : (language || selectedLanguage);
    setSelectedLanguage(effectiveLang);
    setCurrentTab('chat');
    handleSendMessage(promptText, codeSnippet, imageAttachment, 'direct');
  };

  const handleOpenSessionFromHistory = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setCurrentTab('chat');
  };

  const handleDeleteSession = (sessionId: string) => {
    const filtered = sessions.filter((s) => s.id !== sessionId);
    if (filtered.length === 0) {
      // Re-create a fresh session if all deleted
      handleStartNewChat();
    } else {
      setSessions(filtered);
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
    }
  };

  const handleClearAllSessions = () => {
    const freshSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'Nova Conversa',
      category: 'general',
      lastUpdated: 'Agora',
      preview: 'Histórico resetado',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          content: 'Histórico resetado com sucesso. Como posso ajudar com seu código?',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    setSessions([freshSession]);
    setActiveSessionId(freshSession.id);
  };

  return (
    <div
      data-theme={settings.theme}
      data-rgb-border={settings.enableRgbBorder ? 'true' : 'false'}
      className={`flex min-h-screen bg-[#050813] text-slate-100 relative ${activeThemeConfig.selectionClass}`}
    >
      {/* Ambient Fluid LED / RGB Border Effect: Removido completamente do DOM quando desativado */}
      {settings.enableRgbBorder ? (
        <div
          key={`led-border-${settings.theme}`}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
        >
          {/* Trilho LED Superior */}
          <div
            className={`fixed inset-x-0 top-0 h-[2px] ${activeThemeConfig.ambientLedGradient.top} ${activeThemeConfig.ambientLedGradient.glowShadow} opacity-95 animate-pulse`}
          />
          {/* Trilho LED Inferior */}
          <div
            className={`fixed inset-x-0 bottom-0 h-[2px] ${activeThemeConfig.ambientLedGradient.bottom} ${activeThemeConfig.ambientLedGradient.glowShadow} opacity-95 animate-pulse`}
          />
          {/* Trilho LED Esquerdo */}
          <div
            className={`fixed inset-y-0 left-0 w-[2px] ${activeThemeConfig.ambientLedGradient.left} ${activeThemeConfig.ambientLedGradient.glowShadow} opacity-95 animate-pulse`}
          />
          {/* Trilho LED Direito */}
          <div
            className={`fixed inset-y-0 right-0 w-[2px] ${activeThemeConfig.ambientLedGradient.right} ${activeThemeConfig.ambientLedGradient.glowShadow} opacity-95 animate-pulse`}
          />

          {/* Plumas de Glow Perimetral Suaves */}
          <div
            className={`fixed inset-y-0 left-0 w-8 ${activeThemeConfig.ambientLedGradient.left} blur-md opacity-20`}
          />
          <div
            className={`fixed inset-y-0 right-0 w-8 ${activeThemeConfig.ambientLedGradient.right} blur-md opacity-20`}
          />
          <div
            className={`fixed inset-x-0 top-0 h-8 ${activeThemeConfig.ambientLedGradient.top} blur-md opacity-20`}
          />
          <div
            className={`fixed inset-x-0 bottom-0 h-8 ${activeThemeConfig.ambientLedGradient.bottom} blur-md opacity-20`}
          />
        </div>
      ) : null}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenCheckoutModal={() => setIsCheckoutModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onNewChat={handleStartNewChat}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onNavigate={(tab) => setCurrentTab(tab)}
          selectedLanguageName={selectedLanguage}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenCheckoutModal={() => setIsCheckoutModalOpen(true)}
        />

        {creditNotice && (
          <div className="sticky top-14 z-20 flex items-center justify-between bg-gradient-to-r from-cyan-950 via-[#0d1a36] to-blue-950 px-4 py-1.5 text-xs text-cyan-200 border-b border-cyan-500/30">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{creditNotice}</span>
            </span>
            <button
              onClick={() => setIsCheckoutModalOpen(true)}
              className="font-bold underline text-cyan-300 hover:text-white"
            >
              Ver Planos
            </button>
          </div>
        )}

        {/* Phase 1 Integration Info Banner */}
        {currentTab !== 'chat' && <IntegrationBanner onOpenSettings={() => setCurrentTab('settings')} />}

        {/* Dynamic Views */}
        <main className={`flex-1 ${currentTab === 'chat' ? 'overflow-hidden flex flex-col min-h-0' : 'overflow-y-auto'}`}>
          {currentTab === 'home' && (
            <HomeView
              onSubmitPrompt={handlePromptFromHome}
              onNavigate={(tab) => setCurrentTab(tab)}
              selectedLanguageName={selectedLanguage}
              onSelectLanguage={(lang) => setSelectedLanguage(lang)}
            />
          )}

          {currentTab === 'agent' && (
            <AgentModeView
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenInStudio={(files) => {
                setStudioInitialFiles(
                  files.map((f, i) => ({
                    id: `agent-file-${i}`,
                    name: f.name,
                    language: f.language,
                    content: f.content,
                  }))
                );
                if (files.length > 0) {
                  setStudioInitialCode(files[0].content);
                  setStudioInitialFilename(files[0].name);
                }
                setCurrentTab('studio');
              }}
              onOpenInPlayground={(html, css, js) => {
                setCurrentTab('playground');
              }}
            />
          )}

          {currentTab === 'chat' && (
            <ChatView
              messages={activeSession.messages}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearActiveChat}
              isLoading={isLoading}
              isImageAnalyzing={isImageAnalyzing}
              errorMessage={errorMessage}
              onRetry={handleRetry}
              selectedLanguageName={selectedLanguage}
              onNavigateToLanguages={() => setCurrentTab('languages')}
              onApprovePlanInChat={handleApprovePlanInChat}
              onOpenInStudio={(files) => {
                setStudioInitialFiles(
                  files.map((f, i) => ({
                    id: `chat-agent-file-${i}`,
                    name: f.name,
                    language: f.language,
                    content: f.content,
                  }))
                );
                if (files.length > 0) {
                  setStudioInitialCode(files[0].content);
                  setStudioInitialFilename(files[0].name);
                }
                setCurrentTab('studio');
              }}
              onOpenInPlayground={(html, css, js) => {
                setCurrentTab('playground');
              }}
            />
          )}

          {currentTab === 'playground' && (
            <WebPlaygroundView
              onOpenInAlex={(prompt, code) => {
                setCurrentTab('chat');
                handleSendMessage(prompt, code);
              }}
              onSendToStudio={(files) => {
                setStudioInitialFiles(
                  files.map((f, i) => ({
                    id: `pg-file-${i}`,
                    name: f.name,
                    language: f.language,
                    content: f.content,
                  }))
                );
                if (files.length > 0) {
                  setStudioInitialCode(files[0].content);
                  setStudioInitialFilename(files[0].name);
                }
                setCurrentTab('studio');
              }}
            />
          )}

          {currentTab === 'generator' && (
            <CodeGeneratorView
              onOpenProjectInStudio={(files) => {
                setStudioInitialFiles(files);
                if (files.length > 0) {
                  setStudioInitialCode(files[0].content);
                  setStudioInitialFilename(files[0].name);
                }
                setCurrentTab('studio');
              }}
              onOpenSingleFileInStudio={(code, filename) => {
                setStudioInitialCode(code);
                setStudioInitialFilename(filename);
                setStudioInitialFiles(undefined);
                setCurrentTab('studio');
              }}
              onOpenInChat={(prompt, code) => {
                setCurrentTab('chat');
                handleSendMessage(prompt, code);
              }}
            />
          )}

          {currentTab === 'studio' && (
            <CodeStudioView
              initialCode={studioInitialCode}
              initialFilename={studioInitialFilename}
              initialFiles={studioInitialFiles}
              onOpenChatWithPrompt={(prompt, code) => {
                setCurrentTab('chat');
                handleSendMessage(prompt, code);
              }}
            />
          )}

          {currentTab === 'practice' && (
            <PracticeView
              onOpenInAlex={(code, question) => {
                setCurrentTab('chat');
                handleSendMessage(question, code);
              }}
              onOpenInStudio={(code, filename) => {
                setStudioInitialCode(code);
                setStudioInitialFilename(filename);
                setCurrentTab('studio');
              }}
            />
          )}

          {currentTab === 'languages' && (
            <LanguagesView
              selectedLanguageName={selectedLanguage}
              onSelectLanguage={(lang) => setSelectedLanguage(lang)}
              onNavigateToChatWithLanguage={(lang) => {
                setSelectedLanguage(lang);
                setCurrentTab('chat');
                handleSendMessage(`Como estruturar boas práticas, testes e padrões idiomáticos em ${lang}?`);
              }}
              onNavigateToAnalyzeWithLanguage={(lang) => {
                setSelectedLanguage(lang);
                setCurrentTab('analyze');
              }}
              onSendToStudio={(code, filename) => {
                setStudioInitialCode(code);
                setStudioInitialFilename(filename);
                setCurrentTab('studio');
              }}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsView
              onSelectProjectPrompt={(prompt) => {
                setCurrentTab('chat');
                handleSendMessage(prompt);
              }}
              onOpenInStudio={(code, filename) => {
                setStudioInitialCode(code);
                setStudioInitialFilename(filename);
                setCurrentTab('studio');
              }}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              onNavigateToStudio={() => setCurrentTab('studio')}
              onNavigateToPractice={() => setCurrentTab('practice')}
              onNavigateToProjects={() => setCurrentTab('projects')}
            />
          )}

          {currentTab === 'refactor' && (
            <RefactorView
              selectedLanguageName={selectedLanguage}
              onSelectLanguage={(lang) => setSelectedLanguage(lang)}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenInStudio={(code, filename) => {
                setStudioInitialCode(code);
                setStudioInitialFilename(filename);
                setCurrentTab('studio');
              }}
              onOpenInPlayground={(html, css, js) => {
                setCurrentTab('playground');
              }}
            />
          )}

          {currentTab === 'converter' && (
            <CodeConverterView
              selectedLanguageName={selectedLanguage}
              onSelectLanguage={(lang) => setSelectedLanguage(lang)}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenInStudio={(code, filename) => {
                setStudioInitialCode(code);
                setStudioInitialFilename(filename);
                setCurrentTab('studio');
              }}
              onOpenInPlayground={(html, css, js) => {
                setCurrentTab('playground');
              }}
            />
          )}

          {currentTab === 'analyze' && (
            <CodeAnalyzerView
              selectedLanguageName={selectedLanguage}
              onSelectLanguage={(lang) => setSelectedLanguage(lang)}
            />
          )}

          {currentTab === 'fix-errors' && (
            <ErrorFixerView
              selectedLanguageName={selectedLanguage}
              onSelectLanguage={(lang) => setSelectedLanguage(lang)}
              onOpenInChat={(question) => {
                setCurrentTab('chat');
                handleSendMessage(question);
              }}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              sessions={sessions}
              onOpenSession={handleOpenSessionFromHistory}
              onDeleteSession={handleDeleteSession}
              onClearAllSessions={handleClearAllSessions}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={(newSettings) => {
                setSettings(newSettings);
                try {
                  localStorage.setItem('zach_app_settings_v3', JSON.stringify(newSettings));
                } catch {
                  // ignore
                }
              }}
            />
          )}

          {currentTab === 'admin' && (
            <AdminDashboardView
              onNavigateHome={() => setCurrentTab('home')}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Auth & Login / Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setIsAuthModalOpen(false);
          setCreditNotice(`Bem-vindo, ${user.name}! Bônus ativo.`);
          setTimeout(() => setCreditNotice(null), 3500);
          if (user.isSupremeOwner) {
            setCurrentTab('admin');
          }
        }}
      />

      {/* Subscription Plans & Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        selectedPlanId={selectedPlanIdForCheckout}
        onSuccess={(creditsAwarded) => {
          setIsCheckoutModalOpen(false);
          setCreditNotice(`+${creditsAwarded.toLocaleString('pt-BR')} créditos adicionados com sucesso!`);
          setTimeout(() => setCreditNotice(null), 4000);
        }}
      />

      {/* Real-time Visual Toast Pop-up for Asaas Webhook Payments */}
      <PaymentNotificationToast />
    </div>
  );
}
