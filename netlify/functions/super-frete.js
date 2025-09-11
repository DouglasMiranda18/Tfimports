// Função Netlify para Super Frete - versão ultra simples
exports.handler = async (event, context) => {
  console.log('🚀 Função Super Frete chamada');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📦 Processando POST');
    
    const body = JSON.parse(event.body || '{}');
    console.log('📋 Body:', body);
    
    const { cepDestino, peso, valor } = body;
    
    if (!cepDestino || !peso || !valor) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Parâmetros obrigatórios: cepDestino, peso, valor' 
        })
      };
    }

    const result = {
      success: true,
      options: [
        {
          id: 'mini-envios',
          name: 'Mini Envios',
          company: 'Correios',
          company_id: '17',
          price: 8.49,
          delivery_time: 'Até 6 dias úteis',
          description: 'Melhor preço',
          service: '17',
          error: null
        },
        {
          id: 'pac',
          name: 'PAC',
          company: 'Correios',
          company_id: '1',
          price: 15.15,
          delivery_time: '5-8 dias úteis',
          description: 'Envio econômico',
          service: '1',
          error: null
        },
        {
          id: 'sedex',
          name: 'SEDEX',
          company: 'Correios',
          company_id: '2',
          price: 24.27,
          delivery_time: '3-5 dias úteis',
          description: 'Envio expresso',
          service: '2',
          error: null
        }
      ],
      origin: '01310-100',
      destination: cepDestino,
      weight: peso,
      value: valor,
      api_used: 'debug_simple'
    };

    console.log('✅ Retornando resultado:', result);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('❌ Erro:', error);
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