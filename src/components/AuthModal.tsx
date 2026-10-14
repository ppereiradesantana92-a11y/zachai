import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Crown,
  ArrowRight,
  Github,
  Globe,
} from 'lucide-react';
import { authService, SUPREME_OWNER_EMAIL, SUPREME_OWNER_NAME, INITIAL_SIGNUP_BONUS_CREDITS } from '../services/authService';
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
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Por favor, insira seu e-mail.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const user = authService.loginWithEmail(email, password);
      setIsLoading(false);
      onSuccess(user);
      onClose();
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email) {
      setError('Nome e E-mail são obrigatórios.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const user = authService.register({
        name,
        lastName,
        phone,
        email,
        password,
      });
      setIsLoading(false);
      onSuccess(user);
      onClose();
    }, 700);
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'github') => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      const user = authService.loginSocial(provider);
      setIsLoading(false);
      onSuccess(user);
      onClose();
    }, 600);
  };

  const handleQuickSupremeOwner = () => {
    setIsLoading(true);
    setTimeout(() => {
      const owner = authService.loginAsSupremeOwner();
      setIsLoading(false);
      onSuccess(owner);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#070c1d] p-6 shadow-2xl shadow-cyan-950/60 sm:p-8">
        {/* Glow decoration */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-600/20 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-[#1b2b4a] bg-[#0c142b] text-slate-400 hover:text-white hover:border-cyan-500/40"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
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
              ? 'Acesse seu ambiente com Alex IA e continue seus códigos'
              : `Cadastre-se e ganhe ${INITIAL_SIGNUP_BONUS_CREDITS} créditos de bônus imediato`}
          </p>
        </div>

        {/* Bonus Banner */}
        <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 px-3.5 py-2.5 text-xs text-cyan-200">
          <Sparkles className="h-4 w-4 shrink-0 text-cyan-400 animate-pulse" />
          <span>
            <strong>Bônus de Boas-Vindas:</strong> Novos cadastros recebem{' '}
            <strong className="text-white font-bold">{INITIAL_SIGNUP_BONUS_CREDITS} créditos grátis</strong> para criar e refatorar!
          </span>
        </div>

        {/* Tabs: Entrar / Cadastrar */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg border border-[#182744] bg-[#0a1024] p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
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
            }}
            className={`rounded-md py-1.5 text-xs font-semibold transition-all ${
              mode === 'register'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 p-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Social Logins */}
        <div className="space-y-2 mb-5">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSocialLogin('google')}
              type="button"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-[#1b2b4a] bg-[#0b1329] py-2 text-xs font-medium text-slate-200 hover:border-cyan-500/40 hover:bg-[#0f1a38] transition-all"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
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
              <span>Google</span>
            </button>

            <button
              onClick={() => handleSocialLogin('github')}
              type="button"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-[#1b2b4a] bg-[#0b1329] py-2 text-xs font-medium text-slate-200 hover:border-cyan-500/40 hover:bg-[#0f1a38] transition-all"
            >
              <Github className="h-3.5 w-3.5 text-white" />
              <span>GitHub</span>
            </button>

            <button
              onClick={() => handleSocialLogin('facebook')}
              type="button"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-[#1b2b4a] bg-[#0b1329] py-2 text-xs font-medium text-slate-200 hover:border-cyan-500/40 hover:bg-[#0f1a38] transition-all"
            >
              <svg className="h-3.5 w-3.5 text-blue-500 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#182744]" />
            </div>
            <span className="relative bg-[#070c1d] px-2 text-[10px] uppercase tracking-wider text-slate-400">
              Ou continue com e-mail
            </span>
          </div>
        </div>

        {/* Forms */}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full rounded-lg border border-[#1b2b4a] bg-[#0a1024] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#1b2b4a] bg-[#0a1024] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all"
            >
              {isLoading ? (
                <span>Entrando...</span>
              ) : (
                <>
                  <span>Entrar no Zach AI</span>
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
                    className="w-full rounded-lg border border-[#1b2b4a] bg-[#0a1024] py-1.5 pl-8 pr-2 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
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
                  className="w-full rounded-lg border border-[#1b2b4a] bg-[#0a1024] py-1.5 px-3 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-0.5">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full rounded-lg border border-[#1b2b4a] bg-[#0a1024] py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
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
                  className="w-full rounded-lg border border-[#1b2b4a] bg-[#0a1024] py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-0.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#1b2b4a] bg-[#0a1024] py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all"
            >
              {isLoading ? (
                <span>Criando conta e creditando bônus...</span>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Cadastrar e Receber 300 Créditos</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Access for Pedro Henrique (Supreme Owner) */}
        <div className="mt-5 pt-4 border-t border-[#142347]">
          <button
            onClick={handleQuickSupremeOwner}
            type="button"
            className="w-full flex items-center justify-between rounded-lg border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-amber-950/40 p-2.5 text-left text-xs transition-all hover:border-amber-400 hover:scale-[1.01]"
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
