import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

const FALLBACK_SUPABASE_URL = 'https://gigzgnmxnetpgmyqwpum.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_9GQACaUZ4EvsQ0a1WfAduA_cz0Qnv7M';

/**
 * Robustly sanitizes a Supabase URL, removing any markdown wrappers, quotes,
 * brackets, and extracting the clean HTTP/HTTPS origin.
 */
export function cleanSupabaseUrl(rawUrl?: unknown): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return FALLBACK_SUPABASE_URL;
  }

  let s = rawUrl.trim().replace(/^["'`]+|["'`]+$/g, '');

  // Handle markdown links: [text](https://...) -> extract inside parenthesis
  const mdParenthesisMatch = s.match(/\((https?:\/\/[^\s)]+)\)/);
  if (mdParenthesisMatch) {
    s = mdParenthesisMatch[1];
  } else {
    // Handle bracketed URLs: [https://...] -> extract inside brackets
    const mdBracketMatch = s.match(/\[(https?:\/\/[^\s\]]+)\]/);
    if (mdBracketMatch) {
      s = mdBracketMatch[1];
    } else {
      // Find first occurrence of valid http(s) URL
      const directMatch = s.match(/https?:\/\/[^\s"',;)]+/);
      if (directMatch) {
        s = directMatch[0];
      }
    }
  }

  // Strip trailing punctuation like dots, commas, closing brackets/parens
  s = s.replace(/[),.;\]]+$/, '').trim();

  try {
    const parsed = new URL(s);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin;
    }
  } catch {
    // Invalid URL structure, fallback to default
  }

  return FALLBACK_SUPABASE_URL;
}

/**
 * Sanitizes Supabase Anon Key removing quotes and whitespace
 */
export function cleanSupabaseKey(rawKey?: unknown): string {
  if (!rawKey || typeof rawKey !== 'string') {
    return FALLBACK_SUPABASE_ANON_KEY;
  }
  const cleaned = rawKey.trim().replace(/^["'`]+|["'`]+$/g, '');
  if (!cleaned || cleaned === 'SUA_CHAVE_PUBLISHABLE_AQUI') {
    return FALLBACK_SUPABASE_ANON_KEY;
  }
  return cleaned;
}

const rawEnvUrl =
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process?.env?.VITE_SUPABASE_URL) ||
  '';

const rawEnvKey =
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process?.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

export const SUPABASE_URL = cleanSupabaseUrl(rawEnvUrl);
export const SUPABASE_ANON_KEY = cleanSupabaseKey(rawEnvKey);

export const SUPREME_OWNER_EMAIL = 'ppereiradesantana92@gmail.com';
export const SUPREME_OWNER_NAME = 'Pedro Henrique';
export const INITIAL_SYNC_CREDITS = 290;
export const MAX_SYNC_CREDITS = 300;

function safeLocalStorageGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      return window.localStorage.getItem(key);
    }
  } catch {
    // ignore
  }
  return null;
}

function safeLocalStorageSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
}

// Initialize the Supabase Client safely
function createSafeSupabaseClient(): SupabaseClient {
  try {
    return createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  } catch (err) {
    console.warn('[SupabaseClient] Notice: Initial client init with custom env failed, using safe fallback:', err);
    try {
      return createClient(
        FALLBACK_SUPABASE_URL,
        FALLBACK_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        }
      );
    } catch (criticalErr) {
      console.error('[SupabaseClient] Critical fallback failed:', criticalErr);
      return {
        from: () => ({
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
          upsert: () => ({ select: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
        }),
        auth: {
          getUser: async () => ({ data: { user: null }, error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithOAuth: async () => ({ data: { provider: '', url: '' }, error: new Error('Supabase client não inicializado') }),
          signOut: async () => ({ error: null }),
        },
      } as unknown as SupabaseClient;
    }
  }
}

export const supabase: SupabaseClient = createSafeSupabaseClient();

export interface SupabaseUserProfile {
  id: string;
  email: string;
  name: string;
  last_name?: string;
  role: string;
  is_supreme_owner: boolean;
  credits: number;
  max_credits: number;
  total_credits_used: number;
  generations_count: number;
  subscription_plan_id: string;
  subscription_active: boolean;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at: string;
}

export interface SupabaseSyncResult {
  success: boolean;
  source: 'supabase' | 'local_fallback';
  data?: Partial<SupabaseUserProfile>;
  message: string;
  error?: string;
}

/**
 * Checks if Supabase has a valid publishable key configured (not the default placeholder)
 */
export function isSupabaseReady(): boolean {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY) &&
    SUPABASE_ANON_KEY !== 'SUA_CHAVE_PUBLISHABLE_AQUI' &&
    SUPABASE_ANON_KEY.length > 20
  );
}

/**
 * Checks if user is the Supreme Owner and possesses total credit exemption
 */
export function isOwnerCreditExempt(email: string, isSupremeOwner?: boolean): boolean {
  if (isSupremeOwner) return true;
  const normEmail = (email || '').trim().toLowerCase();
  return normEmail === SUPREME_OWNER_EMAIL.toLowerCase();
}

/**
 * Synchronizes Pedro Henrique as Supreme Owner with total credit exemption
 * into Supabase table 'profiles' (and 'users' table fallback).
 */
export async function syncPedroHenriqueProfile(): Promise<SupabaseSyncResult> {
  const profilePayload: SupabaseUserProfile = {
    id: 'usr_supreme_pedro_henrique',
    email: SUPREME_OWNER_EMAIL,
    name: SUPREME_OWNER_NAME,
    last_name: 'Santana',
    role: 'supreme_owner',
    is_supreme_owner: true,
    credits: INITIAL_SYNC_CREDITS, // Base sync balance
    max_credits: MAX_SYNC_CREDITS,
    total_credits_used: 0,
    generations_count: 1,
    subscription_plan_id: 'annual',
    subscription_active: true,
    phone: '+55 11 98765-4321',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    updated_at: new Date().toISOString(),
  };

  // Cache in local storage for instant offline availability & resilience
  safeLocalStorageSet(
    'supabase_cached_profile_pedro_henrique',
    JSON.stringify(profilePayload)
  );

  // If Supabase key is still placeholder, gracefully return local success
  if (!isSupabaseReady()) {
    return {
      success: true,
      source: 'local_fallback',
      data: profilePayload,
      message: `Perfil de Pedro Henrique sincronizado com Isenção Total de Créditos (∞) (Modo Local/Aguardando Anon Key ativa no Supabase).`,
    };
  }

  try {
    // Attempt upsert into 'profiles' table
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'email' })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[SupabaseClient] Notice on profiles upsert (checking users table):', error.message);
      
      // Fallback try on 'users' table if schema uses 'users'
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert(profilePayload, { onConflict: 'email' })
        .select()
        .maybeSingle();

      if (userError) {
        return {
          success: true,
          source: 'local_fallback',
          data: profilePayload,
          message: `Perfil de Pedro Henrique ativo localmente com 290/300 cr. Resposta Supabase: ${error.message}`,
          error: error.message,
        };
      }

      return {
        success: true,
        source: 'supabase',
        data: userData || profilePayload,
        message: 'Perfil de Pedro Henrique sincronizado com sucesso no Supabase (tabela users)!',
      };
    }

    return {
      success: true,
      source: 'supabase',
      data: data || profilePayload,
      message: 'Perfil de Pedro Henrique sincronizado com sucesso no Supabase (tabela profiles)!',
    };
  } catch (err: any) {
    console.error('[SupabaseClient] Network or fetch error syncing with Supabase:', err);
    return {
      success: true,
      source: 'local_fallback',
      data: profilePayload,
      message: 'Perfil de Pedro Henrique salvo em cache local devido a indisponibilidade de rede.',
      error: err?.message,
    };
  }
}

/**
 * Synchronizes any UserProfile into Supabase
 */
export async function syncUserProfile(user: UserProfile): Promise<SupabaseSyncResult> {
  const isOwner =
    user.email.toLowerCase() === SUPREME_OWNER_EMAIL.toLowerCase() ||
    user.name.toLowerCase().includes('pedro henrique');

  const payload: Partial<SupabaseUserProfile> = {
    id: user.id,
    email: user.email,
    name: user.name,
    last_name: user.lastName,
    role: isOwner ? 'supreme_owner' : user.role,
    is_supreme_owner: isOwner ? true : user.isSupremeOwner,
    credits: user.credits,
    max_credits: MAX_SYNC_CREDITS,
    total_credits_used: user.totalCreditsUsed,
    generations_count: user.generationsCount,
    subscription_plan_id: user.subscriptionPlanId || 'free',
    subscription_active: Boolean(user.subscriptionActive),
    phone: user.phone,
    avatar_url: user.avatar,
    updated_at: new Date().toISOString(),
  };

  safeLocalStorageSet(`supabase_cached_profile_${user.email}`, JSON.stringify(payload));

  if (!isSupabaseReady()) {
    return {
      success: true,
      source: 'local_fallback',
      data: payload,
      message: 'Perfil sincronizado em cache local.',
    };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'email' })
      .select()
      .maybeSingle();

    if (error) {
      return {
        success: true,
        source: 'local_fallback',
        data: payload,
        message: `Salvo localmente. Supabase info: ${error.message}`,
        error: error.message,
      };
    }

    return {
      success: true,
      source: 'supabase',
      data: data || payload,
      message: 'Perfil sincronizado no Supabase com sucesso!',
    };
  } catch (err: any) {
    return {
      success: true,
      source: 'local_fallback',
      data: payload,
      message: 'Salvo em cache local.',
      error: err?.message,
    };
  }
}

/**
 * Updates credits in Supabase directly
 */
export async function updateSupabaseCredits(
  email: string,
  credits: number,
  totalUsed?: number
): Promise<SupabaseSyncResult> {
  // If user is Supreme Owner, guarantee total exemption and do not deduct credits in database
  if (isOwnerCreditExempt(email)) {
    return {
      success: true,
      source: 'supabase',
      message: 'Dono Supremo possui isenção total e créditos ilimitados (∞). Nenhuma dedução realizada no banco de dados.',
    };
  }

  if (!isSupabaseReady()) {
    return {
      success: true,
      source: 'local_fallback',
      message: `Saldo atualizado localmente para ${credits} cr.`,
    };
  }

  try {
    const updateObj: Record<string, any> = {
      credits,
      updated_at: new Date().toISOString(),
    };
    if (totalUsed !== undefined) {
      updateObj.total_credits_used = totalUsed;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateObj)
      .eq('email', email);

    if (error) {
      return {
        success: false,
        source: 'supabase',
        message: error.message,
        error: error.message,
      };
    }

    return {
      success: true,
      source: 'supabase',
      message: `Créditos sincronizados no Supabase: ${credits} cr.`,
    };
  } catch (err: any) {
    return {
      success: false,
      source: 'supabase',
      message: err?.message || 'Falha ao atualizar créditos no Supabase',
      error: err?.message,
    };
  }
}

/**
 * Fetches user profile from Supabase by email
 */
export async function fetchSupabaseProfile(
  email: string
): Promise<SupabaseUserProfile | null> {
  if (!isSupabaseReady()) {
    try {
      const cached = safeLocalStorageGet(`supabase_cached_profile_${email}`);
      if (cached) return JSON.parse(cached);
      if (email === SUPREME_OWNER_EMAIL) {
        const ownerCached = safeLocalStorageGet(
          'supabase_cached_profile_pedro_henrique'
        );
        if (ownerCached) return JSON.parse(ownerCached);
      }
    } catch {
      // fallback
    }
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as SupabaseUserProfile;
  } catch (err) {
    console.warn('[SupabaseClient] Error fetching profile:', err);
    return null;
  }
}

/**
 * Returns connection diagnostic status for UI/Admin views
 */
export function getSupabaseDiagnosticStatus() {
  return {
    url: SUPABASE_URL,
    configured: isSupabaseReady(),
    hasCustomKey:
      Boolean(SUPABASE_ANON_KEY) &&
      SUPABASE_ANON_KEY !== 'SUA_CHAVE_PUBLISHABLE_AQUI',
    supremeOwnerEmail: SUPREME_OWNER_EMAIL,
    initialCredits: INITIAL_SYNC_CREDITS,
    maxCredits: MAX_SYNC_CREDITS,
  };
}

// Auto-run initial sync for Pedro Henrique on module load
syncPedroHenriqueProfile().catch((err) => {
  console.debug('[SupabaseClient] Initial auto-sync deferred:', err);
});
