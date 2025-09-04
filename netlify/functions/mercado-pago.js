// Netlify Function para Mercado Pago
// Resolve problemas de CORS fazendo a chamada do servidor

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Apenas aceitar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse do body
    const data = JSON.parse(event.body);
    
    // Credenciais do Mercado Pago (produção)
    const accessToken = 'APP_USR-5032663457298044-090316-620de3416b9f7f60d475223dd78c6b99-2018162925';
    
    // Criar preferência
    const preference = {
      items: data.items.map(item => ({
        id: item.id,
        title: item.nome,
        description: item.descricao || '',
        quantity: item.quantidade,
        unit_price: item.preco,
        currency_id: 'BRL'
      })),
      payer: {
        name: data.cliente.nome,
        email: data.cliente.email,
        phone: {
          number: data.cliente.telefone || ''
        }
      },
      back_urls: {
        success: `${data.baseUrl}/#checkout-success`,
        failure: `${data.baseUrl}/#checkout-failure`,
        pending: `${data.baseUrl}/#checkout-pending`
      },
      auto_return: 'approved',
      external_reference: data.pedidoId,
      notification_url: `${data.baseUrl}/.netlify/functions/webhook-mercado-pago`,
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      }
    };

    // Chamar API do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/v1/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    if (!response.ok) {
      throw new Error(`Mercado Pago API error: ${response.status}`);
    }

    const result = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        preferenceId: result.id,
        initPoint: result.init_point,
        sandboxInitPoint: result.sandbox_init_point
      }),
    };

  } catch (error) {
    console.error('Erro na função Mercado Pago:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      }),
    };
  }
};
