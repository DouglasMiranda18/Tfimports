// Função de teste ultra simples
exports.handler = async (event, context) => {
  console.log('🧪 Teste simples chamado:', event.httpMethod);
  
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
    console.log('📦 Processando requisição');
    
    const body = JSON.parse(event.body || '{}');
    console.log('📋 Body recebido:', body);
    
    const result = {
      success: true,
      message: 'Função de teste funcionando',
      received_data: body,
      timestamp: new Date().toISOString(),
      method: event.httpMethod
    };

    console.log('✅ Resultado:', result);
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
