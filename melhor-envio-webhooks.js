// Webhooks do Melhor Envio
import { melhorEnvioService } from './melhor-envio.js';

export class MelhorEnvioWebhooks {
  constructor(db) {
    this.db = db;
  }

  // Processar webhook de status de envio
  async processShippingStatusWebhook(webhookData) {
    try {
      const { event, data } = webhookData;
      
      switch (event) {
        case 'shipment.created':
          return await this.handleShipmentCreated(data);
        case 'shipment.paid':
          return await this.handleShipmentPaid(data);
        case 'shipment.generated':
          return await this.handleShipmentGenerated(data);
        case 'shipment.dispatched':
          return await this.handleShipmentDispatched(data);
        case 'shipment.delivered':
          return await this.handleShipmentDelivered(data);
        case 'shipment.cancelled':
          return await this.handleShipmentCancelled(data);
        default:
          console.log(`Evento não tratado: ${event}`);
          return { success: true, message: 'Evento não tratado' };
      }
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Envio criado
  async handleShipmentCreated(data) {
    try {
      const { order_id, protocol, tracking_code } = data;
      
      // Atualizar pedido no Firestore
      await this.db.collection('pedidos').doc(order_id).update({
        'shipping_label.order_id': order_id,
        'shipping_label.protocol': protocol,
        'shipping_label.tracking_code': tracking_code,
        'shipping_label.status': 'created',
        'shipping_label.created_at': new Date(),
        status: 'shipping_created',
        updated_at: new Date()
      });

      return {
        success: true,
        message: 'Envio criado com sucesso',
        order_id,
        tracking_code
      };
    } catch (error) {
      console.error('Erro ao processar envio criado:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Envio pago
  async handleShipmentPaid(data) {
    try {
      const { order_id, protocol } = data;
      
      // Atualizar pedido no Firestore
      await this.db.collection('pedidos').doc(order_id).update({
        'shipping_label.status': 'paid',
        'shipping_label.paid_at': new Date(),
        status: 'shipping_paid',
        updated_at: new Date()
      });

      return {
        success: true,
        message: 'Envio pago com sucesso',
        order_id,
        protocol
      };
    } catch (error) {
      console.error('Erro ao processar envio pago:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Etiqueta gerada
  async handleShipmentGenerated(data) {
    try {
      const { order_id, protocol, tracking_code, label_url } = data;
      
      // Atualizar pedido no Firestore
      await this.db.collection('pedidos').doc(order_id).update({
        'shipping_label.status': 'generated',
        'shipping_label.label_url': label_url,
        'shipping_label.generated_at': new Date(),
        status: 'shipping_generated',
        updated_at: new Date()
      });

      return {
        success: true,
        message: 'Etiqueta gerada com sucesso',
        order_id,
        tracking_code,
        label_url
      };
    } catch (error) {
      console.error('Erro ao processar etiqueta gerada:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Envio despachado
  async handleShipmentDispatched(data) {
    try {
      const { order_id, protocol, tracking_code } = data;
      
      // Atualizar pedido no Firestore
      await this.db.collection('pedidos').doc(order_id).update({
        'shipping_label.status': 'dispatched',
        'shipping_label.dispatched_at': new Date(),
        status: 'shipped',
        updated_at: new Date()
      });

      // Enviar notificação para o cliente (opcional)
      await this.notifyCustomer(order_id, 'dispatched');

      return {
        success: true,
        message: 'Envio despachado com sucesso',
        order_id,
        tracking_code
      };
    } catch (error) {
      console.error('Erro ao processar envio despachado:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Envio entregue
  async handleShipmentDelivered(data) {
    try {
      const { order_id, protocol, tracking_code, delivered_at } = data;
      
      // Atualizar pedido no Firestore
      await this.db.collection('pedidos').doc(order_id).update({
        'shipping_label.status': 'delivered',
        'shipping_label.delivered_at': delivered_at || new Date(),
        status: 'delivered',
        updated_at: new Date()
      });

      // Enviar notificação para o cliente
      await this.notifyCustomer(order_id, 'delivered');

      return {
        success: true,
        message: 'Envio entregue com sucesso',
        order_id,
        tracking_code
      };
    } catch (error) {
      console.error('Erro ao processar envio entregue:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Envio cancelado
  async handleShipmentCancelled(data) {
    try {
      const { order_id, protocol, reason } = data;
      
      // Atualizar pedido no Firestore
      await this.db.collection('pedidos').doc(order_id).update({
        'shipping_label.status': 'cancelled',
        'shipping_label.cancelled_at': new Date(),
        'shipping_label.cancellation_reason': reason,
        status: 'shipping_cancelled',
        updated_at: new Date()
      });

      // Enviar notificação para o cliente
      await this.notifyCustomer(order_id, 'cancelled');

      return {
        success: true,
        message: 'Envio cancelado',
        order_id,
        reason
      };
    } catch (error) {
      console.error('Erro ao processar envio cancelado:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Notificar cliente sobre mudança de status
  async notifyCustomer(orderId, status) {
    try {
      const orderDoc = await this.db.collection('pedidos').doc(orderId).get();
      
      if (!orderDoc.exists) {
        console.log('Pedido não encontrado para notificação');
        return;
      }

      const order = orderDoc.data();
      const customerEmail = order.user_email;
      
      // Aqui você pode implementar envio de email, SMS, push notification, etc.
      console.log(`Notificando cliente ${customerEmail} sobre status: ${status}`);
      
      // Exemplo: Salvar notificação no banco
      await this.db.collection('notificacoes').add({
        order_id: orderId,
        user_id: order.user_id,
        user_email: customerEmail,
        type: 'shipping_status',
        status: status,
        message: this.getStatusMessage(status),
        created_at: new Date(),
        read: false
      });

    } catch (error) {
      console.error('Erro ao notificar cliente:', error);
    }
  }

  // Obter mensagem de status
  getStatusMessage(status) {
    const messages = {
      'dispatched': 'Seu pedido foi despachado e está a caminho!',
      'delivered': 'Seu pedido foi entregue com sucesso!',
      'cancelled': 'Seu envio foi cancelado. Entre em contato conosco.'
    };
    
    return messages[status] || 'Status do seu pedido foi atualizado.';
  }

  // Verificar integridade do webhook
  async verifyWebhookSignature(payload, signature, secret) {
    try {
      // Implementar verificação de assinatura se necessário
      // Por enquanto, retorna true (implementar conforme documentação do Melhor Envio)
      return true;
    } catch (error) {
      console.error('Erro ao verificar assinatura do webhook:', error);
      return false;
    }
  }

  // Processar webhook de rastreamento
  async processTrackingWebhook(webhookData) {
    try {
      const { tracking_code, events } = webhookData;
      
      // Atualizar histórico de rastreamento
      await this.db.collection('rastreamento').doc(tracking_code).set({
        tracking_code,
        events: events,
        last_update: new Date(),
        updated_at: new Date()
      }, { merge: true });

      return {
        success: true,
        message: 'Rastreamento atualizado',
        tracking_code
      };
    } catch (error) {
      console.error('Erro ao processar webhook de rastreamento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Instância global
export const melhorEnvioWebhooks = new MelhorEnvioWebhooks();
