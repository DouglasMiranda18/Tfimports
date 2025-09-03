// Integração com Mercado Pago
import { apiConfig, endpoints, getHeaders } from './api-config.js';

export class MercadoPagoService {
  constructor() {
    this.config = apiConfig.mercadoPago;
    this.baseUrl = this.config.baseUrl;
  }

  // Criar preferência de pagamento
  async createPreference(paymentData) {
    try {
      const preference = {
        items: paymentData.items.map(item => ({
          id: item.id,
          title: item.nome,
          description: item.descricao || '',
          quantity: item.quantidade,
          unit_price: item.preco,
          currency_id: 'BRL'
        })),
        payer: {
          name: paymentData.payer.nome,
          email: paymentData.payer.email,
          phone: paymentData.payer.telefone ? {
            area_code: paymentData.payer.telefone.substring(0, 2),
            number: paymentData.payer.telefone.substring(2)
          } : undefined
        },
        back_urls: {
          success: `${window.location.origin}/#checkout?status=success`,
          failure: `${window.location.origin}/#checkout?status=failure`,
          pending: `${window.location.origin}/#checkout?status=pending`
        },
        auto_return: 'approved',
        external_reference: paymentData.external_reference,
        notification_url: `${window.location.origin}/api/notifications/mercado-pago`,
        metadata: {
          order_id: paymentData.external_reference,
          user_id: paymentData.user_id
        }
      };

      const response = await fetch(`${this.baseUrl}${endpoints.mercadoPago.preferences}`, {
        method: 'POST',
        headers: getHeaders('mercadoPago'),
        body: JSON.stringify(preference)
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar preferência: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        preference_id: data.id,
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point
      };

    } catch (error) {
      console.error('Erro ao criar preferência Mercado Pago:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verificar status do pagamento
  async getPaymentStatus(paymentId) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoints.mercadoPago.payments}/${paymentId}`, {
        method: 'GET',
        headers: getHeaders('mercadoPago')
      });

      if (!response.ok) {
        throw new Error(`Erro ao verificar pagamento: ${response.status}`);
      }

      const payment = await response.json();
      return {
        success: true,
        status: payment.status,
        status_detail: payment.status_detail,
        transaction_amount: payment.transaction_amount,
        external_reference: payment.external_reference
      };

    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Processar pagamento com cartão
  async processCardPayment(paymentData) {
    try {
      const payment = {
        transaction_amount: paymentData.amount,
        description: paymentData.description,
        payment_method_id: paymentData.payment_method_id,
        issuer_id: paymentData.issuer_id,
        installments: paymentData.installments,
        token: paymentData.token,
        payer: {
          email: paymentData.payer.email,
          identification: {
            type: paymentData.payer.identification.type,
            number: paymentData.payer.identification.number
          }
        },
        external_reference: paymentData.external_reference,
        metadata: {
          order_id: paymentData.external_reference,
          user_id: paymentData.user_id
        }
      };

      const response = await fetch(`${this.baseUrl}${endpoints.mercadoPago.payments}`, {
        method: 'POST',
        headers: getHeaders('mercadoPago'),
        body: JSON.stringify(payment)
      });

      if (!response.ok) {
        throw new Error(`Erro ao processar pagamento: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        payment_id: result.id,
        status: result.status,
        status_detail: result.status_detail
      };

    } catch (error) {
      console.error('Erro ao processar pagamento com cartão:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obter métodos de pagamento disponíveis
  async getPaymentMethods() {
    try {
      const response = await fetch(`${this.baseUrl}/v1/payment_methods?country_id=BR`, {
        method: 'GET',
        headers: getHeaders('mercadoPago')
      });

      if (!response.ok) {
        throw new Error(`Erro ao obter métodos de pagamento: ${response.status}`);
      }

      const methods = await response.json();
      return {
        success: true,
        methods: methods.filter(method => 
          ['credit_card', 'debit_card', 'pix', 'boleto'].includes(method.id)
        )
      };

    } catch (error) {
      console.error('Erro ao obter métodos de pagamento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obter bandeiras de cartão
  async getCardBrands() {
    try {
      const response = await fetch(`${this.baseUrl}/v1/payment_methods/card_issuers?payment_method_id=credit_card`, {
        method: 'GET',
        headers: getHeaders('mercadoPago')
      });

      if (!response.ok) {
        throw new Error(`Erro ao obter bandeiras: ${response.status}`);
      }

      const brands = await response.json();
      return {
        success: true,
        brands
      };

    } catch (error) {
      console.error('Erro ao obter bandeiras de cartão:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Instância global do serviço
export const mercadoPagoService = new MercadoPagoService();
