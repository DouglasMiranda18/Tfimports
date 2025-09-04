// Integração com Mercado Pago
import { apiConfig, endpoints, getHeaders } from './api-config.js';

export class MercadoPagoService {
  constructor() {
    this.config = apiConfig.mercadoPago;
    this.baseUrl = this.config.baseUrl;
  }

  // Criar preferência de pagamento para Checkout Pro
  async createPreference(paymentData) {
    try {
      console.log('🛒 Criando preferência Mercado Pago via Netlify Function:', paymentData);
      
      // Preparar dados para a Netlify Function
      const requestData = {
        items: paymentData.items,
        cliente: {
          nome: paymentData.payer.nome,
          email: paymentData.payer.email,
          telefone: paymentData.payer.telefone
        },
        pedidoId: paymentData.external_reference,
        baseUrl: window.location.origin
      };
      
      // Chamar Netlify Function em vez da API diretamente
      const response = await fetch('/.netlify/functions/mercado-pago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Erro na função: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido');
      }

      console.log('✅ Preferência criada com sucesso:', result);
      
      return {
        id: result.preferenceId,
        init_point: result.initPoint,
        sandbox_init_point: result.sandboxInitPoint
      };

    } catch (error) {
      console.error('Erro ao criar preferência Mercado Pago:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Redirecionar para checkout do Mercado Pago
  redirectToCheckout(preferenceId) {
    try {
      const checkoutUrl = this.config.sandbox 
        ? `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`
        : `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`;
      
      console.log('🚀 Redirecionando para checkout:', checkoutUrl);
      
      // Abrir em nova aba ou redirecionar
      if (window.confirm('Redirecionar para o Mercado Pago para finalizar o pagamento?')) {
        window.open(checkoutUrl, '_blank');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao redirecionar para checkout:', error);
      return false;
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
