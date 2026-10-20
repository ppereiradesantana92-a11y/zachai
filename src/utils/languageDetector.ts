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
    pattern: /\b(html5?|p[aá]gina html|c[oó]digo html|arquivo html|estrutura html|tag html|tabela html|formul[aá]rio html|bot[aã]o html|markup html|web vanilla)\b/i,
    extension: '.html',
    codeHighlightLang: 'html',
  },
  {
    name: 'CSS',
    pattern: /\b(css3?|estilo css|folha de estilo|regras css|estilos css|estiliza[cç][aã]o css)\b/i,
    extension: '.css',
    codeHighlightLang: 'css',
  },
  {
    name: 'JavaScript',
    pattern: /\b(javascript|vanilla js|js puro|node\.?js|\bjs\b)\b/i,
    extension: '.js',
    codeHighlightLang: 'javascript',
  },
  {
    name: 'TypeScript',
    pattern: /\b(typescript|strict ts|\bts\b)\b/i,
    extension: '.ts',
    codeHighlightLang: 'typescript',
  },
  {
    name: 'Python',
    pattern: /\b(python3?|script python|c[oó]digo python|\bpy\b|django|flask|fastapi)\b/i,
    extension: '.py',
    codeHighlightLang: 'python',
  },
  {
    name: 'SQL',
    pattern: /\b(sql|query sql|consulta sql|postgresql|postgres|mysql|sqlite|tabela sql)\b/i,
    extension: '.sql',
    codeHighlightLang: 'sql',
  },
  {
    name: 'JSON',
    pattern: /\b(json|arquivo json|payload json|objeto json)\b/i,
    extension: '.json',
    codeHighlightLang: 'json',
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
    pattern: /\b(linguagem c\b|c puro)\b/i,
    extension: '.c',
    codeHighlightLang: 'c',
  },
  {
    name: 'Go',
    pattern: /\b(golang|linguagem go|c[oó]digo go|\bgo\b)\b/i,
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
    name: 'Ruby',
    pattern: /\b(ruby|ruby on rails|\brails\b)\b/i,
    extension: '.rb',
    codeHighlightLang: 'ruby',
  },
  {
    name: 'Kotlin',
    pattern: /\b(kotlin)\b/i,
    extension: '.kt',
    codeHighlightLang: 'kotlin',
  },
  {
    name: 'Swift',
    pattern: /\b(swift)\b/i,
    extension: '.swift',
    codeHighlightLang: 'swift',
  },
  {
    name: 'Dart',
    pattern: /\b(dart|flutter)\b/i,
    extension: '.dart',
    codeHighlightLang: 'dart',
  },
  {
    name: 'Bash',
    pattern: /\b(bash|shell script|\bsh\b|\bzsh\b)\b/i,
    extension: '.sh',
    codeHighlightLang: 'bash',
  },
  {
    name: 'YAML',
    pattern: /\b(yaml|yml)\b/i,
    extension: '.yaml',
    codeHighlightLang: 'yaml',
  },
  {
    name: 'XML',
    pattern: /\b(xml)\b/i,
    extension: '.xml',
    codeHighlightLang: 'xml',
  },
  {
    name: 'Markdown',
    pattern: /\b(markdown|\bmd\b)\b/i,
    extension: '.md',
    codeHighlightLang: 'markdown',
  },
];

export function getExtensionForLanguage(langName: string): string {
  const norm = (langName || '').trim().toLowerCase();
  if (norm.includes('html')) return '.html';
  if (norm.includes('css')) return '.css';
  if (norm.includes('typescript') || norm === 'ts') return '.ts';
  if (norm.includes('javascript') || norm === 'js') return '.js';
  if (norm.includes('python') || norm === 'py') return '.py';
  if (norm.includes('sql')) return '.sql';
  if (norm.includes('json')) return '.json';
  if (norm.includes('php')) return '.php';
  if (norm.includes('java') && !norm.includes('script')) return '.java';
  if (norm.includes('c#') || norm.includes('csharp')) return '.cs';
  if (norm.includes('c++') || norm.includes('cpp')) return '.cpp';
  if (norm === 'c') return '.c';
  if (norm.includes('go')) return '.go';
  if (norm.includes('rust')) return '.rs';
  if (norm.includes('ruby')) return '.rb';
  if (norm.includes('kotlin')) return '.kt';
  if (norm.includes('swift')) return '.swift';
  if (norm.includes('dart')) return '.dart';
  if (norm.includes('bash') || norm.includes('shell') || norm === 'sh') return '.sh';
  if (norm.includes('yaml') || norm.includes('yml')) return '.yaml';
  if (norm.includes('xml')) return '.xml';
  if (norm.includes('markdown') || norm === 'md') return '.md';
  return '.ts';
}

export function getCodeHighlightLang(langName: string): string {
  const norm = (langName || '').trim().toLowerCase();
  if (norm.includes('html')) return 'html';
  if (norm.includes('css')) return 'css';
  if (norm.includes('typescript') || norm === 'ts') return 'typescript';
  if (norm.includes('javascript') || norm === 'js') return 'javascript';
  if (norm.includes('python') || norm === 'py') return 'python';
  if (norm.includes('sql')) return 'sql';
  if (norm.includes('json')) return 'json';
  if (norm.includes('php')) return 'php';
  if (norm.includes('java') && !norm.includes('script')) return 'java';
  if (norm.includes('c#') || norm.includes('csharp')) return 'csharp';
  if (norm.includes('c++') || norm.includes('cpp')) return 'cpp';
  if (norm === 'c') return 'c';
  if (norm.includes('go')) return 'go';
  if (norm.includes('rust')) return 'rust';
  if (norm.includes('ruby')) return 'ruby';
  if (norm.includes('kotlin')) return 'kotlin';
  if (norm.includes('swift')) return 'swift';
  if (norm.includes('dart')) return 'dart';
  if (norm.includes('bash') || norm.includes('shell') || norm === 'sh') return 'bash';
  if (norm.includes('yaml') || norm.includes('yml')) return 'yaml';
  if (norm.includes('xml')) return 'xml';
  if (norm.includes('markdown') || norm === 'md') return 'markdown';
  return norm || 'typescript';
}

/**
 * Detecta a linguagem explícita mencionada pelo usuário no prompt.
 * Se o usuário mencionar qualquer linguagem ou formato (HTML, CSS, Python, JS, SQL, JSON, etc.),
 * essa linguagem prevalece imediatamente sobre a configuração padrão (incluindo TypeScript).
 */
export function detectLanguageFromPrompt(
  prompt: string,
  fallbackLanguage: string = 'TypeScript'
): DetectedLanguageInfo {
  const cleanPrompt = (prompt || '').trim();

  // Test explicit patterns
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
 * Verifica se o usuário pediu explicitamente um plano prévio, etapas arquiteturais ou roteiro.
 */
export function isExplicitPlanRequest(prompt: string): boolean {
  const lower = (prompt || '').toLowerCase().trim();
  if (!lower) return false;

  return /\b(planeje|planejar|planejamento|fazer um plano|fa[cç]a um plano|crie um plano|plano de desenvolvimento|plano arquitetural|roteiro pr[eé]vio|etapas pr[eé]vias|fases antes de codificar)\b/i.test(lower);
}

/**
 * Verifica se a tarefa é comprovadamente complexa (arquitetura de sistemas inteiros, microsserviços, etc.).
 */
export function isComplexArchitecturalRequest(prompt: string): boolean {
  const lower = (prompt || '').toLowerCase().trim();
  if (!lower) return false;

  // Se o usuário pediu explicitamente algo simples, nunca é complexo
  if (/\b(simples|b[aá]sico|basico|snippet|exemplo|hello world|bot[aã]o|card simples|p[aá]gina simples)\b/i.test(lower)) {
    return false;
  }

  const complexKeywords = [
    'arquitetura de microsservi',
    'sistema completo de grande porte',
    'plataforma completa de grande porte',
    'monorepo corporativo',
    'diagrama de pastas arquitetural',
    'modelagem de banco de dados relacional complexo',
    'pipeline ci/cd',
    'refatora[cç][aã]o de m[uú]ltiplos arquivos',
    'arquitetura de sistemas inteiros',
  ];

  return complexKeywords.some((kw) => new RegExp(kw, 'i').test(lower));
}

/**
 * Verifica se o prompt do usuário é uma solicitação simples e direta de código,
 * que deve gerar e entregar o código funcional imediatamente no primeiro turno.
 */
export function isSimpleCodeRequest(prompt: string): boolean {
  const lower = (prompt || '').toLowerCase().trim();
  if (!lower) return true;

  // Se for explicitamente um pedido de plano ou arquitetura de sistema inteiro, não é simples
  if (isExplicitPlanRequest(prompt) || isComplexArchitecturalRequest(prompt)) {
    return false;
  }

  // Palavras-chave explícitas de código simples ou geração direta de snippet
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
    'código html',
    'codigo html',
    'página html',
    'pagina html',
    'crie um html',
    'faça um html',
    'gere um html',
    'código em html',
    'codigo em html',
  ];

  if (simpleKeywords.some((kw) => lower.includes(kw))) {
    return true;
  }

  // Se pede criação ou geração direta sem requisição explícita de planejamento
  if (
    lower.includes('crie') ||
    lower.includes('faça') ||
    lower.includes('faca') ||
    lower.includes('gere') ||
    lower.includes('escreva') ||
    lower.includes('como fazer') ||
    lower.includes('código') ||
    lower.includes('codigo') ||
    lower.includes('exemplo')
  ) {
    return true;
  }

  return true;
}

/**
 * Roteamento Inteligente de Modo:
 * Retorna 'direct' (Modo Código Direto) como padrão para solicitações de código.
 * O Modo Planejamento deve ser acionado APENAS se:
 *  a) O usuário pedir explicitamente um plano, arquitetura ou etapa prévia; OU
 *  b) A tarefa for comprovadamente complexa (arquitetura de sistemas inteiros, refatoração de múltiplos arquivos).
 * Em solicitações simples, o código limpo e funcional na linguagem pedida é gerado diretamente.
 */
export function resolveExecutionMode(
  prompt: string,
  requestedMode: 'direct' | 'planning' | 'agent' = 'direct'
): 'direct' | 'planning' | 'agent' {
  const isSimple = isSimpleCodeRequest(prompt);
  const isComplex = isComplexArchitecturalRequest(prompt);
  const isExplicitPlan = isExplicitPlanRequest(prompt);

  // Se o usuário pediu código simples/direto, NUNCA aciona planejamento
  if (isSimple && !isExplicitPlan) {
    return 'direct';
  }

  // Aciona planejamento apenas se explicitamente pedido ou tarefa comprovadamente complexa
  if (isExplicitPlan || isComplex) {
    return 'planning';
  }

  // Se o usuário selecionou modo agente explicitamente
  if (requestedMode === 'agent') {
    return 'agent';
  }

  // Se o usuário selecionou planejamento na UI e a tarefa NÃO for simples
  if (requestedMode === 'planning' && !isSimple) {
    return 'planning';
  }

  // Padrão absoluto: Modo Código Direto
  return 'direct';
}
