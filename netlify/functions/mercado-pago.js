// Netlify Function para Mercado Pago
// Resolve problemas de CORS fazendo a chamada do servidor

const https = require('https');

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
    console.log('📥 Dados recebidos:', event.body);
    
    // Parse do body
    const data = JSON.parse(event.body);
    console.log('📋 Dados parseados:', data);
    
    // Credenciais do Mercado Pago (produção)
    const accessToken = 'APP_USR-5032663457298044-090316-620de3416b9f7f60d475223dd78c6b99-2018162925';
    console.log('🔑 Access Token configurado');
    
    // Validar dados obrigatórios
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Items são obrigatórios');
    }
    
    if (!data.cliente || !data.cliente.nome || !data.cliente.email) {
      throw new Error('Dados do cliente são obrigatórios');
    }
    
    // Criar preferência
    const preference = {
      items: data.items.map(item => ({
        id: item.id,
        title: item.nome,
        description: item.descricao || '',
        quantity: parseInt(item.quantidade) || 1,
        unit_price: parseFloat(item.preco) || 0,
        currency_id: 'BRL'
      })),
      payer: {
        name: data.cliente.nome,
        email: data.cliente.email,
        phone: data.cliente.telefone ? {
          number: data.cliente.telefone
        } : undefined
      },
      back_urls: {
        success: `${data.baseUrl}/#checkout-success`,
        failure: `${data.baseUrl}/#checkout-failure`,
        pending: `${data.baseUrl}/#checkout-pending`
      },
      auto_return: 'approved',
      external_reference: data.pedidoId || 'pedido-' + Date.now(),
      notification_url: `${data.baseUrl}/.netlify/functions/webhook-mercado-pago`,
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      }
    };
    
    console.log('🛒 Preferência criada:', JSON.stringify(preference, null, 2));

    // Chamar API do Mercado Pago usando https
    const result = await new Promise((resolve, reject) => {
      const postData = JSON.stringify(preference);
      
      const options = {
        hostname: 'api.mercadopago.com',
        port: 443,
        path: '/v1/checkout/preferences',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error('Erro ao parsear resposta: ' + e.message));
            }
          } else {
            reject(new Error(`Mercado Pago API error: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', (e) => {
        reject(new Error('Erro na requisição: ' + e.message));
      });

      req.write(postData);
      req.end();
    });
    
    console.log('✅ Resposta do Mercado Pago:', result);

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
