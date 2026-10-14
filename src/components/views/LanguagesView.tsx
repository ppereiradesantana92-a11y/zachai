import React, { useState, useMemo } from 'react';
import {
  Code2,
  Search,
  Check,
  ArrowRight,
  Info,
  MessageSquareCode,
  GraduationCap,
  X,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
} from 'lucide-react';
import {
  LANGUAGES_LIST,
  LANGUAGE_CATEGORIES,
  KIND_LABELS,
  getLanguageQuiz,
} from '../../data/languagesData';
import { LanguageCategory, LanguageItem, LanguageQuizQuestion } from '../../types';
import { CodeBlock } from '../CodeBlock';
import { PythonResearcher } from '../PythonResearcher';

interface LanguagesViewProps {
  selectedLanguageName: string;
  onSelectLanguage: (languageName: string) => void;
  onNavigateToChatWithLanguage: (languageName: string) => void;
  onNavigateToAnalyzeWithLanguage: (languageName: string) => void;
  onSendToStudio?: (code: string, filename: string) => void;
}

export const LanguagesView: React.FC<LanguagesViewProps> = ({
  selectedLanguageName,
  onSelectLanguage,
  onNavigateToChatWithLanguage,
  onNavigateToAnalyzeWithLanguage,
  onSendToStudio,
}) => {
  const [activeCategory, setActiveCategory] = useState<LanguageCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quiz Modal State
  const [activeQuizLang, setActiveQuizLang] = useState<LanguageItem | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Active language object
  const currentLanguageItem = useMemo(() => {
    return (
      LANGUAGES_LIST.find(
        (l) => l.name.toLowerCase() === selectedLanguageName.toLowerCase()
      ) || LANGUAGES_LIST[1] // default TypeScript
    );
  }, [selectedLanguageName]);

  // Filtering
  const filteredLanguages = useMemo(() => {
    return LANGUAGES_LIST.filter((lang) => {
      const matchesCategory =
        activeCategory === 'all' || lang.category === activeCategory;

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const matchesSearch =
        lang.name.toLowerCase().includes(query) ||
        lang.description.toLowerCase().includes(query) ||
        lang.popularUses.toLowerCase().includes(query) ||
        lang.extensions.some((ext) => ext.toLowerCase().includes(query)) ||
        KIND_LABELS[lang.kind]?.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Quiz helpers
  const activeQuizQuestions: LanguageQuizQuestion[] = useMemo(() => {
    if (!activeQuizLang) return [];
    return getLanguageQuiz(activeQuizLang);
  }, [activeQuizLang]);

  const handleOpenQuiz = (lang: LanguageItem) => {
    setActiveQuizLang(lang);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
  };

  const handleCloseQuiz = () => {
    setActiveQuizLang(null);
  };

  const handleSelectOption = (index: number) => {
    if (selectedOptionIndex !== null) return; // already answered
    setSelectedOptionIndex(index);
    setShowExplanation(true);

    const currentQ = activeQuizQuestions[currentQuestionIndex];
    if (currentQ && index === currentQ.correctAnswerIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < activeQuizQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-1 border-b border-[#141e34] pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
          <Code2 className="h-4 w-4" />
          <span>CATÁLOGO MULTILINGUAGEM EXPANDIDO</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Linguagens & Tecnologias
        </h1>
        <p className="text-sm text-slate-300">
          Explore as tecnologias organizadas por categorias, pratique testes de fixação para iniciantes e sincronize a linguagem ativa com o Chat e o Analisador de Código.
        </p>
      </div>

      {/* Execution Status Transparency Card */}
      <div className="mb-6 rounded-xl border border-cyan-500/20 bg-[#070e22] p-4 text-xs text-slate-300">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-cyan-500/10 text-cyan-400">
            <Info className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-semibold text-cyan-200">
              Transparência Operacional (Etapa 1):
            </span>{' '}
            <span className="text-slate-400">
              O ZachAI oferece suporte a templates de sintaxe, formatação idiomática, testes práticos de conceitos e auditoria estática para todas as tecnologias do catálogo.
              <strong> Não há execução real em sandbox ou compilação nativa no servidor</strong> nesta primeira fase.
            </span>
          </div>
        </div>
      </div>

      {/* Python Pesquisador & Executor Section */}
      <div className="mb-8">
        <PythonResearcher
          onSendToStudio={onSendToStudio}
          onSendToChat={(prompt, code) => onNavigateToChatWithLanguage(prompt)}
        />
      </div>

      {/* Active Language Ribbon */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-cyan-500/30 bg-[#09132c] p-4 shadow-lg sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-sm">
            {currentLanguageItem.extensions[0] || currentLanguageItem.name.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Linguagem Ativa Compartilhada:</span>
              <span className="text-sm font-bold text-white">
                {currentLanguageItem.name}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-cyan-300">
              <span>{KIND_LABELS[currentLanguageItem.kind]}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="font-mono text-slate-400">
                {currentLanguageItem.extensions.join(', ')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenQuiz(currentLanguageItem)}
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 px-3 py-1.5 text-xs font-semibold text-purple-200 transition-colors hover:bg-purple-900/60"
          >
            <GraduationCap className="h-3.5 w-3.5 text-purple-300" />
            <span>Fazer Teste Prático</span>
          </button>

          <button
            onClick={() => onNavigateToChatWithLanguage(currentLanguageItem.name)}
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-900/60"
          >
            <MessageSquareCode className="h-3.5 w-3.5" />
            <span>Abrir no Chat</span>
          </button>

          <button
            onClick={() => onNavigateToAnalyzeWithLanguage(currentLanguageItem.name)}
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-95"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Analisar Código</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-3">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome, extensão (.ts, .py, .sol, .sql) ou domínio (Web, Blockchain, IA)..."
            className="w-full rounded-lg border border-[#172340] bg-[#080e22] py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Category Filter Chips / Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
          {LANGUAGE_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                    : 'border border-[#141e35] bg-[#070c1b] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Languages Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLanguages.map((lang) => {
          const isSelected =
            selectedLanguageName.toLowerCase() === lang.name.toLowerCase();

          return (
            <div
              key={lang.id}
              className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                isSelected
                  ? 'border-cyan-500/60 bg-[#09132c] shadow-lg shadow-cyan-950/25 ring-1 ring-cyan-500/30'
                  : 'border-[#141e35] bg-[#070c1b] hover:border-slate-700 hover:bg-[#091024]'
              }`}
            >
              <div>
                {/* Top header of card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-xs font-bold ${
                        isSelected
                          ? 'border-cyan-400/50 bg-cyan-950/60 text-cyan-300'
                          : 'border-[#1b2b4e] bg-[#0c152d] text-slate-300'
                      }`}
                    >
                      {lang.extensions[0] || lang.name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">
                        {lang.name}
                      </h3>
                      <div className="text-[11px] text-cyan-400 font-medium">
                        {KIND_LABELS[lang.kind]}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="flex items-center gap-1 rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                      <Check className="h-3 w-3" />
                      <span>Ativa</span>
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="mt-3 text-xs leading-relaxed text-slate-300">
                  {lang.description}
                </p>

                {/* Popular uses */}
                <div className="mt-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Usos frequentes:</span>{' '}
                  {lang.popularUses}
                </div>

                {/* Extensions */}
                <div className="mt-3 flex flex-wrap items-center gap-1">
                  {lang.extensions.map((ext) => (
                    <span
                      key={ext}
                      className="rounded border border-[#192644] bg-[#091022] px-1.5 py-0.5 font-mono text-[10px] text-slate-400"
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 border-t border-[#131d33] pt-3">
                <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate pr-1 text-slate-500">{lang.executionStatus}</span>
                  <button
                    onClick={() => handleOpenQuiz(lang)}
                    type="button"
                    className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 hover:underline"
                    title="Praticar teste / quiz de conceitos para iniciantes"
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>Teste Prático</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectLanguage(lang.name)}
                    type="button"
                    className={`flex-1 rounded-lg px-2.5 py-1.5 text-center text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                        : 'border border-[#172340] bg-[#091125] text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300'
                    }`}
                  >
                    {isSelected ? 'Linguagem Selecionada' : 'Selecionar'}
                  </button>

                  <button
                    onClick={() => {
                      onSelectLanguage(lang.name);
                      onNavigateToChatWithLanguage(lang.name);
                    }}
                    type="button"
                    title="Iniciar no Chat com esta linguagem"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#172340] bg-[#091125] text-slate-400 hover:border-cyan-500/40 hover:text-cyan-300"
                  >
                    <MessageSquareCode className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectLanguage(lang.name);
                      onNavigateToAnalyzeWithLanguage(lang.name);
                    }}
                    type="button"
                    title="Analisar código nesta linguagem"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#172340] bg-[#091125] text-slate-400 hover:border-cyan-500/40 hover:text-cyan-300"
                  >
                    <Code2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLanguages.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#1a2744] p-12 text-center">
          <Code2 className="mx-auto h-8 w-8 text-slate-600 mb-2" />
          <h3 className="text-sm font-semibold text-slate-300">
            Nenhuma tecnologia encontrada
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Tente refinar sua busca por outro termo ou selecione a categoria "Todas as Tecnologias".
          </p>
        </div>
      )}

      {/* Interactive Beginner Quiz Modal */}
      {activeQuizLang && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="relative flex w-full max-w-xl flex-col rounded-2xl border border-cyan-500/40 bg-[#070d1e] p-5 shadow-2xl shadow-cyan-950/40 sm:p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#141e35] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {activeQuizLang.name} · Teste Prático para Iniciantes
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    Fixação de fundamentos e sintaxe essencial
                  </div>
                </div>
              </div>

              <button
                onClick={handleCloseQuiz}
                type="button"
                aria-label="Fechar quiz"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0f172a] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            {!quizFinished ? (
              <div className="mt-4 flex flex-col space-y-4">
                {/* Progress Counter */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-cyan-300">
                    Questão {currentQuestionIndex + 1} de {activeQuizQuestions.length}
                  </span>
                  <span className="text-[11px] text-purple-300 font-medium">
                    Nível Iniciante
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-[#111933] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                    style={{
                      width: `${((currentQuestionIndex + 1) / activeQuizQuestions.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Question */}
                {activeQuizQuestions[currentQuestionIndex] && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                      {activeQuizQuestions[currentQuestionIndex].question}
                    </h4>

                    {/* Optional Code Snippet */}
                    {activeQuizQuestions[currentQuestionIndex].codeSnippet && (
                      <div className="mt-2.5">
                        <CodeBlock
                          code={activeQuizQuestions[currentQuestionIndex].codeSnippet!}
                          language={activeQuizLang.id}
                          showLineNumbers={false}
                        />
                      </div>
                    )}

                    {/* Options list */}
                    <div className="mt-3.5 space-y-2">
                      {activeQuizQuestions[currentQuestionIndex].options.map(
                        (option, optIdx) => {
                          const isChosen = selectedOptionIndex === optIdx;
                          const isCorrect =
                            optIdx ===
                            activeQuizQuestions[currentQuestionIndex]
                              .correctAnswerIndex;

                          let optionStyle =
                            'border-[#172340] bg-[#0a1126] text-slate-300 hover:border-cyan-500/40 hover:bg-[#0e1938]';

                          if (selectedOptionIndex !== null) {
                            if (isCorrect) {
                              optionStyle =
                                'border-emerald-500/60 bg-emerald-950/40 text-emerald-200';
                            } else if (isChosen) {
                              optionStyle =
                                'border-rose-500/60 bg-rose-950/40 text-rose-200';
                            } else {
                              optionStyle =
                                'border-[#15203b] bg-[#080d1e] text-slate-500 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(optIdx)}
                              disabled={selectedOptionIndex !== null}
                              type="button"
                              className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left text-xs font-medium transition-all ${optionStyle}`}
                            >
                              <span className="font-mono text-slate-500 mt-0.5">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span className="flex-1 leading-relaxed">{option}</span>
                              {selectedOptionIndex !== null && isCorrect && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                              )}
                              {selectedOptionIndex !== null &&
                                isChosen &&
                                !isCorrect && (
                                  <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                                )}
                            </button>
                          );
                        }
                      )}
                    </div>

                    {/* Explanation */}
                    {showExplanation && (
                      <div className="mt-3.5 rounded-lg border border-cyan-500/30 bg-[#091530] p-3 text-xs text-slate-200">
                        <div className="flex items-center gap-1.5 font-semibold text-cyan-300 mb-1">
                          <HelpCircle className="h-3.5 w-3.5" />
                          <span>Explicação de Engenharia:</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-300">
                          {activeQuizQuestions[currentQuestionIndex].explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Controls */}
                <div className="mt-4 flex items-center justify-between border-t border-[#141e35] pt-3">
                  <div className="text-[11px] text-slate-400">
                    Acertos: <span className="font-mono text-cyan-300">{score}</span>
                  </div>

                  {selectedOptionIndex !== null && (
                    <button
                      onClick={handleNextQuestion}
                      type="button"
                      className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:opacity-95"
                    >
                      <span>
                        {currentQuestionIndex + 1 < activeQuizQuestions.length
                          ? 'Próxima Questão'
                          : 'Ver Resultado Final'}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Finished Summary */
              <div className="mt-4 flex flex-col items-center py-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3 shadow-lg shadow-cyan-950/40">
                  <GraduationCap className="h-7 w-7" />
                </div>

                <h4 className="text-base font-bold text-white">
                  Teste de {activeQuizLang.name} Concluído!
                </h4>
                <p className="mt-1 text-xs text-slate-300">
                  Você acertou <strong className="font-mono text-cyan-300 text-sm">{score}</strong> de{' '}
                  <span className="font-mono">{activeQuizQuestions.length}</span> questões.
                </p>

                <div className="my-5 w-full rounded-xl border border-[#16223e] bg-[#091126] p-3 text-xs text-slate-300">
                  <div className="font-semibold text-cyan-300 mb-1">
                    Próximo Passo Recomendado por ZachAI:
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Você pode levar essas dúvidas ou aprofundar na sintaxe diretamente no Chat ou inspecionar funções no Analisador de Código.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    onClick={handleRestartQuiz}
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg border border-[#1a2744] bg-[#0c142b] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-500/40 hover:text-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Refazer Teste</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectLanguage(activeQuizLang.name);
                      handleCloseQuiz();
                      onNavigateToChatWithLanguage(activeQuizLang.name);
                    }}
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:opacity-95"
                  >
                    <MessageSquareCode className="h-3.5 w-3.5" />
                    <span>Aprofundar no Chat</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
