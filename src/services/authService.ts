import { UserProfile, UserRole } from '../types';
import {
  syncPedroHenriqueProfile,
  syncUserProfile,
  updateSupabaseCredits,
  fetchSupabaseProfile,
  supabase,
  INITIAL_SYNC_CREDITS,
  MAX_SYNC_CREDITS,
} from '../lib/supabaseClient';

export const SUPREME_OWNER_EMAIL = 'ppereiradesantana92@gmail.com';
export const SUPREME_OWNER_NAME = 'Pedro Henrique';
export const COST_PER_GENERATION = 10;
export const INITIAL_SIGNUP_BONUS_CREDITS = 300;
export const VISITOR_DAILY_FREE_LIMIT = 5; // 5 free generations (50 credits) per 24h

const STORAGE_KEY = 'zach_ai_current_user_profile_v2';
const LISTENERS: Array<(user: UserProfile) => void> = [];

export function isSupremeOwnerUser(email: string, name?: string): boolean {
  const normEmail = (email || '').trim().toLowerCase();
  const normName = (name || '').trim().toLowerCase();
  return (
    normEmail === SUPREME_OWNER_EMAIL.toLowerCase() ||
    normName === SUPREME_OWNER_NAME.toLowerCase() ||
    normName.includes('pedro henrique')
  );
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

const DEFAULT_SUPREME_OWNER: UserProfile = {
  id: 'usr_supreme_pedro_henrique',
  name: 'Pedro Henrique',
  lastName: 'Santana',
  email: 'ppereiradesantana92@gmail.com',
  phone: '+55 11 98765-4321',
  role: 'supreme_owner',
  isSupremeOwner: true,
  credits: INITIAL_SYNC_CREDITS, // 290 cr.
  maxCredits: MAX_SYNC_CREDITS, // 300 cr.
  totalCreditsUsed: 10,
  generationsCount: 1,
  subscriptionPlanId: 'annual',
  subscriptionActive: true,
  joinedAt: '2024-01-01T00:00:00.000Z',
  lastLoginAt: new Date().toISOString(),
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

const DEFAULT_REGULAR_USER: UserProfile = {
  id: 'usr_default_student',
  name: 'Estudante Dev',
  lastName: 'Iniciante',
  email: 'estudante@zach.ai',
  phone: '+55 11 99999-8888',
  role: 'user',
  isSupremeOwner: false,
  credits: INITIAL_SYNC_CREDITS, // 290 cr.
  maxCredits: MAX_SYNC_CREDITS, // 300 cr.
  totalCreditsUsed: 10,
  generationsCount: 1,
  subscriptionPlanId: 'free',
  subscriptionActive: true,
  joinedAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  visitorDailyGenerationsRemaining: VISITOR_DAILY_FREE_LIMIT,
  lastDailyResetDate: getTodayDateString(),
};

export const authService = {
  getCurrentUser(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user: UserProfile = JSON.parse(stored);
        
        // Re-evaluate supreme owner status dynamically
        if (isSupremeOwnerUser(user.email, user.name)) {
          user.role = 'supreme_owner';
          user.isSupremeOwner = true;
        }

        // Daily reset check for visitors / free accounts
        const today = getTodayDateString();
        if (user.lastDailyResetDate !== today) {
          user.lastDailyResetDate = today;
          user.visitorDailyGenerationsRemaining = VISITOR_DAILY_FREE_LIMIT;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        }

        return user;
      }
    } catch (e) {
      console.warn('Failed to parse user profile from localStorage', e);
    }

    // Default: Initial regular student with initial 300 free bonus credits
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REGULAR_USER));
    return DEFAULT_REGULAR_USER;
  },

  setCurrentUser(user: UserProfile) {
    if (isSupremeOwnerUser(user.email, user.name)) {
      user.role = 'supreme_owner';
      user.isSupremeOwner = true;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user profile', e);
    }
    this.notifyListeners(user);

    // Asynchronously synchronize with Supabase database
    syncUserProfile(user).catch((err) => {
      console.debug('[authService] Supabase sync status:', err);
    });
  },

  async signInWithOAuth(
    provider: 'google' | 'facebook' | 'github'
  ): Promise<{ data?: any; error?: any }> {
    try {
      const origin =
        typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : '';

      const options: {
        redirectTo?: string;
        queryParams?: Record<string, string>;
      } = {
        redirectTo: origin,
      };

      // Ensure Google shows the native account selector so the user can choose their real email account
      if (provider === 'google') {
        options.queryParams = {
          prompt: 'select_account',
          access_type: 'offline',
        };
      }

      console.log(`[authService] Iniciando Supabase OAuth (${provider}) com redirectTo:`, origin);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options,
      });

      if (error) {
        console.error(`[authService] Erro retornado pelo Supabase OAuth (${provider}):`, error.message);
        return { error };
      }

      // If data?.url is present and browser didn't redirect automatically, redirect explicitly
      if (data?.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      }

      return { data };
    } catch (err: any) {
      console.error(`[authService] Exceção durante signInWithOAuth com ${provider}:`, err);
      return { error: err };
    }
  },

  async loginSocial(provider: 'google' | 'facebook' | 'github'): Promise<{ data?: any; error?: any }> {
    return this.signInWithOAuth(provider);
  },

  async signInWithPassword(
    email: string,
    password?: string
  ): Promise<{ user: UserProfile | null; error: string | null }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const isOwner = isSupremeOwnerUser(cleanEmail);

    // If Supreme Owner: guaranteed immediate access under all conditions
    if (isOwner) {
      console.info('[authService] Dono Supremo autenticado:', cleanEmail);
      if (password) {
        supabase.auth.signInWithPassword({ email: cleanEmail, password }).catch(() => {});
      }
      const owner = this.loginAsSupremeOwner();
      return { user: owner, error: null };
    }

    try {
      if (password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          console.warn('[authService] Supabase signInWithPassword erro:', error.message);
          let msg = error.message;
          if (error.message.includes('Invalid login credentials')) {
            msg = 'E-mail ou senha incorretos. Verifique suas credenciais.';
          } else if (error.message.includes('Email not confirmed')) {
            msg = 'E-mail ainda não confirmado. Verifique seu e-mail para ativar a conta.';
          }
          return { user: null, error: msg };
        }

        if (data?.user) {
          const profile = await handleSupabaseUserSession(data.user);
          return { user: profile || this.loginWithEmail(cleanEmail, password), error: null };
        }
      }

      const user = this.loginWithEmail(cleanEmail, password);
      return { user, error: null };
    } catch (err: any) {
      console.error('[authService] Exceção em signInWithPassword:', err);
      return { user: null, error: err?.message || 'Falha ao autenticar com o Supabase.' };
    }
  },

  async signUpWithSupabase(data: {
    name: string;
    lastName?: string;
    phone?: string;
    email: string;
    password: string;
  }): Promise<{ user: UserProfile | null; error: string | null; emailConfirmationRequired?: boolean }> {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const isOwner = isSupremeOwnerUser(cleanEmail, data.name);

    if (isOwner) {
      console.info('[authService] Dono Supremo cadastrado automaticamente:', cleanEmail);
      if (data.password) {
        supabase.auth
          .signUp({
            email: cleanEmail,
            password: data.password,
            options: {
              data: {
                name: data.name,
                lastName: data.lastName,
                full_name: `${data.name} ${data.lastName || ''}`.trim(),
                phone: data.phone,
              },
            },
          })
          .catch(() => {});
      }
      const owner = this.loginAsSupremeOwner();
      return { user: owner, error: null };
    }

    try {
      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          data: {
            name: data.name,
            lastName: data.lastName,
            full_name: `${data.name} ${data.lastName || ''}`.trim(),
            phone: data.phone,
          },
        },
      });

      if (sbError) {
        console.warn('[authService] Supabase signUp erro:', sbError.message);
        let msg = sbError.message;
        if (sbError.message.includes('User already registered')) {
          msg = 'Este e-mail já está cadastrado. Alterne para a aba "Entrar".';
        } else if (sbError.message.includes('Password should be at least')) {
          msg = 'A senha deve conter no mínimo 6 caracteres.';
        }
        return { user: null, error: msg };
      }

      if (sbData?.user) {
        const emailConfirmationRequired =
          !sbData.session && !!sbData.user.identities && sbData.user.identities.length > 0;
        const localUser = this.register(data);
        await handleSupabaseUserSession(sbData.user);
        return { user: localUser, error: null, emailConfirmationRequired };
      }

      const localUser = this.register(data);
      return { user: localUser, error: null };
    } catch (err: any) {
      console.error('[authService] Exceção em signUpWithSupabase:', err);
      const localUser = this.register(data);
      return { user: localUser, error: null };
    }
  },

  loginWithEmail(email: string, _password?: string): UserProfile {
    const isOwner = isSupremeOwnerUser(email);
    
    if (isOwner) {
      const ownerUser: UserProfile = {
        ...DEFAULT_SUPREME_OWNER,
        email: email.trim(),
        lastLoginAt: new Date().toISOString(),
      };
      this.setCurrentUser(ownerUser);
      return ownerUser;
    }

    const regularUser: UserProfile = {
      id: `usr_email_${Date.now()}`,
      name: email.split('@')[0],
      email: email.trim(),
      role: 'user',
      isSupremeOwner: false,
      credits: INITIAL_SIGNUP_BONUS_CREDITS,
      totalCreditsUsed: 0,
      generationsCount: 0,
      subscriptionPlanId: 'free',
      subscriptionActive: true,
      joinedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      visitorDailyGenerationsRemaining: VISITOR_DAILY_FREE_LIMIT,
      lastDailyResetDate: getTodayDateString(),
    };

    this.setCurrentUser(regularUser);
    return regularUser;
  },

  register(data: {
    name: string;
    lastName?: string;
    phone?: string;
    email: string;
    password?: string;
  }): UserProfile {
    const isOwner = isSupremeOwnerUser(data.email, data.name);

    const newUser: UserProfile = {
      id: isOwner ? 'usr_supreme_pedro_henrique' : `usr_reg_${Date.now()}`,
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: isOwner ? 'supreme_owner' : 'user',
      isSupremeOwner: isOwner,
      credits: isOwner ? 100000 : INITIAL_SIGNUP_BONUS_CREDITS,
      totalCreditsUsed: 0,
      generationsCount: 0,
      subscriptionPlanId: isOwner ? 'annual' : 'free',
      subscriptionActive: true,
      joinedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      visitorDailyGenerationsRemaining: VISITOR_DAILY_FREE_LIMIT,
      lastDailyResetDate: getTodayDateString(),
    };

    this.setCurrentUser(newUser);
    return newUser;
  },

  loginAsSupremeOwner(): UserProfile {
    const owner = {
      ...DEFAULT_SUPREME_OWNER,
      lastLoginAt: new Date().toISOString(),
    };
    this.setCurrentUser(owner);
    syncPedroHenriqueProfile().catch(() => {});
    return owner;
  },

  logout(): UserProfile {
    try {
      supabase.auth.signOut().catch((err) => {
        console.warn('[authService] Aviso ao deslogar do Supabase:', err);
      });
    } catch {
      // ignore
    }

    const visitor: UserProfile = {
      id: 'usr_visitor',
      name: 'Visitante',
      email: 'visitante@zach.ai',
      role: 'visitor',
      isSupremeOwner: false,
      credits: 50,
      totalCreditsUsed: 0,
      generationsCount: 0,
      joinedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      visitorDailyGenerationsRemaining: VISITOR_DAILY_FREE_LIMIT,
      lastDailyResetDate: getTodayDateString(),
    };
    this.setCurrentUser(visitor);
    return visitor;
  },

  consumeCredits(amount: number = COST_PER_GENERATION): {
    success: boolean;
    remainingCredits: number;
    exempt?: boolean;
    message?: string;
  } {
    const user = this.getCurrentUser();

    // Supreme Owner: TOTAL EXEMPTION & UNLIMITED CREDITS (0 credits deducted)
    if (user.isSupremeOwner || isSupremeOwnerUser(user.email, user.name)) {
      user.generationsCount = (user.generationsCount || 0) + 1;
      this.setCurrentUser(user);
      return {
        success: true,
        remainingCredits: user.credits,
        exempt: true,
        message: 'Dono Supremo: Acesso Total Gratuito (0 créditos consumidos)',
      };
    }

    // Regular Client / Student: Deduct standard 10 credits per action
    if (user.credits < amount) {
      return {
        success: false,
        remainingCredits: user.credits,
        exempt: false,
        message: `Saldo insuficiente! Esta operação requer ${amount} créditos. Seu saldo atual é de ${user.credits} créditos.`,
      };
    }

    user.credits -= amount;
    user.totalCreditsUsed = (user.totalCreditsUsed || 0) + amount;
    user.generationsCount = (user.generationsCount || 0) + 1;
    this.setCurrentUser(user);
    updateSupabaseCredits(user.email, user.credits, user.totalCreditsUsed).catch(() => {});

    return {
      success: true,
      remainingCredits: user.credits,
      exempt: false,
    };
  },

  addCredits(amount: number, planId?: string): UserProfile {
    const user = this.getCurrentUser();
    user.credits += amount;
    if (planId) {
      user.subscriptionPlanId = planId;
      user.subscriptionActive = true;
    }
    this.setCurrentUser(user);
    updateSupabaseCredits(user.email, user.credits, user.totalCreditsUsed).catch(() => {});
    return user;
  },

  subscribe(callback: (user: UserProfile) => void): () => void {
    LISTENERS.push(callback);
    return () => {
      const idx = LISTENERS.indexOf(callback);
      if (idx !== -1) LISTENERS.splice(idx, 1);
    };
  },

  notifyListeners(user: UserProfile) {
    LISTENERS.forEach((cb) => {
      try {
        cb(user);
      } catch (e) {
        console.error('Error notifying user listener', e);
      }
    });
  },
};

/**
 * Processes a Supabase user session (e.g. following OAuth redirect from Google/Facebook/GitHub),
 * maps profile attributes, updates local user and notifies all app listeners.
 */
export async function handleSupabaseUserSession(sbUser: any): Promise<UserProfile | null> {
  if (!sbUser || !sbUser.email) return null;

  const email: string = sbUser.email;
  const metadata = sbUser.user_metadata || {};
  const fullName: string =
    metadata.full_name ||
    metadata.name ||
    metadata.user_name ||
    email.split('@')[0] ||
    'Usuário';

  const isOwner = isSupremeOwnerUser(email, fullName);
  const avatar =
    metadata.avatar_url ||
    metadata.picture ||
    (isOwner ? DEFAULT_SUPREME_OWNER.avatar : undefined);

  // Attempt to fetch existing profile from Supabase database or local cache
  let dbProfile = await fetchSupabaseProfile(email);

  const currentUser = authService.getCurrentUser();
  const currentCredits =
    currentUser.email === email
      ? currentUser.credits
      : (dbProfile?.credits ?? INITIAL_SIGNUP_BONUS_CREDITS);

  const userProfile: UserProfile = {
    id: sbUser.id || (isOwner ? 'usr_supreme_pedro_henrique' : `usr_sb_${Date.now()}`),
    name: fullName,
    lastName: metadata.last_name || (isOwner ? 'Santana' : undefined),
    email: email,
    phone: sbUser.phone || metadata.phone || '',
    role: (isOwner ? 'supreme_owner' : (dbProfile?.role === 'admin' || dbProfile?.role === 'visitor' ? dbProfile.role : 'user')) as UserRole,
    isSupremeOwner: isOwner,
    credits: isOwner ? 100000 : currentCredits,
    maxCredits: MAX_SYNC_CREDITS,
    totalCreditsUsed: dbProfile?.total_credits_used || 0,
    generationsCount: dbProfile?.generations_count || 0,
    subscriptionPlanId: isOwner ? 'annual' : (dbProfile?.subscription_plan_id || 'free'),
    subscriptionActive: true,
    joinedAt: sbUser.created_at || new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    avatar,
    visitorDailyGenerationsRemaining: VISITOR_DAILY_FREE_LIMIT,
    lastDailyResetDate: getTodayDateString(),
  };

  authService.setCurrentUser(userProfile);

  // If OAuth token parameters are present in URL hash (#access_token=...), clean them cleanly
  if (
    typeof window !== 'undefined' &&
    window.location.hash &&
    (window.location.hash.includes('access_token') || window.location.hash.includes('error'))
  ) {
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch {
      // ignore
    }
  }

  return userProfile;
}

/**
 * Initializes listeners for Supabase authentication state and active sessions.
 */
export function initSupabaseAuthListener(): () => void {
  if (typeof window === 'undefined') return () => {};

  // Check active session on initial load
  supabase.auth
    .getSession()
    .then(({ data: { session }, error }) => {
      if (error) {
        console.warn('[authService] Aviso ao recuperar sessão inicial do Supabase:', error.message);
        return;
      }
      if (session?.user) {
        handleSupabaseUserSession(session.user).catch((e) => {
          console.warn('[authService] Erro ao sincronizar sessão inicial:', e);
        });
      }
    })
    .catch((err) => {
      console.warn('[authService] Falha ao obter sessão do Supabase:', err);
    });

  // Subscribe to real-time auth events (OAuth redirect SIGNED_IN, token refresh, etc.)
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('[authService] Supabase Auth Event:', event, session?.user?.email);
    if (
      (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') &&
      session?.user
    ) {
      await handleSupabaseUserSession(session.user);
    }
  });

  return () => {
    subscription?.unsubscribe();
  };
}

// Auto-initialize auth listener on browser boot
if (typeof window !== 'undefined') {
  initSupabaseAuthListener();
}

