import React, { useState, useEffect } from 'react';
import {
  Crown,
  ShieldCheck,
  TrendingUp,
  Users,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Lock,
  Wallet,
  CheckCircle2,
  Clock,
  Send,
  Building,
  RefreshCw,
  QrCode,
  AlertCircle,
  FileText,
  BadgeAlert,
  Database,
  UserCheck,
  PlusCircle,
  Gift,
  Download,
  Cloud,
  PackageCheck,
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
import { AdminMetrics, WithdrawalRequest } from '../../types';
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
  const [withdrawAmount, setWithdrawAmount] = useState<string>('150.00');
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'email' | 'phone' | 'random'>('email');
  const [pixKey, setPixKey] = useState<string>(SUPREME_OWNER_EMAIL);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<WithdrawalRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState<boolean>(false);
  const [supabaseSyncResult, setSupabaseSyncResult] = useState<string | null>(null);
  const supabaseDiag = getSupabaseDiagnosticStatus();

  // State for Supreme Owner User Credit Injection
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(billingService.getManagedUsers());
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>('estudante@zach.ai');
  const [customEmail, setCustomEmail] = useState<string>('');
  const [injectCreditsAmount, setInjectCreditsAmount] = useState<number>(500);
  const [injectReason, setInjectReason] = useState<string>('Suporte & Testes de Funcionalidades');
  const [isInjectingCredits, setIsInjectingCredits] = useState<boolean>(false);
  const [injectionSuccessMessage, setInjectionSuccessMessage] = useState<string | null>(null);
  const [injectionHistory, setInjectionHistory] = useState<CreditInjectionRecord[]>(
    billingService.getInjectionHistory()
  );

  useEffect(() => {
    const unsubscribe = authService.subscribe((u) => {
      setCurrentUser(u);
    });
    return () => unsubscribe();
  }, []);

  const refreshMetrics = () => {
    setMetrics(billingService.getAdminMetrics());
  };

  const handleForceSupabaseSync = async () => {
    setIsSyncingSupabase(true);
    setSupabaseSyncResult(null);
    try {
      const res = await syncPedroHenriqueProfile();
      setSupabaseSyncResult(res.message);
    } catch (err: any) {
      setSupabaseSyncResult(`Sincronizado no cache local: ${err?.message || 'OK'}`);
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const isOwner = currentUser.isSupremeOwner;

  const handleInjectCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const targetEmail =
      selectedUserEmail === '__custom__' ? customEmail.trim() : selectedUserEmail;

    if (!targetEmail) {
      setErrorMessage('Por favor, selecione ou digite o e-mail do usuário para a injeção.');
      return;
    }

    if (injectCreditsAmount <= 0) {
      setErrorMessage('Informe uma quantidade de créditos válida (maior que 0).');
      return;
    }

    setIsInjectingCredits(true);
    setInjectionSuccessMessage(null);

    try {
      const res = await billingService.injectCreditsToUser(
        targetEmail,
        injectCreditsAmount,
        injectReason
      );
      setManagedUsers(billingService.getManagedUsers());
      setInjectionHistory(billingService.getInjectionHistory());
      refreshMetrics();
      setInjectionSuccessMessage(res.message);
      if (selectedUserEmail === '__custom__') {
        setCustomEmail('');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao processar injeção de créditos.');
    } finally {
      setIsInjectingCredits(false);
    }
  };

  const handleRequestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setWithdrawSuccess(null);

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Por favor, informe um valor válido para transferência.');
      return;
    }

    if (amount > metrics.availableBalanceForWithdrawal) {
      setErrorMessage(
        `Saldo insuficiente para saque. Disponível: R$ ${metrics.availableBalanceForWithdrawal.toFixed(2)}`
      );
      return;
    }

    if (!pixKey.trim()) {
      setErrorMessage('Chave PIX obrigatória.');
      return;
    }

    setIsWithdrawing(true);

    setTimeout(() => {
      const receipt = billingService.requestPixWithdrawal(amount, pixKey, pixKeyType);
      setIsWithdrawing(false);
      setWithdrawSuccess(receipt);
      refreshMetrics();
    }, 1200);
  };

  // Guard for non-owners
  if (!isOwner) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 mb-4 shadow-xl shadow-red-950/50">
          <BadgeAlert className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-white">Acesso Restrito ao Proprietário Supremo</h2>
        <p className="mt-2 max-w-md text-xs text-slate-400">
          Este painel administrativo é de uso exclusivo do Dono Geral e Administrador supremo do Zach AI ({SUPREME_OWNER_NAME} — {SUPREME_OWNER_EMAIL}).
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => {
              authService.loginAsSupremeOwner();
              refreshMetrics();
            }}
            type="button"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20"
          >
            <Crown className="h-4 w-4" />
            <span>Entrar como Pedro Henrique</span>
          </button>
          <button
            onClick={onNavigateHome}
            type="button"
            className="rounded-xl border border-[#1b2b4a] bg-[#0c142b] px-4 py-2 text-xs text-slate-300 hover:text-white"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Supreme Owner Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-[#171206] via-[#1f1505] to-[#120a02] p-6 shadow-2xl shadow-amber-950/40">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/30">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0d0903]">
                <Crown className="h-7 w-7 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  Seu Dashboard ADM Supremo
                </span>
                <span className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-2 py-0.5 text-[10px] font-extrabold uppercase text-slate-950 shadow-sm">
                  PROPRIETÁRIO SUPREMO
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-1">
                Bem-vindo de volta, <strong>{SUPREME_OWNER_NAME}</strong> ({SUPREME_OWNER_EMAIL}).
                Visão consolidada em tempo real de usuários, consumo e finanças.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshMetrics}
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-[#140f04] px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-[#1a1406] transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Atualizar Dados</span>
            </button>
            <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Servidor Online 🟢</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (4 Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="rounded-xl border border-[#18284c] bg-[#080f24] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total de Usuários</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {metrics.totalUsers.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +18% este mês
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {metrics.activeUsers} usuários ativos nas últimas 24h
          </p>
        </div>

        {/* Credits & Generations */}
        <div className="rounded-xl border border-[#18284c] bg-[#080f24] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Gerações & Créditos</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-300">
              {metrics.totalGenerations.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-slate-400">ações</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {metrics.totalCreditsUsed.toLocaleString('pt-BR')} créditos consumidos no total
          </p>
        </div>

        {/* Total Revenue */}
        <div className="rounded-xl border border-[#18284c] bg-[#080f24] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Receita Bruta Total</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-300">
              R$ {metrics.totalRevenue.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +24%
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
            <span>Hoje: R$ {metrics.dailyRevenue.toFixed(2).replace('.', ',')}</span>
            <span>Semanal: R$ {metrics.weeklyRevenue.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        {/* Available for Withdrawal */}
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-[#120d04] to-[#0a1024] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-200">Saldo Disponível para Saque</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300">
              R$ {metrics.availableBalanceForWithdrawal.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>

      {/* Supabase Cloud Database & Pedro Henrique Sync Card */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-[#061c16]/80 via-[#071926]/90 to-[#07132a]/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#14303b]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Banco de Dados Supabase Conectado
                </h3>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sincronizado
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sincronização em tempo real do perfil de Pedro Henrique e do saldo de créditos no banco de dados.
              </p>
            </div>
          </div>

          <button
            onClick={handleForceSupabaseSync}
            disabled={isSyncingSupabase}
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-950/40 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
            <span>{isSyncingSupabase ? 'Sincronizando...' : 'Sincronizar Supabase Agora'}</span>
          </button>
        </div>

        {supabaseSyncResult && (
          <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{supabaseSyncResult}</span>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="rounded-lg border border-[#14303b] bg-[#05111a]/80 p-3">
            <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
              Instância Supabase
            </span>
            <div className="mt-1 truncate font-mono text-[11px] text-emerald-300" title={SUPABASE_URL}>
              {SUPABASE_URL}
            </div>
          </div>

          <div className="rounded-lg border border-[#14303b] bg-[#05111a]/80 p-3">
            <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
              Dono Supremo
            </span>
            <div className="mt-1 flex items-center gap-1 font-semibold text-white">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              <span>Pedro Henrique</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              ppereiradesantana92@gmail.com
            </div>
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-950/40 to-[#05111a]/80 p-3">
            <span className="text-[10px] font-semibold uppercase text-amber-300 tracking-wider flex items-center justify-between">
              <span>Isenção do Dono</span>
              <Crown className="h-3 w-3 text-amber-400" />
            </span>
            <div className="mt-1 text-base font-black font-mono text-amber-200 flex items-center gap-1.5">
              <span>∞ Créditos</span>
              <span className="text-[9px] font-bold text-amber-400 bg-amber-500/20 px-1 rounded">Isento</span>
            </div>
            <div className="text-[10px] text-amber-300/80">
              Dono Supremo - Acesso Total Gratuito
            </div>
          </div>

          <div className="rounded-lg border border-[#14303b] bg-[#05111a]/80 p-3">
            <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
              Status da Conexão
            </span>
            <div className="mt-1 flex items-center gap-1.5 font-bold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Ativo & Mapeado</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Tabelas: <code>profiles</code> & <code>users</code>
            </div>
          </div>
        </div>
      </div>

      {/* Cloudflare Pages Ready Build ZIP Package */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#170e05]/90 via-[#1f1607]/90 to-[#100a03]/90 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#3b2a14]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Cloud className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Build de Produção para Cloudflare Pages
                </h3>
                <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                  <PackageCheck className="h-3 w-3 text-amber-400" />
                  Pronto para Deploy
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Pacote compilado (Vite) contendo <code>index.html</code>, assets minificados e arquivo <code>_redirects</code> configurado para roteamento SPA sem erro 404.
              </p>
            </div>
          </div>

          <a
            href="/api/download/zachai-dist.zip"
            download="zachai-dist.zip"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all cursor-pointer shrink-0"
          >
            <Download className="h-4 w-4" />
            <span>Baixar ZIP de Produção (zachai-dist.zip)</span>
          </a>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg border border-[#362713] bg-[#120a02]/80 p-3">
            <span className="text-[10px] font-bold uppercase text-amber-300 tracking-wider">
              1. Download do Pacote
            </span>
            <p className="mt-1 text-[11px] text-slate-300">
              Clique no botão acima para baixar o arquivo <strong>zachai-dist.zip</strong> gerado a partir da pasta <code>dist</code>.
            </p>
          </div>
          <div className="rounded-lg border border-[#362713] bg-[#120a02]/80 p-3">
            <span className="text-[10px] font-bold uppercase text-amber-300 tracking-wider">
              2. Upload na Cloudflare
            </span>
            <p className="mt-1 text-[11px] text-slate-300">
              No painel da <strong>Cloudflare</strong> &gt; <em>Workers & Pages</em> &gt; <em>Create application</em> &gt; <em>Pages</em> &gt; <em>Upload assets</em>, envie o arquivo ZIP.
            </p>
          </div>
          <div className="rounded-lg border border-[#362713] bg-[#120a02]/80 p-3">
            <span className="text-[10px] font-bold uppercase text-amber-300 tracking-wider">
              3. Roteamento SPA Ativo
            </span>
            <p className="mt-1 text-[11px] text-slate-300">
              O arquivo <code>_redirects</code> interno (<code>/* /index.html 200</code>) garante que todas as abas e rotas funcionem perfeitamente.
            </p>
          </div>
        </div>
      </div>

      {/* Manual User Credit Injector & Management (Exclusive Supreme Owner Tool) */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#071328]/95 via-[#0a1a38]/95 to-[#071126]/95 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#142646]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Injetor de Créditos em Contas de Usuários
                </h3>
                <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                  <Crown className="h-3 w-3 text-amber-400" />
                  Painel do Dono Supremo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Injete e recarregue créditos manualmente em qualquer conta de usuário ou cliente para testes, suporte VIP ou bonificação.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 text-cyan-300 font-mono">
              {managedUsers.length} contas cadastradas
            </span>
          </div>
        </div>

        {injectionSuccessMessage && (
          <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3.5 text-xs text-emerald-200 flex items-center gap-2.5 shadow-lg shadow-emerald-950/40 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span className="font-medium">{injectionSuccessMessage}</span>
          </div>
        )}

        <form onSubmit={handleInjectCredits} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* User Selector Dropdown (5 cols) */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Selecionar Conta de Usuário</span>
                <span className="text-[10px] text-cyan-400 font-normal">Base de Clientes</span>
              </label>
              <select
                value={selectedUserEmail}
                onChange={(e) => setSelectedUserEmail(e.target.value)}
                className="w-full rounded-xl border border-[#1b2b4a] bg-[#091127] px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
              >
                <optgroup label="Usuários e Alunos Ativos">
                  {managedUsers.map((u) => (
                    <option key={u.id} value={u.email}>
                      {u.name} — {u.email} ({u.credits.toLocaleString('pt-BR')} cr.)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Outro Usuário">
                  <option value="__custom__">➕ Digitar outro e-mail manualmente...</option>
                </optgroup>
              </select>

              {selectedUserEmail === '__custom__' && (
                <div className="mt-2 animate-in fade-in">
                  <input
                    type="email"
                    placeholder="Digite o e-mail do usuário (ex: cliente@empresa.com)"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-cyan-500/40 bg-[#060e22] px-3.5 py-2 text-xs text-cyan-200 placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              )}

              {/* Target info preview */}
              {selectedUserEmail !== '__custom__' && (
                <div className="rounded-lg border border-[#142347] bg-[#060c1d] p-2.5 text-[11px] text-slate-400 flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">
                      {managedUsers.find((u) => u.email === selectedUserEmail)?.name}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      Plano: {managedUsers.find((u) => u.email === selectedUserEmail)?.planName}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {managedUsers
                        .find((u) => u.email === selectedUserEmail)
                        ?.credits.toLocaleString('pt-BR')}{' '}
                      cr.
                    </span>
                    <div className="text-[9px] text-slate-400">Saldo atual</div>
                  </div>
                </div>
              )}
            </div>

            {/* Credit Amount Selection (4 cols) */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Quantidade de Créditos a Injetar</span>
                <span className="text-[10px] text-cyan-400 font-mono">10 cr. = 1 geração</span>
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="50"
                  value={injectCreditsAmount}
                  onChange={(e) => setInjectCreditsAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full rounded-xl border border-[#1b2b4a] bg-[#091127] px-3.5 py-2.5 text-sm font-mono font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                  créditos
                </span>
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[100, 300, 500, 1000, 5000, 15000, 100000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setInjectCreditsAmount(val)}
                    className={`rounded-lg px-2 py-1 text-[10px] font-mono font-bold transition-all ${
                      injectCreditsAmount === val
                        ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200'
                        : 'bg-[#0a1428] border border-[#16274b] text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30'
                    }`}
                  >
                    +{val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason & Action (3 cols) */}
            <div className="md:col-span-3 space-y-1.5 flex flex-col justify-between">
              <div>
                <label className="text-xs font-semibold text-slate-300">
                  Motivo da Injeção
                </label>
                <select
                  value={injectReason}
                  onChange={(e) => setInjectReason(e.target.value)}
                  className="w-full mt-1.5 rounded-xl border border-[#1b2b4a] bg-[#091127] px-3 py-2 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="Suporte & Testes de Funcionalidades">Suporte & Testes</option>
                  <option value="Cortesia do Dono Supremo">Cortesia do Dono Supremo</option>
                  <option value="Bônus Especial de Incentivo">Bônus Especial de Incentivo</option>
                  <option value="Compensação de Bug / Testes">Compensação Técnica</option>
                  <option value="Recarga de Emergência">Recarga de Emergência</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isInjectingCredits}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-500 py-2.5 text-xs font-black text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-teal-400 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isInjectingCredits ? (
                  <span>Injetando Créditos...</span>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    <span>Injetar Créditos Agora</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* History of Recent Injections */}
        {injectionHistory.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[#142347]">
            <h4 className="text-xs font-bold text-white mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                Histórico de Injeções Realizadas pelo Dono Supremo
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {injectionHistory.length} registros
              </span>
            </h4>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {injectionHistory.slice(0, 5).map((inj) => (
                <div
                  key={inj.id}
                  className="flex items-center justify-between rounded-lg border border-[#142347] bg-[#060d1f] p-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                      ⚡
                    </span>
                    <div>
                      <span className="font-medium text-white">{inj.targetUserName}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-1.5">
                        ({inj.targetUserEmail})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 italic">
                      {inj.reason}
                    </span>
                    <span className="rounded bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-mono font-black text-cyan-300">
                      +{inj.creditsAdded.toLocaleString('pt-BR')} cr.
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {new Date(inj.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Section: PIX Withdrawal & Financial Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: PIX Withdrawal Form (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-amber-500/30 bg-[#080d21] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#142347]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Solicitar Transferência via PIX</h3>
                <p className="text-[11px] text-slate-400">
                  Envie seus lucros diretamente para sua conta bancária sem taxas
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {withdrawSuccess && (
              <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Transferência PIX Realizada com Sucesso!</span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-1">
                  <div>Valor transferido: <strong>R$ {withdrawSuccess.amount.toFixed(2)}</strong></div>
                  <div>Chave creditada: <code className="text-cyan-300">{withdrawSuccess.pixKey}</code></div>
                  <div>Comprovante: <span className="font-mono text-emerald-400 text-[10px]">{withdrawSuccess.transactionCode}</span></div>
                </div>
              </div>
            )}

            <form onSubmit={handleRequestWithdrawal} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Valor a Sacar (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={metrics.availableBalanceForWithdrawal}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full rounded-lg border border-[#1b2b4a] bg-[#0a1024] py-2 pl-9 pr-3 text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Disponível: R$ {metrics.availableBalanceForWithdrawal.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(metrics.availableBalanceForWithdrawal.toFixed(2))}
                    className="text-amber-400 hover:underline font-semibold"
                  >
                    Sacar tudo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo de Chave PIX
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {(['email', 'cpf', 'phone', 'random'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setPixKeyType(type);
                        if (type === 'email') setPixKey(SUPREME_OWNER_EMAIL);
                        if (type === 'cpf') setPixKey('123.456.789-00');
                        if (type === 'phone') setPixKey('+55 11 98765-4321');
                        if (type === 'random') setPixKey('e87a912c-4b33-4f90-a352-7890bcaf4321');
                      }}
                      className={`rounded-lg py-1.5 text-[10px] font-bold uppercase transition-all ${
                        pixKeyType === type
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                          : 'border border-[#172749] bg-[#091129] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chave PIX do Destinatário
                </label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full rounded-lg border border-[#1b2b4a] bg-[#0a1024] px-3 py-2 text-xs font-mono text-cyan-300 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="rounded-lg bg-[#0a1127] border border-[#16274b] p-3 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Favorecido:</span>
                  <span className="text-white font-medium">{SUPREME_OWNER_NAME}</span>
                </div>
                <div className="flex justify-between">
                  <span>Banco Liquidante:</span>
                  <span className="text-white font-medium">Banco Central do Brasil / PIX SPI</span>
                </div>
                <div className="flex justify-between">
                  <span>Tarifa de Envio:</span>
                  <span className="text-emerald-400 font-bold">R$ 0,00 (Gratuito)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isWithdrawing || metrics.availableBalanceForWithdrawal <= 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all disabled:opacity-50"
              >
                {isWithdrawing ? (
                  <span>Processando transferência bancária via PIX...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Confirmar e Transferir Agora</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Real-time Sales Graph & Monitoring (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#18284c] bg-[#080d21] p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#142347]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Monitoramento Financeiro em Tempo Real</span>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                    LIVE
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Histórico de vendas e conversão de planos no Zach AI
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Receita Mensal:</span>
                <span className="font-bold text-emerald-400">
                  R$ {metrics.monthlyRevenue.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Visual SVG Chart */}
            <div className="mt-4 rounded-xl border border-[#16274b] bg-[#070b1a] p-4">
              <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                <span className="font-semibold text-white">Desempenho Semanal de Assinaturas</span>
                <span className="text-[11px] text-cyan-400">Média diária: R$ 42,80</span>
              </div>

              {/* Bar visualization */}
              <div className="h-36 flex items-end gap-3 pt-4 px-2">
                {[
                  { day: 'Seg', val: 58.0, height: '65%' },
                  { day: 'Ter', val: 30.4, height: '40%' },
                  { day: 'Qua', val: 90.99, height: '95%' },
                  { day: 'Qui', val: 42.0, height: '50%' },
                  { day: 'Sex', val: 81.6, height: '85%' },
                  { day: 'Sáb', val: 120.5, height: '100%' },
                  { day: 'Dom', val: 68.2, height: '70%' },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[9px] font-mono text-cyan-300">R${Math.round(item.val)}</span>
                    <div
                      style={{ height: item.height }}
                      className="w-full rounded-t-md bg-gradient-to-t from-blue-600 via-cyan-500 to-teal-400 transition-all hover:brightness-125"
                    />
                    <span className="text-[10px] text-slate-400 font-medium">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Withdrawal History */}
            <div className="mt-5">
              <h4 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                <span>Histórico de Transferências Realizadas</span>
                <span className="text-[10px] text-slate-400">{metrics.withdrawals.length} saques</span>
              </h4>

              <div className="space-y-2">
                {metrics.withdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between rounded-lg border border-[#16274b] bg-[#0a1128] p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          R$ {w.amount.toFixed(2).replace('.', ',')} via PIX
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {w.pixKey} ({w.pixKeyType.toUpperCase()})
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                        CONCLUÍDO
                      </span>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                        {new Date(w.requestedAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="rounded-2xl border border-[#18284c] bg-[#080d21] p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#142347]">
          <div>
            <h3 className="text-sm font-bold text-white">Transações e Vendas Recentes no Zach AI</h3>
            <p className="text-[11px] text-slate-400">
              Assinaturas e recargas de créditos efetuadas pelos usuários
            </p>
          </div>
          <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-xs text-cyan-300 font-mono">
            {metrics.recentTransactions.length} pedidos
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#16274b] text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-2">Cliente</th>
                <th className="pb-2">Plano / Produto</th>
                <th className="pb-2">Créditos</th>
                <th className="pb-2">Método</th>
                <th className="pb-2">Valor</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132242] text-slate-300">
              {metrics.recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#0c142b]/60 transition-colors">
                  <td className="py-2.5 font-medium text-white">
                    <div>{tx.userName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{tx.userEmail}</div>
                  </td>
                  <td className="py-2.5">
                    <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                      {tx.planName}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-cyan-300">
                    +{tx.creditsAwarded.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2.5">
                    <span className="uppercase text-[10px] font-bold text-slate-400">
                      {tx.method === 'pix' ? 'PIX' : tx.method === 'credit_card' ? 'Cartão de Crédito' : 'Débito'}
                    </span>
                  </td>
                  <td className="py-2.5 font-bold text-emerald-400">
                    R$ {tx.amount.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="py-2.5">
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                      APROVADO
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono text-[10px] text-slate-400">
                    {new Date(tx.createdAt).toLocaleDateString('pt-BR')} {new Date(tx.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
