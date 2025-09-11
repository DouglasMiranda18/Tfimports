// Função de teste super básica
exports.handler = async (event, context) => {
  console.log('🧪 Função de teste chamada');
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: true,
      message: 'Função de teste funcionando!',
      method: event.httpMethod,
      timestamp: new Date().toISOString()
    })
  };
};
