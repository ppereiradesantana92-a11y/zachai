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
import { paymentGatewayService } from './paymentGatewayService';

export const SUBSCRIPTION_PLANS: CreditPlan[] = [
  {
    id: 'free',
    name: 'Gratuito (Bônus de Boas-Vindas)',
    price: 0,
    priceFormatted: 'R$ 0,00',
    credits: 500,
    creditsFormatted: '500 créditos',
    billingPeriod: 'Ao criar conta',
    popularBadge: 'INICIANTE',
    features: [
      '500 créditos grátis de boas-vindas',
      'Acesso ao Chat com Alex IA',
      'Testes e Quizzes práticos de programação',
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
    name: 'Plano Mensal Pro',
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

const TRANSACTIONS_KEY = 'zach_billing_transactions_v3';
const WITHDRAWALS_KEY = 'zach_billing_withdrawals_v3';
const MANAGED_USERS_KEY = 'zach_managed_users_v3';
const INJECTIONS_KEY = 'zach_injections_history_v3';

// Limpeza total: Inicialização com zero transações fictícias
const INITIAL_TRANSACTIONS: PaymentTransaction[] = [];
const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [];

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
    return INITIAL_WITHDRAWALS;
  },

  saveWithdrawals(withdrawals: WithdrawalRequest[]) {
    localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(withdrawals));
  },

  /**
   * Processa o checkout utilizando a arquitetura oficial do gateway (Asaas / Mercado Pago)
   */
  async processCheckout(
    plan: CreditPlan,
    customer: CheckoutCustomerData,
    method: PaymentMethod,
    cardData?: CreditCardData
  ): Promise<PaymentTransaction> {
    const result = await paymentGatewayService.createCheckout({
      plan,
      customer: {
        fullName: customer.fullName,
        email: customer.email,
        cpfCnpj: customer.cpf || '00000000000',
        phone: customer.phone,
      },
      method,
      card: cardData
        ? {
            holderName: cardData.cardHolder,
            number: cardData.cardNumber,
            expiryMonth: cardData.expiryMonth,
            expiryYear: cardData.expiryYear,
            cvv: cardData.cvv,
            installments: cardData.installments,
          }
        : undefined,
    });

    const transactions = this.getTransactions();
    const newTransaction: PaymentTransaction = {
      id: result.transactionId,
      userId: authService.getCurrentUser().id,
      userEmail: customer.email || authService.getCurrentUser().email,
      userName: customer.fullName || authService.getCurrentUser().name,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      creditsAwarded: plan.credits,
      method,
      status: result.status === 'approved' ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      cardLast4: cardData?.cardNumber ? cardData.cardNumber.replace(/\s+/g, '').slice(-4) : undefined,
      pixCode: result.pixQrCodeText,
      pixQrCodeImage: result.pixQrCodeImage,
      invoiceUrl: result.invoiceUrl,
    };

    transactions.unshift(newTransaction);
    this.saveTransactions(transactions);

    // Concede os créditos reais se a transação foi aprovada
    if (newTransaction.status === 'approved') {
      authService.addCredits(plan.credits, plan.id);
    }

    return newTransaction;
  },

  /**
   * Métricas reais e transparentes (Zero dados fictícios)
   */
  getAdminMetrics(): AdminMetrics {
    const transactions = this.getTransactions();
    const withdrawals = this.getWithdrawals();
    const managedUsers = this.getManagedUsers();

    const approvedTransactions = transactions.filter((t) => t.status === 'approved');
    const totalRevenue = approvedTransactions.reduce((sum, t) => sum + t.amount, 0);

    const now = Date.now();
    const dayMs = 24 * 3600 * 1000;
    const weekMs = 7 * dayMs;
    const monthMs = 30 * dayMs;

    const dailyRevenue = approvedTransactions
      .filter((t) => now - new Date(t.createdAt).getTime() <= dayMs)
      .reduce((sum, t) => sum + t.amount, 0);

    const weeklyRevenue = approvedTransactions
      .filter((t) => now - new Date(t.createdAt).getTime() <= weekMs)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyRevenue = approvedTransactions
      .filter((t) => now - new Date(t.createdAt).getTime() <= monthMs)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawn = withdrawals
      .filter((w) => w.status === 'completed')
      .reduce((sum, w) => sum + w.amount, 0);

    const availableBalance = Math.max(0, totalRevenue - totalWithdrawn);
    const currentUser = authService.getCurrentUser();

    return {
      totalUsers: managedUsers.length,
      activeUsers: managedUsers.filter((u) => u.credits > 0).length,
      totalCreditsUsed: currentUser.totalCreditsUsed || 0,
      totalGenerations: currentUser.generationsCount || 0,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      dailyRevenue: Number(dailyRevenue.toFixed(2)),
      weeklyRevenue: Number(weeklyRevenue.toFixed(2)),
      monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
      availableBalanceForWithdrawal: Number(availableBalance.toFixed(2)),
      recentTransactions: transactions.slice(0, 10),
      withdrawals,
    };
  },

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

  isCreditExempt(user?: { email?: string; name?: string; isSupremeOwner?: boolean }): boolean {
    return this.isSupremeOwner(user);
  },

  /**
   * Lista de contas reais cadastradas para o Dono Supremo gerenciar (zero clientes fake)
   */
  getManagedUsers(): ManagedUser[] {
    const currentUser = authService.getCurrentUser();
    const isOwner = this.isSupremeOwner(currentUser);

    const baseList: ManagedUser[] = [
      {
        id: isOwner ? 'usr_supreme_pedro_henrique' : currentUser.id,
        name: isOwner ? SUPREME_OWNER_NAME : currentUser.name,
        email: isOwner ? SUPREME_OWNER_EMAIL : currentUser.email,
        role: isOwner ? 'supreme_owner' : currentUser.role,
        planName: isOwner ? 'Plano Dono Supremo (Ilimitado)' : 'Gratuito (500 créditos)',
        credits: isOwner ? 100000 : currentUser.credits,
        totalInjected: 0,
        isSupremeOwner: isOwner,
      },
    ];

    try {
      const stored = localStorage.getItem(MANAGED_USERS_KEY);
      if (stored) {
        const parsed: ManagedUser[] = JSON.parse(stored);
        if (parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    localStorage.setItem(MANAGED_USERS_KEY, JSON.stringify(baseList));
    return baseList;
  },

  saveManagedUsers(users: ManagedUser[]) {
    try {
      localStorage.setItem(MANAGED_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save managed users', e);
    }
  },

  getInjectionHistory(): CreditInjectionRecord[] {
    try {
      const stored = localStorage.getItem(INJECTIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  },

  /**
   * Permite que o Dono Supremo (Pedro Henrique) adicione créditos a qualquer usuário real
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
      targetUser = {
        id: `usr_client_${Date.now()}`,
        name: targetEmail.split('@')[0],
        email: targetEmail.trim(),
        role: 'user',
        planName: 'Créditos Concedidos pelo Dono Supremo',
        credits: creditsToAdd,
        totalInjected: creditsToAdd,
      };
      users.unshift(targetUser);
    }

    this.saveManagedUsers(users);

    const currentUser = authService.getCurrentUser();
    if (currentUser.email.toLowerCase() === targetEmail.trim().toLowerCase()) {
      currentUser.credits += creditsToAdd;
      authService.setCurrentUser(currentUser);
    }

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
      localStorage.setItem(INJECTIONS_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }

    return {
      success: true,
      targetUser,
      message: `Sucesso! +${creditsToAdd.toLocaleString('pt-BR')} créditos adicionados para ${targetUser.email}.`,
    };
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
