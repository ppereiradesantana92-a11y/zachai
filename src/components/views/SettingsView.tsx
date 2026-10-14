import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Cpu,
  Save,
  Check,
  RotateCcw,
  Sliders,
  Terminal,
  Lock,
} from 'lucide-react';
import { AppSettings } from '../../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    const defaults: AppSettings = {
      preferredModel: 'ZachAI Core Engine (Etapa 1)',
      responseDetail: 'balanced',
      indentSize: 2,
      showLineNumbers: true,
      autoCopyCode: false,
      highContrast: false,
      language: 'pt-BR',
    };
    setLocalSettings(defaults);
    onUpdateSettings(defaults);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-1 border-b border-[#141e34] pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
          <Settings className="h-4 w-4" />
          <span>CONFIGURAÇÕES DO SISTEMA</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Preferências & Status Técnico
        </h1>
        <p className="text-sm text-slate-300">
          Configure preferências de formatação de código, comportamento das respostas e verifique as diretrizes de segurança da API.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Status da Integração (Requisito Crítico do Usuário) */}
        <div className="rounded-xl border border-cyan-500/30 bg-[#070e24] p-5 shadow-xl">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span>Transparência de Integração & Segurança (Etapa 1)</span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            Conforme as especificações de desenvolvimento do AI Studio, as chaves de API secretas (como <code className="font-mono text-cyan-300">GEMINI_API_KEY</code>)
            <strong> nunca devem ser expostas no navegador do usuário</strong>.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-lg border border-[#172545] bg-[#050a1a] p-3">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-cyan-400" />
                <span>Proteção de Chaves de API</span>
              </span>
              <p className="mt-1 text-slate-400 text-[11px] leading-relaxed">
                As chamadas ao modelo serão efetuadas exclusivamente pelo backend (<code className="font-mono">server.ts</code>) através de rotas proxy seguras (<code className="font-mono">/api/*</code>).
              </p>
            </div>

            <div className="rounded-lg border border-[#172545] bg-[#050a1a] p-3">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                <span>Estado da Fase Atual</span>
              </span>
              <p className="mt-1 text-slate-400 text-[11px] leading-relaxed">
                Primeira etapa implementada: interface profissional futurista, analisadores estáticos de código, correção de exceções e menus funcionais.
              </p>
            </div>
          </div>
        </div>

        {/* Preferências de Resposta do Assistente */}
        <div className="rounded-xl border border-[#141e35] bg-[#070c1b] p-5">
          <h2 className="text-sm font-semibold text-white mb-4">
            Comportamento do Assistente
          </h2>

          <div className="space-y-4 text-xs">
            {/* Nível de Detalhe */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Nível de detalhamento das explicações:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'concise', label: 'Direto & Sintético', desc: 'Foco no código puro com comentários essenciais' },
                  { id: 'balanced', label: 'Equilibrado (Recomendado)', desc: 'Explica o raciocínio e boas práticas' },
                  { id: 'comprehensive', label: 'Completo & Acadêmico', desc: 'Inclui análise de complexidade e arquitetura' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setLocalSettings({
                        ...localSettings,
                        responseDetail: item.id as any,
                      })
                    }
                    className={`rounded-lg border p-3 text-left transition-all ${
                      localSettings.responseDetail === item.id
                        ? 'border-cyan-500/60 bg-[#0c1632] text-cyan-300'
                        : 'border-[#172340] bg-[#091024] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-white text-xs">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Formatação de Código */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#131d33]">
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Indentação de código gerado:
                </label>
                <select
                  value={localSettings.indentSize}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      indentSize: Number(e.target.value) as 2 | 4,
                    })
                  }
                  className="w-full rounded-lg border border-[#172340] bg-[#091024] px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                >
                  <option value={2}>2 Espaços (Padrão Web / TypeScript)</option>
                  <option value={4}>4 Espaços (Padrão Python / Backend)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Exibição de linhas no editor:
                </label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showLineNumbers}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        showLineNumbers: e.target.checked,
                      })
                    }
                    className="rounded border-[#172340] bg-[#091024] text-cyan-500 focus:ring-0"
                  />
                  <span className="text-slate-300 text-xs">
                    Exibir numeração de linhas nos blocos de código
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restaurar padrões</span>
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                <span>Preferências salvas com sucesso!</span>
              </span>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:opacity-95"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Salvar Preferências</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
