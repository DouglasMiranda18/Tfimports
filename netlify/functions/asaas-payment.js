// Netlify Function para Asaas
// Cria pagamentos via Asaas API

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
    
    // API Key do Asaas (você vai configurar depois)
    const apiKey = process.env.ASAAS_API_KEY || 'SUA_API_KEY_AQUI';
    const environment = process.env.ASAAS_ENVIRONMENT || 'sandbox';
    const baseUrl = environment === 'production' 
      ? 'https://www.asaas.com/api/v3' 
      : 'https://sandbox.asaas.com/api/v3';
    
    console.log('🔑 API Key configurada:', apiKey ? 'Sim' : 'Não');
    console.log('🌍 Ambiente:', environment);
    
    // Validar dados obrigatórios
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Items são obrigatórios');
    }
    
    if (!data.cliente || !data.cliente.nome || !data.cliente.email) {
      throw new Error('Dados do cliente são obrigatórios');
    }
    
    // Calcular valor total
    const totalValue = data.items.reduce((total, item) => {
      return total + (parseFloat(item.preco) * parseInt(item.quantidade));
    }, 0);
    
    console.log('💰 Valor total:', totalValue);
    
    // Criar pagamento
    const payment = {
      customer: 'cliente-padrao', // Por enquanto usar cliente padrão
      billingType: data.tipoPagamento || 'PIX', // PIX, CREDIT_CARD, BOLETO
      value: totalValue.toFixed(2),
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: `Pedido ${data.pedidoId || 'pedido-' + Date.now()} - TFI IMPORTS`,
      externalReference: data.pedidoId || 'pedido-' + Date.now(),
      callback: {
        successUrl: `${data.baseUrl}/#checkout-success`,
        autoRedirect: true
      }
    };
    
    console.log('🛒 Pagamento criado:', JSON.stringify(payment, null, 2));

    // Chamar API do Asaas
    const result = await new Promise((resolve, reject) => {
      const postData = JSON.stringify(payment);
      
      const options = {
        hostname: environment === 'production' ? 'www.asaas.com' : 'sandbox.asaas.com',
        port: 443,
        path: '/api/v3/payments',
        method: 'POST',
        headers: {
          'access_token': apiKey,
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
            reject(new Error(`Asaas API error: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', (e) => {
        reject(new Error('Erro na requisição: ' + e.message));
      });

      req.write(postData);
      req.end();
    });
    
    console.log('✅ Resposta do Asaas:', result);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentId: result.id,
        status: result.status,
        paymentUrl: result.invoiceUrl,
        qrCode: result.pixTransaction?.qrCode,
        pixCopyPaste: result.pixTransaction?.payload,
        pixKey: result.pixTransaction?.pixKey
      }),
    };

  } catch (error) {
    console.error('❌ Erro na função Asaas:', error);
    
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
