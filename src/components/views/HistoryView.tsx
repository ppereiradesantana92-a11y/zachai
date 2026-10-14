import React, { useState } from 'react';
import {
  History,
  MessageSquare,
  Search,
  Trash2,
  ArrowRight,
  Clock,
  Layers,
  Bug,
  BookOpen,
} from 'lucide-react';
import { ChatSession } from '../../types';

interface HistoryViewProps {
  sessions: ChatSession[];
  onOpenSession: (session: ChatSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAllSessions: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  onOpenSession,
  onDeleteSession,
  onClearAllSessions,
}) => {
  const [search, setSearch] = useState('');

  const filteredSessions = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.preview.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-1 border-b border-[#141e34] pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
          <History className="h-4 w-4" />
          <span>SESSÕES ANTERIORES</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Histórico de Conversas
        </h1>
        <p className="text-sm text-slate-300">
          Acesse diagnósticos, análises e trechos de código gerados anteriormente com o ZachAI.
        </p>
      </div>

      {/* Search & Actions Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar no histórico de código..."
            className="w-full rounded-lg border border-[#172340] bg-[#080e22] py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {sessions.length > 0 && (
          <button
            onClick={onClearAllSessions}
            type="button"
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Limpar todo o histórico</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="flex flex-col justify-between gap-3 rounded-xl border border-[#141e35] bg-[#070c1b] p-4 transition-all hover:border-cyan-500/40 hover:bg-[#091126] sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0e1834] text-cyan-400 border border-[#1b2b4e]">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">
                  {session.title}
                </h2>
                <p className="mt-0.5 text-xs text-slate-300 line-clamp-1">
                  {session.preview}
                </p>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{session.lastUpdated}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{session.messages.length} mensagens trocadas</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => onDeleteSession(session.id)}
                type="button"
                aria-label="Excluir sessão"
                className="rounded p-1.5 text-slate-500 hover:bg-rose-950/40 hover:text-rose-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                onClick={() => onOpenSession(session)}
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-[#0c1630] px-3 py-1.5 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-950/60"
              >
                <span>Reabrir</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredSessions.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#1a2744] p-12 text-center">
            <History className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <h3 className="text-sm font-semibold text-slate-300">
              Nenhuma sessão registrada
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Inicie uma nova conversa no Chat ou submeta um prompt no Início para registrar no histórico.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
