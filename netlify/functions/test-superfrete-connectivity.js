// Função para testar conectividade com SuperFrete
exports.handler = async (event, context) => {
  console.log('🧪 Teste de conectividade SuperFrete chamado');
  
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
    console.log('🔍 Testando conectividade com SuperFrete...');
    
    const apiKey = process.env.SUPER_FRETE_API_KEY;
    console.log('🔑 API Key existe:', !!apiKey);
    console.log('🔑 Tamanho da API Key:', apiKey?.length || 0);
    
    const results = {
      timestamp: new Date().toISOString(),
      api_key_exists: !!apiKey,
      api_key_length: apiKey?.length || 0,
      tests: []
    };

    // Teste 1: Conectividade básica
    try {
      console.log('🌐 Teste 1: Conectividade básica...');
      const basicTest = await fetch('https://api.superfrete.com/', {
        method: 'GET',
        headers: {
          'User-Agent': 'TFI Imports (contato@tfimports.com.br)'
        }
      });
      
      results.tests.push({
        name: 'Conectividade básica',
        url: 'https://api.superfrete.com/',
        status: basicTest.status,
        success: basicTest.ok,
        headers: Object.fromEntries(basicTest.headers.entries())
      });
      
      console.log('✅ Teste 1 concluído:', basicTest.status);
    } catch (error) {
      console.error('❌ Teste 1 falhou:', error.message);
      results.tests.push({
        name: 'Conectividade básica',
        url: 'https://api.superfrete.com/',
        success: false,
        error: error.message
      });
    }

    // Teste 2: Endpoint calculator
    try {
      console.log('🌐 Teste 2: Endpoint calculator...');
      const calculatorTest = await fetch('https://api.superfrete.com/api/v0/calculator', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'TFI Imports (contato@tfimports.com.br)',
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          from: { postal_code: '01310-100' },
          to: { postal_code: '20020050' },
          services: '1,2,17',
          options: {
            own_hand: false,
            receipt: false,
            insurance_value: 0,
            use_insurance_value: false
          },
          products: [{
            quantity: 1,
            height: 2,
            width: 11,
            length: 16,
            weight: 0.3
          }]
        })
      });
      
      const responseText = await calculatorTest.text();
      
      results.tests.push({
        name: 'Endpoint calculator',
        url: 'https://api.superfrete.com/api/v0/calculator',
        status: calculatorTest.status,
        success: calculatorTest.ok,
        response_preview: responseText.substring(0, 200),
        headers: Object.fromEntries(calculatorTest.headers.entries())
      });
      
      console.log('✅ Teste 2 concluído:', calculatorTest.status);
    } catch (error) {
      console.error('❌ Teste 2 falhou:', error.message);
      results.tests.push({
        name: 'Endpoint calculator',
        url: 'https://api.superfrete.com/api/v0/calculator',
        success: false,
        error: error.message
      });
    }

    // Teste 3: Sandbox
    try {
      console.log('🌐 Teste 3: Sandbox...');
      const sandboxTest = await fetch('https://sandbox.superfrete.com/', {
        method: 'GET',
        headers: {
          'User-Agent': 'TFI Imports (contato@tfimports.com.br)'
        }
      });
      
      results.tests.push({
        name: 'Sandbox conectividade',
        url: 'https://sandbox.superfrete.com/',
        status: sandboxTest.status,
        success: sandboxTest.ok,
        headers: Object.fromEntries(sandboxTest.headers.entries())
      });
      
      console.log('✅ Teste 3 concluído:', sandboxTest.status);
    } catch (error) {
      console.error('❌ Teste 3 falhou:', error.message);
      results.tests.push({
        name: 'Sandbox conectividade',
        url: 'https://sandbox.superfrete.com/',
        success: false,
        error: error.message
      });
    }

    console.log('📊 Resultados dos testes:', results);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Testes de conectividade concluídos',
        results
      })
    };

  } catch (error) {
    console.error('❌ Erro no teste de conectividade:', error);
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
