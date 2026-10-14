export type PracticeDifficulty = 'iniciante' | 'intermediario' | 'avancado';
export type ChallengeType = 'quiz' | 'code-challenge' | 'bug-hunt';

export interface PracticeChallenge {
  id: string;
  title: string;
  type: ChallengeType;
  difficulty: PracticeDifficulty;
  language: string;
  category: 'Lógica Básica' | 'Estruturas de Dados' | 'Frontend Web' | 'Backend & APIs' | 'Algoritmos' | 'Segurança';
  description: string;
  instructions: string;
  codeSnippet?: string;
  initialCode?: string;
  expectedOutputSnippet?: string;
  testCases?: Array<{
    input: string;
    expected: string;
    description: string;
  }>;
  options?: string[];
  correctAnswerIndex?: number;
  explanation: string;
  points: number;
  hints: string[];
}

export const PRACTICE_CHALLENGES: PracticeChallenge[] = [
  // --- INICIANTE (Lógica, Sintaxe e Conceitos Fundamentais) ---
  {
    id: 'beg-1',
    title: 'Variáveis e Mutabilidade com const vs let',
    type: 'quiz',
    difficulty: 'iniciante',
    language: 'JavaScript / TypeScript',
    category: 'Lógica Básica',
    description: 'Entenda como o JavaScript moderno controla a reatribuição de variáveis.',
    instructions: 'Analise o trecho de código abaixo e identifique o que acontecerá ao executar a linha 3:',
    codeSnippet: `const totalPontos = 100;
let bonus = 20;
totalPontos = totalPontos + bonus;
console.log(totalPontos);`,
    options: [
      'Lança TypeError: Assignment to constant variable',
      'Exibe 120 normalmente no console',
      'A variável se torna undefined silenciosamente',
      'Cria automaticamente uma nova variável global chamada totalPontos',
    ],
    correctAnswerIndex: 0,
    explanation: 'Variáveis declaradas com `const` criam uma ligação imutável na atribuição. Tentar reatribuir `totalPontos` lança um TypeError em tempo de execução.',
    points: 100,
    hints: ['Lembre-se da regra de ouro do ES6: use const por padrão e let apenas quando o valor for reatribuído.'],
  },
  {
    id: 'beg-2',
    title: 'Condicionais e Valores Falsy',
    type: 'quiz',
    difficulty: 'iniciante',
    language: 'JavaScript',
    category: 'Lógica Básica',
    description: 'Identifique quais valores são considerados falsy em estruturas condicionais.',
    instructions: 'Qual dos seguintes valores é avaliado como VERDADEIRO (truthy) em um bloco if?',
    codeSnippet: `if (valor) {
  console.log("Executou!");
}`,
    options: [
      '"0" (uma string contendo o caractere zero)',
      '0 (número zero)',
      'null',
      'undefined',
    ],
    correctAnswerIndex: 0,
    explanation: 'Em JavaScript, qualquer string não-vazia (mesmo contendo "0" ou "false") é avaliada como truthy. Os valores falsy são: false, 0, -0, 0n, "", null, undefined e NaN.',
    points: 100,
    hints: ['Strings têm comprimento length > 0, logo são tratadas como truthy.'],
  },
  {
    id: 'beg-3',
    title: 'Desafio Prático: Soma dos Números Pares',
    type: 'code-challenge',
    difficulty: 'iniciante',
    language: 'JavaScript',
    category: 'Lógica Básica',
    description: 'Escreva uma função que recebe um array de inteiros e calcula a soma apenas dos valores pares.',
    instructions: 'Implemente a função somarPares(numeros) para retornar a soma de todos os números onde n % 2 === 0.',
    initialCode: `function somarPares(numeros) {
  // SEU CÓDIGO AQUI:
  // Dica: itere sobre o array e use o operador % 2 === 0
  let soma = 0;
  for (const n of numeros) {
    if (n % 2 === 0) {
      soma += n;
    }
  }
  return soma;
}`,
    expectedOutputSnippet: 'somarPares([1, 2, 3, 4, 5, 6]) => 12',
    testCases: [
      { input: '[1, 2, 3, 4, 5, 6]', expected: '12', description: 'Soma pares 2 + 4 + 6' },
      { input: '[7, 11, 13]', expected: '0', description: 'Apenas ímpares resulta em 0' },
      { input: '[10, -2, 4]', expected: '12', description: 'Valores positivos e negativos pares' },
    ],
    explanation: 'Utilizamos o operador módulo (%) para verificar a divisibilidade por 2. Quando o resto for 0, o número é adicionado ao acumulador.',
    points: 150,
    hints: [
      'Você pode usar um loop for...of simples ou o método numeros.filter(n => n % 2 === 0).reduce((acc, curr) => acc + curr, 0).',
    ],
  },
  {
    id: 'beg-4',
    title: 'Caça ao Bug: Loop Infinito no While',
    type: 'bug-hunt',
    difficulty: 'iniciante',
    language: 'Python',
    category: 'Lógica Básica',
    description: 'Encontre e corrija o erro grave de lógica no contador.',
    instructions: 'O código abaixo foi submetido por um aluno e trava a CPU em um loop infinito. O que falta?',
    codeSnippet: `contador = 0
limite = 5

while contador < limite:
    print(f"Número atual: {contador}")
    # O que está faltando aqui?`,
    options: [
      'Falta incrementar o contador (ex: contador += 1)',
      'O operador de comparação deveria ser contador > limite',
      'Python não suporta loops while com números inteiros',
      'Falta converter o limite para string antes do loop',
    ],
    correctAnswerIndex: 0,
    explanation: 'Sem a atualização da variável de controle (`contador += 1`), a condição `contador < limite` continuará verdadeira indefinidamente, causando um loop infinito.',
    points: 120,
    hints: ['Toda estrutura de repetição baseada em condição necessita que o estado mude a cada iteração.'],
  },

  // --- INTERMEDIÁRIO (Arrays, Objetos, Assincronismo e Funções de Alta Ordem) ---
  {
    id: 'mid-1',
    title: 'Promises e Assincronismo no Event Loop',
    type: 'quiz',
    difficulty: 'intermediario',
    language: 'JavaScript / Node.js',
    category: 'Backend & APIs',
    description: 'Compreenda a ordem de resolução de Microtasks e Macrotasks no JavaScript.',
    instructions: 'Qual será a sequência exata de números impressos no console ao executar o código?',
    codeSnippet: `console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');`,
    options: [
      '1, 4, 3, 2',
      '1, 2, 3, 4',
      '1, 4, 2, 3',
      '1, 3, 4, 2',
    ],
    correctAnswerIndex: 0,
    explanation: 'O código síncrono executa primeiro (1 e 4). As Promises entram na fila de Microtasks (executada imediatamente após a pilha síncrona esvaziar -> 3). O setTimeout entra na fila de Macrotasks (Task Queue -> 2).',
    points: 200,
    hints: ['Microtasks (Promises) têm prioridade absoluta sobre Macrotasks (setTimeout / setInterval).'],
  },
  {
    id: 'mid-2',
    title: 'Desafio Prático: Inversão de String Sem Métodos Nativos',
    type: 'code-challenge',
    difficulty: 'intermediario',
    language: 'TypeScript / JavaScript',
    category: 'Algoritmos',
    description: 'Crie um algoritmo clássico de manipulação de strings com técnica de dois ponteiros.',
    instructions: 'Implemente inverterTexto(str: string): string sem utilizar str.split("").reverse().join("").',
    initialCode: `function inverterTexto(str: string): string {
  // SEU CÓDIGO AQUI:
  let resultado = '';
  for (let i = str.length - 1; i >= 0; i--) {
    resultado += str[i];
  }
  return resultado;
}`,
    expectedOutputSnippet: 'inverterTexto("ZachAI") => "IAhcaZ"',
    testCases: [
      { input: '"ZachAI"', expected: '"IAhcaZ"', description: 'Inverte palavra simples' },
      { input: '"desenvolvedor"', expected: '"rodavlovnesed"', description: 'Inverte texto longo' },
      { input: '""', expected: '""', description: 'String vazia preservada' },
    ],
    explanation: 'Iterar de trás para frente no índice `str.length - 1` até 0 constrói a string invertida em tempo linear O(n).',
    points: 220,
    hints: ['Um loop decrescente de i = str.length - 1 até 0 resolve com complexidade O(n).'],
  },
  {
    id: 'mid-3',
    title: 'Imutabilidade e Clonagem Profunda em React State',
    type: 'quiz',
    difficulty: 'intermediario',
    language: 'React & TypeScript',
    category: 'Frontend Web',
    description: 'Entenda como mutações acidentais de estado causam bugs no React.',
    instructions: 'Por que o código a seguir NÃO dispara uma nova renderização confiavelmente?',
    codeSnippet: `const [usuario, setUsuario] = useState({ nome: 'Ana', pontuacao: 10 });

function adicionarPontos() {
  usuario.pontuacao += 5;
  setUsuario(usuario);
}`,
    options: [
      'Porque a referência do objeto continua sendo a mesma na memória, falhando na comparação Object.is() do React',
      'Porque setUsuario só aceita valores primitivos e não objetos literais',
      'Porque o estado do React precisa ser atualizado exclusivamente via Redux',
      'Porque pontuacao não foi tipada como readonly',
    ],
    correctAnswerIndex: 0,
    explanation: 'O React verifica se o estado mudou comparando as referências via Object.is(). Modificar diretamente as propriedades do objeto preserva a referência original, fazendo com que o React assuma que nada mudou.',
    points: 200,
    hints: ['A forma correta é criar uma cópia: setUsuario({ ...usuario, pontuacao: usuario.pontuacao + 5 }).'],
  },

  // --- AVANÇADO (Design Patterns, Complexidade O(n), Concorrência e Segurança) ---
  {
    id: 'adv-1',
    title: 'Prevenção de Ataques SQL Injection (Segurança)',
    type: 'quiz',
    difficulty: 'avancado',
    language: 'SQL & Backend',
    category: 'Segurança',
    description: 'Identifique o padrão correto para parametrizar consultas em bancos de dados.',
    instructions: 'Qual das seguintes implementações elimina vulnerabilidades de SQL Injection ao autenticar um usuário?',
    codeSnippet: `// Opção A:
db.query(\`SELECT * FROM users WHERE email = '\${email}' AND pass = '\${hash}'\`);

// Opção B:
db.query('SELECT * FROM users WHERE email = $1 AND pass = $2', [email, hash]);`,
    options: [
      'Opção B: Consultas preparadas com parâmetros vinculados (Prepared Statements)',
      'Opção A: Concatenação direta com template literals',
      'Ambas são vulneráveis caso o banco seja PostgreSQL',
      'Nenhuma das duas protege sem um captcha no frontend',
    ],
    correctAnswerIndex: 0,
    explanation: 'Prepared Statements tratam os parâmetros `$1` e `$2` como dados literais e nunca como comandos SQL executáveis, neutralizando tentativas de injeção de comandos maliciosos.',
    points: 300,
    hints: ['Nunca concatene entradas do usuário diretamente no texto da query SQL.'],
  },
  {
    id: 'adv-2',
    title: 'Complexidade de Tempo Big-O e Busca Binária',
    type: 'quiz',
    difficulty: 'avancado',
    language: 'Estruturas de Dados',
    category: 'Algoritmos',
    description: 'Analise o desempenho assintótico de algoritmos de busca.',
    instructions: 'Em um array ordenado de 1.000.000 de elementos, qual é o número máximo aproximado de comparações necessárias para encontrar um valor usando Busca Binária?',
    options: [
      'Cerca de 20 comparações (O(log n))',
      '1.000.000 de comparações (O(n))',
      '500.000 comparações (O(n/2))',
      '1.000 comparações (O(√n))',
    ],
    correctAnswerIndex: 0,
    explanation: 'A busca binária divide o espaço de busca pela metade a cada passo: log₂(1.000.000) ≈ 19,93. Portanto, no pior caso serão necessárias apenas cerca de 20 iterações.',
    points: 300,
    hints: ['2 elevado a 20 é 1.048.576, cobrindo todo o milhão de elementos.'],
  },
  {
    id: 'adv-3',
    title: 'Desafio Prático: Verificador de Parênteses Balanceados (Pilha / Stack)',
    type: 'code-challenge',
    difficulty: 'avancado',
    language: 'TypeScript / JavaScript',
    category: 'Estruturas de Dados',
    description: 'Verifique se uma expressão possui abertura e fechamento de parênteses, colchetes e chaves perfeitamente balanceados.',
    instructions: 'Implemente estaBalanceado(expressao: string): boolean utilizando o conceito de Pilha (LIFO).',
    initialCode: `function estaBalanceado(expressao: string): boolean {
  // SEU CÓDIGO AQUI:
  const pilha: string[] = [];
  const mapa: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

  for (const char of expressao) {
    if (char === '(' || char === '[' || char === '{') {
      pilha.push(char);
    } else if (char === ')' || char === ']' || char === '}') {
      if (pilha.pop() !== mapa[char]) {
        return false;
      }
    }
  }

  return pilha.length === 0;
}`,
    expectedOutputSnippet: 'estaBalanceado("{[()]}") => true, estaBalanceado("{[(])}") => false',
    testCases: [
      { input: '"{[()]}"', expected: 'true', description: 'Todos balanceados e ordenados' },
      { input: '"([)]"', expected: 'false', description: 'Ordem cruzada incorreta' },
      { input: '"((("', expected: 'false', description: 'Faltam fechamentos' },
      { input: '"function foo() { return [1, 2]; }"', expected: 'true', description: 'Código real balanceado' },
    ],
    explanation: 'Ao encontrar um caractere de fechamento, removemos o elemento do topo da pilha. Se não corresponder ao par esperado ou a pilha estiver vazia, a expressão é inválida.',
    points: 350,
    hints: ['Utilize uma array como pilha (push para empilhar, pop para desempilhar).'],
  },
];
