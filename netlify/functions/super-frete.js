// Função Netlify para Super Frete - versão debug
exports.handler = async (event, context) => {
  console.log('🚀 Função Super Frete chamada:', event.httpMethod);
  
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
    console.log('📦 Processando requisição POST');
    
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
    
    const { cepDestino, peso, valor, dimensoes } = body;
    console.log('📋 Parâmetros recebidos:', { cepDestino, peso, valor, dimensoes });

    // Validar parâmetros básicos
    if (!cepDestino || !peso || !valor) {
      console.log('❌ Parâmetros inválidos');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Parâmetros obrigatórios: cepDestino, peso, valor' 
        })
      };
    }
    
    // Validar CEP
    if (cepDestino.length !== 8) {
      console.log('❌ CEP inválido:', cepDestino);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: `CEP deve ter 8 dígitos: ${cepDestino}` 
        })
      };
    }

    // Verificar variáveis de ambiente
    console.log('🔍 Verificando variáveis de ambiente...');
    console.log('🔑 SUPER_FRETE_API_KEY existe:', !!process.env.SUPER_FRETE_API_KEY);
    console.log('🔑 Tamanho da API Key:', process.env.SUPER_FRETE_API_KEY?.length || 0);
    
    // API Key do Super Frete (variável de ambiente)
    const apiKey = process.env.SUPER_FRETE_API_KEY;
    const cepOrigem = '01310-100';
    
    if (!apiKey) {
      console.error('❌ API Key do Super Frete não encontrada');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Configuração da API não encontrada - verifique as variáveis de ambiente'
        })
      };
    }

    console.log('✅ API Key encontrada, continuando...');

    // Por enquanto, retornar dados de teste para verificar se a função está funcionando
    console.log('🧪 Retornando dados de teste (sem chamar API)');
    
    const result = {
      success: true,
      options: [
        {
          id: 'pac',
          name: 'PAC',
          company: 'Correios',
          company_id: '1',
          price: 15.15,
          delivery_time: '5-8 dias úteis',
          description: 'Envio econômico',
          service: 'pac',
          error: null
        },
        {
          id: 'sedex',
          name: 'SEDEX',
          company: 'Correios',
          company_id: '2',
          price: 24.27,
          delivery_time: '3-5 dias úteis',
          description: 'Envio expresso',
          service: 'sedex',
          error: null
        }
      ],
      origin: '01310-100',
      destination: cepDestino,
      weight: peso,
      value: valor,
      api_used: 'debug_mode',
      api_key_found: !!apiKey
    };

    console.log('✅ Resultado de debug:', result);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('❌ Erro na função Super Frete:', error);
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