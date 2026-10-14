import React, { useState } from 'react';
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
  ChevronRight,
  Clock,
  Landmark,
  BadgeCheck,
  Zap,
  Crown,
} from 'lucide-react';
import {
  SUBSCRIPTION_PLANS,
  billingService,
} from '../services/billingService';
import { CreditPlan, PaymentMethod, CheckoutCustomerData, CreditCardData } from '../types';
import { authService } from '../services/authService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId?: string;
  onSuccess: (creditsAwarded: number) => void;
}

const BANK_LOGOS = [
  { name: 'Nubank', color: 'from-[#8A05BE] to-[#59037c]' },
  { name: 'Itaú', color: 'from-[#EC7000] to-[#b35400]' },
  { name: 'Bradesco', color: 'from-[#CC092F] to-[#8f041e]' },
  { name: 'Banco do Brasil', color: 'from-[#FCDE00] to-[#c7af00] text-blue-900' },
  { name: 'Caixa', color: 'from-[#0066B3] to-[#004780]' },
  { name: 'Inter', color: 'from-[#FF7A00] to-[#c75e00]' },
  { name: 'Santander', color: 'from-[#EC0000] to-[#9e0000]' },
];

const CARD_BRANDS = [
  { name: 'Visa', badge: 'VISA', bg: 'bg-blue-600' },
  { name: 'Mastercard', badge: 'MC', bg: 'bg-amber-600' },
  { name: 'Elo', badge: 'ELO', bg: 'bg-red-600' },
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
  const [step, setStep] = useState<'plan' | 'checkout' | 'success'>('plan');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  // Customer Form State
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

  // Credit Card Form State
  const [cardData, setCardData] = useState<CreditCardData>({
    cardNumber: '•••• •••• •••• 4242',
    cardHolder: (currentUser.name || 'PEDRO HENRIQUE').toUpperCase(),
    expiryMonth: '12',
    expiryYear: '29',
    cvv: '123',
    installments: 1,
    cardBrand: 'visa',
  });

  if (!isOpen) return null;

  const handleSelectPlan = (plan: CreditPlan) => {
    setSelectedPlan(plan);
    if (plan.id === 'free') {
      // Award free bonus immediately
      authService.addCredits(300, 'free');
      onSuccess(300);
      setStep('success');
    } else {
      setStep('checkout');
    }
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    try {
      const tx = await billingService.processCheckout(
        selectedPlan,
        customer,
        paymentMethod,
        cardData
      );
      setIsProcessing(false);
      setStep('success');
      onSuccess(tx.creditsAwarded);
    } catch (e) {
      setIsProcessing(false);
      alert('Falha ao processar pagamento.');
    }
  };

  const handleCopyPix = () => {
    const pixCode = `00020126580014br.gov.bcb.pix0136${Date.now()}520400005303986540${selectedPlan.price.toFixed(2)}5802BR5925Pedro Henrique Santana6009Sao Paulo62070503***6304`;
    navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#070c1d] shadow-2xl shadow-cyan-950/70 max-h-[92vh] flex flex-col">
        {/* Glow ambient */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#142347] px-6 py-4 bg-[#0a1024]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md shadow-cyan-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#070c1d]">
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Economia de Créditos & Planos Zach AI</span>
                <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">
                  SEGURO
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                10 Créditos por geração · Sem cobranças surpresa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1b2b4a] bg-[#0c142b] text-slate-400 hover:text-white hover:border-cyan-500/40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {authService.getCurrentUser().isSupremeOwner && (
            <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-amber-950/40 p-3.5 text-xs text-amber-200 flex items-center justify-between gap-3 shadow-lg shadow-amber-950/20">
              <div className="flex items-center gap-2.5">
                <Crown className="h-4 w-4 text-amber-400 fill-amber-400/30 shrink-0 animate-pulse" />
                <span>
                  <strong>Dono Supremo (Pedro Henrique):</strong> Você possui <strong>Isenção Total e Créditos Infinitos (∞)</strong>. O checkout comercial abaixo permanece 100% ativo para simulação e teste de planos dos clientes.
                </span>
              </div>
              <span className="rounded-md bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold text-amber-300 shrink-0">
                Acesso Total Gratuito
              </span>
            </div>
          )}

          {step === 'plan' && (
            <div>
              <div className="text-center max-w-lg mx-auto mb-6">
                <h4 className="text-lg font-bold text-white">
                  Escolha o Plano Ideal para seu Aprendizado
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Ganhe acesso ilimitado ao Alex IA, refatoração de código, testes automatizados e o Zach Code Studio.
                </p>
              </div>

              {/* Grid of Plans */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isSelected = selectedPlan.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-400 bg-gradient-to-b from-[#0e1b38] to-[#070e24] shadow-lg shadow-cyan-950/50 scale-[1.02]'
                          : 'border-[#152445] bg-[#081026] hover:border-cyan-500/40 hover:bg-[#0b1532]'
                      }`}
                    >
                      {plan.popularBadge && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                          <span className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-2 py-0.5 text-[8px] font-black uppercase text-slate-950 shadow-sm">
                            {plan.popularBadge}
                          </span>
                        </div>
                      )}

                      <div>
                        <h5 className="font-bold text-white text-xs mt-1">
                          {plan.name}
                        </h5>
                        <div className="mt-2 text-cyan-300 font-extrabold text-base">
                          {plan.priceFormatted}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {plan.creditsFormatted}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {plan.billingPeriod}
                        </div>

                        <ul className="mt-3 space-y-1.5 border-t border-[#16274a] pt-3 text-[10px] text-slate-300">
                          {plan.features.slice(0, 3).map((f, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <CheckCircle2 className="h-3 w-3 shrink-0 text-cyan-400 mt-0.5" />
                              <span className="leading-tight">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPlan(plan);
                        }}
                        type="button"
                        className={`mt-4 w-full rounded-lg py-1.5 text-[11px] font-bold transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-slate-950 shadow-md shadow-cyan-500/20'
                            : 'border border-[#1f3560] bg-[#0d1a38] text-cyan-300 hover:border-cyan-400'
                        }`}
                      >
                        {plan.id === 'free' ? 'Resgatar Grátis' : 'Assinar Plano'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Supported Payment Flags & Banks Banner */}
              <div className="mt-6 rounded-xl border border-[#142347] bg-[#091129] p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Pagamento Seguro com Criptografia SSL e Aprovação Imediata</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    <span className="rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 text-[10px] font-bold">
                      PIX Instantâneo
                    </span>
                    {CARD_BRANDS.map((b) => (
                      <span
                        key={b.name}
                        className={`rounded px-1.5 py-0.5 text-[9px] font-black text-white ${b.bg}`}
                      >
                        {b.badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'checkout' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form & Payment Method (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Escolha a Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                        paymentMethod === 'pix'
                          ? 'border-teal-400 bg-teal-950/30 text-teal-300 shadow-sm'
                          : 'border-[#172749] bg-[#091129] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <QrCode className="h-5 w-5 mb-1" />
                      <span className="text-xs font-bold">PIX</span>
                      <span className="text-[9px] text-teal-400">Aprovação Imediata</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                        paymentMethod === 'credit_card'
                          ? 'border-cyan-400 bg-cyan-950/30 text-cyan-300 shadow-sm'
                          : 'border-[#172749] bg-[#091129] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CreditCard className="h-5 w-5 mb-1" />
                      <span className="text-xs font-bold">Crédito</span>
                      <span className="text-[9px] text-cyan-400">Até 12x</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('debit_card')}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                        paymentMethod === 'debit_card'
                          ? 'border-blue-400 bg-blue-950/30 text-blue-300 shadow-sm'
                          : 'border-[#172749] bg-[#091129] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Landmark className="h-5 w-5 mb-1" />
                      <span className="text-xs font-bold">Débito</span>
                      <span className="text-[9px] text-blue-400">Bancos Nacionais</span>
                    </button>
                  </div>
                </div>

                {/* Customer Data */}
                <div className="space-y-3 rounded-xl border border-[#172749] bg-[#091129] p-4">
                  <h5 className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>1. Dados do Pagador</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={customer.fullName}
                        onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                        className="w-full rounded-lg border border-[#1a2c52] bg-[#080d21] px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                        CPF
                      </label>
                      <input
                        type="text"
                        value={customer.cpf}
                        onChange={(e) => setCustomer({ ...customer, cpf: e.target.value })}
                        className="w-full rounded-lg border border-[#1a2c52] bg-[#080d21] px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                        E-mail para Recibo
                      </label>
                      <input
                        type="email"
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        className="w-full rounded-lg border border-[#1a2c52] bg-[#080d21] px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                        WhatsApp / Celular
                      </label>
                      <input
                        type="tel"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        className="w-full rounded-lg border border-[#1a2c52] bg-[#080d21] px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Method Specific Fields */}
                {paymentMethod === 'pix' && (
                  <div className="rounded-xl border border-teal-500/40 bg-teal-950/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-teal-400" />
                        <span className="text-xs font-bold text-white">Chave PIX e QR Code Dinâmico</span>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] text-teal-300 font-mono">
                        <Clock className="h-3.5 w-3.5 animate-pulse" />
                        <span>Expira em 14:59</span>
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#070e24] p-3 rounded-lg border border-teal-500/20">
                      <div className="h-28 w-28 shrink-0 rounded bg-white p-2 flex items-center justify-center">
                        {/* Realistic Mock QR Code */}
                        <div className="grid grid-cols-5 gap-1 w-full h-full">
                          {Array.from({ length: 25 }).map((_, i) => (
                            <div
                              key={i}
                              className={`rounded-[1px] ${
                                i % 2 === 0 || i % 5 === 0 ? 'bg-slate-900' : 'bg-transparent'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex-1 space-y-2 text-left">
                        <p className="text-[11px] text-slate-300">
                          Abra o app do seu banco (Nubank, Itaú, BB, etc.), escolha <strong>PIX Copia e Cola</strong> e escaneie o código:
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            readOnly
                            value={`00020126580014br.gov.bcb.pix0136tx_${selectedPlan.id}_${selectedPlan.price.toFixed(2)}`}
                            className="flex-1 rounded border border-[#1d2d4f] bg-[#050914] px-2 py-1 font-mono text-[10px] text-slate-400 select-all"
                          />
                          <button
                            type="button"
                            onClick={handleCopyPix}
                            className="flex items-center gap-1 rounded bg-teal-500/20 px-2.5 py-1 text-[10px] font-bold text-teal-300 border border-teal-500/40 hover:bg-teal-500/30"
                          >
                            {copiedPix ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'credit_card' && (
                  <div className="rounded-xl border border-cyan-500/30 bg-[#091129] p-4 space-y-3">
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
                          className="w-full rounded-lg border border-[#1a2c52] bg-[#080d21] px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-400 mb-0.5">
                            Nome Impresso
                          </label>
                          <input
                            type="text"
                            value={cardData.cardHolder}
                            onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() })}
                            className="w-full rounded-lg border border-[#1a2c52] bg-[#080d21] px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
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
                            className="w-full rounded-lg border border-[#1a2c52] bg-[#080d21] px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">
                          Parcelas
                        </label>
                        <select
                          value={cardData.installments}
                          onChange={(e) => setCardData({ ...cardData, installments: Number(e.target.value) })}
                          className="w-full rounded-lg border border-[#1a2c52] bg-[#080d21] px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                        >
                          <option value={1}>1x de {selectedPlan.priceFormatted} (sem juros)</option>
                          <option value={2}>2x de R$ {(selectedPlan.price / 2).toFixed(2)} (sem juros)</option>
                          <option value={3}>3x de R$ {(selectedPlan.price / 3).toFixed(2)} (sem juros)</option>
                          <option value={6}>6x de R$ {((selectedPlan.price * 1.05) / 6).toFixed(2)}</option>
                          <option value={12}>12x de R$ {((selectedPlan.price * 1.1) / 12).toFixed(2)}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'debit_card' && (
                  <div className="rounded-xl border border-blue-500/30 bg-[#091129] p-4 space-y-3">
                    <h5 className="text-xs font-semibold text-white">
                      Selecione o seu Banco Emissor
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {BANK_LOGOS.map((bank) => (
                        <div
                          key={bank.name}
                          className={`rounded-lg bg-gradient-to-r ${bank.color} p-2 text-center text-[11px] font-bold text-white shadow-sm`}
                        >
                          {bank.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Order Summary & Confirmation (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-[#16274b] bg-[#081026] p-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#142347]">
                    <span className="text-xs font-semibold text-slate-400">Plano Selecionado</span>
                    <button
                      type="button"
                      onClick={() => setStep('plan')}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      Alterar plano
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{selectedPlan.name}</span>
                      <span className="text-sm font-extrabold text-cyan-300">
                        {selectedPlan.priceFormatted}
                      </span>
                    </div>

                    <div className="rounded-lg bg-cyan-950/40 border border-cyan-500/20 p-2.5 text-xs text-cyan-200">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Zap className="h-3.5 w-3.5 text-cyan-400" />
                        <span>+{selectedPlan.creditsFormatted} imediatos</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Cada solicitação ou refatoração consome exatamente 10 créditos.
                      </p>
                    </div>

                    <div className="space-y-1 pt-2 text-[11px] text-slate-400 border-t border-[#142347]">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{selectedPlan.priceFormatted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de processamento:</span>
                        <span className="text-emerald-400">R$ 0,00 (Grátis)</span>
                      </div>
                      <div className="flex justify-between text-white font-bold pt-2 border-t border-[#142347]">
                        <span>Total a Pagar:</span>
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
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-cyan-500/25 hover:opacity-95 transition-all"
                  >
                    {isProcessing ? (
                      <span>Processando pagamento com segurança...</span>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Confirmar e Liberar Créditos</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3 text-emerald-400" />
                    <span>Ambiente criptografado 256-bit SSL</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center max-w-md mx-auto space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-xl shadow-emerald-950/50">
                <BadgeCheck className="h-10 w-10 animate-bounce" />
              </div>
              <h4 className="text-xl font-bold text-white">
                Pagamento Aprovado com Sucesso!
              </h4>
              <p className="text-xs text-slate-300">
                Parabéns! Seus <strong>{selectedPlan.creditsFormatted}</strong> foram adicionados à sua conta Zach AI e já estão disponíveis para uso imediato no Alex IA.
              </p>

              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs text-cyan-200">
                <span>Novo saldo de créditos: </span>
                <strong className="text-white font-mono text-sm">
                  {authService.getCurrentUser().credits.toLocaleString('pt-BR')} créditos
                </strong>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20"
              >
                Voltar e Começar a Criar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
