import React, { useState } from 'react';
import { Info, X, ShieldAlert, ChevronRight } from 'lucide-react';

interface IntegrationBannerProps {
  onOpenSettings?: () => void;
}

export const IntegrationBanner: React.FC<IntegrationBannerProps> = ({
  onOpenSettings,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside aria-label="Informações da Fase 1" className="mx-4 mt-3 mb-1 sm:mx-6">
      <div className="flex flex-col gap-2 rounded-lg border border-cyan-500/20 bg-[#091124] p-3 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="mt-0.5 sm:mt-0 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-cyan-500/10 text-cyan-400">
            <Info className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-semibold text-cyan-200">
              Etapa 1 — Protótipo de Interface & Fluxos Operacionais:
            </span>{' '}
            <span className="text-slate-400">
              A integração de modelo no servidor será conectada na próxima fase.
              Os analisadores, depuradores e fluxos de código estão prontos para teste.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              type="button"
              className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              <ShieldAlert className="h-3 w-3" />
              <span>Ver status de segurança</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            type="button"
            aria-label="Dispensar aviso"
            className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
