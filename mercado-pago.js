// Serviço de integração com Mercado Pago
import { validateConfig } from './api-config.js';

class MercadoPagoService {
  constructor() {
    this.config = null;
    this.baseUrl = 'https://api.mercadopago.com';
  }

  // Inicializar configuração
  async init() {
    try {
      this.config = await validateConfig();
      return { success: true };
    } catch (error) {
      console.error('Erro ao inicializar Mercado Pago:', error);
      return { success: false, error: error.message };
    }
  }

  // Criar preferência de pagamento
  async createPreference(preferenceData) {
    try {
      if (!this.config) {
        await this.init();
      }

      const response = await fetch(`${this.baseUrl}/checkout/preferences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.mercado_pago_access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: preferenceData.items.map(item => ({
            id: item.id,
            title: item.nome,
            description: item.descricao,
            quantity: item.quantidade,
            unit_price: item.preco,
            currency_id: 'BRL'
          })),
          payer: {
            name: preferenceData.payer.nome,
            email: preferenceData.payer.email,
            phone: preferenceData.payer.telefone ? {
              number: preferenceData.payer.telefone
            } : undefined
          },
          external_reference: preferenceData.external_reference,
          notification_url: `${this.config.base_url}/api/mercadopago/webhook`,
          back_urls: {
            success: `${this.config.base_url}/#checkout?status=success`,
            failure: `${this.config.base_url}/#checkout?status=failure`,
            pending: `${this.config.base_url}/#checkout?status=pending`
          },
          auto_return: 'approved',
          payment_methods: {
            excluded_payment_methods: [],
            excluded_payment_types: [],
            installments: 12
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar preferência');
      }

      const data = await response.json();
      
      return {
        success: true,
        preference_id: data.id,
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point
      };

    } catch (error) {
      console.error('Erro ao criar preferência:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Processar pagamento com cartão
  async processCardPayment(cardData) {
    try {
      if (!this.config) {
        await this.init();
      }

      const response = await fetch(`${this.baseUrl}/v1/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.mercado_pago_access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction_amount: cardData.amount,
          description: cardData.description,
          payment_method_id: cardData.payment_method_id,
          issuer_id: cardData.issuer_id,
          installments: cardData.installments,
          token: cardData.token,
          payer: {
            email: cardData.payer.email,
            identification: cardData.payer.identification
          },
          external_reference: cardData.external_reference,
          notification_url: `${this.config.base_url}/api/mercadopago/webhook`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao processar pagamento');
      }

      const data = await response.json();
      
      return {
        success: true,
        payment_id: data.id,
        status: data.status,
        status_detail: data.status_detail
      };

    } catch (error) {
      console.error('Erro ao processar pagamento com cartão:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obter status do pagamento
  async getPaymentStatus(paymentId) {
    try {
      if (!this.config) {
        await this.init();
      }

      const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.mercado_pago_access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao obter status do pagamento');
      }

      const data = await response.json();
      
      return {
        success: true,
        id: data.id,
        status: data.status,
        status_detail: data.status_detail,
        transaction_amount: data.transaction_amount,
        external_reference: data.external_reference
      };

    } catch (error) {
      console.error('Erro ao obter status do pagamento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validar webhook do Mercado Pago
  validateWebhook(notificationData, signature) {
    try {
      if (!this.config) {
        return { success: false, error: 'Configuração não inicializada' };
      }

      // Implementar validação de assinatura se necessário
      // Por enquanto, aceitar todas as notificações
      return {
        success: true,
        data: notificationData
      };

    } catch (error) {
      console.error('Erro ao validar webhook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obter métodos de pagamento disponíveis
  async getPaymentMethods() {
    try {
      if (!this.config) {
        await this.init();
      }

      const response = await fetch(`${this.baseUrl}/v1/payment_methods`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.mercado_pago_access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao obter métodos de pagamento');
      }

      const data = await response.json();
      
      return {
        success: true,
        payment_methods: data
      };

    } catch (error) {
      console.error('Erro ao obter métodos de pagamento:', error);
      return {
        success: false,
        error: error.message,
        payment_methods: []
      };
    }
  }

  // Obter bancos emissores
  async getIssuers(paymentMethodId) {
    try {
      if (!this.config) {
        await this.init();
      }

      const response = await fetch(`${this.baseUrl}/v1/payment_methods/${paymentMethodId}/issuers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.mercado_pago_access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao obter bancos emissores');
      }

      const data = await response.json();
      
      return {
        success: true,
        issuers: data
      };

    } catch (error) {
      console.error('Erro ao obter bancos emissores:', error);
      return {
        success: false,
        error: error.message,
        issuers: []
      };
    }
  }

  // Obter parcelas disponíveis
  async getInstallments(amount, paymentMethodId, issuerId) {
    try {
      if (!this.config) {
        await this.init();
      }

      const response = await fetch(`${this.baseUrl}/v1/payment_methods/installments?amount=${amount}&payment_method_id=${paymentMethodId}&issuer_id=${issuerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.mercado_pago_access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao obter parcelas');
      }

      const data = await response.json();
      
      return {
        success: true,
        installments: data[0]?.payer_costs || []
      };

    } catch (error) {
      console.error('Erro ao obter parcelas:', error);
      return {
        success: false,
        error: error.message,
        installments: []
      };
    }
  }
}

// Instância singleton
export const mercadoPagoService = new MercadoPagoService();
