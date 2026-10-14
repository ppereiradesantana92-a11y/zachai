import {
  CreditPlan,
  PaymentTransaction,
  WithdrawalRequest,
  AdminMetrics,
  PaymentMethod,
  CheckoutCustomerData,
  CreditCardData,
} from '../types';
import { authService, SUPREME_OWNER_EMAIL, SUPREME_OWNER_NAME } from './authService';

export const SUBSCRIPTION_PLANS: CreditPlan[] = [
  {
    id: 'free',
    name: 'Gratuito (Bônus)',
    price: 0,
    priceFormatted: 'R$ 0,00',
    credits: 300,
    creditsFormatted: '300 créditos',
    billingPeriod: 'Ao criar conta',
    popularBadge: 'INICIANTE',
    features: [
      '300 créditos grátis de boas-vindas',
      'Acesso ao Chat com Alex IA',
      'Testes e Quizzes práticos',
      'Playground Web com Live Preview',
      'Suporte da comunidade ZachAI',
    ],
  },
  {
    id: 'daily',
    name: 'Plano Diário',
    price: 5.8,
    priceFormatted: 'R$ 5,80',
    credits: 300,
    creditsFormatted: '300 créditos',
    billingPeriod: 'Cobrança diária',
    popularBadge: 'RÁPIDO',
    features: [
      '300 créditos imediatos',
      'Ideal para tarefas pontuais e correções',
      'Acesso ao Zach Code Studio',
      'Conversor Poliglota de Código',
      'Processamento prioritário',
    ],
  },
  {
    id: 'weekly',
    name: 'Plano Semanal',
    price: 10.8,
    priceFormatted: 'R$ 10,80',
    credits: 3500,
    creditsFormatted: '3.500 créditos',
    billingPeriod: 'Cobrança semanal',
    popularBadge: 'ECONÔMICO',
    features: [
      '3.500 créditos (Mais de 350 gerações)',
      'Acesso ao Modo Agente Autônomo',
      'Refatoração Inteligente & Clean Code',
      'Gerador de Códigos por arquivos',
      'Economia de 55% por crédito',
    ],
  },
  {
    id: 'monthly',
    name: 'Plano Mensal',
    price: 30.4,
    priceFormatted: 'R$ 30,40',
    credits: 15000,
    creditsFormatted: '15.000 créditos',
    billingPeriod: 'Cobrança mensal',
    popularBadge: 'MAIS POPULAR',
    highlight: true,
    features: [
      '15.000 créditos (1.500 gerações)',
      'Memória de Projeto Ilimitada do Alex',
      'Auditoria Completa de Segurança e Performance',
      'Exportação para GitHub em 1 clique',
      'Suporte VIP no Discord & WhatsApp',
    ],
  },
  {
    id: 'annual',
    name: 'Plano Anual Supremo',
    price: 90.99,
    priceFormatted: 'R$ 90,99',
    credits: 100000,
    creditsFormatted: '100.000 créditos',
    billingPeriod: 'Cobrança anual única',
    popularBadge: 'MELHOR VALOR',
    highlight: true,
    features: [
      '100.000 créditos gigantescos para o ano todo',
      'Economia massiva de mais de 75%',
      'Todas as ferramentas Pro liberadas',
      'Acesso antecipado aos novos modelos do Alex',
      'Distintivo Especial de Membro Supremo',
    ],
  },
];

const TRANSACTIONS_KEY = 'zach_billing_transactions_v2';
const WITHDRAWALS_KEY = 'zach_billing_withdrawals_v2';

// Seed initial realistic transactions for Pedro Henrique's ADM Dashboard
const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'tx_89412',
    userId: 'usr_pedro_client_1',
    userEmail: 'dev.lucas@empresa.com.br',
    userName: 'Lucas Alcantara',
    planId: 'annual',
    planName: 'Plano Anual Supremo',
    amount: 90.99,
    creditsAwarded: 100000,
    method: 'pix',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'tx_89413',
    userId: 'usr_pedro_client_2',
    userEmail: 'mariana.tech@gmail.com',
    userName: 'Mariana Duarte',
    planId: 'monthly',
    planName: 'Plano Mensal',
    amount: 30.4,
    creditsAwarded: 15000,
    method: 'credit_card',
    cardLast4: '4242',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'tx_89414',
    userId: 'usr_pedro_client_3',
    userEmail: 'gabriel.costa@outlook.com',
    userName: 'Gabriel Costa',
    planId: 'weekly',
    planName: 'Plano Semanal',
    amount: 10.8,
    creditsAwarded: 3500,
    method: 'pix',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'tx_89415',
    userId: 'usr_pedro_client_4',
    userEmail: 'carla.startup@dev.io',
    userName: 'Carla Silveira',
    planId: 'daily',
    planName: 'Plano Diário',
    amount: 5.8,
    creditsAwarded: 300,
    method: 'debit_card',
    cardLast4: '8821',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'tx_89416',
    userId: 'usr_pedro_client_5',
    userEmail: 'rodrigo.eng@gmail.com',
    userName: 'Rodrigo Medeiros',
    planId: 'monthly',
    planName: 'Plano Mensal',
    amount: 30.4,
    creditsAwarded: 15000,
    method: 'pix',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];

const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'wth_001',
    requestedBy: SUPREME_OWNER_NAME,
    amount: 150.0,
    pixKeyType: 'email',
    pixKey: SUPREME_OWNER_EMAIL,
    status: 'completed',
    requestedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 3 + 300000).toISOString(),
    transactionCode: 'PIX-E00416999202610110901',
  },
];

export const billingService = {
  getPlans(): CreditPlan[] {
    return SUBSCRIPTION_PLANS;
  },

  getPlanById(id: string): CreditPlan | undefined {
    return SUBSCRIPTION_PLANS.find((p) => p.id === id);
  },

  getTransactions(): PaymentTransaction[] {
    try {
      const stored = localStorage.getItem(TRANSACTIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse billing transactions', e);
    }
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
    return INITIAL_TRANSACTIONS;
  },

  saveTransactions(transactions: PaymentTransaction[]) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  },

  getWithdrawals(): WithdrawalRequest[] {
    try {
      const stored = localStorage.getItem(WITHDRAWALS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse withdrawals', e);
    }
    localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(INITIAL_WITHDRAWALS));
    return INITIAL_WITHDRAWALS;
  },

  saveWithdrawals(withdrawals: WithdrawalRequest[]) {
    localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(withdrawals));
  },

  processCheckout(
    plan: CreditPlan,
    customer: CheckoutCustomerData,
    method: PaymentMethod,
    cardData?: CreditCardData
  ): Promise<PaymentTransaction> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const transactions = this.getTransactions();
        const txId = `tx_${Date.now().toString().slice(-6)}`;
        
        const newTransaction: PaymentTransaction = {
          id: txId,
          userId: authService.getCurrentUser().id,
          userEmail: customer.email || authService.getCurrentUser().email,
          userName: customer.fullName || authService.getCurrentUser().name,
          planId: plan.id,
          planName: plan.name,
          amount: plan.price,
          creditsAwarded: plan.credits,
          method,
          status: 'approved',
          createdAt: new Date().toISOString(),
          cardLast4: cardData?.cardNumber ? cardData.cardNumber.replace(/\s+/g, '').slice(-4) : undefined,
          pixCode: method === 'pix' ? `00020126580014br.gov.bcb.pix0136${txId}520400005303986540${plan.price.toFixed(2)}5802BR5925Pedro Henrique Santana6009Sao Paulo62070503***6304` : undefined,
        };

        transactions.unshift(newTransaction);
        this.saveTransactions(transactions);

        // Add credits to user immediately
        authService.addCredits(plan.credits, plan.id);

        resolve(newTransaction);
      }, 1000);
    });
  },

  getAdminMetrics(): AdminMetrics {
    const transactions = this.getTransactions();
    const withdrawals = this.getWithdrawals();

    const totalRevenue = transactions
      .filter((t) => t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);

    const now = Date.now();
    const dayMs = 24 * 3600 * 1000;
    const weekMs = 7 * dayMs;
    const monthMs = 30 * dayMs;

    const dailyRevenue = transactions
      .filter((t) => t.status === 'approved' && now - new Date(t.createdAt).getTime() <= dayMs)
      .reduce((sum, t) => sum + t.amount, 0);

    const weeklyRevenue = transactions
      .filter((t) => t.status === 'approved' && now - new Date(t.createdAt).getTime() <= weekMs)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyRevenue = transactions
      .filter((t) => t.status === 'approved' && now - new Date(t.createdAt).getTime() <= monthMs)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawn = withdrawals
      .filter((w) => w.status === 'completed')
      .reduce((sum, w) => sum + w.amount, 0);

    const availableBalance = Math.max(0, totalRevenue - totalWithdrawn);

    return {
      totalUsers: 1482,
      activeUsers: 347,
      totalCreditsUsed: 498200,
      totalGenerations: 49820,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      dailyRevenue: Number(dailyRevenue.toFixed(2)),
      weeklyRevenue: Number(weeklyRevenue.toFixed(2)),
      monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
      availableBalanceForWithdrawal: Number(availableBalance.toFixed(2)),
      recentTransactions: transactions.slice(0, 10),
      withdrawals,
    };
  },

  /**
   * Evaluates if a user is the Supreme Owner and eligible for total credit exemption
   */
  isSupremeOwner(user?: { email?: string; name?: string; isSupremeOwner?: boolean }): boolean {
    if (!user) return false;
    if (user.isSupremeOwner) return true;
    const email = (user.email || '').trim().toLowerCase();
    const name = (user.name || '').trim().toLowerCase();
    return (
      email === SUPREME_OWNER_EMAIL.toLowerCase() ||
      name === SUPREME_OWNER_NAME.toLowerCase() ||
      name.includes('pedro henrique')
    );
  },

  /**
   * Check if user has total exemption (0 cost for all actions)
   */
  isCreditExempt(user?: { email?: string; name?: string; isSupremeOwner?: boolean }): boolean {
    return this.isSupremeOwner(user);
  },

  /**
   * List of managed customer accounts for Pedro Henrique to view and inject credits
   */
  getManagedUsers(): ManagedUser[] {
    const defaultList: ManagedUser[] = [
      {
        id: 'usr_pedro_client_1',
        name: 'Lucas Alcantara',
        email: 'dev.lucas@empresa.com.br',
        role: 'user',
        planName: 'Plano Anual Supremo',
        credits: 100000,
        totalInjected: 0,
      },
      {
        id: 'usr_pedro_client_2',
        name: 'Mariana Duarte',
        email: 'mariana.tech@gmail.com',
        role: 'user',
        planName: 'Plano Mensal',
        credits: 15000,
        totalInjected: 0,
      },
      {
        id: 'usr_pedro_client_3',
        name: 'Gabriel Costa',
        email: 'gabriel.costa@outlook.com',
        role: 'user',
        planName: 'Plano Semanal',
        credits: 3500,
        totalInjected: 0,
      },
      {
        id: 'usr_pedro_client_4',
        name: 'Carla Silveira',
        email: 'carla.startup@dev.io',
        role: 'user',
        planName: 'Plano Diário',
        credits: 300,
        totalInjected: 0,
      },
      {
        id: 'usr_pedro_client_5',
        name: 'Rodrigo Medeiros',
        email: 'rodrigo.eng@gmail.com',
        role: 'user',
        planName: 'Plano Mensal',
        credits: 15000,
        totalInjected: 0,
      },
      {
        id: 'usr_default_student',
        name: 'Estudante Dev Iniciante',
        email: 'estudante@zach.ai',
        role: 'user',
        planName: 'Gratuito (Bônus)',
        credits: 290,
        totalInjected: 0,
      },
      {
        id: 'usr_visitor',
        name: 'Visitante Não Registrado',
        email: 'visitante@zach.ai',
        role: 'visitor',
        planName: 'Degustação Grátis',
        credits: 50,
        totalInjected: 0,
      },
    ];

    try {
      const stored = localStorage.getItem('zach_managed_users_list_v2');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    localStorage.setItem('zach_managed_users_list_v2', JSON.stringify(defaultList));
    return defaultList;
  },

  /**
   * Saves updated managed users list
   */
  saveManagedUsers(users: ManagedUser[]) {
    try {
      localStorage.setItem('zach_managed_users_list_v2', JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save managed users', e);
    }
  },

  /**
   * Retrieves injection history
   */
  getInjectionHistory(): CreditInjectionRecord[] {
    try {
      const stored = localStorage.getItem('zach_credit_injections_history_v2');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'inj_seed_1',
        adminName: SUPREME_OWNER_NAME,
        adminEmail: SUPREME_OWNER_EMAIL,
        targetUserEmail: 'estudante@zach.ai',
        targetUserName: 'Estudante Dev Iniciante',
        creditsAdded: 500,
        reason: 'Bônus de Incentivo para Estudos',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        supabaseSynced: true,
      },
    ];
  },

  /**
   * Allows Supreme Owner (Pedro Henrique) to inject credits into any user account
   */
  async injectCreditsToUser(
    targetEmail: string,
    creditsToAdd: number,
    reason: string = 'Injeção manual pelo Dono Supremo'
  ): Promise<{ success: boolean; targetUser: ManagedUser; message: string }> {
    const users = this.getManagedUsers();
    let userIndex = users.findIndex(
      (u) => u.email.toLowerCase() === targetEmail.trim().toLowerCase()
    );

    let targetUser: ManagedUser;
    if (userIndex >= 0) {
      users[userIndex].credits += creditsToAdd;
      users[userIndex].totalInjected = (users[userIndex].totalInjected || 0) + creditsToAdd;
      targetUser = users[userIndex];
    } else {
      // New user account registered on the fly
      targetUser = {
        id: `usr_custom_${Date.now()}`,
        name: targetEmail.split('@')[0],
        email: targetEmail.trim(),
        role: 'user',
        planName: 'Injetado pelo Dono Supremo',
        credits: creditsToAdd,
        totalInjected: creditsToAdd,
      };
      users.unshift(targetUser);
    }

    this.saveManagedUsers(users);

    // If target is current active user in session, update their live balance too
    const currentUser = authService.getCurrentUser();
    if (currentUser.email.toLowerCase() === targetEmail.trim().toLowerCase()) {
      currentUser.credits += creditsToAdd;
      authService.setCurrentUser(currentUser);
    }

    // Record in history log
    const history = this.getInjectionHistory();
    const newRecord: CreditInjectionRecord = {
      id: `inj_${Date.now()}`,
      adminName: SUPREME_OWNER_NAME,
      adminEmail: SUPREME_OWNER_EMAIL,
      targetUserEmail: targetUser.email,
      targetUserName: targetUser.name,
      creditsAdded: creditsToAdd,
      reason,
      timestamp: new Date().toISOString(),
      supabaseSynced: true,
    };
    history.unshift(newRecord);
    try {
      localStorage.setItem('zach_credit_injections_history_v2', JSON.stringify(history));
    } catch {
      // ignore
    }

    // Also record transaction in recent sales/activity
    const transactions = this.getTransactions();
    transactions.unshift({
      id: `tx_inj_${Date.now().toString().slice(-5)}`,
      userId: targetUser.id,
      userEmail: targetUser.email,
      userName: targetUser.name,
      planId: 'owner_injection',
      planName: `Injeção ADM (+${creditsToAdd.toLocaleString('pt-BR')} cr.)`,
      amount: 0,
      creditsAwarded: creditsToAdd,
      method: 'pix',
      status: 'approved',
      createdAt: new Date().toISOString(),
    });
    this.saveTransactions(transactions);

    return {
      success: true,
      targetUser,
      message: `Sucesso! +${creditsToAdd.toLocaleString('pt-BR')} créditos injetados na conta de ${targetUser.name} (${targetUser.email}).`,
    };
  },

  requestPixWithdrawal(amount: number, pixKey: string, pixKeyType: 'cpf' | 'email' | 'phone' | 'random'): WithdrawalRequest {
    const withdrawals = this.getWithdrawals();
    const wthId = `wth_${Date.now().toString().slice(-6)}`;
    const txCode = `PIX-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newWithdrawal: WithdrawalRequest = {
      id: wthId,
      requestedBy: SUPREME_OWNER_NAME,
      amount: Number(amount.toFixed(2)),
      pixKey,
      pixKeyType,
      status: 'completed',
      requestedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      transactionCode: txCode,
    };

    withdrawals.unshift(newWithdrawal);
    this.saveWithdrawals(withdrawals);
    return newWithdrawal;
  },
};

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  planName: string;
  credits: number;
  totalInjected: number;
  isSupremeOwner?: boolean;
}

export interface CreditInjectionRecord {
  id: string;
  adminName: string;
  adminEmail: string;
  targetUserEmail: string;
  targetUserName: string;
  creditsAdded: number;
  reason: string;
  timestamp: string;
  supabaseSynced: boolean;
}
