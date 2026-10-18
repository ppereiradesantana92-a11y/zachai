/**
 * emailService.ts (Frontend Client)
 * Serviço de comunicação com as rotas de e-mails transacionais do Resend
 */

export interface ResendConfigStatus {
  configured: boolean;
  fromEmail: string;
  provider: string;
}

export const emailService = {
  /**
   * Consulta o status de configuração do Resend no servidor
   */
  async getStatus(): Promise<ResendConfigStatus> {
    try {
      const res = await fetch('/api/emails/config');
      if (res.ok) {
        return await res.json();
      }
      return { configured: false, fromEmail: '', provider: 'resend' };
    } catch {
      return { configured: false, fromEmail: '', provider: 'resend' };
    }
  },

  /**
   * Dispara o e-mail de boas-vindas com a cota inicial de créditos
   */
  async sendWelcomeEmail(params: {
    email: string;
    name?: string;
    credits?: number;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/emails/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      return { success: res.ok && data.success, error: data.error };
    } catch (err: any) {
      console.warn('[emailService] Falha de rede ao disparar boas-vindas:', err);
      return { success: false, error: err?.message || 'Falha na requisição' };
    }
  },

  /**
   * Solicita o código de recuperação de senha por e-mail
   */
  async requestPasswordReset(params: {
    email: string;
    name?: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/emails/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      return {
        success: res.ok && data.success,
        message: data.message,
        error: data.error,
      };
    } catch (err: any) {
      console.error('[emailService] Erro ao solicitar recuperação:', err);
      return { success: false, error: err?.message || 'Erro de conexão com o servidor' };
    }
  },

  /**
   * Valida o código de 6 dígitos recebido por e-mail
   */
  async verifyResetCode(email: string, code: string): Promise<{ valid: boolean; message: string }> {
    try {
      const res = await fetch('/api/emails/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      return await res.json();
    } catch (err: any) {
      return { valid: false, message: err?.message || 'Erro de conexão ao verificar código' };
    }
  },

  /**
   * Confirma e redefine a senha do usuário
   */
  async confirmPasswordReset(params: {
    email: string;
    code: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/emails/confirm-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      return {
        success: res.ok && data.success,
        message: data.message || (data.success ? 'Senha alterada com sucesso.' : 'Falha ao alterar senha.'),
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro ao redefinir senha' };
    }
  },
};
