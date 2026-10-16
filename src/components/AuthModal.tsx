import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Sparkles,
  Crown,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import {
  authService,
  SUPREME_OWNER_EMAIL,
  SUPREME_OWNER_NAME,
  INITIAL_SIGNUP_BONUS_CREDITS,
  isSupremeOwnerUser,
} from '../services/authService';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSupremeOwnerEntered = isSupremeOwnerUser(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Por favor, insira seu e-mail.');
      return;
    }

    if (!password) {
      setError('Por favor, digite sua senha de acesso.');
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate via Supabase Auth (signInWithPassword)
      const res = await authService.signInWithPassword(cleanEmail, password);

      if (res.error) {
        setError(res.error);
        setIsLoading(false);
        return;
      }

      if (res.user) {
        if (res.user.isSupremeOwner) {
          setSuccessMessage('Bem-vindo, Dono Supremo! Acesso irrestrito concedido.');
        }
        setTimeout(() => {
          setIsLoading(false);
          onSuccess(res.user!);
          onClose();
        }, 300);
      } else {
        setIsLoading(false);
        setError('Não foi possível autenticar. Verifique seus dados.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Erro inesperado durante a autenticação.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail) {
      setError('Nome e E-mail são obrigatórios.');
      return;
    }

    if (!password || password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      // Register via Supabase Auth (signUp)
      const res = await authService.signUpWithSupabase({
        name: cleanName,
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: cleanEmail,
        password,
      });

      if (res.error) {
        setError(res.error);
        setIsLoading(false);
        return;
      }

      if (res.emailConfirmationRequired) {
        setIsLoading(false);
        setSuccessMessage(
          'Conta criada com sucesso! Verifique seu e-mail para confirmar a ativação ou faça login.'
        );
        if (res.user) {
          setTimeout(() => {
            onSuccess(res.user!);
            onClose();
          }, 1500);
        }
        return;
      }

      if (res.user) {
        setTimeout(() => {
          setIsLoading(false);
          onSuccess(res.user!);
          onClose();
        }, 400);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Erro inesperado ao criar conta no Supabase.');
    }
  };

  const handleQuickSupremeOwner = () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setTimeout(() => {
      const owner = authService.loginAsSupremeOwner();
      setIsLoading(false);
      onSuccess(owner);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#070c1d] p-6 shadow-2xl shadow-cyan-950/60 sm:p-8">
        {/* Glow decoration */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-600/20 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Fechar"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-[#1b2b4a] bg-[#0c142b] text-slate-400 hover:text-white hover:border-cyan-500/40 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/30">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#070c1d]">
              <Sparkles className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {mode === 'login' ? 'Entrar no Zach AI' : 'Criar Conta no Zach AI'}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {mode === 'login'
              ? 'Autenticação nativa com E-mail e Senha protegida via Supabase Auth'
              : `Cadastre-se com E-mail e Senha para ganhar ${INITIAL_SIGNUP_BONUS_CREDITS} créditos de bônus`}
          </p>
        </div>

        {/* Welcome Bonus Banner */}
        <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 px-3.5 py-2.5 text-xs text-cyan-200">
          <Sparkles className="h-4 w-4 shrink-0 text-cyan-400 animate-pulse" />
          <span>
            <strong>Bônus de Boas-Vindas:</strong> Novos cadastros recebem{' '}
            <strong className="text-white font-bold">{INITIAL_SIGNUP_BONUS_CREDITS} créditos grátis</strong> para criar e refatorar!
          </span>
        </div>

        {/* Tabs: Entrar / Cadastrar */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg border border-[#182744] bg-[#0a1024] p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`rounded-md py-1.5 text-xs font-semibold transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Entrar (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`rounded-md py-1.5 text-xs font-semibold transition-all ${
              mode === 'register'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Criar Conta (Cadastro)
          </button>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 p-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Success Feedback */}
        {successMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Supreme Owner Live Detection Banner */}
        {isSupremeOwnerEntered && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/50 bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-amber-950/60 p-2.5 text-xs text-amber-200 shadow-md shadow-amber-950/40 animate-in fade-in">
            <Crown className="h-4 w-4 shrink-0 text-amber-400 animate-bounce" />
            <div className="text-[11px] leading-tight">
              <strong className="text-amber-300">Dono Supremo Detectado!</strong>
              <p className="text-[10px] text-amber-200/80">
                Acesso automático com créditos ilimitados (0 custo) e selo VIP permanente.
              </p>
            </div>
          </div>
        )}

        {/* 100% Native Email & Password Forms */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ppereiradesantana92@gmail.com ou seu@email.com"
                  className="w-full rounded-lg border border-[#1b2b4a] bg-[#0a1024] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  Senha
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#1b2b4a] bg-[#0a1024] py-2 pl-9 pr-9 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:opacity-95 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Autenticando via Supabase...</span>
                </>
              ) : (
                <>
                  <span>Entrar com E-mail e Senha</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-0.5">
                  Nome
                </label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Pedro"
                    className="w-full rounded-lg border border-[#1b2b4a] bg-[#0a1024] py-1.5 pl-8 pr-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-0.5">
                  Sobrenome
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Henrique"
                  className="w-full rounded-lg border border-[#1b2b4a] bg-[#0a1024] py-1.5 px-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-0.5">
                Telefone / WhatsApp (Opcional)
              </label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full rounded-lg border border-[#1b2b4a] bg-[#0a1024] py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-0.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full rounded-lg border border-[#1b2b4a] bg-[#0a1024] py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-0.5">
                Senha (mínimo 6 dígitos)
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#1b2b4a] bg-[#0a1024] py-1.5 pl-8 pr-8 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:opacity-95 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Cadastrando no Supabase...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Criar Conta e Receber {INITIAL_SIGNUP_BONUS_CREDITS} Créditos</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Access for Pedro Henrique (Supreme Owner) */}
        <div className="mt-5 pt-4 border-t border-[#142347]">
          <button
            onClick={handleQuickSupremeOwner}
            disabled={isLoading}
            type="button"
            className="w-full flex items-center justify-between rounded-lg border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-amber-950/40 p-2.5 text-left text-xs transition-all hover:border-amber-400 hover:scale-[1.01] disabled:opacity-50"
            title="Acesso imediato para o Dono Supremo Pedro Henrique com créditos ilimitados"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-500/20 text-amber-400">
                <Crown className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="font-bold text-amber-200 text-[11px] flex items-center gap-1">
                  <span>Acesso Dono Supremo</span>
                  <span className="text-[9px] bg-amber-500/30 text-amber-300 px-1 py-0.2 rounded font-mono">
                    ADM
                  </span>
                </div>
                <div className="text-[10px] text-amber-400/80 font-mono">
                  {SUPREME_OWNER_EMAIL}
                </div>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
