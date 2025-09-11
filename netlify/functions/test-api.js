// Função de teste para verificar API Key e conectividade
exports.handler = async (event, context) => {
  console.log('🧪 Teste de API chamado');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('🔍 Verificando configuração...');
    
    const apiKey = process.env.SUPER_FRETE_API_KEY;
    console.log('🔑 API Key existe:', !!apiKey);
    console.log('🔑 Tamanho da API Key:', apiKey?.length || 0);
    console.log('🔑 Primeiros 10 caracteres:', apiKey?.substring(0, 10) || 'N/A');
    
    const result = {
      success: true,
      api_key_exists: !!apiKey,
      api_key_length: apiKey?.length || 0,
      api_key_preview: apiKey?.substring(0, 10) || 'N/A',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };

    console.log('✅ Resultado do teste:', result);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('❌ Erro no teste:', error);
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
