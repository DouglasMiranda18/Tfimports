// Função Netlify para Super Frete - API real
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

    console.log('✅ API Key encontrada, chamando API do Super Frete...');

    // Dimensões padrão
    const defaultDimensoes = {
      height: 2,
      width: 11,
      length: 16
    };

    const dimensoesFinais = dimensoes || defaultDimensoes;

    // Preparar dados para API do Super Frete
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
    
    console.log('📦 Dados para API:', JSON.stringify(shippingData, null, 2));

    // Chamar API real do Super Frete
    try {
      console.log('🌐 Fazendo requisição para API do Super Frete...');
      
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
        const errorText = await apiResponse.text();
        console.error('❌ API retornou erro:', apiResponse.status, errorText);
        throw new Error(`API retornou status ${apiResponse.status}: ${errorText}`);
      }

      const apiData = await apiResponse.json();
      console.log('📦 Resposta da API:', JSON.stringify(apiData, null, 2));

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
          origin: '01310-100',
          destination: cepDestino,
          weight: peso,
          value: valor,
          api_used: 'super_frete_api',
          package_dimensions: apiData[0]?.package || null
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
      
      // Retornar dados de fallback em caso de erro
      const fallbackResult = {
        success: true,
        options: [
          {
            id: 'mini-envios',
            name: 'Mini Envios',
            company: 'Correios',
            company_id: '17',
            price: 8.49,
            delivery_time: 'Até 6 dias úteis',
            description: 'Melhor preço - Fallback',
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
            description: 'Envio econômico - Fallback',
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
            description: 'Envio expresso - Fallback',
            service: '2',
            error: null
          }
        ],
        origin: '01310-100',
        destination: cepDestino,
        weight: peso,
        value: valor,
        api_used: 'fallback_mode',
        error: apiError.message
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(fallbackResult)
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