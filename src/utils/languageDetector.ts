/**
 * languageDetector.ts
 * Utilitário inteligente para identificação de linguagem solicitada pelo usuário e classificação de complexidade de requisições.
 */

export interface DetectedLanguageInfo {
  detected: boolean;
  name: string;
  extension: string;
  codeHighlightLang: string;
}

const LANGUAGE_PATTERNS: Array<{
  name: string;
  pattern: RegExp;
  extension: string;
  codeHighlightLang: string;
}> = [
  {
    name: 'HTML',
    pattern: /\b(html5?|p[aá]gina html|c[oó]digo html|arquivo html|estrutura html|tag html|tabela html|formul[aá]rio html|bot[aã]o html)\b/i,
    extension: '.html',
    codeHighlightLang: 'html',
  },
  {
    name: 'CSS',
    pattern: /\b(css3?|estilo css|folha de estilo|regras css)\b/i,
    extension: '.css',
    codeHighlightLang: 'css',
  },
  {
    name: 'JavaScript',
    pattern: /\b(javascript|vanilla js|js puro|node\.?js)\b/i,
    extension: '.js',
    codeHighlightLang: 'javascript',
  },
  {
    name: 'TypeScript',
    pattern: /\b(typescript|ts|strict ts)\b/i,
    extension: '.ts',
    codeHighlightLang: 'typescript',
  },
  {
    name: 'Python',
    pattern: /\b(python3?|script python|c[oó]digo python|django|flask|fastapi)\b/i,
    extension: '.py',
    codeHighlightLang: 'python',
  },
  {
    name: 'SQL',
    pattern: /\b(sql|query sql|consulta sql|postgresql|postgres|mysql|sqlite)\b/i,
    extension: '.sql',
    codeHighlightLang: 'sql',
  },
  {
    name: 'PHP',
    pattern: /\b(php|script php|laravel)\b/i,
    extension: '.php',
    codeHighlightLang: 'php',
  },
  {
    name: 'Java',
    pattern: /\b(java(?!script)|spring boot|c[oó]digo java)\b/i,
    extension: '.java',
    codeHighlightLang: 'java',
  },
  {
    name: 'C#',
    pattern: /\b(c#|csharp|\.net|dotnet)\b/i,
    extension: '.cs',
    codeHighlightLang: 'csharp',
  },
  {
    name: 'C++',
    pattern: /\b(c\+\+|cpp)\b/i,
    extension: '.cpp',
    codeHighlightLang: 'cpp',
  },
  {
    name: 'C',
    pattern: /\b(linguagem c|c puro)\b/i,
    extension: '.c',
    codeHighlightLang: 'c',
  },
  {
    name: 'Go',
    pattern: /\b(golang|linguagem go|c[oó]digo go)\b/i,
    extension: '.go',
    codeHighlightLang: 'go',
  },
  {
    name: 'Rust',
    pattern: /\b(rust|c[oó]digo rust|cargo)\b/i,
    extension: '.rs',
    codeHighlightLang: 'rust',
  },
  {
    name: 'JSON',
    pattern: /\b(json|arquivo json|payload json)\b/i,
    extension: '.json',
    codeHighlightLang: 'json',
  },
  {
    name: 'Bash',
    pattern: /\b(bash|shell script|sh|zsh)\b/i,
    extension: '.sh',
    codeHighlightLang: 'bash',
  },
];

export function getExtensionForLanguage(langName: string): string {
  const norm = (langName || '').trim().toLowerCase();
  if (norm.includes('html')) return '.html';
  if (norm.includes('css')) return '.css';
  if (norm.includes('typescript')) return '.ts';
  if (norm.includes('javascript')) return '.js';
  if (norm.includes('python')) return '.py';
  if (norm.includes('sql')) return '.sql';
  if (norm.includes('php')) return '.php';
  if (norm.includes('java') && !norm.includes('script')) return '.java';
  if (norm.includes('c#') || norm.includes('csharp')) return '.cs';
  if (norm.includes('c++') || norm.includes('cpp')) return '.cpp';
  if (norm === 'c') return '.c';
  if (norm.includes('go')) return '.go';
  if (norm.includes('rust')) return '.rs';
  if (norm.includes('json')) return '.json';
  if (norm.includes('bash') || norm.includes('shell')) return '.sh';
  return '.ts';
}

export function getCodeHighlightLang(langName: string): string {
  const norm = (langName || '').trim().toLowerCase();
  if (norm.includes('html')) return 'html';
  if (norm.includes('css')) return 'css';
  if (norm.includes('typescript')) return 'typescript';
  if (norm.includes('javascript')) return 'javascript';
  if (norm.includes('python')) return 'python';
  if (norm.includes('sql')) return 'sql';
  if (norm.includes('php')) return 'php';
  if (norm.includes('java') && !norm.includes('script')) return 'java';
  if (norm.includes('c#') || norm.includes('csharp')) return 'csharp';
  if (norm.includes('c++') || norm.includes('cpp')) return 'cpp';
  if (norm === 'c') return 'c';
  if (norm.includes('go')) return 'go';
  if (norm.includes('rust')) return 'rust';
  if (norm.includes('json')) return 'json';
  if (norm.includes('bash') || norm.includes('shell')) return 'bash';
  return norm || 'typescript';
}

/**
 * Detecta a linguagem explícita mencionada pelo usuário no prompt,
 * preservando a linguagem fallback se nenhuma for citada.
 */
export function detectLanguageFromPrompt(
  prompt: string,
  fallbackLanguage: string = 'TypeScript'
): DetectedLanguageInfo {
  const cleanPrompt = (prompt || '').trim();

  for (const item of LANGUAGE_PATTERNS) {
    if (item.pattern.test(cleanPrompt)) {
      return {
        detected: true,
        name: item.name,
        extension: item.extension,
        codeHighlightLang: item.codeHighlightLang,
      };
    }
  }

  return {
    detected: false,
    name: fallbackLanguage,
    extension: getExtensionForLanguage(fallbackLanguage),
    codeHighlightLang: getCodeHighlightLang(fallbackLanguage),
  };
}

/**
 * Verifica se o prompt do usuário é uma solicitação simples e direta de código,
 * que NÃO requer planejamento arquitetural em fases.
 */
export function isSimpleCodeRequest(prompt: string): boolean {
  const lower = (prompt || '').toLowerCase().trim();

  // Expressões explícitas de simplicidade ou exemplos pontuais
  const simpleKeywords = [
    'simples',
    'básico',
    'basico',
    'botão',
    'botao',
    'hello world',
    'snippet',
    'exemplo',
    'função',
    'funcao',
    'script',
    'tag',
    'página simples',
    'pagina simples',
    'código simples',
    'codigo simples',
    'html simples',
    'apenas um',
    'somente um',
    'rápido',
    'rapido',
    'card simples',
    'formulário simples',
    'formulario simples',
    'tabela simples',
  ];

  for (const kw of simpleKeywords) {
    if (lower.includes(kw)) {
      return true;
    }
  }

  // Se o prompt é muito curto (< 100 caracteres) e pede criação direta
  if (lower.length < 100 && (lower.includes('crie') || lower.includes('faça') || lower.includes('gere') || lower.includes('escreva') || lower.includes('como fazer'))) {
    // E não menciona arquitetura ou sistemas complexos
    if (!isComplexArchitecturalRequest(prompt)) {
      return true;
    }
  }

  return false;
}

/**
 * Verifica se o prompt expressa uma solicitação genuinamente complexa
 * (que justifica a ativação do Modo de Planejamento Arquitetural).
 */
export function isComplexArchitecturalRequest(prompt: string): boolean {
  const lower = (prompt || '').toLowerCase().trim();

  const complexKeywords = [
    'arquitetura',
    'planeje',
    'planejar',
    'plano de desenvolvimento',
    'microsserviço',
    'microsservico',
    'sistema completo',
    'plataforma completa',
    'roadmap',
    'fase 1',
    'fases de desenvolvimento',
    'monorepo',
    'clean architecture',
    'diagrama de pastas',
    'modelagem de banco',
    'pipeline ci/cd',
    'saas completo',
  ];

  return complexKeywords.some((kw) => lower.includes(kw));
}
