import { UserProfile } from '../types';
import {
  syncPedroHenriqueProfile,
  syncUserProfile,
  updateSupabaseCredits,
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

  loginSocial(provider: 'google' | 'facebook' | 'github'): UserProfile {
    // Simulated realistic social auth
    const names: Record<string, string> = {
      google: 'Google User',
      facebook: 'Facebook User',
      github: 'GitHub Developer',
    };

    const newUser: UserProfile = {
      id: `usr_${provider}_${Date.now()}`,
      name: names[provider],
      email: `user.${provider}@exemplo.com`,
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

    this.setCurrentUser(newUser);
    return newUser;
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
