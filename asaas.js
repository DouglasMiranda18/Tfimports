// Integração com Asaas - Sistema de Pagamento
import { apiConfig, endpoints, getHeaders } from './api-config.js';

export class AsaasService {
  constructor() {
    this.config = apiConfig.asaas;
    this.baseUrl = this.config.baseUrl;
  }

  // Criar cliente no Asaas via Netlify Function
  async createCustomer(customerData) {
    try {
      console.log('👤 Criando cliente no Asaas:', customerData);
      
      const customer = {
        name: customerData.nome,
        email: customerData.email,
        phone: customerData.telefone,
        mobilePhone: customerData.telefone,
        cpfCnpj: customerData.cpf,
        postalCode: customerData.cep,
        address: customerData.endereco,
        addressNumber: customerData.numero,
        complement: customerData.complemento,
        province: customerData.bairro,
        city: customerData.cidade,
        state: customerData.estado,
        country: 'Brasil',
        externalReference: customerData.id || `cliente-${Date.now()}`
      };

      const response = await fetch('/.netlify/functions/asaas-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'POST',
          endpoint: '/customers',
          data: customer
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(`Erro ao criar cliente: ${result.error}`);
      }

      console.log('✅ Cliente criado:', result.data);
      return result.data;

    } catch (error) {
      console.error('❌ Erro ao criar cliente:', error);
      throw error;
    }
  }

  // Criar pagamento no Asaas
  async createPayment(paymentData) {
    try {
      console.log('💳 Criando pagamento no Asaas:', paymentData);
      
      // Primeiro, criar ou buscar cliente
      let customer;
      try {
        customer = await this.createCustomer(paymentData.cliente);
      } catch (error) {
        console.log('⚠️ Erro ao criar cliente, tentando buscar existente...');
        // Se falhar, usar cliente padrão ou tentar buscar
        customer = { id: 'cliente-padrao' };
      }

      // Calcular valor total
      const totalValue = paymentData.items.reduce((total, item) => {
        return total + (parseFloat(item.preco) * parseInt(item.quantidade));
      }, 0);

      const payment = {
        customer: customer.id,
        billingType: 'CREDIT_CARD', // Pode ser CREDIT_CARD, PIX, BOLETO, etc.
        value: totalValue.toFixed(2),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias
        description: `Pedido ${paymentData.pedidoId} - TFI IMPORTS`,
        externalReference: paymentData.pedidoId,
        callback: {
          successUrl: `${paymentData.baseUrl}/#checkout-success`,
          autoRedirect: true
        },
        creditCard: {
          holderName: paymentData.cliente.nome,
          number: paymentData.cartao?.numero || '',
          expiryMonth: paymentData.cartao?.mes || '',
          expiryYear: paymentData.cartao?.ano || '',
          ccv: paymentData.cartao?.cvv || ''
        },
        creditCardHolderInfo: {
          name: paymentData.cliente.nome,
          email: paymentData.cliente.email,
          cpfCnpj: paymentData.cliente.cpf,
          postalCode: paymentData.cliente.cep,
          addressNumber: paymentData.cliente.numero,
          phone: paymentData.cliente.telefone
        }
      };

      const response = await fetch(`${this.baseUrl}${endpoints.asaas.payments}`, {
        method: 'POST',
        headers: getHeaders('asaas'),
        body: JSON.stringify(payment)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao criar pagamento: ${errorData.errors?.[0]?.description || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Pagamento criado:', result);
      
      return {
        success: true,
        paymentId: result.data.id,
        status: result.data.status,
        paymentUrl: result.data.invoiceUrl,
        qrCode: result.data.pixTransaction?.qrCode,
        pixCopyPaste: result.data.pixTransaction?.payload
      };

    } catch (error) {
      console.error('❌ Erro ao criar pagamento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Criar pagamento PIX
  async createPixPayment(paymentData) {
    try {
      console.log('📱 Criando pagamento PIX no Asaas:', paymentData);
      
      // Primeiro, criar ou buscar cliente
      let customer;
      try {
        customer = await this.createCustomer(paymentData.cliente);
      } catch (error) {
        console.log('⚠️ Erro ao criar cliente, usando cliente padrão...');
        customer = { id: 'cliente-padrao' };
      }

      // Calcular valor total
      const totalValue = paymentData.items.reduce((total, item) => {
        return total + (parseFloat(item.preco) * parseInt(item.quantidade));
      }, 0);

      const payment = {
        customer: customer.id,
        billingType: 'PIX',
        value: totalValue.toFixed(2),
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 dia
        description: `Pedido ${paymentData.pedidoId} - TFI IMPORTS`,
        externalReference: paymentData.pedidoId,
        callback: {
          successUrl: `${paymentData.baseUrl}/#checkout-success`,
          autoRedirect: true
        }
      };

      const response = await fetch('/.netlify/functions/asaas-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'POST',
          endpoint: '/payments',
          data: payment
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(`Erro ao criar PIX: ${result.error}`);
      }
      console.log('✅ PIX criado:', result);
      
      return {
        success: true,
        paymentId: result.id,
        status: result.status,
        qrCode: result.pixTransaction?.qrCode,
        pixCopyPaste: result.pixTransaction?.payload,
        pixKey: result.pixTransaction?.pixKey
      };

    } catch (error) {
      console.error('❌ Erro ao criar PIX:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verificar status do pagamento
  async getPaymentStatus(paymentId) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoints.asaas.payments}/${paymentId}`, {
        method: 'GET',
        headers: getHeaders('asaas')
      });

      if (!response.ok) {
        throw new Error(`Erro ao consultar pagamento: ${response.statusText}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('❌ Erro ao consultar pagamento:', error);
      throw error;
    }
  }

  // Criar pagamento com cartão
  async createCardPayment(paymentData) {
    try {
      console.log('💳 Criando pagamento com cartão no Asaas:', paymentData);
      
      // Primeiro, criar ou buscar cliente
      let customer;
      try {
        customer = await this.createCustomer(paymentData.customer);
      } catch (error) {
        console.log('⚠️ Erro ao criar cliente, usando cliente padrão...');
        // Usar cliente padrão se não conseguir criar
        customer = { id: 'cliente-padrao' };
      }

      const payment = {
        customer: customer.id,
        billingType: 'CREDIT_CARD',
        value: paymentData.items.reduce((total, item) => total + (item.preco * item.quantidade), 0),
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 dia
        description: `Pedido TFI - ${paymentData.items.map(item => item.nome).join(', ')}`,
        externalReference: paymentData.external_reference,
        creditCard: {
          holderName: paymentData.card.nome,
          number: paymentData.card.numero,
          expiryMonth: paymentData.card.validade.split('/')[0],
          expiryYear: `20${paymentData.card.validade.split('/')[1]}`,
          ccv: paymentData.card.cvv
        },
        creditCardHolderInfo: {
          name: paymentData.card.nome,
          email: paymentData.customer.email,
          cpfCnpj: paymentData.customer.cpf,
          postalCode: paymentData.customer.cep,
          addressNumber: paymentData.customer.numero,
          phone: paymentData.customer.telefone
        }
      };

      const response = await fetch('/.netlify/functions/asaas-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'POST',
          endpoint: '/payments',
          data: payment
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(`Erro ao criar pagamento: ${result.error}`);
      }

      console.log('✅ Pagamento com cartão criado:', result.data);
      
      return {
        success: true,
        paymentId: result.data.id,
        status: result.data.status,
        paymentUrl: result.data.invoiceUrl
      };

    } catch (error) {
      console.error('❌ Erro ao criar pagamento com cartão:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Instância do serviço
export const asaasService = new AsaasService();
