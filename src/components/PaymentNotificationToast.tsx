import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  X,
  Zap,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode,
} from 'lucide-react';
import {
  paymentGatewayService,
  AsaasNotificationEvent,
} from '../services/paymentGatewayService';
import { authService } from '../services/authService';

export const PaymentNotificationToast: React.FC = () => {
  const [activeNotification, setActiveNotification] = useState<AsaasNotificationEvent | null>(null);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    // Subscreve a notificações de pagamento em tempo real (SSE + Polling)
    const unsubscribe = paymentGatewayService.subscribeToPaymentNotifications(
      currentUser.email,
      (notif) => {
        console.info('[PaymentNotificationToast] Pagamento confirmado em tempo real:', notif);

        // Atualiza créditos localmente caso ainda não tenham sido creditados
        authService.addCredits(notif.credits, notif.planName);

        setActiveNotification(notif);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser.email]);

  if (!activeNotification) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-[#070e1e]/95 p-4 shadow-2xl shadow-emerald-950/60 backdrop-blur-md">
        {/* Glow de fundo */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-cyan-500/20 blur-2xl" />

        {/* Botão de Fechar */}
        <button
          onClick={() => setActiveNotification(null)}
          type="button"
          aria-label="Fechar notificação"
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/30">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div className="flex-1 pr-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-emerald-300">
                Asaas Oficial
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeNotification.billingType === 'PIX' ? 'PIX Aprovado' : 'Cartão Confirmado'}
              </span>
            </div>

            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Pagamento Confirmado!</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            </h4>

            <p className="text-xs text-emerald-300 font-semibold mt-0.5">
              +{activeNotification.credits.toLocaleString('pt-BR')} créditos liberados!
            </p>

            <p className="text-[11px] text-slate-300 mt-1">
              Recebimento de R$ {activeNotification.value.toFixed(2)} processado com sucesso.
            </p>

            <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px]">
              <span className="text-slate-400 font-mono truncate max-w-[150px]">
                ID: {activeNotification.paymentId}
              </span>
              <button
                type="button"
                onClick={() => setActiveNotification(null)}
                className="font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Excelente</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
