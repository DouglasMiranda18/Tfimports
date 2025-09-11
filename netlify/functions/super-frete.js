// Função Netlify para Super Frete - contorna CORS
// Usando fetch nativo do Node.js 18+

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
    console.log('📝 Body recebido:', event.body);
    
    let body;
    try {
      body = JSON.parse(event.body);
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
    console.log('📋 Parâmetros:', { cepDestino, peso, valor, dimensoes });

    // Validar parâmetros
    if (!cepDestino || !peso || !valor) {
      console.log('❌ Parâmetros inválidos:', { cepDestino, peso, valor });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: `Parâmetros obrigatórios: cepDestino=${cepDestino}, peso=${peso}, valor=${valor}` 
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

    // API Key do Super Frete
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTc1ODg5NzQsInN1YiI6InBtOGY3bFREMlpOSFQwRjRsNVBNTFpxbEltZjEifQ.NLe4SysNaudhBIy3xlid18e2cM2wlMDgNCLPMkCkQc';
    const cepOrigem = '01310-100';
    
    console.log('🔑 API Key configurada:', apiKey ? 'Sim' : 'Não');
    console.log('📍 CEP Origem:', cepOrigem);

    // Dimensões padrão se não fornecidas
    const defaultDimensoes = {
      height: 2,
      width: 11,
      length: 16
    };

    const dimensoesFinais = dimensoes || defaultDimensoes;

    // Preparar dados para a API
    const shippingData = {
      from: {
        postal_code: cepOrigem
      },
      to: {
        postal_code: cepDestino
      },
      products: [{
        id: '1',
        width: dimensoesFinais.width,
        height: dimensoesFinais.height,
        length: dimensoesFinais.length,
        weight: peso,
        insurance_value: valor,
        quantity: 1
      }]
    };
    
    console.log('📦 Dados para API:', JSON.stringify(shippingData, null, 2));

    // Chamar API real do Super Frete com retry
    console.log('🔄 Chamando API do Super Frete...');
    
    let lastError = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${maxRetries}...`);
        
        console.log('🌐 Fazendo requisição para:', 'https://api.superfrete.com/shipment/calculate');
        console.log('📤 Headers:', {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.substring(0, 20)}...`,
          'User-Agent': 'SuperFrete-Integration/1.0'
        });
        
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
        console.log('📡 Headers da resposta:', Object.fromEntries(apiResponse.headers.entries()));
        
        if (!apiResponse.ok) {
          throw new Error(`API retornou status ${apiResponse.status}`);
        }

        const apiData = await apiResponse.json();
        console.log('📦 Resposta da API:', JSON.stringify(apiData, null, 2));

        // Processar resposta da API
        if (apiData && apiData.data && Array.isArray(apiData.data) && apiData.data.length > 0) {
          const opcoes = apiData.data.map(item => ({
            id: item.id || item.service,
            name: item.name || item.service,
            company: item.company?.name || 'Correios',
            company_id: item.company?.id || '1',
            price: parseFloat(item.price) || 0,
            delivery_time: item.delivery_time || '5-8 dias úteis',
            description: item.description || '',
            service: item.service || item.id,
            error: item.error || null
          }));

          const result = {
            success: true,
            options: opcoes,
            origin: cepOrigem,
            destination: cepDestino,
            weight: peso,
            value: valor,
            api_used: 'super_frete_api'
          };

          console.log('✅ Resultado da API:', result);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
          };
        } else {
          throw new Error('Resposta da API inválida ou vazia');
        }

      } catch (apiError) {
        lastError = apiError;
        console.error(`❌ Erro na tentativa ${attempt}:`, apiError);
        console.error(`❌ Stack trace:`, apiError.stack);
        
        if (attempt < maxRetries) {
          console.log(`⏳ Aguardando 2 segundos antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    // Se todas as tentativas falharam, retornar erro
    console.error('❌ Todas as tentativas falharam. Último erro:', lastError);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Não foi possível calcular o frete. Tente novamente em alguns minutos.',
        details: lastError?.message || 'Erro desconhecido'
      })
    };

  } catch (error) {
    console.error('Erro na função Super Frete:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Erro interno do servidor. Tente novamente.',
        details: error.message
      })
    };
  }
};