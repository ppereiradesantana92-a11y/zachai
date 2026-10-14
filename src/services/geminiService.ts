import {
  AlexDiagnosisResult,
  CodeAnalysisResult,
  ExecutionMode,
  ArchitecturePlan,
  AgentExecutionPlan,
  RefactoringResult,
  CodeConversionRequest,
  CodeConversionResult,
} from '../types';

export interface DiagnoseRequest {
  errorMessage?: string;
  codeContext?: string;
  language?: string;
  imageBase64?: string;
  mimeType?: string;
}

export interface ChatApiRequest {
  message: string;
  language?: string;
  codeSnippet?: string;
  imageBase64?: string;
  mimeType?: string;
  mode?: ExecutionMode;
  projectMemoryContext?: string;
}

export interface ChatApiResponse {
  content: string;
  codeSnippet?: {
    language: string;
    code: string;
    filename?: string;
  };
  plan?: ArchitecturePlan;
  agentPlan?: AgentExecutionPlan;
}

export interface CodeAnalysisRequest {
  code?: string;
  language?: string;
  analysisMode?: 'all' | 'security' | 'performance' | 'cleanCode';
  imageBase64?: string;
  mimeType?: string;
}

/**
 * Sends a multimodal error diagnostic request to Alex via the backend server proxy.
 */
export async function diagnoseErrorWithAlex(
  params: DiagnoseRequest
): Promise<AlexDiagnosisResult> {
  const response = await fetch('/api/alex/diagnose', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Erro ${response.status}: Falha ao contatar Alex via servidor.`
    );
  }

  const data = await response.json();
  return data as AlexDiagnosisResult;
}

/**
 * Sends a chat or code generation request (including image uploads) to ZachAI.
 */
export async function sendChatMessage(
  params: ChatApiRequest
): Promise<ChatApiResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Erro ${response.status}: Falha na comunicação com o assistente.`
    );
  }

  const data = await response.json();
  return data as ChatApiResponse;
}

/**
 * Sends a multimodal code and architecture audit request to Alex via the backend server proxy.
 */
export async function analyzeCodeWithAlex(
  params: CodeAnalysisRequest
): Promise<CodeAnalysisResult> {
  const response = await fetch('/api/alex/analyze-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Erro ${response.status}: Falha ao analisar código com Alex.`
    );
  }

  const data = await response.json();
  return data as CodeAnalysisResult;
}

export interface GenerateProjectParams {
  prompt: string;
  framework?: string;
  architecture?: string;
  includeBackend?: boolean;
  fileSeparation?: string;
  mode?: 'direct' | 'planning';
}

/**
 * Generates an Architectural Plan (Scope, File Hierarchy, Roadmap) before coding.
 */
export async function planArchitectureProject(
  prompt: string,
  framework = 'React 19 + Tailwind CSS + TypeScript'
): Promise<import('../types').ArchitecturePlan> {
  const response = await fetch('/api/plan-architecture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, framework }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Erro ${response.status}: Falha ao gerar plano de arquitetura.`
    );
  }

  const data = await response.json();
  return data as import('../types').ArchitecturePlan;
}

/**
 * Sends a structured multi-file project generation request to ZachAI Code Engine.
 */
export async function generateFullProject(
  params: GenerateProjectParams
): Promise<import('../types').GeneratedProjectStructure> {
  const response = await fetch('/api/generate-project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Erro ${response.status}: Falha ao gerar arquivos do projeto.`
    );
  }

  const data = await response.json();
  return data as import('../types').GeneratedProjectStructure;
}

export interface RefactorRequest {
  code: string;
  language?: string;
  focus?: 'all' | 'cleanCode' | 'performance' | 'solid';
}

/**
 * Sends code to Alex for Intelligent Refactoring with strict behavior preservation.
 */
export async function refactorCodeWithAlex(
  params: RefactorRequest
): Promise<RefactoringResult> {
  const response = await fetch('/api/alex/refactor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Erro ${response.status}: Falha ao processar refatoração com o Alex.`
    );
  }

  const data = await response.json();
  return data as RefactoringResult;
}

/**
 * Sends code to Alex for automatic language conversion (e.g. Python -> TypeScript or Java).
 */
export async function convertCodeWithAlex(
  params: CodeConversionRequest
): Promise<CodeConversionResult> {
  const response = await fetch('/api/code/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Erro ${response.status}: Falha ao traduzir código entre linguagens.`
    );
  }

  const data = await response.json();
  return data as CodeConversionResult;
}

