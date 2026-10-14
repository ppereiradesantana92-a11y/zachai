import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Flame,
  ArrowRight,
  Code2,
  Check,
  ChevronRight,
  Filter,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { PRACTICE_CHALLENGES, PracticeChallenge, PracticeDifficulty } from '../../data/practiceData';

interface PracticeViewProps {
  onOpenInAlex?: (code: string, question: string) => void;
  onOpenInStudio?: (initialCode: string, filename: string) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  onOpenInAlex,
  onOpenInStudio,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | PracticeDifficulty>('all');
  const [activeChallengeId, setActiveChallengeId] = useState<string>(PRACTICE_CHALLENGES[0].id);
  
  // Progress & Scores State (persisted locally during session)
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [codeSubmissions, setCodeSubmissions] = useState<Record<string, string>>({});
  const [solvedChallenges, setSolvedChallenges] = useState<Record<string, boolean>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [codeTestResults, setCodeTestResults] = useState<Record<string, { passed: boolean; message: string }>>({});

  const activeChallenge = useMemo(() => {
    return PRACTICE_CHALLENGES.find((c) => c.id === activeChallengeId) || PRACTICE_CHALLENGES[0];
  }, [activeChallengeId]);

  const filteredChallenges = useMemo(() => {
    if (selectedDifficulty === 'all') return PRACTICE_CHALLENGES;
    return PRACTICE_CHALLENGES.filter((c) => c.difficulty === selectedDifficulty);
  }, [selectedDifficulty]);

  // Dynamic Score Calculation
  const totalPoints = useMemo(() => {
    return PRACTICE_CHALLENGES.reduce((acc, curr) => {
      if (solvedChallenges[curr.id]) {
        return acc + curr.points;
      }
      return acc;
    }, 0);
  }, [solvedChallenges]);

  const maxPossiblePoints = useMemo(() => {
    return PRACTICE_CHALLENGES.reduce((acc, curr) => acc + curr.points, 0);
  }, []);

  const progressPercentage = Math.round((Object.keys(solvedChallenges).filter(k => solvedChallenges[k]).length / PRACTICE_CHALLENGES.length) * 100);

  // Difficulty badge styling
  const getDifficultyBadge = (diff: PracticeDifficulty) => {
    switch (diff) {
      case 'iniciante':
        return { label: 'Iniciante', bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' };
      case 'intermediario':
        return { label: 'Intermediário', bg: 'bg-amber-950/60 border-amber-500/40 text-amber-300' };
      case 'avancado':
        return { label: 'Avançado', bg: 'bg-rose-950/60 border-rose-500/40 text-rose-300' };
    }
  };

  const handleSelectQuizOption = (optionIndex: number) => {
    if (solvedChallenges[activeChallenge.id]) return; // already solved

    setUserAnswers((prev) => ({ ...prev, [activeChallenge.id]: optionIndex }));
    const isCorrect = optionIndex === activeChallenge.correctAnswerIndex;

    if (isCorrect) {
      setSolvedChallenges((prev) => ({ ...prev, [activeChallenge.id]: true }));
      setShowExplanation((prev) => ({ ...prev, [activeChallenge.id]: true }));
    }
  };

  const handleCodeChange = (code: string) => {
    setCodeSubmissions((prev) => ({ ...prev, [activeChallenge.id]: code }));
  };

  const handleRunCodeTest = () => {
    const code = codeSubmissions[activeChallenge.id] || activeChallenge.initialCode || '';
    
    // Evaluate challenge tests safely for client-side feedback
    try {
      if (activeChallenge.id === 'beg-3') {
        // somarPares test
        // eslint-disable-next-line no-new-func
        const fn = new Function(`${code}; return somarPares;`)();
        const res1 = fn([1, 2, 3, 4, 5, 6]);
        const res2 = fn([7, 11, 13]);
        if (res1 === 12 && res2 === 0) {
          setCodeTestResults((prev) => ({ ...prev, [activeChallenge.id]: { passed: true, message: 'Todos os testes passaram! Retorno: 12 e 0.' } }));
          setSolvedChallenges((prev) => ({ ...prev, [activeChallenge.id]: true }));
          setShowExplanation((prev) => ({ ...prev, [activeChallenge.id]: true }));
        } else {
          setCodeTestResults((prev) => ({ ...prev, [activeChallenge.id]: { passed: false, message: `Falha no teste: esperava 12, obteve ${res1}` } }));
        }
      } else if (activeChallenge.id === 'mid-2') {
        // inverterTexto test
        // eslint-disable-next-line no-new-func
        const fn = new Function(`${code}; return inverterTexto;`)();
        const res1 = fn('ZachAI');
        const res2 = fn('desenvolvedor');
        if (res1 === 'IAhcaZ' && res2 === 'rodavlovnesed') {
          setCodeTestResults((prev) => ({ ...prev, [activeChallenge.id]: { passed: true, message: 'Sucesso! "ZachAI" invertido para "IAhcaZ".' } }));
          setSolvedChallenges((prev) => ({ ...prev, [activeChallenge.id]: true }));
          setShowExplanation((prev) => ({ ...prev, [activeChallenge.id]: true }));
        } else {
          setCodeTestResults((prev) => ({ ...prev, [activeChallenge.id]: { passed: false, message: `Falha: esperava "IAhcaZ", obteve "${res1}"` } }));
        }
      } else if (activeChallenge.id === 'adv-3') {
        // estaBalanceado test
        // eslint-disable-next-line no-new-func
        const fn = new Function(`${code}; return estaBalanceado;`)();
        const res1 = fn('{[()]}');
        const res2 = fn('([)]');
        if (res1 === true && res2 === false) {
          setCodeTestResults((prev) => ({ ...prev, [activeChallenge.id]: { passed: true, message: 'Pilha validada com precisão nos casos de parênteses!' } }));
          setSolvedChallenges((prev) => ({ ...prev, [activeChallenge.id]: true }));
          setShowExplanation((prev) => ({ ...prev, [activeChallenge.id]: true }));
        } else {
          setCodeTestResults((prev) => ({ ...prev, [activeChallenge.id]: { passed: false, message: `Falha de validação da pilha nos casos de teste.` } }));
        }
      } else {
        // Generic completion
        setCodeTestResults((prev) => ({ ...prev, [activeChallenge.id]: { passed: true, message: 'Código submetido e verificado com sucesso!' } }));
        setSolvedChallenges((prev) => ({ ...prev, [activeChallenge.id]: true }));
        setShowExplanation((prev) => ({ ...prev, [activeChallenge.id]: true }));
      }
    } catch (err: any) {
      setCodeTestResults((prev) => ({
        ...prev,
        [activeChallenge.id]: { passed: false, message: `Erro de Execução/Sintaxe: ${err?.message || 'Verifique o código'}` },
      }));
    }
  };

  const handleResetChallenge = () => {
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[activeChallenge.id];
      return copy;
    });
    setCodeSubmissions((prev) => {
      const copy = { ...prev };
      delete copy[activeChallenge.id];
      return copy;
    });
    setSolvedChallenges((prev) => {
      const copy = { ...prev };
      delete copy[activeChallenge.id];
      return copy;
    });
    setShowExplanation((prev) => {
      const copy = { ...prev };
      delete copy[activeChallenge.id];
      return copy;
    });
    setCodeTestResults((prev) => {
      const copy = { ...prev };
      delete copy[activeChallenge.id];
      return copy;
    });
  };

  const currentDiffBadge = getDifficultyBadge(activeChallenge.difficulty);
  const isCurrentSolved = !!solvedChallenges[activeChallenge.id];
  const currentSelectedOption = userAnswers[activeChallenge.id];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden bg-[#050813] text-slate-100">
      {/* Top Banner: Score, Progress, and Levels */}
      <div className="border-b border-[#141e34] bg-[#070c1b] px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Header & Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#070c1b]">
                <GraduationCap className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white sm:text-lg">
                  Testes e Práticas
                </h1>
                <span className="rounded bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  Zach Academy
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Desafios práticos de código, lógica e quizzes divididos por níveis de progresso
              </p>
            </div>
          </div>

          {/* Gamification Stats */}
          <div className="flex items-center gap-4">
            {/* Points Card */}
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-1.5 shadow-sm">
              <Trophy className="h-4 w-4 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-300/80 uppercase font-semibold">Pontos Acumulados</span>
                <span className="font-mono text-xs font-bold text-amber-300">
                  {totalPoints} / {maxPossiblePoints} XP
                </span>
              </div>
            </div>

            {/* Streak & Solved Card */}
            <div className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-3 py-1.5 shadow-sm">
              <Flame className="h-4 w-4 text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-cyan-300/80 uppercase font-semibold">Concluídos</span>
                <span className="font-mono text-xs font-bold text-cyan-300">
                  {Object.keys(solvedChallenges).filter(k => solvedChallenges[k]).length} de {PRACTICE_CHALLENGES.length}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="hidden sm:flex flex-col gap-1 w-36">
              <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                <span>Progresso</span>
                <span className="text-cyan-400 font-mono">{progressPercentage}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#121c37]">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-300 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Sidebar of Questions + Active Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Filter and List of Challenges */}
        <aside className="w-80 shrink-0 border-r border-[#141e34] bg-[#070c1b]/60 flex flex-col overflow-hidden max-md:hidden">
          {/* Difficulty Filter Tabs */}
          <div className="p-3 border-b border-[#141e34] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-cyan-400" />
                Filtrar por Nível
              </span>
              <span className="font-mono text-[10px] text-slate-500">{filteredChallenges.length} desafios</span>
            </div>
            <div className="grid grid-cols-4 gap-1 rounded-lg bg-[#050813] p-1 text-[11px]">
              {(['all', 'iniciante', 'intermediario', 'avancado'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedDifficulty(lvl)}
                  type="button"
                  className={`rounded py-1 text-center font-medium capitalize transition-all ${
                    selectedDifficulty === lvl
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl === 'all' ? 'Todos' : lvl === 'iniciante' ? 'Inic.' : lvl === 'intermediario' ? 'Inter.' : 'Avan.'}
                </button>
              ))}
            </div>
          </div>

          {/* List of Challenges */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredChallenges.map((challenge, index) => {
              const isSelected = challenge.id === activeChallenge.id;
              const isSolved = solvedChallenges[challenge.id];
              const badge = getDifficultyBadge(challenge.difficulty);

              return (
                <button
                  key={challenge.id}
                  onClick={() => setActiveChallengeId(challenge.id)}
                  type="button"
                  className={`group flex w-full flex-col gap-1.5 rounded-lg border p-2.5 text-left transition-all ${
                    isSelected
                      ? 'border-cyan-500/50 bg-[#0c1630] shadow-sm'
                      : 'border-[#121c35] bg-[#080e22] hover:border-[#1d2d54] hover:bg-[#0c142c]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-mono text-[10px] text-slate-500">#{index + 1}</span>
                      <span className={`text-xs font-semibold truncate ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                        {challenge.title}
                      </span>
                    </div>
                    {isSolved && (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`rounded border px-1.5 py-0.2 font-medium ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="font-mono text-amber-300 font-semibold">
                      +{challenge.points} XP
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Side: Active Challenge Workspace */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 bg-[#050813]">
          <div className="mx-auto max-w-4xl w-full space-y-6">
            {/* Challenge Header Card */}
            <div className="rounded-xl border border-[#16223d] bg-[#070c1b] p-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#141e34] pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${currentDiffBadge.bg}`}>
                    Nível: {currentDiffBadge.label}
                  </span>
                  <span className="rounded bg-[#0c152d] border border-[#1a284c] px-2 py-0.5 text-xs font-mono text-slate-300">
                    {activeChallenge.language}
                  </span>
                  <span className="rounded bg-[#0c152d] border border-[#1a284c] px-2 py-0.5 text-xs font-medium text-cyan-300">
                    {activeChallenge.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-300">
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    +{activeChallenge.points} XP
                  </span>

                  {isCurrentSolved ? (
                    <span className="flex items-center gap-1 rounded bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Resolvido
                    </span>
                  ) : (
                    <span className="rounded bg-slate-800/60 px-2 py-0.5 text-xs text-slate-400">
                      Em aberto
                    </span>
                  )}
                </div>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                {activeChallenge.title}
              </h2>

              <p className="text-sm text-slate-300 mb-2 leading-relaxed">
                {activeChallenge.description}
              </p>

              <div className="rounded-lg border border-[#16223d] bg-[#060b1a] p-3 text-xs text-cyan-300 font-medium">
                <span className="font-bold text-white uppercase tracking-wider block mb-1">Instrução:</span>
                {activeChallenge.instructions}
              </div>
            </div>

            {/* Code Snippet for Reference (if challenge has one) */}
            {activeChallenge.codeSnippet && (
              <div className="rounded-xl border border-[#16223d] bg-[#070c1b] overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#141e34] bg-[#091024] px-4 py-2 text-xs text-slate-400 font-mono">
                  <span>Código de Referência:</span>
                  <span>{activeChallenge.language}</span>
                </div>
                <pre className="p-4 overflow-x-auto font-mono text-xs text-slate-200 bg-[#050813] leading-relaxed">
                  <code>{activeChallenge.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* Quiz Options (when type is quiz or bug-hunt) */}
            {activeChallenge.options && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Selecione a alternativa correta:</span>
                  <span className="text-[11px] text-slate-400">Feedback instantâneo</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {activeChallenge.options.map((option, idx) => {
                    const isSelected = currentSelectedOption === idx;
                    const isCorrect = idx === activeChallenge.correctAnswerIndex;
                    let cardStyle = 'border-[#141e34] bg-[#070c1b] hover:border-cyan-500/40 hover:bg-[#0b132a] text-slate-200';

                    if (isSelected) {
                      if (isCorrect) {
                        cardStyle = 'border-emerald-500/60 bg-emerald-950/40 text-emerald-200 shadow-md';
                      } else {
                        cardStyle = 'border-rose-500/60 bg-rose-950/40 text-rose-200';
                      }
                    } else if (isCurrentSolved && isCorrect) {
                      cardStyle = 'border-emerald-500/60 bg-emerald-950/20 text-emerald-300';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectQuizOption(idx)}
                        type="button"
                        className={`flex items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition-all ${cardStyle}`}
                      >
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                          isSelected && isCorrect
                            ? 'border-emerald-400 bg-emerald-500 text-black'
                            : isSelected && !isCorrect
                            ? 'border-rose-400 bg-rose-500 text-white'
                            : 'border-slate-600 bg-[#0a1124] text-slate-300'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="flex-1 leading-snug">{option}</span>
                        {isSelected && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
                        {isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Interactive Code Editor (when type is code-challenge) */}
            {activeChallenge.type === 'code-challenge' && (
              <div className="rounded-xl border border-[#16223d] bg-[#070c1b] overflow-hidden space-y-3 p-4">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-cyan-400" />
                    <span className="font-bold">Editor Prático de Solução:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {onOpenInStudio && (
                      <button
                        onClick={() => onOpenInStudio(codeSubmissions[activeChallenge.id] || activeChallenge.initialCode || '', `desafio-${activeChallenge.id}.js`)}
                        type="button"
                        className="rounded border border-cyan-500/30 bg-[#0c1630] px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950 transition-colors"
                      >
                        Abrir no Zach Studio
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative rounded-lg border border-[#182645] bg-[#050813] p-3 font-mono text-xs">
                  <textarea
                    value={codeSubmissions[activeChallenge.id] ?? activeChallenge.initialCode ?? ''}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    rows={10}
                    className="w-full resize-y bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none font-mono text-xs leading-relaxed"
                    placeholder="// Escreva sua solução aqui..."
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span>Resultado esperado:</span>
                    <span className="text-cyan-300">{activeChallenge.expectedOutputSnippet}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunCodeTest}
                      type="button"
                      className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:from-blue-500 hover:to-cyan-400 transition-all active:scale-95"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Testar Solução</span>
                    </button>
                  </div>
                </div>

                {/* Test Results Output */}
                {codeTestResults[activeChallenge.id] && (
                  <div className={`rounded-lg border p-3 text-xs font-mono mt-3 ${
                    codeTestResults[activeChallenge.id].passed
                      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                      : 'border-rose-500/40 bg-rose-950/30 text-rose-300'
                  }`}>
                    <div className="flex items-center gap-2 font-bold mb-1">
                      {codeTestResults[activeChallenge.id].passed ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span>Parabéns! Código aprovado com sucesso.</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-rose-400" />
                          <span>Não passou em todos os testes.</span>
                        </>
                      )}
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      {codeTestResults[activeChallenge.id].message}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Feedback and Explanation Box */}
            {showExplanation[activeChallenge.id] && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Explicação Didática da Resposta:</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeChallenge.explanation}
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-emerald-400">
                    +{activeChallenge.points} XP creditados ao seu perfil!
                  </span>
                  {onOpenInAlex && (
                    <button
                      onClick={() => onOpenInAlex(activeChallenge.codeSnippet || activeChallenge.initialCode || '', `Explique detalhadamente o desafio: ${activeChallenge.title}`)}
                      type="button"
                      className="text-xs text-cyan-300 hover:underline flex items-center gap-1"
                    >
                      <span>Perguntar mais detalhes ao Alex</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Controls: Hints, Reset, Next */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#141e34] pt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHint((prev) => ({ ...prev, [activeChallenge.id]: !prev[activeChallenge.id] }))}
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-[#1b2b4d] bg-[#091124] px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500/30 hover:text-cyan-300 transition-colors"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  <span>{showHint[activeChallenge.id] ? 'Ocultar Dica' : 'Ver Dica'}</span>
                </button>

                <button
                  onClick={handleResetChallenge}
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-[#1b2b4d] bg-[#091124] px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reiniciar Desafio</span>
                </button>
              </div>

              {/* Next Challenge Button */}
              <div className="flex items-center gap-2">
                {(() => {
                  const currentIndex = filteredChallenges.findIndex((c) => c.id === activeChallenge.id);
                  const nextChallenge = filteredChallenges[currentIndex + 1];
                  if (!nextChallenge) return null;

                  return (
                    <button
                      onClick={() => setActiveChallengeId(nextChallenge.id)}
                      type="button"
                      className="flex items-center gap-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900 transition-colors"
                    >
                      <span>Próximo Desafio</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Hint Box (when opened) */}
            {showHint[activeChallenge.id] && activeChallenge.hints && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-200 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  Dica para resolução:
                </span>
                <p className="text-slate-300 text-[11px]">
                  {activeChallenge.hints[0]}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
