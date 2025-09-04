// Webhook do Mercado Pago para receber notificações de pagamento
exports.handler = async (event, context) => {
  try {
    // Parse dos dados do webhook
    const data = JSON.parse(event.body);
    
    console.log('Webhook Mercado Pago recebido:', data);
    
    // Aqui você pode processar a notificação
    // Por exemplo, atualizar status do pedido no Firebase
    
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
    
  } catch (error) {
    console.error('Erro no webhook:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
