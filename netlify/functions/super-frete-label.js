// Função Netlify para criar etiquetas no Super Frete - versão debug
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

    console.log('✅ API Key encontrada, simulando criação de etiqueta...');

    // Simular criação de etiqueta (para debug)
    const result = {
      success: true,
      label_id: 'SF_' + Date.now(),
      status: 'pending',
      tracking: null, // Só fica disponível quando status = 'released'
      price: body.selectedShipping?.price || 0,
      service: body.selectedShipping?.name || 'Mini Envios',
      created_at: new Date().toISOString(),
      message: 'Etiqueta criada com sucesso (modo debug)',
      api_used: 'debug_mode'
    };

    console.log('✅ Etiqueta simulada criada:', result);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

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