// Netlify Function para processar pagamentos Asaas
exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { method, endpoint, data } = JSON.parse(event.body);
    console.log('📥 Requisição recebida:', { method, endpoint, data });
    
    // Configurar URL base do Asaas
    const baseUrl = 'https://www.asaas.com/api/v3';
    const url = `${baseUrl}${endpoint}`;
    console.log('🔗 URL do Asaas:', url);
    
    // Configurar headers para Asaas
    const asaasHeaders = {
      'Content-Type': 'application/json',
      'access_token': process.env.VITE_ASAAS_API_KEY
    };

    // Fazer requisição para Asaas
    const response = await fetch(url, {
      method: method || 'POST',
      headers: asaasHeaders,
      body: data ? JSON.stringify(data) : undefined
    });

    const result = await response.json();
    console.log('📦 Resposta do Asaas:', JSON.stringify(result, null, 2));

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          success: false,
          error: result.errors?.[0]?.description || 'Erro na API Asaas',
          details: result
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result
      })
    };

  } catch (error) {
    console.error('Erro na função Asaas:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      })
    };
  }
};