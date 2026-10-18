/**
 * emailService.ts
 * Serviço Oficial de Envio de E-mails Transacionais via Resend (https://resend.com)
 * 
 * E-mails suportados:
 * 1. Boas-vindas (Novo cadastro com cota inicial de 500 créditos)
 * 2. Recuperação de Senha (Código de verificação PIN e link seguro)
 * 3. Confirmação de Pagamento Asaas (Créditos liberados via PIX ou Cartão)
 */

import { Resend } from 'resend';

// Store para códigos de recuperação de senha com validade de 30 minutos
interface ResetCodeEntry {
  code: string;
  email: string;
  expiresAt: number;
}

const PASSWORD_RESET_STORE = new Map<string, ResetCodeEntry>();

export function getResendClient(): { client: Resend | null; fromEmail: string; apiKey: string } {
  const apiKey = process.env.RESEND_API_KEY || '';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Zach AI <onboarding@resend.dev>';

  if (!apiKey || apiKey === 'MY_RESEND_API_KEY') {
    return { client: null, fromEmail, apiKey: '' };
  }

  try {
    const client = new Resend(apiKey);
    return { client, fromEmail, apiKey };
  } catch (err) {
    console.error('[emailService] Erro ao instanciar cliente Resend:', err);
    return { client: null, fromEmail, apiKey };
  }
}

/**
 * Gera um código numérico de 6 dígitos para recuperação de senha
 */
export function generatePasswordResetCode(email: string): string {
  const cleanEmail = email.trim().toLowerCase();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutos de validade

  PASSWORD_RESET_STORE.set(cleanEmail, { code, email: cleanEmail, expiresAt });
  return code;
}

/**
 * Valida o código numérico de recuperação de senha
 */
export function verifyPasswordResetCode(email: string, code: string): { valid: boolean; message: string } {
  const cleanEmail = email.trim().toLowerCase();
  const entry = PASSWORD_RESET_STORE.get(cleanEmail);

  if (!entry) {
    return { valid: false, message: 'Nenhuma solicitação de recuperação encontrada para este e-mail.' };
  }

  if (Date.now() > entry.expiresAt) {
    PASSWORD_RESET_STORE.delete(cleanEmail);
    return { valid: false, message: 'O código de verificação expirou (validade de 30 minutos). Solicite um novo.' };
  }

  if (entry.code !== code.trim()) {
    return { valid: false, message: 'Código de verificação incorreto. Verifique o número recebido por e-mail.' };
  }

  return { valid: true, message: 'Código validado com sucesso.' };
}

/**
 * Invalida o código após o uso
 */
export function invalidatePasswordResetCode(email: string): void {
  const cleanEmail = email.trim().toLowerCase();
  PASSWORD_RESET_STORE.delete(cleanEmail);
}

// ==========================================
// Templates HTML Responsivos com Identidade Visual Zach AI
// ==========================================

function getEmailHeader(): string {
  return `
    <div style="text-align: center; padding: 24px 0 16px 0; border-bottom: 1px solid #1e293b;">
      <div style="display: inline-block; background: linear-gradient(135deg, #0284c7, #06b6d4); padding: 2px; border-radius: 12px; margin-bottom: 12px;">
        <div style="background: #070b19; padding: 8px 16px; border-radius: 10px;">
          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #38bdf8;">
            ZACH<span style="color: #ffffff;">.AI</span>
          </span>
        </div>
      </div>
      <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">
        Inteligência Artificial & Engenharia de Software
      </p>
    </div>
  `;
}

function getEmailFooter(): string {
  return `
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #1e293b; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748b;">
      <p style="margin: 0 0 6px 0;">Este é um e-mail transacional automático enviado por Zach AI.</p>
      <p style="margin: 0 0 6px 0;">Integrado oficialmente com <strong>Asaas Gateway</strong> e <strong>Resend</strong>.</p>
      <p style="margin: 0; font-size: 11px; color: #475569;">© ${new Date().getFullYear()} Zach AI Inc. Todos os direitos reservados.</p>
    </div>
  `;
}

/**
 * 1. E-mail de Boas-Vindas
 */
export async function sendWelcomeEmail(params: {
  name: string;
  email: string;
  credits?: number;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const { client, fromEmail } = getResendClient();
  const credits = params.credits || 500;
  const firstName = params.name ? params.name.split(' ')[0] : 'Desenvolvedor(a)';

  if (!client) {
    console.warn('[emailService] RESEND_API_KEY não configurada. E-mail de boas-vindas não disparado.');
    return { success: false, error: 'Chave RESEND_API_KEY não configurada no servidor.' };
  }

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>Bem-vindo ao Zach AI</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">
        <div style="background-color: #0b1120; border: 1px solid #1e293b; border-radius: 16px; padding: 32px 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          ${getEmailHeader()}

          <div style="padding: 24px 0;">
            <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0; line-height: 1.3;">
              Olá, ${firstName}! Seja muito bem-vindo(a) ao Zach AI 🚀
            </h1>

            <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 20px 0;">
              Sua conta foi criada com sucesso! Para começar com o pé direito na construção e diagnóstico dos seus projetos, creditamos sua cota inicial imediata:
            </p>

            <!-- Quota Card -->
            <div style="background: linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(6, 182, 212, 0.1)); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.2px; color: #38bdf8; font-weight: 600;">Saldo Inicial Liberado</span>
              <div style="font-size: 38px; font-weight: 900; color: #ffffff; margin: 8px 0; font-family: 'SF Pro Display', -apple-system, sans-serif;">
                +${credits} <span style="font-size: 18px; font-weight: 600; color: #38bdf8;">CRÉDITOS</span>
              </div>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                Utilize para geração de código, diagnósticos com IA e arquitetura de software.
              </p>
            </div>

            <h3 style="font-size: 15px; font-weight: 600; color: #f1f5f9; margin: 0 0 12px 0;">
              O que você pode fazer no Zach AI:
            </h3>
            <ul style="padding-left: 20px; margin: 0 0 24px 0; font-size: 14px; line-height: 1.8; color: #94a3b8;">
              <li><strong style="color: #e2e8f0;">Assistente Multimodal:</strong> Diagnóstico de bugs e inspeção de código em tempo real.</li>
              <li><strong style="color: #e2e8f0;">Integração Oficial de Pagamentos:</strong> Recarga instantânea via PIX e Cartão Asaas.</li>
              <li><strong style="color: #e2e8f0;">Painel de Customização:</strong> Bordas com temas LED RGB, modo focado e exportação limpa.</li>
            </ul>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 28px 0;">
              <a href="https://ais-pre-p5o2ir2xgilqolihysf6zq-221400284737.us-east1.run.app" 
                 style="display: inline-block; background: linear-gradient(135deg, #0284c7, #06b6d4); color: #070b19; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);">
                Acessar Plataforma Zach AI →
              </a>
            </div>
          </div>

          ${getEmailFooter()}
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const res = await client.emails.send({
      from: fromEmail,
      to: params.email,
      subject: `🚀 Bem-vindo(a) ao Zach AI! Seus ${credits} créditos foram liberados`,
      html,
    });

    if (res.error) {
      console.warn('[emailService] Resend retornou aviso ao enviar boas-vindas:', res.error);
      return { success: false, error: res.error.message };
    }

    console.info(`[emailService] E-mail de boas-vindas enviado para ${params.email} com sucesso (ID: ${res.data?.id})`);
    return { success: true, id: res.data?.id };
  } catch (err: any) {
    console.error('[emailService] Erro ao enviar boas-vindas:', err);
    return { success: false, error: err?.message || 'Falha no envio via Resend' };
  }
}

/**
 * 2. E-mail de Recuperação de Senha
 */
export async function sendPasswordResetEmail(params: {
  email: string;
  name?: string;
  code: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const { client, fromEmail } = getResendClient();
  const firstName = params.name ? params.name.split(' ')[0] : 'Usuário';

  if (!client) {
    console.warn('[emailService] RESEND_API_KEY não configurada. E-mail de recuperação não disparado.');
    return { success: false, error: 'Chave RESEND_API_KEY não configurada no servidor.' };
  }

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>Recuperação de Senha - Zach AI</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">
        <div style="background-color: #0b1120; border: 1px solid #1e293b; border-radius: 16px; padding: 32px 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          ${getEmailHeader()}

          <div style="padding: 24px 0;">
            <div style="display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
              Segurança da Conta
            </div>

            <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0;">
              Código de Recuperação de Senha 🔐
            </h1>

            <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 20px 0;">
              Olá, ${firstName}! Recebemos uma solicitação para redefinir a senha de acesso da sua conta Zach AI vinculada a <strong>${params.email}</strong>.
            </p>

            <!-- Verification Code Card -->
            <div style="background: #020617; border: 1px dashed #38bdf8; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Seu Código de Verificação</span>
              <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; margin: 12px 0; font-family: monospace;">
                ${params.code}
              </div>
              <p style="margin: 0; font-size: 12px; color: #f59e0b;">
                ⏱ Este código expira em <strong>30 minutos</strong>.
              </p>
            </div>

            <p style="font-size: 13px; line-height: 1.6; color: #94a3b8; margin: 0 0 16px 0;">
              Insira o código acima no aplicativo Zach AI na tela de confirmação para cadastrar sua nova senha com segurança.
            </p>

            <div style="background-color: rgba(30, 41, 59, 0.5); border-left: 3px solid #64748b; padding: 12px; border-radius: 4px; font-size: 12px; color: #94a3b8; margin-top: 20px;">
              <strong>Não solicitou esta redefinição?</strong> Você pode ignorar este e-mail com segurança. Sua senha atual permanecerá inalterada e sua conta protegida.
            </div>
          </div>

          ${getEmailFooter()}
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const res = await client.emails.send({
      from: fromEmail,
      to: params.email,
      subject: `🔐 Recuperação de Senha - Zach AI (Código: ${params.code})`,
      html,
    });

    if (res.error) {
      console.warn('[emailService] Resend retornou erro ao enviar recuperação:', res.error);
      return { success: false, error: res.error.message };
    }

    console.info(`[emailService] Código de recuperação enviado para ${params.email} (ID: ${res.data?.id})`);
    return { success: true, id: res.data?.id };
  } catch (err: any) {
    console.error('[emailService] Erro ao enviar recuperação de senha:', err);
    return { success: false, error: err?.message || 'Falha no envio de e-mail' };
  }
}

/**
 * 3. E-mail de Confirmação de Pagamento Asaas
 */
export async function sendPaymentConfirmationEmail(params: {
  customerName?: string;
  customerEmail: string;
  planName: string;
  amount: number;
  creditsAwarded: number;
  paymentId: string;
  billingType?: string;
  invoiceUrl?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const { client, fromEmail } = getResendClient();
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'Cliente';
  const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(params.amount);
  const formattedMethod = (params.billingType || 'PIX').toUpperCase();

  if (!client) {
    console.warn('[emailService] RESEND_API_KEY não configurada. E-mail de confirmação de pagamento não disparado.');
    return { success: false, error: 'Chave RESEND_API_KEY não configurada no servidor.' };
  }

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>Pagamento Aprovado - Zach AI</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">
        <div style="background-color: #0b1120; border: 1px solid #1e293b; border-radius: 16px; padding: 32px 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          ${getEmailHeader()}

          <div style="padding: 24px 0;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 50%; margin-bottom: 12px;">
                <span style="font-size: 24px; color: #34d399;">✓</span>
              </div>
              <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 6px 0;">
                Pagamento Aprovado com Sucesso! 🎉
              </h1>
              <p style="font-size: 13px; color: #34d399; margin: 0; font-weight: 600;">
                Gateway Asaas Oficial • Cobrança Confirmada
              </p>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 20px 0;">
              Olá, ${firstName}! O seu pagamento foi processado e recebido pelo Asaas. Seus créditos foram adicionados automaticamente à sua conta Zach AI.
            </p>

            <!-- Credits Highlight Box -->
            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1)); border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.2px; color: #34d399; font-weight: 600;">
                Créditos Adicionados Imediatamente
              </span>
              <div style="font-size: 38px; font-weight: 900; color: #ffffff; margin: 8px 0;">
                +${params.creditsAwarded.toLocaleString('pt-BR')} <span style="font-size: 18px; font-weight: 600; color: #34d399;">CRÉDITOS</span>
              </div>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                Disponíveis agora no seu painel para qualquer geração de código e diagnósticos.
              </p>
            </div>

            <!-- Receipt Breakdown Table -->
            <div style="background-color: #020617; border: 1px solid #1e293b; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
              <h4 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">
                Resumo da Transação Asaas
              </h4>
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #1e293b;">
                  <td style="padding: 8px 0; color: #94a3b8;">Item / Pacote:</td>
                  <td style="padding: 8px 0; text-align: right; color: #ffffff; font-weight: 600;">${params.planName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #1e293b;">
                  <td style="padding: 8px 0; color: #94a3b8;">Valor Pago:</td>
                  <td style="padding: 8px 0; text-align: right; color: #34d399; font-weight: 700;">${formattedPrice}</td>
                </tr>
                <tr style="border-bottom: 1px solid #1e293b;">
                  <td style="padding: 8px 0; color: #94a3b8;">Forma de Pagamento:</td>
                  <td style="padding: 8px 0; text-align: right; color: #ffffff;">${formattedMethod}</td>
                </tr>
                <tr style="border-bottom: 1px solid #1e293b;">
                  <td style="padding: 8px 0; color: #94a3b8;">ID da Cobrança Asaas:</td>
                  <td style="padding: 8px 0; text-align: right; color: #64748b; font-family: monospace; font-size: 11px;">${params.paymentId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8;">Data / Hora:</td>
                  <td style="padding: 8px 0; text-align: right; color: #94a3b8; font-size: 12px;">${new Date().toLocaleString('pt-BR')}</td>
                </tr>
              </table>
            </div>

            <!-- CTA / Invoice Link -->
            <div style="text-align: center; margin: 24px 0;">
              <a href="https://ais-pre-p5o2ir2xgilqolihysf6zq-221400284737.us-east1.run.app" 
                 style="display: inline-block; background: linear-gradient(135deg, #0284c7, #06b6d4); color: #070b19; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin-right: 8px; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);">
                Abrir Zach AI e Usar Créditos →
              </a>
              ${
                params.invoiceUrl
                  ? `<a href="${params.invoiceUrl}" target="_blank" style="display: inline-block; background: #1e293b; color: #e2e8f0; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 20px; border-radius: 8px; border: 1px solid #334155;">Ver Comprovante Asaas</a>`
                  : ''
              }
            </div>
          </div>

          ${getEmailFooter()}
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const res = await client.emails.send({
      from: fromEmail,
      to: params.customerEmail,
      subject: `✅ Pagamento Aprovado! ${params.creditsAwarded} créditos adicionados à sua conta Zach AI`,
      html,
    });

    if (res.error) {
      console.warn('[emailService] Resend retornou erro ao enviar confirmação de pagamento:', res.error);
      return { success: false, error: res.error.message };
    }

    console.info(`[emailService] Confirmação de pagamento enviada para ${params.customerEmail} (ID: ${res.data?.id})`);
    return { success: true, id: res.data?.id };
  } catch (err: any) {
    console.error('[emailService] Erro ao enviar confirmação de pagamento:', err);
    return { success: false, error: err?.message || 'Falha no envio de e-mail via Resend' };
  }
}
