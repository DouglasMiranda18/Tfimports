// Netlify Function para Webhooks do Melhor Envio
// Nota: Esta função apenas registra os webhooks, não atualiza o Firebase diretamente
// As atualizações do Firebase serão feitas pelo frontend quando necessário

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
    
    // Registrar evento (Firebase será atualizado pelo frontend)
    console.log('📦 Envio criado:', {
      order_id,
      protocol,
      tracking_code,
      timestamp: new Date().toISOString()
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
    
    // Registrar evento
    console.log('💳 Envio pago:', {
      order_id,
      protocol,
      timestamp: new Date().toISOString()
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
    
    // Registrar evento
    console.log('🏷️ Etiqueta gerada:', {
      order_id,
      protocol,
      tracking_code,
      label_url,
      timestamp: new Date().toISOString()
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
    
    // Registrar evento
    console.log('🚚 Envio despachado:', {
      order_id,
      protocol,
      tracking_code,
      timestamp: new Date().toISOString()
    });

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
    
    // Registrar evento
    console.log('✅ Envio entregue:', {
      order_id,
      protocol,
      tracking_code,
      delivered_at,
      timestamp: new Date().toISOString()
    });

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
    
    // Registrar evento
    console.log('❌ Envio cancelado:', {
      order_id,
      protocol,
      reason,
      timestamp: new Date().toISOString()
    });

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
