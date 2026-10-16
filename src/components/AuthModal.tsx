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
  Github,
} from 'lucide-react';
import {
  authService,
  SUPREME_OWNER_EMAIL,
  INITIAL_SIGNUP_BONUS_CREDITS,
  isSupremeOwnerUser,
} from '../services/authService';
import { supabase } from '../lib/supabaseClient';
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
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<'google' | 'github' | 'facebook' | null>(null);
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
      setError('Por favor, informe seu endereço de e-mail.');
      return;
    }

    if (!password) {
      setError('Por favor, digite sua senha de acesso.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.signInWithPassword(cleanEmail, password);

      if (res.error) {
        setError(res.error);
        setIsLoading(false);
        return;
      }

      if (res.user) {
        if (res.user.isSupremeOwner) {
          setSuccessMessage('Acesso Dono Supremo confirmado! Painel administrativo liberado.');
        }
        setTimeout(() => {
          setIsLoading(false);
          onSuccess(res.user!);
          onClose();
        }, 300);
      } else {
        setIsLoading(false);
        setError('Não foi possível autenticar. Verifique suas credenciais.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Falha de comunicação no processo de login.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail) {
      setError('Nome e E-mail são campos obrigatórios.');
      return;
    }

    if (!password || password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
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
          'Conta criada! Um link de confirmação foi enviado ao seu e-mail para validação.'
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
        }, 350);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Erro inesperado ao registrar usuário.');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github' | 'facebook') => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    setSocialLoadingProvider(provider);

    try {
      const options: {
        redirectTo?: string;
        queryParams?: Record<string, string>;
      } = {
        redirectTo: window.location.origin,
      };

      if (provider === 'google') {
        options.queryParams = {
          prompt: 'select_account',
          access_type: 'offline',
        };
      }

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options,
      });

      if (oauthError) {
        setIsLoading(false);
        setSocialLoadingProvider(null);
        setError(`Falha ao conectar via ${provider.toUpperCase()}: ${oauthError.message}`);
        return;
      }

      if (data?.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setIsLoading(false);
      setSocialLoadingProvider(null);
      setError(`Erro inesperado com ${provider}: ${err?.message || err}`);
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
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-[#070b19] p-6 shadow-2xl shadow-cyan-950/40 sm:p-7">
        {/* Subtle accent glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl" />

        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Fechar"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand header */}
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-md shadow-cyan-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#070b19]">
              <Sparkles className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">
            {mode === 'login' ? 'Entrar no Zach AI' : 'Criar Nova Conta'}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {mode === 'login'
              ? 'Conecte-se para continuar seus projetos e consultar Alex IA'
              : `Cadastre-se e ganhe ${INITIAL_SIGNUP_BONUS_CREDITS} créditos de boas-vindas imediatamente`}
          </p>
        </div>

        {/* Welcome quota notification */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-cyan-500/20 bg-cyan-950/20 px-3 py-2 text-xs text-cyan-200">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>Cota Inicial de Boas-Vindas:</span>
          </div>
          <span className="font-bold text-white bg-cyan-500/20 px-2 py-0.5 rounded text-[11px] font-mono">
            {INITIAL_SIGNUP_BONUS_CREDITS} créditos
          </span>
        </div>

        {/* Social Login Options */}
        <div className="mb-4 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              type="button"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/50 py-2 px-2 text-xs font-medium text-slate-200 hover:border-slate-700 hover:bg-slate-900 disabled:opacity-50 transition-all"
              title="Entrar com sua conta Google oficial"
            >
              {socialLoadingProvider === 'google' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
              ) : (
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span className="truncate">Google</span>
            </button>

            <button
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
              type="button"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/50 py-2 px-2 text-xs font-medium text-slate-200 hover:border-slate-700 hover:bg-slate-900 disabled:opacity-50 transition-all"
              title="Entrar com sua conta GitHub oficial"
            >
              {socialLoadingProvider === 'github' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
              ) : (
                <Github className="h-3.5 w-3.5 text-white shrink-0" />
              )}
              <span className="truncate">GitHub</span>
            </button>

            <button
              onClick={() => handleSocialLogin('facebook')}
              disabled={isLoading}
              type="button"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/50 py-2 px-2 text-xs font-medium text-slate-200 hover:border-slate-700 hover:bg-slate-900 disabled:opacity-50 transition-all"
              title="Entrar com sua conta Facebook oficial"
            >
              {socialLoadingProvider === 'facebook' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
              ) : (
                <svg className="h-3.5 w-3.5 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
              <span className="truncate">Facebook</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center pt-1 pb-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-[#070b19] px-2 text-[10px] tracking-wider text-slate-400 uppercase font-medium">
              ou com e-mail e senha
            </span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
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
            Entrar
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
            Cadastrar (+500 cr.)
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-950/30 p-2.5 text-xs text-rose-300">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Real-time Supreme Owner Detection */}
        {isSupremeOwnerEntered && (
          <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-amber-500/40 bg-amber-950/30 p-2.5 text-xs text-amber-200 shadow-sm animate-in fade-in">
            <Crown className="h-4 w-4 shrink-0 text-amber-400 animate-pulse" />
            <div className="text-[11px] leading-tight">
              <strong className="text-amber-300 font-bold">Dono Supremo Detectado</strong>
              <p className="text-[10px] text-amber-300/80">
                Créditos ilimitados e acesso exclusivo ao Painel Administrativo.
              </p>
            </div>
          </div>
        )}

        {/* Forms */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
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
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-2 pl-9 pr-9 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
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
                  <span>Autenticando...</span>
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
                  <User className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Pedro"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-1.5 pl-8 pr-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
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
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-1.5 px-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-0.5">
                Telefone / WhatsApp (Opcional)
              </label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-0.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-0.5">
                Senha (mínimo 6 dígitos)
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-1.5 pl-8 pr-8 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300"
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
                  <span>Registrando conta...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Cadastrar e Receber {INITIAL_SIGNUP_BONUS_CREDITS} Créditos</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Access for Pedro Henrique (Supreme Owner) */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80">
          <button
            onClick={handleQuickSupremeOwner}
            disabled={isLoading}
            type="button"
            className="w-full flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-950/20 p-2 text-left text-xs transition-all hover:border-amber-400/60 hover:bg-amber-950/30 disabled:opacity-50"
            title="Acesso direto de Dono Supremo para Pedro Henrique"
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
