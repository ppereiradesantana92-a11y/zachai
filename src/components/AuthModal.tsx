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
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import {
  authService,
  SUPREME_OWNER_EMAIL,
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
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(initialMode);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

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
          setSuccessMessage('Acesso Dono Supremo autorizado! Painel ADM e créditos ilimitados liberados.');
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
      setError(err?.message || 'Falha de comunicação durante o login.');
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
          'Conta cadastrada com sucesso! Um e-mail de ativação foi enviado para confirmação.'
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
        setSuccessMessage(
          `Conta criada com sucesso! Enviamos um e-mail de boas-vindas para ${cleanEmail} com seus ${INITIAL_SIGNUP_BONUS_CREDITS} créditos liberados.`
        );
        setTimeout(() => {
          setIsLoading(false);
          onSuccess(res.user!);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Erro inesperado ao cadastrar conta no Supabase.');
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.requestPasswordReset(cleanEmail, name);
      setIsLoading(false);

      if (res.success) {
        setResetStep('verify');
        setSuccessMessage(
          'Código de verificação de 6 dígitos enviado via Resend! Verifique sua caixa de entrada e spam.'
        );
      } else {
        setError(res.error || 'Falha ao enviar e-mail de recuperação. Verifique o e-mail digitado.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Erro de comunicação ao solicitar recuperação.');
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    const cleanCode = resetCode.trim();

    if (!cleanCode || cleanCode.length < 6) {
      setError('Informe o código de 6 dígitos recebido por e-mail.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.confirmPasswordReset({
        email: cleanEmail,
        code: cleanCode,
        newPassword,
      });

      setIsLoading(false);

      if (res.success) {
        setSuccessMessage('Senha alterada com sucesso! Entre agora com a sua nova senha.');
        setPassword(newPassword);
        setTimeout(() => {
          setMode('login');
          setResetStep('request');
          setResetCode('');
          setNewPassword('');
        }, 1200);
      } else {
        setError(res.message || 'Código inválido ou expirado.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Erro ao redefinir senha.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
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
              {mode === 'forgot_password' ? (
                <KeyRound className="h-5 w-5 text-cyan-400" />
              ) : (
                <Sparkles className="h-5 w-5 text-cyan-400" />
              )}
            </div>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">
            {mode === 'login'
              ? 'Entrar no Zach AI'
              : mode === 'register'
              ? 'Criar Nova Conta'
              : 'Recuperação de Senha'}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {mode === 'login'
              ? 'Autenticação nativa e segura com E-mail e Senha'
              : mode === 'register'
              ? `Cadastre-se para receber ${INITIAL_SIGNUP_BONUS_CREDITS} créditos de bônus imediato`
              : 'Enviaremos um código de verificação seguro via Resend para o seu e-mail'}
          </p>
        </div>

        {/* Welcome quota notification */}
        {mode !== 'forgot_password' && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-cyan-500/20 bg-cyan-950/20 px-3 py-2 text-xs text-cyan-200">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span>Cota Inicial de Boas-Vindas:</span>
            </div>
            <span className="font-bold text-white bg-cyan-500/20 px-2 py-0.5 rounded text-[11px] font-mono">
              {INITIAL_SIGNUP_BONUS_CREDITS} créditos
            </span>
          </div>
        )}

        {/* Mode Toggle Tabs (Hidden in forgot_password mode) */}
        {mode !== 'forgot_password' ? (
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
        ) : (
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMessage(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar para o Login</span>
            </button>
            <span className="text-[11px] text-slate-500 font-mono">
              Etapa {resetStep === 'request' ? '1/2' : '2/2'}
            </span>
          </div>
        )}

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

        {/* Form Container */}
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
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot_password');
                    setResetStep('request');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Esqueceu a senha?
                </button>
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
              className="w-full mt-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
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
        ) : mode === 'register' ? (
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
                    placeholder="Digite seu nome"
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
                  placeholder="Digite seu sobrenome"
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
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Cadastrar e Receber {INITIAL_SIGNUP_BONUS_CREDITS} Créditos</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Mode: forgot_password */
          <div className="space-y-3">
            {resetStep === 'request' ? (
              <form onSubmit={handleRequestPasswordReset} className="space-y-3">
                <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs text-cyan-200">
                  <div className="flex items-center gap-2 font-semibold text-white mb-1">
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                    <span>Recuperação Segura via Resend</span>
                  </div>
                  <p className="text-[11px] text-cyan-300/80 leading-relaxed">
                    Informe o e-mail cadastrado. Enviaremos um código numérico de 6 dígitos válido por 30 minutos.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Seu E-mail Cadastrado
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                      <span>Enviando e-mail...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-3.5 w-3.5" />
                      <span>Enviar Código por E-mail</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmPasswordReset} className="space-y-3">
                <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-2.5 text-xs text-cyan-200">
                  <span className="text-[11px] text-cyan-300">
                    Insira o código enviado para <strong>{email}</strong>:
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Código de Verificação (6 dígitos)
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-2 pl-9 pr-3 text-sm font-mono tracking-widest text-cyan-400 placeholder-slate-600 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nova Senha (mínimo 6 dígitos)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-2 pl-9 pr-9 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                      <span>Validando e Redefinindo...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Confirmar Nova Senha</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setResetStep('request')}
                    className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Não recebeu? Solicitar novo código
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Quick Access for Pedro Henrique (Supreme Owner) */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80">
          <button
            onClick={handleQuickSupremeOwner}
            disabled={isLoading}
            type="button"
            className="w-full flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-950/20 p-2 text-left text-xs transition-all hover:border-amber-400/60 hover:bg-amber-950/30 disabled:opacity-50 cursor-pointer"
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
