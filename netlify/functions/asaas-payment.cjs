// Função Netlify para integração com Asaas API
// Endpoint: /.netlify/functions/asaas-payment

// Usar fetch nativo do Node.js 18+ ou polyfill
const fetch = globalThis.fetch || require('node-fetch');

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    // Verificar se é uma requisição POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Método não permitido. Use POST.'
        })
      };
    }

    // Parse do body da requisição
    const body = JSON.parse(event.body || '{}');
    
    // Extrair parâmetros
    const { method, endpoint, data } = body;

    // Validar parâmetros obrigatórios
    if (!method || !endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Parâmetros obrigatórios: method, endpoint'
        })
      };
    }

    // Obter API key do ambiente
    const apiKey = process.env.VITE_ASAAS_API_KEY;
    if (!apiKey) {
      console.error('❌ VITE_ASAAS_API_KEY não configurada');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Configuração da API não encontrada'
        })
      };
    }

    // URL base da API Asaas
    const environment = process.env.VITE_ASAAS_ENVIRONMENT || 'sandbox';
    const baseUrl = environment === 'production' 
      ? 'https://www.asaas.com/api/v3' 
      : 'https://sandbox.asaas.com/api/v3';
    const url = `${baseUrl}${endpoint}`;

    console.log('💳 Fazendo requisição para Asaas:', {
      method,
      url,
      hasData: !!data
    });

    // Preparar headers para a API Asaas
    const apiHeaders = {
      'access_token': apiKey,
      'Content-Type': 'application/json'
    };

    // Fazer requisição para a API do Asaas
    const response = await fetch(url, {
      method,
      headers: apiHeaders,
      body: data ? JSON.stringify(data) : undefined
    });

    console.log('📡 Status da resposta Asaas:', response.status);

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta:', parseError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Resposta inválida da API',
          details: responseText.substring(0, 200)
        })
      };
    }

    if (!response.ok) {
      console.error('❌ Erro na API Asaas:', response.status, responseData);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: responseData.errors ? responseData.errors[0].description : 'Erro na API',
          status: response.status,
          details: responseData
        })
      };
    }

    console.log('📦 Resposta da API Asaas:', responseData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: responseData,
        status: response.status
      })
    };

  } catch (error) {
    console.error('❌ Erro na função asaas-payment:', error);
    
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
