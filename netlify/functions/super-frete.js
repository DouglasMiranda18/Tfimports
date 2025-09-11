// Função Netlify para Super Frete - versão ultra simples para debug
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

    console.log('✅ API Key encontrada, testando API...');

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

    // Testar API
    const url = 'https://api.superfrete.com/api/v0/calculator';
    console.log('🌐 Testando URL:', url);
    
    try {
      const apiResponse = await fetch(url, {
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
      
      const responseText = await apiResponse.text();
      console.log('📡 Resposta da API:', responseText);
      
      if (apiResponse.ok) {
        let apiData;
        try {
          apiData = JSON.parse(responseText);
          console.log('📦 Resposta parseada:', JSON.stringify(apiData, null, 2));
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse:', parseError);
          throw parseError;
        }

        // Processar resposta
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
            working_url: url
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
      } else {
        console.error('❌ API retornou erro:', apiResponse.status, responseText);
        throw new Error(`API retornou status ${apiResponse.status}: ${responseText}`);
      }

    } catch (apiError) {
      console.error('❌ Erro na API do Super Frete:', apiError);
      console.error('❌ Stack trace:', apiError.stack);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Erro ao calcular frete com Super Frete',
          details: apiError.message,
          stack: apiError.stack,
          api_used: 'super_frete_api_failed'
        })
      };
    }

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