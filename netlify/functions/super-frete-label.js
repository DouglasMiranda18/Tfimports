// Função Netlify para criar etiquetas no Super Frete - API oficial
exports.handler = async (event, context) => {
  console.log('🏷️ Função Super Frete Label chamada:', event.httpMethod);
  
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
    console.log('📦 Processando criação de etiqueta');
    
    const body = JSON.parse(event.body || '{}');
    console.log('📋 Dados recebidos:', {
      orderData: !!body.orderData,
      selectedShipping: !!body.selectedShipping,
      packageDimensions: !!body.packageDimensions,
      fromData: !!body.fromData,
      toData: !!body.toData
    });

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

    console.log('✅ API Key encontrada, criando etiqueta na API oficial...');

    // Preparar dados para criação da etiqueta na API oficial
    const labelData = {
      from: {
        name: body.fromData?.name || "TFI IMPORTS",
        address: body.fromData?.address || "Rua Augusta, 123",
        complement: body.fromData?.complement || "",
        number: body.fromData?.number || "",
        district: body.fromData?.district || "Consolação",
        city: body.fromData?.city || "São Paulo",
        state_abbr: body.fromData?.state_abbr || "SP",
        postal_code: body.fromData?.postal_code || "01310-100",
        document: body.fromData?.document || "12345678901"
      },
      to: {
        name: body.toData?.name || body.orderData?.user_name || "Cliente",
        address: body.toData?.address || body.orderData?.shipping_address?.logradouro || "Endereço",
        complement: body.toData?.complement || body.orderData?.shipping_address?.complemento || "",
        number: body.toData?.number || body.orderData?.shipping_address?.numero || "",
        district: body.toData?.district || body.orderData?.shipping_address?.bairro || "NA",
        city: body.toData?.city || body.orderData?.shipping_address?.cidade || "Cidade",
        state_abbr: body.toData?.state_abbr || body.orderData?.shipping_address?.uf || "SP",
        postal_code: body.toData?.postal_code || body.orderData?.shipping_address?.cep || "00000000",
        email: body.toData?.email || body.orderData?.user_email || "",
        document: body.toData?.document || body.orderData?.shipping_address?.documento || "00000000000"
      },
      service: body.selectedShipping?.service_id || body.selectedShipping?.id || "17",
      products: body.orderData?.items?.map(item => ({
        name: item.nome || "Produto",
        quantity: item.quantidade || 1,
        unitary_value: parseFloat(item.preco) || 0
      })) || [],
      volumes: {
        height: body.packageDimensions?.height || 2,
        width: body.packageDimensions?.width || 11,
        length: body.packageDimensions?.length || 16,
        weight: body.packageDimensions?.weight || 0.3
      },
      options: {
        insurance_value: parseFloat(body.orderData?.total) || 0,
        receipt: false,
        own_hand: false,
        non_commercial: false
      },
      platform: "TFI IMPORTS",
      tag: `TFI-${Date.now()}`
    };
    
    console.log('🏷️ Dados para criação da etiqueta:', JSON.stringify(labelData, null, 2));

    // Chamar API oficial para criar etiqueta
    try {
      console.log('🌐 Criando etiqueta na API oficial do Super Frete...');
      
      const apiResponse = await fetch('https://api.superfrete.com/api/v0/cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'TFI Imports (contato@tfimports.com.br)',
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(labelData)
      });

      console.log('📡 Status da API:', apiResponse.status);
      
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('❌ API retornou erro:', apiResponse.status, errorText);
        throw new Error(`API retornou status ${apiResponse.status}: ${errorText}`);
      }

      const apiData = await apiResponse.json();
      console.log('🏷️ Resposta da API oficial:', JSON.stringify(apiData, null, 2));

      // Processar resposta da API oficial
      if (apiData && apiData.id) {
        const result = {
          success: true,
          label_id: apiData.id,
          status: apiData.status || 'pending',
          tracking: apiData.tracking || null,
          price: apiData.price || body.selectedShipping?.price || 0,
          service: apiData.service || body.selectedShipping?.name || 'Mini Envios',
          created_at: apiData.created_at || new Date().toISOString(),
          message: 'Etiqueta criada com sucesso na API oficial',
          api_used: 'super_frete_official_api'
        };

        console.log('✅ Etiqueta criada com sucesso na API oficial:', result);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result)
        };
      } else {
        console.error('❌ Resposta da API inválida:', apiData);
        throw new Error('Resposta da API inválida');
      }

    } catch (apiError) {
      console.error('❌ Erro na API oficial do Super Frete:', apiError);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Erro ao criar etiqueta na API oficial',
          details: apiError.message,
          api_used: 'super_frete_official_api_failed'
        })
      };
    }

  } catch (error) {
    console.error('❌ Erro na função Super Frete Label:', error);
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