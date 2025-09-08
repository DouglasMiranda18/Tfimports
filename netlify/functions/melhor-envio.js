// Netlify Function para Melhor Envio
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
    const { action, data } = JSON.parse(event.body || '{}');
    
    console.log('🚚 Melhor Envio Function - Action:', action);
    console.log('📦 Data recebida:', data);

    // Configurações do Melhor Envio
    const MELHOR_ENVIO_TOKEN = process.env.VITE_MELHOR_ENVIO_TOKEN || 'TOKEN_TEMPORARIO_MELHOR_ENVIO_12345';
    const MELHOR_ENVIO_BASE_URL = 'https://www.melhorenvio.com.br';
    
    console.log('🔑 Token do Melhor Envio:', MELHOR_ENVIO_TOKEN ? MELHOR_ENVIO_TOKEN.substring(0, 10) + '...' : 'NÃO CONFIGURADO');
    console.log('🌐 Base URL:', MELHOR_ENVIO_BASE_URL);
    console.log('🔍 Todas as variáveis de ambiente:', Object.keys(process.env).filter(key => key.includes('MELHOR')));
    
    // Verificar se o token é válido
    if (!MELHOR_ENVIO_TOKEN || MELHOR_ENVIO_TOKEN === 'TOKEN_TEMPORARIO_MELHOR_ENVIO_12345') {
      console.log('⚠️ Token inválido, usando fallback');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Token do Melhor Envio não configurado',
          fallback: true
        })
      };
    }
    
    const melhorEnvioHeaders = {
      'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'TFI-Imports/1.0'
    };

    let response;
    let result;

    switch (action) {
      case 'calculate':
        // Calcular frete
        console.log('📊 Calculando frete...');
        
        const calculateData = {
          from: {
            postal_code: data.from?.postal_code || '01310-100' // CEP padrão São Paulo
          },
          to: {
            postal_code: data.to?.postal_code
          },
          products: data.products || [],
          services: data.services || "1,2,3,4,17",
          options: data.options || {
            insurance_value: 0,
            receipt: false,
            own_hand: false
          }
        };

        console.log('📦 Dados para cálculo:', calculateData);

        response = await fetch(`${MELHOR_ENVIO_BASE_URL}/api/v2/me/shipment/calculate`, {
          method: 'POST',
          headers: melhorEnvioHeaders,
          body: JSON.stringify(calculateData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erro na API Melhor Envio:', response.status, errorText);
          throw new Error(`Erro na API Melhor Envio: ${response.status} - ${errorText}`);
        }

        result = await response.json();
        console.log('✅ Resultado do cálculo:', result);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: result,
            action: 'calculate'
          })
        };

      case 'companies':
        // Obter empresas de transporte
        console.log('🏢 Obtendo empresas...');
        
        response = await fetch(`${MELHOR_ENVIO_BASE_URL}/api/v2/me/shipment/companies`, {
          method: 'GET',
          headers: melhorEnvioHeaders
        });

        if (!response.ok) {
          throw new Error(`Erro ao obter empresas: ${response.status}`);
        }

        result = await response.json();
        console.log('✅ Empresas obtidas:', result);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: result,
            action: 'companies'
          })
        };

      case 'tracking':
        // Rastrear envio
        console.log('📍 Rastreando envio:', data.tracking_code);
        
        response = await fetch(`${MELHOR_ENVIO_BASE_URL}/api/v2/me/shipment/tracking/${data.tracking_code}`, {
          method: 'GET',
          headers: melhorEnvioHeaders
        });

        if (!response.ok) {
          throw new Error(`Erro ao rastrear: ${response.status}`);
        }

        result = await response.json();
        console.log('✅ Rastreamento:', result);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: result,
            action: 'tracking'
          })
        };

      case 'validate_cep':
        // Validar CEP
        console.log('📍 Validando CEP:', data.cep);
        
        const cleanCEP = data.cep.replace(/\D/g, '');
        
        if (cleanCEP.length !== 8) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'CEP deve ter exatamente 8 dígitos'
            })
          };
        }

        // Usar ViaCEP para validação
        const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        
        if (!viaCepResponse.ok) {
          throw new Error(`Erro na API ViaCEP: ${viaCepResponse.status}`);
        }

        const cepData = await viaCepResponse.json();
        
        if (cepData.erro) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'CEP não encontrado'
            })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: {
              cep: cepData.cep,
              logradouro: cepData.logradouro,
              bairro: cepData.bairro,
              cidade: cepData.localidade,
              uf: cepData.uf,
              ibge: cepData.ibge,
              ddd: cepData.ddd
            },
            action: 'validate_cep'
          })
        };

      case 'create_label':
        // Criar etiqueta de envio
        console.log('🏷️ Criando etiqueta de envio...');
        
        response = await fetch(`${MELHOR_ENVIO_BASE_URL}/api/v2/me/cart`, {
          method: 'POST',
          headers: melhorEnvioHeaders,
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erro ao criar etiqueta:', response.status, errorText);
          throw new Error(`Erro ao criar etiqueta: ${response.status} - ${errorText}`);
        }

        result = await response.json();
        console.log('✅ Etiqueta criada:', result);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: result,
            action: 'create_label'
          })
        };

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Ação não reconhecida'
          })
        };
    }

  } catch (error) {
    console.error('❌ Erro na função Melhor Envio:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        details: error.toString()
      })
    };
  }
};
