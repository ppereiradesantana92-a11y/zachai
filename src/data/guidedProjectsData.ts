export interface ProjectStep {
  stepNumber: number;
  title: string;
  objective: string;
  explanation: string;
  filename: string;
  language: string;
  code: string;
  tips: string[];
}

export interface GuidedStudentProject {
  id: string;
  title: string;
  tagline: string;
  category: 'frontend' | 'games' | 'backend' | 'fullstack';
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  estimatedTime: string;
  techStack: string[];
  description: string;
  prerequisites: string[];
  steps: ProjectStep[];
}

export const GUIDED_STUDENT_PROJECTS: GuidedStudentProject[] = [
  {
    id: 'landing-page',
    title: 'Landing Page Responsiva de Alta Conversão',
    tagline: 'Construa uma página moderna e profissional com Hero, Features, CTA e modo escuro.',
    category: 'frontend',
    difficulty: 'Iniciante',
    estimatedTime: '40 min',
    techStack: ['React 19', 'Tailwind CSS', 'TypeScript', 'Lucide Icons'],
    description: 'Aprenda os fundamentos de componentização limpa, design responsivo com Tailwind CSS e acessibilidade criando uma página web real do zero.',
    prerequisites: ['Conceitos básicos de HTML/CSS', 'Fundamentos de componentes React'],
    steps: [
      {
        stepNumber: 1,
        title: 'Estruturação do Hero e Cabeçalho Moderno',
        objective: 'Criar o cabeçalho com logotipo, menu de navegação e a seção Hero de destaque visual.',
        explanation: 'O Hero é a primeira impressão de qualquer produto. Usamos flexbox, tags semânticas e gradientes para reter a atenção do usuário nos primeiros 3 segundos.',
        filename: 'src/components/HeroSection.tsx',
        language: 'typescript',
        code: `import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export function HeroSection() {
  return (
    <header className="relative overflow-hidden bg-[#050813] py-16 px-6 text-white border-b border-[#141e34]">
      <div className="mx-auto max-w-5xl text-center">
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Lançamento Zach 2.0 • Edição Estudante</span>
        </div>

        {/* Título com gradiente */}
        <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Aprenda a Programar <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Construindo Projetos Reais
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
          Domine TypeScript, Python, APIs e lógica prática com feedback imediato da IA Alex e execução no Zach Code Studio.
        </p>

        {/* Botões de Ação */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95">
            <span>Começar Agora Gratuitamente</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button className="rounded-lg border border-[#1b2a47] bg-[#090f23] px-5 py-3 text-sm font-medium text-slate-300 hover:border-cyan-500/40 hover:text-white transition-colors">
            Ver Demonstração
          </button>
        </div>

        {/* Prova social rápida */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> 100% Prático</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> Sem Instalações Pesadas</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> Feedback do Alex em Segundos</span>
        </div>
      </div>
    </header>
  );
}`,
        tips: [
          'Use max-w-5xl e mx-auto para manter o conteúdo contido em monitores grandes.',
          'Gradientes em texto funcionam com as classes: bg-clip-text text-transparent bg-gradient-to-r.',
        ],
      },
      {
        stepNumber: 2,
        title: 'Grade de Recursos & Benefícios (Cards Dinâmicos)',
        objective: 'Construir a seção de cards com ícones dinâmicos, efeitos hover e tipografia limpa.',
        explanation: 'Separamos os dados dos cards em uma constante imutável para facilitar a manutenção e permitir renderização declarativa via .map().',
        filename: 'src/components/FeaturesGrid.tsx',
        language: 'typescript',
        code: `import React from 'react';
import { Terminal, ShieldCheck, Zap, Bot, Cpu, Rocket } from 'lucide-react';

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  desc: string;
  badge: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: Terminal,
    title: 'Zach Code Studio',
    desc: 'Editor completo com abas, explorador de arquivos e terminal integrado diretamente no navegador.',
    badge: 'IDE Web',
  },
  {
    icon: Bot,
    title: 'Alex AI Integrado',
    desc: 'Auditor de erros em tempo real que analisa prints de telas de erro e explica a causa raiz.',
    badge: 'Multimodal',
  },
  {
    icon: Zap,
    title: 'Python Pesquisador',
    desc: 'Execute scripts Python interativos com saída instantânea e consulta de bibliotecas padrão.',
    badge: 'Executor',
  },
  {
    icon: ShieldCheck,
    title: 'Testes & Quizzes por Nível',
    desc: 'Desafios práticos divididos do iniciante ao avançado com pontuação dinâmica e XP.',
    badge: 'Gamificação',
  },
];

export function FeaturesGrid() {
  return (
    <section className="bg-[#050813] py-16 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Tudo o que você precisa para evoluir na programação
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Ferramentas modernas projetadas para acelerar sua curva de aprendizado.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-xl border border-[#16233f] bg-[#070d1e] p-6 transition-all hover:border-cyan-500/50 hover:bg-[#0a1229] hover:shadow-lg hover:shadow-cyan-950/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded bg-[#121c33] px-2 py-0.5 text-xs font-semibold text-slate-300">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}`,
        tips: [
          'Agrupar efeitos de hover com a classe "group" no pai e "group-hover:" nos elementos filhos cria microinterações sofisticadas.',
        ],
      },
      {
        stepNumber: 3,
        title: 'Seção de Call-to-Action (CTA) & Rodapé',
        objective: 'Integrar a chamada final para conversão com formulário de e-mail e rodapé informativo.',
        explanation: 'O CTA converte o visitante interessado em um estudante cadastrado. Incluímos validação simples de e-mail.',
        filename: 'src/components/CtaSection.tsx',
        language: 'typescript',
        code: `import React, { useState } from 'react';
import { Send, CheckCircle2, Shield } from 'lucide-react';

export function CtaSection() {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSuccess(true);
  };

  return (
    <section className="bg-[#070e24] py-16 px-6 border-t border-[#141e34]">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Pronto para escrever seus primeiros códigos de verdade?
        </h2>
        <p className="mt-3 text-sm text-slate-300">
          Junte-se a milhares de estudantes que evoluem todos os dias com Zach AI.
        </p>

        {isSuccess ? (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-4 text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold text-sm">Convite enviado com sucesso para {email}!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu melhor e-mail institucional ou pessoal..."
              className="w-full sm:w-96 rounded-lg border border-[#1b2b4b] bg-[#050813] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-cyan-400 transition-colors"
            >
              <span>Acessar Grátis</span>
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Shield className="h-3.5 w-3.5 text-cyan-400" />
          <span>Privacidade garantida • Sem spam • Acesso a todas as linguagens</span>
        </div>
      </div>
    </section>
  );
}`,
        tips: [
          'Sempre adicione estados de sucesso e erro ao interagir com formulários para melhorar a UX.',
        ],
      },
    ],
  },
  {
    id: 'game-2d',
    title: 'Jogo 2D Interativo em HTML5 Canvas & JavaScript',
    tagline: 'Crie o clássico jogo da Cobrinha (Snake) ou Asteroides com loop de animação a 60 FPS.',
    category: 'games',
    difficulty: 'Iniciante',
    estimatedTime: '35 min',
    techStack: ['HTML5 Canvas', 'JavaScript / TypeScript', 'Game Loop', 'Matemática 2D'],
    description: 'Aprenda lógica de jogos, detecção de colisão entre retângulos, escuta de teclado e atualização de canvas a 60 quadros por segundo.',
    prerequisites: ['Conhecimento de variáveis e loops', 'Escuta de eventos com addEventListener'],
    steps: [
      {
        stepNumber: 1,
        title: 'Inicialização do Canvas & Game Loop',
        objective: 'Configurar a tela gráfica e estabelecer o ciclo de renderização requestAnimationFrame.',
        explanation: 'O Game Loop é o coração de qualquer jogo eletrônico: a cada ciclo (tick), nós limpamos o canvas, atualizamos a lógica e redesenhamos os elementos na tela.',
        filename: 'src/games/SnakeGame.ts',
        language: 'typescript',
        code: `// Estrutura do Motor do Jogo 2D
export interface Point {
  x: number;
  y: number;
}

export class MiniSnakeGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gridSize = 20;
  private tileCount = 20;
  private snake: Point[] = [{ x: 10, y: 10 }];
  private velocity: Point = { x: 0, y: 0 };
  private apple: Point = { x: 15, y: 15 };
  public score = 0;
  public isGameOver = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.canvas.width = this.gridSize * this.tileCount;
    this.canvas.height = this.gridSize * this.tileCount;
    this.setupControls();
  }

  private setupControls() {
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (this.velocity.y === 0) this.velocity = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (this.velocity.y === 0) this.velocity = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (this.velocity.x === 0) this.velocity = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (this.velocity.x === 0) this.velocity = { x: 1, y: 0 };
          break;
      }
    });
  }

  public update() {
    if (this.isGameOver) return;
    if (this.velocity.x === 0 && this.velocity.y === 0) return;

    // Move a cabeça
    const newHead: Point = {
      x: this.snake[0].x + this.velocity.x,
      y: this.snake[0].y + this.velocity.y,
    };

    // Colisão com as paredes
    if (newHead.x < 0 || newHead.x >= this.tileCount || newHead.y < 0 || newHead.y >= this.tileCount) {
      this.isGameOver = true;
      return;
    }

    // Colisão com o próprio corpo
    for (let part of this.snake) {
      if (part.x === newHead.x && part.y === newHead.y) {
        this.isGameOver = true;
        return;
      }
    }

    this.snake.unshift(newHead);

    // Comeu a maçã?
    if (newHead.x === this.apple.x && newHead.y === this.apple.y) {
      this.score += 10;
      this.spawnApple();
    } else {
      this.snake.pop();
    }
  }

  private spawnApple() {
    this.apple = {
      x: Math.floor(Math.random() * this.tileCount),
      y: Math.floor(Math.random() * this.tileCount),
    };
  }

  public render() {
    // Limpa tela
    this.ctx.fillStyle = '#050813';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Desenha Maçã
    this.ctx.fillStyle = '#f43f5e';
    this.ctx.fillRect(this.apple.x * this.gridSize, this.apple.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);

    // Desenha Cobrinha
    this.ctx.fillStyle = '#06b6d4';
    for (let part of this.snake) {
      this.ctx.fillRect(part.x * this.gridSize, part.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
    }
  }
}`,
        tips: [
          'Evite que o jogador vire 180 graus sobre o próprio corpo checando se a velocidade oposta não é ativa.',
        ],
      },
      {
        stepNumber: 2,
        title: 'Componente React com Canvas & Placar',
        objective: 'Integrar a classe do jogo a um componente React com botão de reiniciar e exibição de placar.',
        explanation: 'Usamos useRef para obter a referência do elemento <canvas> do DOM sem re-renderizar a cada frame.',
        filename: 'src/components/SnakeGameComponent.tsx',
        language: 'typescript',
        code: `import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { MiniSnakeGame } from '../games/SnakeGame';

export function SnakeGameComponent() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameInstanceRef = useRef<MiniSnakeGame | null>(null);

  const initGame = () => {
    if (!canvasRef.current) return;
    const game = new MiniSnakeGame(canvasRef.current);
    gameInstanceRef.current = game;
    setGameOver(false);
    setScore(0);
  };

  useEffect(() => {
    initGame();
    const interval = setInterval(() => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.update();
        gameInstanceRef.current.render();
        setScore(gameInstanceRef.current.score);
        if (gameInstanceRef.current.isGameOver) {
          setGameOver(true);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-[#141e34] bg-[#070c1a] p-6 text-white max-w-md mx-auto">
      <div className="flex w-full items-center justify-between">
        <h3 className="font-bold text-lg text-cyan-400">Snake 2D Arcade</h3>
        <div className="flex items-center gap-1.5 rounded bg-cyan-950/60 px-2.5 py-1 text-xs font-semibold text-cyan-300">
          <Trophy className="h-3.5 w-3.5 text-yellow-400" />
          <span>Pontos: {score}</span>
        </div>
      </div>

      <div className="relative rounded-lg border-2 border-cyan-500/40 overflow-hidden shadow-lg shadow-cyan-950/30">
        <canvas ref={canvasRef} className="block bg-[#050813]" />
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
            <span className="text-xl font-bold text-rose-400">Fim de Jogo!</span>
            <p className="text-xs text-slate-300 mt-1">Pontuação Final: {score}</p>
            <button
              onClick={initGame}
              className="mt-3 flex items-center gap-2 rounded bg-cyan-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-cyan-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Jogar Novamente</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Use as teclas de setas do teclado (↑, ↓, ←, →) para controlar a cobrinha!
      </p>
    </div>
  );
}`,
        tips: [
          'O cleanup do useEffect com clearInterval evita que múltiplos loops concorrentes acelerem o jogo ao recarregar a tela.',
        ],
      },
    ],
  },
  {
    id: 'calculator-api',
    title: 'Calculadora Científica & API de Expressões',
    tagline: 'Construa um parser de expressões matemáticas com suporte a histórico e API REST com Express.',
    category: 'backend',
    difficulty: 'Iniciante',
    estimatedTime: '30 min',
    techStack: ['Node.js', 'Express', 'TypeScript', 'Validação Zod'],
    description: 'Aprenda a receber requisições HTTP POST, validar os dados de entrada usando Zod e calcular com segurança sem usar o perigoso eval().',
    prerequisites: ['Conceito de requisição HTTP (JSON)', 'TypeScript básico'],
    steps: [
      {
        stepNumber: 1,
        title: 'Avaliador Seguro de Expressões Sem eval()',
        objective: 'Construir uma função pura que avalia operações aritméticas básicas de forma determinística.',
        explanation: 'Nunca use eval() em servidores reais pois abre brechas críticas de execução de código arbitrário. Criamos um interpretador simples baseado em operadores.',
        filename: 'src/utils/safeMathCalculator.ts',
        language: 'typescript',
        code: `export type Operator = '+' | '-' | '*' | '/' | '^';

export interface CalculationResult {
  expression: string;
  result: number;
  timestamp: string;
}

export function safeCalculate(a: number, op: Operator, b: number): number {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (b === 0) throw new Error('Divisão por zero não é permitida.');
      return a / b;
    case '^':
      return Math.pow(a, b);
    default:
      throw new Error(\`Operador inválido: \${op}\`);
  }
}

// Histórico de cálculos em memória
export class CalculationHistory {
  private history: CalculationResult[] = [];

  public add(item: CalculationResult) {
    this.history.unshift(item);
    if (this.history.length > 20) this.history.pop();
  }

  public getAll(): CalculationResult[] {
    return [...this.history];
  }
}`,
        tips: [
          'Sempre trate o caso de divisão por zero explicitamente para evitar erros silenciosos com valor Infinity.',
        ],
      },
      {
        stepNumber: 2,
        title: 'Endpoint REST com Express & Middleware Zod',
        objective: 'Configurar a rota POST /api/calculate com validação de esquema de entrada.',
        explanation: 'O Zod garante que qualquer payload malformado receba resposta HTTP 400 Bad Request detalhada antes de atingir as regras de negócio.',
        filename: 'src/server/calculatorRoute.ts',
        language: 'typescript',
        code: `import express, { Request, Response } from 'express';
import { z } from 'zod';
import { safeCalculate, CalculationHistory, Operator } from '../utils/safeMathCalculator';

export const calculatorRouter = express.Router();
const historyManager = new CalculationHistory();

const CalculateSchema = z.object({
  operandA: z.number({ required_error: 'Primeiro operando é obrigatório' }),
  operator: z.enum(['+', '-', '*', '/', '^'], { required_error: 'Operador obrigatório (+, -, *, /, ^)' }),
  operandB: z.number({ required_error: 'Segundo operando é obrigatório' }),
});

calculatorRouter.post('/api/calculate', (req: Request, res: Response) => {
  const parseResult = CalculateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Dados de requisição inválidos',
      details: parseResult.error.format(),
    });
  }

  const { operandA, operator, operandB } = parseResult.data;

  try {
    const result = safeCalculate(operandA, operator as Operator, operandB);
    const entry = {
      expression: \`\${operandA} \${operator} \${operandB}\`,
      result,
      timestamp: new Date().toISOString(),
    };
    historyManager.add(entry);

    return res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (err: any) {
    return res.status(422).json({
      success: false,
      error: err.message,
    });
  }
});

calculatorRouter.get('/api/calculate/history', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    history: historyManager.getAll(),
  });
});`,
        tips: [
          'Utilize status 400 para erros de sintaxe/JSON e 422 para erros de negócio (ex: divisão por zero).',
        ],
      },
    ],
  },
];
