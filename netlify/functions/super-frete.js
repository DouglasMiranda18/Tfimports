// Função Netlify para Super Frete - versão debug mínima
exports.handler = async (event, context) => {
  console.log('🚀 Função Super Frete chamada:', event.httpMethod);
  
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
    
    // Parse do body
    let body;
    try {
      body = JSON.parse(event.body || '{}');
      console.log('📋 Body recebido:', body);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Body inválido - não é um JSON válido'
        })
      };
    }
    
    const { cepDestino, peso, valor, dimensoes } = body;
    console.log('📋 Parâmetros extraídos:', { cepDestino, peso, valor, dimensoes });
    
    if (!cepDestino || !peso || !valor) {
      console.log('❌ Parâmetros obrigatórios ausentes');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Parâmetros obrigatórios: cepDestino, peso, valor' 
        })
      };
    }

    // Verificar API Key
    const apiKey = process.env.SUPER_FRETE_API_KEY;
    console.log('🔑 API Key existe:', !!apiKey);
    console.log('🔑 Tamanho da API Key:', apiKey?.length || 0);
    
    if (!apiKey) {
      console.error('❌ API Key não encontrada');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'API Key não configurada'
        })
      };
    }

    console.log('✅ API Key encontrada, preparando dados...');

    // Dados simples para teste
    const shippingData = {
      from: {
        postal_code: '01310-100'
      },
      to: {
        postal_code: cepDestino
      },
      services: "1,2,17",
      options: {
        own_hand: false,
        receipt: false,
        insurance_value: 0,
        use_insurance_value: false
      },
      package: {
        height: 2,
        width: 11,
        length: 16,
        weight: peso
      }
    };
    
    console.log('📦 Dados para API:', JSON.stringify(shippingData, null, 2));

    // Retornar dados de teste primeiro (sem chamar API)
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
          description: 'Melhor preço - Teste',
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
          description: 'Envio econômico - Teste',
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
          description: 'Envio expresso - Teste',
          service: '2',
          error: null
        }
      ],
      origin: '01310-100',
      destination: cepDestino,
      weight: peso,
      value: valor,
      api_used: 'test_mode',
      message: 'Modo de teste - API não chamada'
    };

    console.log('✅ Retornando dados de teste');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('❌ Erro na função:', error);
    console.error('❌ Stack trace:', error.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      })
    };
  }
};