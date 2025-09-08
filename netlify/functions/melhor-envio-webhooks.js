// Netlify Function para Webhooks do Melhor Envio
const admin = require('firebase-admin');

// Inicializar Firebase Admin (se não estiver inicializado)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin:', error);
  }
}

const db = admin.firestore();

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Webhook-Signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Verificar se é POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Método não permitido'
        })
      };
    }

    // Verificar assinatura do webhook (opcional)
    const signature = event.headers['x-webhook-signature'];
    const webhookSecret = process.env.MELHOR_ENVIO_WEBHOOK_SECRET;
    
    if (webhookSecret && !verifyWebhookSignature(event.body, signature, webhookSecret)) {
      console.error('❌ Assinatura do webhook inválida');
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Assinatura inválida'
        })
      };
    }

    // Parse do payload
    const webhookData = JSON.parse(event.body);
    console.log('🚚 Webhook Melhor Envio recebido:', webhookData);

    const { event: eventType, data } = webhookData;
    
    let result;

    switch (eventType) {
      case 'shipment.created':
        result = await handleShipmentCreated(data);
        break;
      case 'shipment.paid':
        result = await handleShipmentPaid(data);
        break;
      case 'shipment.generated':
        result = await handleShipmentGenerated(data);
        break;
      case 'shipment.dispatched':
        result = await handleShipmentDispatched(data);
        break;
      case 'shipment.delivered':
        result = await handleShipmentDelivered(data);
        break;
      case 'shipment.cancelled':
        result = await handleShipmentCancelled(data);
        break;
      default:
        console.log(`Evento não tratado: ${eventType}`);
        result = { success: true, message: 'Evento não tratado' };
    }

    console.log('✅ Webhook processado:', result);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

// Verificar assinatura do webhook
function verifyWebhookSignature(payload, signature, secret) {
  // Implementar verificação de assinatura conforme documentação do Melhor Envio
  // Por enquanto, retorna true (implementar conforme necessário)
  return true;
}

// Envio criado
async function handleShipmentCreated(data) {
  try {
    const { order_id, protocol, tracking_code } = data;
    
    // Atualizar pedido no Firestore
    await db.collection('orders').doc(order_id).update({
      'shipping_label.order_id': order_id,
      'shipping_label.protocol': protocol,
      'shipping_label.tracking_code': tracking_code,
      'shipping_label.status': 'created',
      'shipping_label.created_at': admin.firestore.FieldValue.serverTimestamp(),
      status: 'shipping_created',
      updated_at: admin.firestore.FieldValue.serverTimestamp()
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
async function handleShipmentPaid(data) {
  try {
    const { order_id, protocol } = data;
    
    // Atualizar pedido no Firestore
    await db.collection('orders').doc(order_id).update({
      'shipping_label.status': 'paid',
      'shipping_label.paid_at': admin.firestore.FieldValue.serverTimestamp(),
      status: 'shipping_paid',
      updated_at: admin.firestore.FieldValue.serverTimestamp()
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
async function handleShipmentGenerated(data) {
  try {
    const { order_id, protocol, tracking_code, label_url } = data;
    
    // Atualizar pedido no Firestore
    await db.collection('orders').doc(order_id).update({
      'shipping_label.status': 'generated',
      'shipping_label.label_url': label_url,
      'shipping_label.generated_at': admin.firestore.FieldValue.serverTimestamp(),
      status: 'shipping_generated',
      updated_at: admin.firestore.FieldValue.serverTimestamp()
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
async function handleShipmentDispatched(data) {
  try {
    const { order_id, protocol, tracking_code } = data;
    
    // Atualizar pedido no Firestore
    await db.collection('orders').doc(order_id).update({
      'shipping_label.status': 'dispatched',
      'shipping_label.dispatched_at': admin.firestore.FieldValue.serverTimestamp(),
      status: 'shipped',
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Enviar notificação para o cliente (opcional)
    await notifyCustomer(order_id, 'dispatched');

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
async function handleShipmentDelivered(data) {
  try {
    const { order_id, protocol, tracking_code, delivered_at } = data;
    
    // Atualizar pedido no Firestore
    await db.collection('orders').doc(order_id).update({
      'shipping_label.status': 'delivered',
      'shipping_label.delivered_at': delivered_at || admin.firestore.FieldValue.serverTimestamp(),
      status: 'delivered',
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Enviar notificação para o cliente
    await notifyCustomer(order_id, 'delivered');

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
async function handleShipmentCancelled(data) {
  try {
    const { order_id, protocol, reason } = data;
    
    // Atualizar pedido no Firestore
    await db.collection('orders').doc(order_id).update({
      'shipping_label.status': 'cancelled',
      'shipping_label.cancelled_at': admin.firestore.FieldValue.serverTimestamp(),
      'shipping_label.cancellation_reason': reason,
      status: 'shipping_cancelled',
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Enviar notificação para o cliente
    await notifyCustomer(order_id, 'cancelled');

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
async function notifyCustomer(orderId, status) {
  try {
    const orderDoc = await db.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      console.log('Pedido não encontrado para notificação');
      return;
    }

    const order = orderDoc.data();
    const customerEmail = order.user_email;
    
    // Salvar notificação no banco
    await db.collection('notifications').add({
      order_id: orderId,
      user_id: order.user_id,
      user_email: customerEmail,
      type: 'shipping_status',
      status: status,
      message: getStatusMessage(status),
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });

    console.log(`Notificação salva para cliente ${customerEmail} sobre status: ${status}`);

  } catch (error) {
    console.error('Erro ao notificar cliente:', error);
  }
}

// Obter mensagem de status
function getStatusMessage(status) {
  const messages = {
    'dispatched': 'Seu pedido foi despachado e está a caminho!',
    'delivered': 'Seu pedido foi entregue com sucesso!',
    'cancelled': 'Seu envio foi cancelado. Entre em contato conosco.'
  };
  
  return messages[status] || 'Status do seu pedido foi atualizado.';
}
