// Função Netlify para criar etiquetas no Super Frete
exports.handler = async (event, context) => {
  console.log('🏷️ Função Super Frete Label chamada:', event.httpMethod);
  
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
    console.log('📦 Processando requisição POST para criar etiqueta');
    
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
    
    const { 
      orderData, 
      selectedShipping, 
      packageDimensions,
      fromData,
      toData 
    } = body;
    
    console.log('📋 Dados recebidos:', { 
      orderData: !!orderData, 
      selectedShipping: !!selectedShipping, 
      packageDimensions: !!packageDimensions,
      fromData: !!fromData,
      toData: !!toData
    });

    // Validar parâmetros básicos
    if (!orderData || !selectedShipping || !packageDimensions || !fromData || !toData) {
      console.log('❌ Parâmetros obrigatórios ausentes');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Parâmetros obrigatórios: orderData, selectedShipping, packageDimensions, fromData, toData' 
        })
      };
    }

    // Verificar API Key
    const apiKey = process.env.SUPER_FRETE_API_KEY;
    if (!apiKey) {
      console.error('❌ API Key do Super Frete não encontrada');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Configuração da API não encontrada'
        })
      };
    }

    // Preparar dados para criação da etiqueta
    const labelData = {
      from: {
        name: fromData.name || "TFI IMPORTS",
        address: fromData.address || "Rua Augusta, 123",
        complement: fromData.complement || "",
        number: fromData.number || "",
        district: fromData.district || "Consolação",
        city: fromData.city || "São Paulo",
        state_abbr: fromData.state_abbr || "SP",
        postal_code: fromData.postal_code || "01310-100",
        document: fromData.document || "12345678901"
      },
      to: {
        name: toData.name || orderData.customer?.nome || "Cliente",
        address: toData.address || orderData.customer?.endereco || "Endereço",
        complement: toData.complement || orderData.customer?.complemento || "",
        number: toData.number || orderData.customer?.numero || "",
        district: toData.district || orderData.customer?.bairro || "NA",
        city: toData.city || orderData.customer?.cidade || "Cidade",
        state_abbr: toData.state_abbr || orderData.customer?.estado || "SP",
        postal_code: toData.postal_code || orderData.customer?.cep || "00000000",
        email: toData.email || orderData.customer?.email || "",
        document: toData.document || orderData.customer?.cpf || "00000000000"
      },
      service: selectedShipping.service_id || selectedShipping.id,
      products: orderData.items?.map(item => ({
        name: item.nome || "Produto",
        quantity: item.quantidade || 1,
        unitary_value: parseFloat(item.preco) || 0
      })) || [],
      volumes: {
        height: packageDimensions.height || 2,
        width: packageDimensions.width || 11,
        length: packageDimensions.length || 16,
        weight: packageDimensions.weight || 0.3
      },
      options: {
        insurance_value: parseFloat(orderData.total) || 0,
        receipt: false,
        own_hand: false,
        non_commercial: false
      },
      platform: "TFI IMPORTS",
      tag: `TFI-${Date.now()}`
    };
    
    console.log('🏷️ Dados para criação da etiqueta:', JSON.stringify(labelData, null, 2));

    // Chamar API para criar etiqueta
    console.log('🔄 Criando etiqueta no Super Frete...');
    
    try {
      const apiResponse = await fetch('https://api.superfrete.com/shipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'SuperFrete-Integration/1.0'
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
      console.log('🏷️ Resposta da API:', JSON.stringify(apiData, null, 2));

      // Processar resposta da API
      if (apiData && apiData.id) {
        const result = {
          success: true,
          label_id: apiData.id,
          status: apiData.status || 'pending',
          tracking: apiData.tracking || null,
          price: apiData.price || selectedShipping.price,
          service: apiData.service || selectedShipping.name,
          created_at: apiData.created_at || new Date().toISOString(),
          message: 'Etiqueta criada com sucesso'
        };

        console.log('✅ Etiqueta criada com sucesso:', result);
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
      console.error('❌ Erro na API do Super Frete:', apiError);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Erro ao criar etiqueta. Tente novamente.',
          details: apiError.message
        })
      };
    }

  } catch (error) {
    console.error('❌ Erro na função Super Frete Label:', error);
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
