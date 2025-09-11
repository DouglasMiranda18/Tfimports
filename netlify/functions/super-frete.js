// Função Netlify para Super Frete - implementação completa
exports.handler = async (event, context) => {
  console.log('🚀 Função Super Frete chamada:', event.httpMethod);
  
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ Respondendo OPTIONS');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Apenas permitir POST
  if (event.httpMethod !== 'POST') {
    console.log('❌ Método não permitido:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📦 Processando requisição POST');
    
    // Parse do body
    let body;
    try {
      body = JSON.parse(event.body);
      console.log('✅ JSON parse bem-sucedido');
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
    console.log('📋 Parâmetros recebidos:', { cepDestino, peso, valor, dimensoes });

    // Validar parâmetros básicos
    if (!cepDestino || !peso || !valor) {
      console.log('❌ Parâmetros inválidos');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Parâmetros obrigatórios: cepDestino, peso, valor' 
        })
      };
    }
    
    // Validar CEP
    if (cepDestino.length !== 8) {
      console.log('❌ CEP inválido:', cepDestino);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: `CEP deve ter 8 dígitos: ${cepDestino}` 
        })
      };
    }

    // Verificar variáveis de ambiente
    console.log('🔍 Verificando variáveis de ambiente...');
    console.log('🔑 SUPER_FRETE_API_KEY existe:', !!process.env.SUPER_FRETE_API_KEY);
    console.log('🔑 Tamanho da API Key:', process.env.SUPER_FRETE_API_KEY?.length || 0);
    
    // API Key do Super Frete (variável de ambiente)
    const apiKey = process.env.SUPER_FRETE_API_KEY;
    const cepOrigem = '01310-100';
    
    if (!apiKey) {
      console.error('❌ API Key do Super Frete não encontrada');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Configuração da API não encontrada - verifique as variáveis de ambiente'
        })
      };
    }

    console.log('✅ API Key encontrada, continuando...');

    // Dimensões padrão se não fornecidas
    const defaultDimensoes = {
      height: 2,
      width: 11,
      length: 16
    };

    const dimensoesFinais = dimensoes || defaultDimensoes;

    // Preparar dados para a API do Super Frete (formato correto)
    const shippingData = {
      from: {
        postal_code: cepOrigem
      },
      to: {
        postal_code: cepDestino
      },
      services: "1,2,17", // PAC, SEDEX, Mini Envios
      options: {
        own_hand: false,
        receipt: false,
        insurance_value: parseFloat(valor),
        use_insurance_value: true
      },
      products: [{
        quantity: 1,
        height: dimensoesFinais.height,
        width: dimensoesFinais.width,
        length: dimensoesFinais.length,
        weight: peso
      }]
    };
    
    console.log('📦 Dados para API:', JSON.stringify(shippingData, null, 2));

    // Chamar API real do Super Frete
    console.log('🔄 Chamando API do Super Frete...');
    
    try {
      console.log('🌐 Fazendo requisição para:', 'https://api.superfrete.com/shipment/calculate');
      
      const apiResponse = await fetch('https://api.superfrete.com/shipment/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'SuperFrete-Integration/1.0'
        },
        body: JSON.stringify(shippingData)
      });

      console.log('📡 Status da API:', apiResponse.status);
      
      if (!apiResponse.ok) {
        console.error('❌ API retornou erro:', apiResponse.status);
        const errorText = await apiResponse.text();
        console.error('❌ Resposta de erro:', errorText);
        throw new Error(`API retornou status ${apiResponse.status}: ${errorText}`);
      }

      const apiData = await apiResponse.json();
      console.log('📦 Resposta da API recebida:', JSON.stringify(apiData, null, 2));

      // Processar resposta da API
      if (apiData && Array.isArray(apiData) && apiData.length > 0) {
        const opcoes = apiData.map(item => ({
          id: item.id || item.service,
          name: item.name || item.service,
          company: item.company?.name || 'Correios',
          company_id: item.company?.id || item.service,
          price: parseFloat(item.price) || 0,
          delivery_time: item.delivery_time || '5-8 dias úteis',
          description: item.description || '',
          service: item.service || item.id,
          error: item.error || null,
          // Dados da caixa ideal retornada pela API
          package: item.package || null
        }));

        const result = {
          success: true,
          options: opcoes,
          origin: cepOrigem,
          destination: cepDestino,
          weight: peso,
          value: valor,
          api_used: 'super_frete_api',
          package_dimensions: apiData[0]?.package || null // Dimensões da caixa ideal
        };

        console.log('✅ Resultado processado com sucesso');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result)
        };
      } else {
        console.error('❌ Resposta da API inválida ou vazia:', apiData);
        throw new Error('Resposta da API inválida ou vazia');
      }

    } catch (apiError) {
      console.error('❌ Erro na API do Super Frete:', apiError);
      
      // Retornar erro específico
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Erro ao calcular frete. Tente novamente.',
          details: apiError.message
        })
      };
    }

  } catch (error) {
    console.error('❌ Erro na função Super Frete:', error);
    console.error('❌ Stack trace:', error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Erro interno do servidor. Tente novamente.',
        details: error.message,
        stack: error.stack
      })
    };
  }
};