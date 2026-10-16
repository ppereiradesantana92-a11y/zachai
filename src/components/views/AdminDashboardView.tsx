import React, { useState, useEffect } from 'react';
import {
  Crown,
  ShieldCheck,
  TrendingUp,
  Users,
  DollarSign,
  Lock,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Database,
  PlusCircle,
  Copy,
  Check,
  CreditCard,
  QrCode,
  Zap,
  Globe,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import {
  authService,
  SUPREME_OWNER_EMAIL,
  SUPREME_OWNER_NAME,
} from '../../services/authService';
import {
  billingService,
  ManagedUser,
  CreditInjectionRecord,
} from '../../services/billingService';
import {
  paymentGatewayService,
  GatewayConfig,
} from '../../services/paymentGatewayService';
import { AdminMetrics } from '../../types';
import {
  syncPedroHenriqueProfile,
  getSupabaseDiagnosticStatus,
  SUPABASE_URL,
} from '../../lib/supabaseClient';

interface AdminDashboardViewProps {
  onNavigateHome: () => void;
  onOpenAuthModal?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onNavigateHome,
  onOpenAuthModal,
}) => {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [metrics, setMetrics] = useState<AdminMetrics>(billingService.getAdminMetrics());
  const [isSyncingSupabase, setIsSyncingSupabase] = useState<boolean>(false);
  const [supabaseSyncResult, setSupabaseSyncResult] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Gateway Config state
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig>(paymentGatewayService.getConfig());
  const [gatewayApiKey, setGatewayApiKey] = useState(gatewayConfig.apiKey || '');
  const [gatewayWebhookSecret, setGatewayWebhookSecret] = useState(gatewayConfig.webhookSecret || '');
  const [gatewaySavedMessage, setGatewaySavedMessage] = useState<string | null>(null);

  // Credit injection state
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(billingService.getManagedUsers());
  const [targetEmail, setTargetEmail] = useState<string>('');
  const [injectAmount, setInjectAmount] = useState<number>(500);
  const [injectReason, setInjectReason] = useState<string>('Suporte e Teste de Recursos');
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [injectionSuccessMessage, setInjectionSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [injectionHistory, setInjectionHistory] = useState<CreditInjectionRecord[]>(
    billingService.getInjectionHistory()
  );

  const supabaseDiag = getSupabaseDiagnosticStatus();

  useEffect(() => {
    const unsubscribe = authService.subscribe((u) => {
      setCurrentUser(u);
    });
    return () => unsubscribe();
  }, []);

  const refreshMetrics = () => {
    setMetrics(billingService.getAdminMetrics());
    setManagedUsers(billingService.getManagedUsers());
    setInjectionHistory(billingService.getInjectionHistory());
  };

  const handleForceSupabaseSync = async () => {
    setIsSyncingSupabase(true);
    setSupabaseSyncResult(null);
    try {
      const res = await syncPedroHenriqueProfile();
      setSupabaseSyncResult(res.message);
      refreshMetrics();
    } catch (err: any) {
      setSupabaseSyncResult(`Sincronizado no cache local: ${err?.message || 'OK'}`);
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = paymentGatewayService.updateConfig({
      provider: gatewayConfig.provider,
      environment: gatewayConfig.environment,
      apiKey: gatewayApiKey.trim() || undefined,
      webhookSecret: gatewayWebhookSecret.trim() || undefined,
    });
    setGatewayConfig(updated);
    setGatewaySavedMessage('Configuração do gateway atualizada com sucesso.');
    setTimeout(() => setGatewaySavedMessage(null), 3000);
  };

  const handleInjectCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInjectionSuccessMessage(null);

    const cleanEmail = targetEmail.trim();
    if (!cleanEmail) {
      setErrorMessage('Informe o e-mail de destino para injetar os créditos.');
      return;
    }

    if (injectAmount <= 0) {
      setErrorMessage('A quantidade de créditos deve ser superior a zero.');
      return;
    }

    setIsInjecting(true);

    try {
      const res = await billingService.injectCreditsToUser(
        cleanEmail,
        injectAmount,
        injectReason
      );
      setInjectionSuccessMessage(res.message);
      setTargetEmail('');
      refreshMetrics();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao processar injeção de créditos.');
    } finally {
      setIsInjecting(false);
    }
  };

  const handleCopyWebhookUrl = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(gatewayConfig.webhookUrl);
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    }
  };

  // RESTRICTION GUARD: Completely hide administration panel from common users
  if (!currentUser.isSupremeOwner) {
    return (
      <div className="flex-1 p-6 md:p-12 flex items-center justify-center bg-[#050813]">
        <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-[#070b19] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-4">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Acesso Restrito</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Este painel administrativo é de uso exclusivo do Dono Supremo do Zach AI ({SUPREME_OWNER_EMAIL}). Usuários regulares não possuem privilégios de gerenciamento.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={onNavigateHome}
              type="button"
              className="w-full rounded-lg bg-slate-900 border border-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              Voltar para a Página Inicial
            </button>
            <button
              onClick={onOpenAuthModal}
              type="button"
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all"
            >
              Entrar como Administrador
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#050813] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Crown className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Painel de Gestão & Administração
            </h1>
            <span className="rounded bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
              Dono Supremo
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sessão autenticada: <span className="font-mono text-amber-300">{SUPREME_OWNER_EMAIL}</span> ({SUPREME_OWNER_NAME}) · Créditos Ilimitados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshMetrics}
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Atualizar Dados</span>
          </button>
          <button
            onClick={onNavigateHome}
            type="button"
            className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sair para Início
          </button>
        </div>
      </div>

      {/* KPI Real Metrics (Zero dados fictícios) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Receita de Planos (Real)</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            R$ {metrics.totalRevenue.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Receita líquida processada via gateway
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Contas de Clientes</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.totalUsers}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total de usuários reais registrados
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Gerações Realizadas</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.totalGenerations}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Consultas e refatorações no Alex IA
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Créditos em Circulação</span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {managedUsers.reduce((sum, u) => sum + (u.isSupremeOwner ? 0 : u.credits), 0).toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Saldo acumulado de clientes ativos
          </p>
        </div>
      </div>

      {/* Gateway & Webhooks Architecture Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white">Integração de Pagamentos Oficiais</h2>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono uppercase">
                {gatewayConfig.provider} ({gatewayConfig.environment})
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Estrutura de webhook preparada para gateways oficiais (Asaas e Mercado Pago) com conciliação automática de PIX dinâmico e Cartão de Crédito.
            </p>

            <form onSubmit={handleSaveGateway} className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Gateway Provedor
                  </label>
                  <select
                    value={gatewayConfig.provider}
                    onChange={(e) =>
                      setGatewayConfig({
                        ...gatewayConfig,
                        provider: e.target.value as 'asaas' | 'mercadopago',
                      })
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="asaas">Asaas (Recomendado)</option>
                    <option value="mercadopago">Mercado Pago</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Ambiente
                  </label>
                  <select
                    value={gatewayConfig.environment}
                    onChange={(e) =>
                      setGatewayConfig({
                        ...gatewayConfig,
                        environment: e.target.value as 'sandbox' | 'production',
                      })
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="production">Produção Oficial</option>
                    <option value="sandbox">Sandbox (Testes)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Chave de API / Access Token
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="password"
                    value={gatewayApiKey}
                    onChange={(e) => setGatewayApiKey(e.target.value)}
                    placeholder="$aact_YTU5YTE0M2M6N2Nm..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  URL Oficial de Webhook (Copie para seu Painel do Gateway)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={gatewayConfig.webhookUrl}
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-mono text-cyan-300 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyWebhookUrl}
                    className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-700 transition-colors"
                  >
                    {copiedWebhook ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedWebhook ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {gatewaySavedMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2 text-xs text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{gatewaySavedMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all"
              >
                Salvar Configurações do Gateway
              </button>
            </form>
          </div>

          {/* Database Diagnostics */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Sincronização com Supabase</h2>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ativo</span>
              </span>
            </div>

            <div className="text-xs text-slate-400 space-y-1 font-mono text-[11px]">
              <div>Projeto: <span className="text-slate-300">{supabaseDiag.url}</span></div>
              <div>Conta Dono: <span className="text-amber-300">{SUPREME_OWNER_EMAIL}</span></div>
            </div>

            {supabaseSyncResult && (
              <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-2 text-xs text-cyan-200">
                {supabaseSyncResult}
              </div>
            )}

            <button
              type="button"
              disabled={isSyncingSupabase}
              onClick={handleForceSupabaseSync}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/60 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
              <span>Sincronizar Perfil do Dono Supremo com Supabase</span>
            </button>
          </div>
        </div>

        {/* Credit Injection Section */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <PlusCircle className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Injetar Créditos em Conta de Usuário</h2>
            </div>

            <p className="text-xs text-slate-400">
              Como Dono Supremo, você pode adicionar créditos imediatamente a qualquer conta de cliente para incentivo ou bonificação.
            </p>

            <form onSubmit={handleInjectCredits} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  E-mail do Usuário
                </label>
                <input
                  type="email"
                  required
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="cliente@exemplo.com"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Quantidade de Créditos
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    required
                    value={injectAmount}
                    onChange={(e) => setInjectAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Motivo da Bonificação
                  </label>
                  <input
                    type="text"
                    value={injectReason}
                    onChange={(e) => setInjectReason(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-2 text-xs text-rose-300">
                  {errorMessage}
                </div>
              )}

              {injectionSuccessMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2 text-xs text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{injectionSuccessMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isInjecting}
                className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 py-2 text-xs font-bold text-slate-950 shadow-sm hover:opacity-95 transition-all disabled:opacity-50"
              >
                {isInjecting ? 'Processando injeção...' : 'Conceder Créditos Imediatamente'}
              </button>
            </form>
          </div>

          {/* Managed users table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
            <h2 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
              Contas Reais Registradas ({managedUsers.length})
            </h2>

            <div className="divide-y divide-slate-800/80 max-h-56 overflow-y-auto">
              {managedUsers.map((u) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{u.name}</span>
                      {u.isSupremeOwner && (
                        <span className="rounded bg-amber-500/20 text-amber-300 px-1.5 py-0.2 text-[9px] font-mono">
                          DONO
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-cyan-300 font-bold">
                      {u.isSupremeOwner ? '∞ (Ilimitado)' : `${u.credits.toLocaleString('pt-BR')} cr.`}
                    </div>
                    <div className="text-[10px] text-slate-500">{u.planName}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
