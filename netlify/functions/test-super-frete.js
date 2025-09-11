// Função de teste simples para Super Frete
exports.handler = async (event, context) => {
  console.log('🧪 Teste Super Frete chamado');
  
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
    const body = JSON.parse(event.body || '{}');
    console.log('📋 Body recebido:', body);
    
    const result = {
      success: true,
      message: 'Teste funcionando',
      received_data: body,
      api_key_exists: !!process.env.SUPER_FRETE_API_KEY,
      timestamp: new Date().toISOString()
    };

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
