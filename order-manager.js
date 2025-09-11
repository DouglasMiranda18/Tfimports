// Gerenciador de Pedidos
import { mercadoPagoService } from './mercado-pago.js';
import { superFreteService } from './super-frete.js';

export class OrderManager {
  constructor(db) {
    this.db = db;
  }

  // Criar pedido completo
  async createOrder(orderData) {
    try {
      const orderId = this.generateOrderId();
      
      // Dados do pedido
      const order = {
        id: orderId,
        status: 'pending_payment',
        user_id: orderData.user_id,
        user_email: orderData.user_email,
        user_name: orderData.user_name,
        items: orderData.items,
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        total: orderData.total,
        shipping_address: orderData.shipping_address,
        payment_method: orderData.payment_method,
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {
          source: 'website',
          version: '1.0'
        }
      };

      // Salvar pedido no Firestore
      await this.db.collection('pedidos').doc(orderId).set(order);

      // Processar pagamento
      const paymentResult = await this.processPayment(order, orderData.payment_data);
      
      if (paymentResult.success) {
        // Atualizar pedido com dados do pagamento
        await this.db.collection('pedidos').doc(orderId).update({
          payment_id: paymentResult.payment_id,
          payment_status: paymentResult.status,
          payment_url: paymentResult.payment_url,
          updated_at: new Date()
        });

        return {
          success: true,
          order_id: orderId,
          payment_url: paymentResult.payment_url,
          payment_id: paymentResult.payment_id
        };
      } else {
        // Marcar pedido como falha no pagamento
        await this.db.collection('pedidos').doc(orderId).update({
          status: 'payment_failed',
          payment_error: paymentResult.error,
          updated_at: new Date()
        });

        return {
          success: false,
          error: paymentResult.error,
          order_id: orderId
        };
      }

    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Processar pagamento
  async processPayment(order, paymentData) {
    try {
      if (paymentData.method === 'pix') {
        return await this.processPixPayment(order, paymentData);
      } else if (paymentData.method === 'credit_card') {
        return await this.processCardPayment(order, paymentData);
      } else if (paymentData.method === 'boleto') {
        return await this.processBoletoPayment(order, paymentData);
      } else {
        throw new Error('Método de pagamento não suportado');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Processar pagamento PIX
  async processPixPayment(order, paymentData) {
    try {
      const preferenceData = {
        items: order.items.map(item => ({
          id: item.id,
          nome: item.nome,
          descricao: item.descricao || '',
          quantidade: item.quantidade,
          preco: item.preco
        })),
        payer: {
          nome: order.user_name,
          email: order.user_email,
          telefone: paymentData.telefone
        },
        external_reference: order.id,
        user_id: order.user_id
      };

      const result = await mercadoPagoService.createPreference(preferenceData);
      
      if (result.success) {
        return {
          success: true,
          payment_id: result.preference_id,
          payment_url: this.config.sandbox ? result.sandbox_init_point : result.init_point,
          status: 'pending'
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Processar pagamento com cartão
  async processCardPayment(order, paymentData) {
    try {
      const cardData = {
        amount: order.total,
        description: `Pedido #${order.id}`,
        payment_method_id: paymentData.payment_method_id,
        issuer_id: paymentData.issuer_id,
        installments: paymentData.installments,
        token: paymentData.token,
        payer: {
          email: order.user_email,
          identification: {
            type: paymentData.identification_type,
            number: paymentData.identification_number
          }
        },
        external_reference: order.id,
        user_id: order.user_id
      };

      const result = await mercadoPagoService.processCardPayment(cardData);
      
      if (result.success) {
        return {
          success: true,
          payment_id: result.payment_id,
          status: result.status,
          payment_url: null
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Processar pagamento boleto
  async processBoletoPayment(order, paymentData) {
    try {
      const preferenceData = {
        items: order.items.map(item => ({
          id: item.id,
          nome: item.nome,
          descricao: item.descricao || '',
          quantidade: item.quantidade,
          preco: item.preco
        })),
        payer: {
          nome: order.user_name,
          email: order.user_email
        },
        external_reference: order.id,
        user_id: order.user_id,
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 1
        }
      };

      const result = await mercadoPagoService.createPreference(preferenceData);
      
      if (result.success) {
        return {
          success: true,
          payment_id: result.preference_id,
          payment_url: this.config.sandbox ? result.sandbox_init_point : result.init_point,
          status: 'pending'
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Atualizar status do pedido
  async updateOrderStatus(orderId, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        updated_at: new Date(),
        ...additionalData
      };

      await this.db.collection('pedidos').doc(orderId).update(updateData);

      // Se pagamento aprovado, criar etiqueta de envio
      if (status === 'payment_approved') {
        console.log('🏷️ Pagamento aprovado, criando etiqueta de envio...');
        const labelResult = await this.createShippingLabel(orderId);
        console.log('🏷️ Resultado da criação da etiqueta:', labelResult);
      }

      return {
        success: true,
        order_id: orderId,
        status
      };

    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Criar etiqueta de envio
  async createShippingLabel(orderId) {
    try {
      console.log('🏷️ Iniciando criação de etiqueta para pedido:', orderId);
      
      const orderDoc = await this.db.collection('pedidos').doc(orderId).get();
      
      if (!orderDoc.exists) {
        throw new Error('Pedido não encontrado');
      }

      const order = orderDoc.data();
      console.log('📦 Dados do pedido:', {
        id: order.id,
        status: order.status,
        shipping: order.shipping,
        items: order.items?.length || 0
      });
      
      const shippingData = {
        service_id: order.shipping.service_id,
        cliente: {
          nome: order.user_name,
          email: order.user_email,
          telefone: order.shipping_address.telefone,
          documento: order.shipping_address.documento
        },
        endereco: {
          logradouro: order.shipping_address.logradouro,
          numero: order.shipping_address.numero,
          complemento: order.shipping_address.complemento,
          bairro: order.shipping_address.bairro,
          cidade: order.shipping_address.cidade,
          uf: order.shipping_address.uf,
          cep: order.shipping_address.cep
        },
        produtos: order.items,
        peso_total: order.items.reduce((total, item) => total + (item.peso || 0.3), 0)
      };

      // Preparar dados para criação da etiqueta no Super Frete
      const labelData = {
        orderData: order,
        selectedShipping: order.shipping,
        packageDimensions: order.package_dimensions || {
          height: 2,
          width: 11,
          length: 16,
          weight: order.items.reduce((total, item) => total + (item.peso || 0.3), 0)
        },
        fromData: {
          name: "TFI IMPORTS",
          address: "Rua Augusta, 123",
          complement: "",
          number: "",
          district: "Consolação",
          city: "São Paulo",
          state_abbr: "SP",
          postal_code: "01310-100",
          document: "12345678901"
        },
        toData: {
          name: order.user_name,
          address: order.shipping_address.logradouro,
          complement: order.shipping_address.complemento || "",
          number: order.shipping_address.numero || "",
          district: order.shipping_address.bairro,
          city: order.shipping_address.cidade,
          state_abbr: order.shipping_address.uf,
          postal_code: order.shipping_address.cep,
          email: order.user_email,
          document: order.shipping_address.documento || "00000000000"
        }
      };

      // Chamar função Netlify para criar etiqueta
      console.log('🌐 Chamando função Netlify para criar etiqueta...');
      console.log('📦 Dados enviados:', labelData);
      
      const response = await fetch('/.netlify/functions/super-frete-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(labelData)
      });

      console.log('📡 Status da resposta:', response.status);
      const result = await response.json();
      console.log('📦 Resultado da função:', result);
      
      if (result.success) {
        // Atualizar pedido com dados da etiqueta
        await this.db.collection('pedidos').doc(orderId).update({
          shipping_label: {
            label_id: result.label_id,
            status: result.status,
            tracking_code: result.tracking,
            price: result.price,
            service: result.service,
            created_at: result.created_at
          },
          status: 'shipping_created',
          updated_at: new Date()
        });

        return {
          success: true,
          label_id: result.label_id,
          tracking_code: result.tracking,
          status: result.status
        };
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Erro ao criar etiqueta de envio:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obter pedidos do usuário
  async getUserOrders(userId, limit = 10) {
    try {
      const snapshot = await this.db.collection('pedidos')
        .where('user_id', '==', userId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .get();

      const orders = [];
      snapshot.forEach(doc => {
        orders.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        orders
      };

    } catch (error) {
      console.error('Erro ao obter pedidos do usuário:', error);
      return {
        success: false,
        error: error.message,
        orders: []
      };
    }
  }

  // Gerar ID único para pedido
  generateOrderId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `TFI-${timestamp}-${random}`.toUpperCase();
  }

  // Processar notificação do Mercado Pago
  async processMercadoPagoNotification(notificationData) {
    try {
      const { type, data } = notificationData;
      
      if (type === 'payment') {
        const paymentStatus = await mercadoPagoService.getPaymentStatus(data.id);
        
        if (paymentStatus.success) {
          const orderId = paymentStatus.external_reference;
          let orderStatus = 'pending';
          
          switch (paymentStatus.status) {
            case 'approved':
              orderStatus = 'payment_approved';
              break;
            case 'pending':
              orderStatus = 'pending_payment';
              break;
            case 'rejected':
              orderStatus = 'payment_rejected';
              break;
            case 'cancelled':
              orderStatus = 'payment_cancelled';
              break;
          }

          await this.updateOrderStatus(orderId, orderStatus, {
            payment_status: paymentStatus.status,
            payment_status_detail: paymentStatus.status_detail,
            payment_amount: paymentStatus.transaction_amount
          });

          return {
            success: true,
            order_id: orderId,
            status: orderStatus
          };
        }
      }

      return {
        success: false,
        error: 'Tipo de notificação não suportado'
      };

    } catch (error) {
      console.error('Erro ao processar notificação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
