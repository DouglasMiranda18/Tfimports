// Função Netlify para Super Frete - API oficial
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
    
    const body = JSON.parse(event.body || '{}');
    console.log('📋 Body recebido:', body);
    
    const { cepDestino, peso, valor, dimensoes } = body;
    
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

    // Verificar API Key
    const apiKey = process.env.SUPER_FRETE_API_KEY;
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

    console.log('✅ API Key encontrada, chamando API oficial do Super Frete...');

    // Dimensões padrão
    const defaultDimensoes = {
      height: 2,
      width: 11,
      length: 16
    };

    const dimensoesFinais = dimensoes || defaultDimensoes;

    // Preparar dados para API oficial do Super Frete
    const shippingData = {
      from: {
        postal_code: '01310-100'
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
    
    console.log('📦 Dados para API oficial:', JSON.stringify(shippingData, null, 2));

    // Chamar API oficial do Super Frete
    try {
      console.log('🌐 Fazendo requisição para API oficial do Super Frete...');
      
      const apiResponse = await fetch('https://api.superfrete.com/api/v0/calculator', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'TFI Imports (contato@tfimports.com.br)',
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(shippingData)
      });

      console.log('📡 Status da API:', apiResponse.status);
      
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('❌ API retornou erro:', apiResponse.status, errorText);
        throw new Error(`API retornou status ${apiResponse.status}: ${errorText}`);
      }

      const apiData = await apiResponse.json();
      console.log('📦 Resposta da API oficial:', JSON.stringify(apiData, null, 2));

      // Processar resposta da API oficial
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
          origin: '01310-100',
          destination: cepDestino,
          weight: peso,
          value: valor,
          api_used: 'super_frete_official_api',
          package_dimensions: apiData[0]?.package || null
        };

        console.log('✅ Resultado processado com sucesso da API oficial');
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
      console.error('❌ Erro na API oficial do Super Frete:', apiError);
      
      // Retornar erro específico da API
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Erro ao calcular frete com Super Frete',
          details: apiError.message,
          api_used: 'super_frete_official_api_failed'
        })
      };
    }

  } catch (error) {
    console.error('❌ Erro na função:', error);
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