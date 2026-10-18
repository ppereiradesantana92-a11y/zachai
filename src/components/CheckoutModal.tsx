import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Lock,
  ArrowRight,
  Clock,
  BadgeCheck,
  Zap,
  Crown,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  SUBSCRIPTION_PLANS,
  billingService,
} from '../services/billingService';
import { CreditPlan, PaymentMethod, CheckoutCustomerData, CreditCardData, PaymentTransaction } from '../types';
import { authService } from '../services/authService';
import { paymentGatewayService } from '../services/paymentGatewayService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId?: string;
  onSuccess: (creditsAwarded: number) => void;
}

const CARD_BRANDS = [
  { name: 'Visa', badge: 'VISA', bg: 'bg-blue-600' },
  { name: 'Mastercard', badge: 'MC', bg: 'bg-amber-600' },
  { name: 'Elo', badge: 'ELO', bg: 'bg-rose-600' },
  { name: 'Hipercard', badge: 'HIPER', bg: 'bg-red-700' },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPlanId = 'monthly',
  onSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<CreditPlan>(
    billingService.getPlanById(selectedPlanId) || SUBSCRIPTION_PLANS[3]
  );
  const [step, setStep] = useState<'plan' | 'checkout' | 'pix_wait' | 'success'>('plan');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTransaction, setActiveTransaction] = useState<PaymentTransaction | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const currentUser = authService.getCurrentUser();
  const [customer, setCustomer] = useState<CheckoutCustomerData>({
    fullName: currentUser.name || 'Pedro Henrique',
    email: currentUser.email || 'ppereiradesantana92@gmail.com',
    cpf: '123.456.789-00',
    phone: currentUser.phone || '(11) 98765-4321',
    street: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
  });

  const [cardData, setCardData] = useState<CreditCardData>({
    cardNumber: '4532 8765 4321 4242',
    cardHolder: (currentUser.name || 'PEDRO HENRIQUE').toUpperCase(),
    expiryMonth: '12',
    expiryYear: '29',
    cvv: '123',
    installments: 1,
    cardBrand: 'visa',
  });

  const pollingRef = useRef<any>(null);

  // Monitora status do PIX enquanto na tela de espera
  useEffect(() => {
    if (step === 'pix_wait' && activeTransaction?.id) {
      const pollPayment = async () => {
        try {
          setIsCheckingStatus(true);
          const status = await paymentGatewayService.checkPaymentStatus(activeTransaction.id);
          if (status.isConfirmed) {
            clearInterval(pollingRef.current);
            authService.addCredits(activeTransaction.creditsAwarded, activeTransaction.planName);
            onSuccess(activeTransaction.creditsAwarded);
            setStep('success');
          }
        } catch (e) {
          console.warn('[CheckoutModal] Erro ao checar status do PIX:', e);
        } finally {
          setIsCheckingStatus(false);
        }
      };

      pollingRef.current = setInterval(pollPayment, 3500);
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [step, activeTransaction, onSuccess]);

  if (!isOpen) return null;

  const handleSelectPlan = (plan: CreditPlan) => {
    setSelectedPlan(plan);
    setErrorMessage(null);
    if (plan.id === 'free') {
      authService.addCredits(500, 'free');
      onSuccess(500);
      setStep('success');
    } else {
      setStep('checkout');
    }
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const tx = await billingService.processCheckout(
        selectedPlan,
        customer,
        paymentMethod,
        cardData
      );

      setActiveTransaction(tx);
      setIsProcessing(false);

      if (paymentMethod === 'pix') {
        setStep('pix_wait');
      } else {
        if (tx.status === 'approved') {
          onSuccess(tx.creditsAwarded);
          setStep('success');
        } else {
          setErrorMessage('Cobrança enviada ao Asaas. Aguardando confirmação da operadora.');
        }
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || 'Falha ao processar checkout com o Asaas.');
    }
  };

  const handleManualCheckStatus = async () => {
    if (!activeTransaction?.id) return;
    setIsCheckingStatus(true);
    try {
      const res = await paymentGatewayService.checkPaymentStatus(activeTransaction.id);
      if (res.isConfirmed) {
        authService.addCredits(activeTransaction.creditsAwarded, activeTransaction.planName);
        onSuccess(activeTransaction.creditsAwarded);
        setStep('success');
      } else {
        setErrorMessage('O Asaas ainda não acusou a liquidação do PIX. Aguarde alguns segundos.');
        setTimeout(() => setErrorMessage(null), 4000);
      }
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCopyPix = () => {
    const pixText =
      activeTransaction?.pixCode ||
      `00020126580014br.gov.bcb.pix0136tx_${selectedPlan.id}_${Date.now()}520400005303986540${selectedPlan.price.toFixed(
        2
      )}5802BR5925Pedro Henrique Santana6009Sao Paulo62070503***6304`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pixText);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-[#070b19] shadow-2xl shadow-cyan-950/50 max-h-[92vh] flex flex-col">
        {/* Glow ambient */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-md shadow-cyan-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#070b19]">
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Planos & Recarga de Créditos Zach AI</span>
                <span className="rounded bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">
                  Asaas Oficial
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                10 Créditos por solicitação · Sem mensalidades ocultas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {currentUser.isSupremeOwner && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs text-amber-200 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <Crown className="h-4 w-4 text-amber-400 shrink-0 animate-pulse" />
                <span>
                  <strong>Dono Supremo (Pedro Henrique):</strong> Você possui <strong>Isenção Total e Créditos Infinitos (∞)</strong>. O checkout comercial abaixo permanece disponível para testes da experiência de novos clientes.
                </span>
              </div>
              <span className="rounded bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold text-amber-300 shrink-0">
                Livre de Cobrança
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Plan Selection */}
          {step === 'plan' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isCurrentSelected = selectedPlan.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => handleSelectPlan(plan)}
                      className={`relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                        isCurrentSelected
                          ? 'border-cyan-500 bg-slate-900/90 shadow-lg shadow-cyan-950/50 scale-[1.01]'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      {plan.popularBadge && (
                        <span className="absolute -top-2.5 right-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
                          {plan.popularBadge}
                        </span>
                      )}

                      <div>
                        <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold text-white">
                            {plan.priceFormatted}
                          </span>
                          <span className="text-[10px] text-slate-400">/{plan.billingPeriod}</span>
                        </div>

                        <div className="mt-2.5 inline-flex items-center gap-1 rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-300 font-mono">
                          <Zap className="h-3 w-3" />
                          <span>{plan.creditsFormatted}</span>
                        </div>

                        <ul className="mt-3.5 space-y-1.5 border-t border-slate-800/80 pt-3">
                          {plan.features.slice(0, 4).map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                              <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPlan(plan);
                        }}
                        className={`mt-4 w-full rounded-lg py-2 text-xs font-bold transition-all ${
                          plan.id === 'free'
                            ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                            : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-slate-950 shadow-md shadow-cyan-500/20 hover:opacity-95'
                        }`}
                      >
                        {plan.id === 'free' ? 'Resgatar 500 Grátis' : 'Selecionar Plano'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Checkout Form */}
          {step === 'checkout' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form & Payment Method */}
              <div className="lg:col-span-7 space-y-5">
                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Forma de Pagamento Oficial:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                        paymentMethod === 'pix'
                          ? 'border-teal-400 bg-teal-950/40 text-teal-200 shadow-md shadow-teal-950/40'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <QrCode className="h-4 w-4 text-teal-400" />
                      <span>PIX Oficial Asaas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                        paymentMethod === 'credit_card'
                          ? 'border-blue-500 bg-blue-950/40 text-blue-200 shadow-md shadow-blue-950/40'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <CreditCard className="h-4 w-4 text-blue-400" />
                      <span>Cartão de Crédito</span>
                    </button>
                  </div>
                </div>

                {/* Customer Data */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
                  <h5 className="text-xs font-semibold text-white">1. Dados do Titular (Nota Fiscal)</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Nome Completo</label>
                      <input
                        type="text"
                        value={customer.fullName}
                        onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">E-mail de Notificação</label>
                      <input
                        type="email"
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">CPF / CNPJ</label>
                      <input
                        type="text"
                        value={customer.cpf}
                        onChange={(e) => setCustomer({ ...customer, cpf: e.target.value })}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">WhatsApp / Celular</label>
                      <input
                        type="tel"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Fields if selected */}
                {paymentMethod === 'credit_card' && (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
                    <h5 className="text-xs font-semibold text-white flex items-center justify-between">
                      <span>2. Dados do Cartão de Crédito</span>
                      <div className="flex items-center gap-1">
                        {CARD_BRANDS.map((b) => (
                          <span
                            key={b.name}
                            className={`rounded px-1.5 py-0.2 text-[8px] font-black text-white ${b.bg}`}
                          >
                            {b.badge}
                          </span>
                        ))}
                      </div>
                    </h5>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">
                          Número do Cartão
                        </label>
                        <input
                          type="text"
                          value={cardData.cardNumber}
                          onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                          placeholder="4532 •••• •••• 4242"
                          className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-400 mb-0.5">
                            Nome Impresso no Cartão
                          </label>
                          <input
                            type="text"
                            value={cardData.cardHolder}
                            onChange={(e) =>
                              setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() })
                            }
                            className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">
                            CVV
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardData.cvv}
                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                            className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">
                            Validade (Mês/Ano)
                          </label>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              maxLength={2}
                              value={cardData.expiryMonth}
                              onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value })}
                              placeholder="MM"
                              className="w-1/2 rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none text-center"
                            />
                            <input
                              type="text"
                              maxLength={4}
                              value={cardData.expiryYear}
                              onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value })}
                              placeholder="AAAA"
                              className="w-1/2 rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none text-center"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">
                            Parcelamento
                          </label>
                          <select
                            value={cardData.installments}
                            onChange={(e) =>
                              setCardData({ ...cardData, installments: Number(e.target.value) })
                            }
                            className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                          >
                            <option value={1}>1x de {selectedPlan.priceFormatted} (sem juros)</option>
                            <option value={2}>2x de R$ {(selectedPlan.price / 2).toFixed(2)} (sem juros)</option>
                            <option value={3}>3x de R$ {(selectedPlan.price / 3).toFixed(2)} (sem juros)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-semibold text-slate-400">Resumo da Aquisição</span>
                    <button
                      type="button"
                      onClick={() => setStep('plan')}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      Trocar plano
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{selectedPlan.name}</span>
                      <span className="text-sm font-extrabold text-cyan-300">
                        {selectedPlan.priceFormatted}
                      </span>
                    </div>

                    <div className="rounded-lg bg-cyan-950/30 border border-cyan-500/20 p-2.5 text-xs text-cyan-200">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Zap className="h-3.5 w-3.5 text-cyan-400" />
                        <span>+{selectedPlan.creditsFormatted} imediatos</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Liberação automática pelo webhook do Asaas.
                      </p>
                    </div>

                    <div className="space-y-1 pt-2 text-[11px] text-slate-400 border-t border-slate-800">
                      <div className="flex justify-between">
                        <span>Gateway:</span>
                        <span className="text-white font-medium">Asaas Pagamentos S.A.</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de processamento:</span>
                        <span className="text-emerald-400">Grátis (0%)</span>
                      </div>
                      <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-800">
                        <span>Total:</span>
                        <span className="text-base text-cyan-300">{selectedPlan.priceFormatted}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleProcessPayment}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Comunicando com o Asaas...</span>
                      </>
                    ) : paymentMethod === 'pix' ? (
                      <>
                        <QrCode className="h-4 w-4" />
                        <span>Gerar PIX Asaas Agora</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Confirmar Pagamento com Cartão</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3 text-emerald-400" />
                    <span>Conexão criptografada via Asaas API v3</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PIX Waiting Screen with QR Code and Live Status Polling */}
          {step === 'pix_wait' && activeTransaction && (
            <div className="max-w-xl mx-auto space-y-5 py-2">
              <div className="rounded-2xl border border-teal-500/30 bg-teal-950/20 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-teal-500/20">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-white">
                      PIX Asaas Gerado com Sucesso
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-300">
                    {selectedPlan.priceFormatted}
                  </span>
                </div>

                {/* QR Code Real do Asaas */}
                <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-950/80 p-4 rounded-xl border border-teal-500/30">
                  <div className="h-44 w-44 shrink-0 rounded-xl bg-white p-2.5 flex items-center justify-center shadow-md">
                    {activeTransaction.pixQrCodeImage ? (
                      <img
                        src={`data:image/png;base64,${activeTransaction.pixQrCodeImage}`}
                        alt="QR Code PIX Asaas"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900 text-white rounded p-2 text-center">
                        <QrCode className="h-12 w-12 text-teal-400 mb-1" />
                        <span className="text-[10px] font-mono text-slate-300">PIX Asaas</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2.5 text-left w-full">
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      <span>Como pagar com PIX:</span>
                    </h5>
                    <ol className="text-[11px] text-slate-300 space-y-1 list-decimal list-inside">
                      <li>Abra o aplicativo do seu banco ou carteira digital.</li>
                      <li>Escolha <strong>Pagar com PIX</strong> (QR Code ou Copia e Cola).</li>
                      <li>Aponte a câmera ou cole a chave abaixo.</li>
                    </ol>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-slate-400">Chave PIX Copia e Cola:</span>
                      <div className="flex items-center gap-2">
                        <input
                          readOnly
                          value={activeTransaction.pixCode || ''}
                          className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 font-mono text-[10px] text-slate-300 select-all"
                        />
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className="flex items-center gap-1.5 rounded-lg bg-teal-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md hover:bg-teal-300 transition-colors shrink-0"
                        >
                          {copiedPix ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Radar de Detecção em Tempo Real */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Loader2 className={`h-4 w-4 text-cyan-400 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                    <span>Aguardando webhook do Asaas confirmar o recebimento...</span>
                  </div>

                  <button
                    type="button"
                    disabled={isCheckingStatus}
                    onClick={handleManualCheckStatus}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-semibold"
                  >
                    Já efetuei o pagamento! Checar agora
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 'success' && (
            <div className="py-8 text-center max-w-md mx-auto space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-xl shadow-emerald-950/50">
                <BadgeCheck className="h-10 w-10 animate-bounce" />
              </div>
              <h4 className="text-xl font-bold text-white">
                Pagamento Asaas Aprovado!
              </h4>
              <p className="text-xs text-slate-300">
                Seus <strong>{selectedPlan.creditsFormatted}</strong> foram liberados e já estão prontos para uso em todas as IAs do ZachAI.
              </p>

              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs text-cyan-200">
                <span>Saldo atualizado da sua conta: </span>
                <strong className="text-white font-mono text-sm">
                  {authService.getCurrentUser().credits.toLocaleString('pt-BR')} créditos
                </strong>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all"
              >
                Continuar Programando
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
