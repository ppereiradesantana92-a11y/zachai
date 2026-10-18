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
  Palette,
  Sparkles,
  Zap,
  Layers,
  Code2,
  CreditCard,
  QrCode,
  Mail,
  Send,
  Loader2,
} from 'lucide-react';
import { AppSettings, AppTheme } from '../../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

const THEME_OPTIONS: Array<{
  id: AppTheme;
  name: string;
  desc: string;
  gradient: string;
  accentColor: string;
}> = [
  {
    id: 'neon-blue',
    name: 'Azul Neon (Padrão)',
    desc: 'Estética futurista com acentos elétricos ciano e azul cobalto.',
    gradient: 'from-blue-600 via-cyan-400 to-teal-400',
    accentColor: '#00d4ff',
  },
  {
    id: 'cyber-purple',
    name: 'Roxo Cyberpunk',
    desc: 'Acentos violeta vibrante e fúcsia para programadores noturnos.',
    gradient: 'from-purple-600 via-fuchsia-500 to-indigo-400',
    accentColor: '#c084fc',
  },
  {
    id: 'emerald-green',
    name: 'Verde Esmeralda',
    desc: 'Estilo terminal bio-sintético com tons esmeralda e menta.',
    gradient: 'from-emerald-600 via-teal-400 to-green-400',
    accentColor: '#34d399',
  },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [emailTestLoading, setEmailTestLoading] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<string | null>(null);

  const handleTestEmail = async () => {
    setEmailTestLoading(true);
    setEmailTestResult(null);
    try {
      const res = await fetch('/api/emails/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'ppereiradesantana92@gmail.com',
          name: 'Pedro Henrique',
          credits: 500,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailTestResult('✓ E-mail disparado com sucesso via Resend! (ID: ' + (data.id || 'ok') + ')');
      } else {
        setEmailTestResult('Aviso: ' + (data.error || 'Falha ao enviar'));
      }
    } catch (err: any) {
      setEmailTestResult('Erro: ' + (err?.message || 'Falha de conexão'));
    } finally {
      setEmailTestLoading(false);
    }
  };

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
      theme: 'neon-blue',
      enableRgbBorder: true,
    };
    setLocalSettings(defaults);
    onUpdateSettings(defaults);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
          <Settings className="h-4 w-4" />
          <span>CONFIGURAÇÕES DO SISTEMA</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Preferências & Customização Visual
        </h1>
        <p className="text-sm text-slate-300">
          Personalize a estética da interface, temas cromáticos, bordas LED e o comportamento do assistente Alex IA.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Customização Visual (Nova Seção Requisitada) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Customização Visual & Temas</h2>
            </div>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-mono">
              NOVO
            </span>
          </div>

          {/* Seleção de Temas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Paleta Cromática da Interface:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {THEME_OPTIONS.map((t) => {
                const isSelected = localSettings.theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setLocalSettings({ ...localSettings, theme: t.id })}
                    className={`rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-slate-900 shadow-md shadow-cyan-950/40 scale-[1.01]'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`h-4 w-12 rounded-full bg-gradient-to-r ${t.gradient}`} />
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-cyan-400" />
                      )}
                    </div>
                    <div className="font-bold text-white text-xs">{t.name}</div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-snug">{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Borda LED / RGB Fluida Switch */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold text-white">
                  Iluminação Ambiente: Borda LED / RGB Fluida
                </span>
                <span className="rounded bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400 px-1.5 py-0.2 text-[8px] font-black text-slate-950">
                  RGB
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ativa uma moldura de luz perimetral sutil e animada nas bordas da janela com gradiente suave.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={localSettings.enableRgbBorder}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, enableRgbBorder: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-purple-600"></div>
            </label>
          </div>
        </div>

        {/* Preferências de Resposta do Assistente Alex */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Comportamento do Assistente Alex IA</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1.5">
                Nível de detalhamento das respostas:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'concise', label: 'Direto & Sintético', desc: 'Foco exclusivo no código limpo e objetivo' },
                  { id: 'balanced', label: 'Equilibrado (Recomendado)', desc: 'Explica o raciocínio, contexto e boas práticas' },
                  { id: 'comprehensive', label: 'Completo & Acadêmico', desc: 'Inclui complexidade Big-O e arquitetura de dados' },
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
                        ? 'border-cyan-500 bg-slate-900 text-cyan-300'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-white text-xs">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
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
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value={2}>2 Espaços (Padrão Web / TypeScript / React)</option>
                  <option value={4}>4 Espaços (Padrão Python / Java / Backend)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Exibição de linhas no editor:
                </label>
                <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showLineNumbers}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        showLineNumbers: e.target.checked,
                      })
                    }
                    className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                  />
                  <span className="text-slate-300 text-xs">
                    Exibir numeração de linhas nos blocos de código
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Status de Produção & Segurança */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Segurança & Conformidade de Produção</h2>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            As chaves de API sensíveis e modelos generativos são acessados exclusivamente por proxy server-side (<code className="font-mono text-cyan-300">/api/*</code>).
            Nenhum segredo de infraestrutura é exposto ao navegador do usuário.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-cyan-400" />
                <span>Credenciais Criptografadas</span>
              </span>
              <p className="mt-1 text-slate-400 text-[11px]">
                Tokens de autenticação gerenciados via Supabase Auth com suporte a Bearer headers seguros.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                <span>Alex IA Core Engine</span>
              </span>
              <p className="mt-1 text-slate-400 text-[11px]">
                Modo agente, auditoria estática, playground com execução segura em sandbox iframe.
              </p>
            </div>
          </div>
        </div>

        {/* Integração Gateway Asaas Oficial (API v3) */}
        <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-teal-500/20">
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-teal-400" />
              <h2 className="text-sm font-bold text-white">Gateway de Pagamentos Oficial Asaas (API v3)</h2>
            </div>
            <span className="rounded bg-teal-500/20 border border-teal-500/40 px-2 py-0.5 text-[10px] font-bold text-teal-300">
              PRODUÇÃO ATIVA
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Processamento automatizado de assinaturas e recargas de créditos via <strong>PIX Dinâmico (QR Code / Copia e Cola)</strong> e <strong>Cartão de Crédito</strong> através da API Oficial do Asaas (<code className="font-mono text-teal-300">https://www.asaas.com/api/v3/</code>).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-teal-400" />
                <span>Webhook em Tempo Real</span>
              </span>
              <p className="mt-1 text-slate-400 text-[11px]">
                Evento <code className="text-teal-300">PAYMENT_RECEIVED</code> credita instantaneamente o saldo do usuário.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Notificações Visuais (Toast)</span>
              </span>
              <p className="mt-1 text-slate-400 text-[11px]">
                Pop-up no aplicativo avisando em tempo real assim que o pagamento for liquidado.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>Armazenamento Seguro</span>
              </span>
              <p className="mt-1 text-slate-400 text-[11px]">
                Chave mantida sob sigilo no servidor através da variável <code className="text-cyan-300">ASAAS_API_KEY</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Integração Oficial de E-mails Transacionais Resend */}
        <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sky-500/20">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white">Serviço de E-mails Transacionais Resend (resend.com)</h2>
            </div>
            <span className="rounded bg-sky-500/20 border border-sky-500/40 px-2 py-0.5 text-[10px] font-bold text-sky-300">
              API OFICIAL ATIVA
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Serviço de entrega de alta performance para todos os e-mails transacionais do ecossistema Zach AI, integrando com templates HTML responsivos modernos e chave segura <code className="font-mono text-sky-300">RESEND_API_KEY</code>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>E-mail de Boas-Vindas</span>
              </span>
              <p className="mt-1 text-slate-400 text-[11px]">
                Enviado automaticamente no cadastro com a liberação de 500 créditos.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Recuperação de Senha</span>
              </span>
              <p className="mt-1 text-slate-400 text-[11px]">
                Código numérico PIN de 6 dígitos com validade segura de 30 minutos.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Confirmação Asaas</span>
              </span>
              <p className="mt-1 text-slate-400 text-[11px]">
                Comprovante automático disparado no evento <code className="text-emerald-300">PAYMENT_RECEIVED</code>.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-800/60">
            <div className="text-[11px] text-slate-400">
              {emailTestResult ? (
                <span className={emailTestResult.startsWith('✓') ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                  {emailTestResult}
                </span>
              ) : (
                <span>Remetente configurado: <code className="text-sky-300 font-mono">onboarding@resend.dev</code></span>
              )}
            </div>

            <button
              type="button"
              onClick={handleTestEmail}
              disabled={emailTestLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-900/30 px-3 py-1.5 text-xs font-semibold text-sky-200 hover:bg-sky-800/40 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {emailTestLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Disparando teste...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Disparar E-mail de Teste</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
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
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all"
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
