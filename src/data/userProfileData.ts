export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'iniciante' | 'codigo' | 'alex' | 'streak';
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}

export interface UserProfileState {
  name: string;
  title: string;
  avatarUrl: string;
  totalXp: number;
  level: number;
  currentStreakDays: number;
  bestStreakDays: number;
  hoursPracticed: number;
  completedQuizzes: number;
  completedChallenges: number;
  completedProjects: number;
  alexDiagnosesCount: number;
  achievements: Achievement[];
}

export const INITIAL_USER_PROFILE: UserProfileState = {
  name: 'Estudante Zach',
  title: 'Explorador Fullstack & IA',
  avatarUrl: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='64' fill='%23080e21'/><circle cx='64' cy='46' r='20' fill='%2300d4ff'/><path d='M26 106 c0 -20 17 -34 38 -34 s38 14 38 34 Z' fill='%2300d4ff'/></svg>`,
  totalXp: 0,
  level: 1,
  currentStreakDays: 0,
  bestStreakDays: 0,
  hoursPracticed: 0,
  completedQuizzes: 0,
  completedChallenges: 0,
  completedProjects: 0,
  alexDiagnosesCount: 0,
  achievements: [
    {
      id: 'ach-first-hello',
      title: "Primeiro 'Hello World'",
      description: 'Executou seu primeiro trecho de código ou iniciou uma sessão de aprendizagem.',
      iconName: 'Sparkles',
      category: 'iniciante',
      unlocked: false,
      xpReward: 100,
    },
    {
      id: 'ach-python-master',
      title: 'Mestre do Python',
      description: 'Executou e testou rotinas de dados ou scripts no Python Pesquisador.',
      iconName: 'Zap',
      category: 'codigo',
      unlocked: false,
      xpReward: 250,
    },
    {
      id: 'ach-alex-hunter',
      title: 'Caçador de Bugs com Alex',
      description: 'Submeteu prints ou trechos de erro e obteve a correção instantânea da IA.',
      iconName: 'Bug',
      category: 'alex',
      unlocked: false,
      xpReward: 300,
    },
    {
      id: 'ach-first-site',
      title: 'Primeiro Site Publicado',
      description: 'Completou o roteiro guiado de Landing Page no Módulo de Projetos.',
      iconName: 'Rocket',
      category: 'codigo',
      unlocked: false,
      xpReward: 500,
    },
    {
      id: 'ach-streak-week',
      title: 'Fogo nos Estudos (5 Dias de Streak)',
      description: 'Manteve constância de estudo ativa por 5 dias consecutivos sem falhar.',
      iconName: 'Flame',
      category: 'streak',
      unlocked: false,
      xpReward: 350,
    },
    {
      id: 'ach-quiz-champion',
      title: 'Gênio dos Quizzes',
      description: 'Acertou 10 perguntas de sintaxe sem errar nenhuma na primeira tentativa.',
      iconName: 'Trophy',
      category: 'iniciante',
      unlocked: false,
      xpReward: 400,
    },
    {
      id: 'ach-architect',
      title: 'Arquiteto de APIs',
      description: 'Finalizou a construção de uma API REST com Express e validação Zod.',
      iconName: 'Layers',
      category: 'codigo',
      unlocked: false,
      xpReward: 600,
    },
    {
      id: 'ach-multimodal-ninja',
      title: 'Detetive Multimodal',
      description: 'Enviou 5 prints de telas com mensagens de erro no console para o Alex auditar.',
      iconName: 'Camera',
      category: 'alex',
      unlocked: false,
      xpReward: 450,
    },
  ],
};
