import { ProjectTemplate, ChatSession } from '../types';

export const SUGGESTIONS = {
  createSites: [
    {
      id: 'site-1',
      title: 'Landing Page de Alta Conversão',
      desc: 'Construir página moderna em React com Tailwind CSS, tema escuro e animações suaves.',
      prompt: 'Crie uma landing page responsiva em React e Tailwind CSS para uma plataforma SaaS de automação de testes com modo escuro, cards de benefícios e seção hero moderna.',
      tag: 'React + Tailwind',
    },
    {
      id: 'site-2',
      title: 'API REST em Node.js & TypeScript',
      desc: 'Estruturar arquitetura limpa com Express, validação Zod e tratamento centralizado de erros.',
      prompt: 'Crie a estrutura de uma API REST com Express e TypeScript contendo controllers, middlewares de validação Zod e tratamento de exceções assíncronas.',
      tag: 'Node + Express',
    },
    {
      id: 'site-3',
      title: 'Dashboard Analítico Responsivo',
      desc: 'Interface com métricas, gráficos interativos e tabela de transações filtrável.',
      prompt: 'Desenvolva um componente de dashboard analítico em React com cards de métricas (KPIs), gráfico em SVG limpo e tabela paginada com busca em tempo real.',
      tag: 'Dashboard SaaS',
    },
  ],
  explainCode: [
    {
      id: 'exp-1',
      title: 'Debounce vs Throttle no JavaScript',
      desc: 'Compreender a diferença prática de temporização e evitar chamadas excessivas em inputs e scroll.',
      prompt: 'Explique a diferença entre debounce e throttle no JavaScript com exemplos práticos de implementação e casos de uso no React.',
      tag: 'JavaScript Moderno',
    },
    {
      id: 'exp-2',
      title: 'Ciclo de Vida do useEffect & Hooks',
      desc: 'Entender array de dependências, funções de cleanup e como evitar re-renderizações infinitas.',
      prompt: 'Explique detalhadamente como o hook useEffect gerencia dependências e closures antigas no React 19, e como usar o cleanup para evitar vazamentos.',
      tag: 'React Hooks',
    },
    {
      id: 'exp-3',
      title: 'Inversão de Controle & SOLID',
      desc: 'Princípios de arquitetura de software aplicados a código TypeScript modular e testável.',
      prompt: 'Explique o princípio de Inversão de Dependência (D do SOLID) em TypeScript demonstrando a transição de acoplamento rígido para injeção via interface.',
      tag: 'Engenharia de Software',
    },
  ],
  fixErrors: [
    {
      id: 'fix-1',
      title: 'Cannot read properties of undefined (reading map)',
      desc: 'Resolver falhas clássicas de renderização condicional em dados assíncronos ou listas vazias.',
      prompt: 'Estou recebendo o erro "TypeError: Cannot read properties of undefined (reading \'map\')". Como tratar estados de carregamento e valores nulos de forma segura?',
      tag: 'TypeError',
    },
    {
      id: 'fix-2',
      title: 'Bloqueio de CORS na Requisição Fetch',
      desc: 'Configurar cabeçalhos Access-Control-Allow-Origin e resolver pré-flight OPTIONS no backend.',
      prompt: 'Minha requisição no navegador falha com "CORS header \'Access-Control-Allow-Origin\' missing". Como resolver isso de forma segura no servidor Express?',
      tag: 'Rede & APIs',
    },
    {
      id: 'fix-3',
      title: 'Maximum update depth exceeded no React',
      desc: 'Identificar loops infinitos causados por chamadas de setState dentro do corpo do componente.',
      prompt: 'Como solucionar o erro "Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside useEffect"?',
      tag: 'React Re-render',
    },
  ],
};

export const INITIAL_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'session-welcome',
    title: 'Guia de Inicialização do ZachAI',
    category: 'general',
    lastUpdated: 'Hoje, 09:30',
    preview: 'Bem-vindo ao ZachAI! Veja como posso ajudar no seu fluxo de desenvolvimento.',
    messages: [
      {
        id: 'msg-1',
        sender: 'assistant',
        content: `Olá! Sou o **ZachAI**, seu assistente de programação futurista focado em alta produtividade, código limpo e arquitetura de software.\n\nVocê pode me pedir para:\n* **Criar sites e aplicações completas** com React, Tailwind, Next.js e TypeScript;\n* **Explicar trechos de código complexos** e padrões de engenharia;\n* **Diagnosticar e corrigir erros** com análise de causa raiz e diffs imediatos.\n\n*Nota sobre a Fase 1: As ferramentas estruturadas de análise de código e correção de erros estão ativas. A integração direta com o modelo de linguagem no servidor será conectada na próxima etapa.*`,
        timestamp: '09:30',
      },
    ],
  },
  {
    id: 'session-react-debounce',
    title: 'Exemplo: Hook useDebounce em TypeScript',
    category: 'explanation',
    lastUpdated: 'Hoje, 08:45',
    preview: 'Implementação de custom hook para busca em tempo real com TypeScript.',
    messages: [
      {
        id: 'msg-2-1',
        sender: 'user',
        content: 'Como criar um hook personalizado useDebounce em React com TypeScript para otimizar um input de pesquisa?',
        timestamp: '08:43',
      },
      {
        id: 'msg-2-2',
        sender: 'assistant',
        content: `Aqui está uma implementação limpa e reutilizável do hook \`useDebounce\`. Ela aceita qualquer tipo de valor e adia a atualização até que o tempo estipulado transcorra sem novas alterações.`,
        codeSnippet: {
          language: 'typescript',
          filename: 'src/hooks/useDebounce.ts',
          code: `import { useState, useEffect } from 'react';

/**
 * Hook para atrasar atualizações de valores (debounce).
 * @param value Valor a ser monitorado
 * @param delay Tempo em milissegundos (padrão: 300ms)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Agenda a atualização do valor
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o timer se o valor mudar antes do prazo
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}`,
        },
        timestamp: '08:45',
      },
    ],
  },
];

export const INITIAL_PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'proj-saas-core',
    title: 'SaaS Dashboard Core',
    description: 'Arquitetura modular para painel administrativo com dark mode, barra lateral colapsável, métricas e tabela paginada.',
    category: 'frontend',
    stack: ['React 19', 'Tailwind CSS', 'TypeScript', 'Lucide Icons'],
    stars: 342,
    structure: [
      'src/components/layout/Sidebar.tsx',
      'src/components/layout/Header.tsx',
      'src/components/dashboard/MetricCard.tsx',
      'src/components/dashboard/DataTable.tsx',
      'src/hooks/useMetrics.ts',
    ],
    samplePrompt: 'Gere a estrutura de um dashboard SaaS com métricas de desempenho em React e Tailwind.',
  },
  {
    id: 'proj-rest-express',
    title: 'API REST Segura com Node.js',
    description: 'Servidor Express configurado com TypeScript, CORS estrito, validação de schema Zod, JWT e logging estruturado.',
    category: 'backend',
    stack: ['Node.js', 'Express', 'TypeScript', 'Zod', 'JWT'],
    stars: 289,
    structure: [
      'src/server.ts',
      'src/routes/auth.routes.ts',
      'src/controllers/user.controller.ts',
      'src/middlewares/auth.middleware.ts',
      'src/middlewares/errorHandler.ts',
    ],
    samplePrompt: 'Estruture uma API REST com Express e TypeScript pronta para produção.',
  },
  {
    id: 'proj-fullstack-starter',
    title: 'Fullstack Applet Architecture',
    description: 'Aplicação monorepo simplificada com frontend Vite/React e proxy backend seguro Express para consumo de IA sem expor chaves.',
    category: 'fullstack',
    stack: ['Vite', 'React', 'Express', 'Server Proxy', 'Tailwind'],
    stars: 512,
    structure: [
      'server.ts',
      'src/App.tsx',
      'src/services/aiProxy.ts',
      'src/components/CodeViewer.tsx',
      '.env.example',
    ],
    samplePrompt: 'Como configurar uma arquitetura segura com Vite e Express para chamadas de IA?',
  },
  {
    id: 'proj-micro-services',
    title: 'Serviço de Processamento em Python',
    description: 'Microserviço FastAPI com tipos Pydantic, documentação Swagger automática e processamento assíncrono de tarefas.',
    category: 'backend',
    stack: ['Python 3.11', 'FastAPI', 'Pydantic', 'Uvicorn'],
    stars: 198,
    structure: [
      'app/main.py',
      'app/api/endpoints.py',
      'app/schemas/payload.py',
      'app/services/processor.py',
      'requirements.txt',
    ],
    samplePrompt: 'Crie um microserviço em FastAPI para validação e transformação de JSON.',
  },
];

export const COMMON_ERROR_PRESETS = [
  {
    name: 'TypeError: Cannot read properties of undefined (map)',
    error: `TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (src/components/UserList.tsx:14:22)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:16305:18)`,
    code: `export function UserList({ data }: { data?: { items: string[] } }) {
  // Erro ocorre aqui quando data ou items ainda estão indefinidos
  return (
    <ul>
      {data.items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  );
}`,
    language: 'typescript',
  },
  {
    name: 'CORS policy: No Access-Control-Allow-Origin header',
    error: `Access to fetch at 'https://api.empresa.com/v1/auth' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.`,
    code: `// Código do cliente fazendo requisição
fetch('https://api.empresa.com/v1/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({ action: 'verify' })
})
.then(res => res.json())
.catch(err => console.error(err));`,
    language: 'javascript',
  },
  {
    name: 'React: Maximum update depth exceeded',
    error: `Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
    at checkForNestedUpdates (react-dom.development.js:27374)`,
    code: `import { useState, useEffect } from 'react';

export function CounterComponent() {
  const [count, setCount] = useState(0);

  // Problema: atualiza o estado sem array de dependências
  useEffect(() => {
    setCount(count + 1);
  });

  return <div>Contagem: {count}</div>;
}`,
    language: 'typescript',
  },
];
