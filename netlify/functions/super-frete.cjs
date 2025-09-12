// Função Netlify para integração com SuperFrete API
// Endpoint: /.netlify/functions/super-frete

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
    const {
      cepDestino,
      peso,
      valor,
      dimensoes = {
        height: 2,
        width: 11,
        length: 16
      }
    } = body;

    // Validar parâmetros obrigatórios
    if (!cepDestino || !peso || valor === undefined) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Parâmetros obrigatórios: cepDestino, peso, valor'
        })
      };
    }

    // Obter API key do ambiente
    const apiKey = process.env.SUPER_FRETE_API_KEY;
    if (!apiKey) {
      console.error('❌ SUPER_FRETE_API_KEY não configurada');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Configuração da API não encontrada'
        })
      };
    }

    // CEP de origem (São Paulo - TFI IMPORTS)
    const cepOrigem = '01153000';
    const cepDestinoLimpo = cepDestino.replace(/\D/g, '');

    // Validar CEPs
    if (cepOrigem.length !== 8 || cepDestinoLimpo.length !== 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'CEPs devem ter 8 dígitos'
        })
      };
    }

    console.log('🚚 Calculando frete:', {
      cepOrigem,
      cepDestino: cepDestinoLimpo,
      peso,
      valor,
      dimensoes
    });

    // Preparar dados para a API do SuperFrete
    const requestData = {
      from: {
        postal_code: cepOrigem
      },
      to: {
        postal_code: cepDestinoLimpo
      },
      services: "1,2,17", // PAC, SEDEX, e outros serviços
      options: {
        own_hand: false,
        receipt: false,
        insurance_value: valor,
        use_insurance_value: valor > 0
      },
      package: {
        height: dimensoes.height,
        width: dimensoes.width,
        length: dimensoes.length,
        weight: peso
      }
    };

    // Fazer requisição para a API do SuperFrete
    const response = await fetch('https://api.superfrete.com/api/v0/calculator', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'TFI Imports - E-commerce (contato@tfiimports.com)',
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    console.log('📡 Status da resposta SuperFrete:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API SuperFrete:', response.status, errorText);
      
      // Retornar fallback em caso de erro
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          options: getFallbackOptions(cepDestino, peso, valor),
          origin: cepOrigem,
          destination: cepDestino,
          weight: peso,
          value: valor,
          api_used: 'fallback',
          error: 'API indisponível, usando valores estimados'
        })
      };
    }

    const data = await response.json();
    console.log('📦 Resposta da API SuperFrete:', data);

    // Processar resposta da API
    if (data && Array.isArray(data) && data.length > 0) {
      const options = data.map(item => ({
        id: item.id || item.service || 'unknown',
        name: item.name || item.service || 'Serviço de Entrega',
        company: item.company || 'Super Frete',
        company_id: item.company_id || item.id || 'unknown',
        price: parseFloat(item.price) || 0,
        delivery_time: item.delivery_time || item.delivery_range || '5-8 dias úteis',
        description: item.description || item.name || item.service || '',
        service: item.service || item.id || 'unknown',
        error: item.error || null
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          options,
          origin: cepOrigem,
          destination: cepDestino,
          weight: peso,
          value: valor,
          api_used: 'super_frete_api'
        })
      };
    } else {
      console.error('❌ Resposta vazia da API SuperFrete');
      
      // Retornar fallback
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          options: getFallbackOptions(cepDestino, peso, valor),
          origin: cepOrigem,
          destination: cepDestino,
          weight: peso,
          value: valor,
          api_used: 'fallback',
          error: 'Nenhuma opção de frete encontrada'
        })
      };
    }

  } catch (error) {
    console.error('❌ Erro na função super-frete:', error);
    
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

// Função de fallback com valores estimados
function getFallbackOptions(cepDestino, peso, valor) {
  const distancia = calculateDistance('01153000', cepDestino);
  
  const options = [];

  // PAC
  const pacPrice = calculatePacPrice(peso, distancia);
  if (pacPrice > 0) {
    options.push({
      id: 'pac',
      name: 'PAC',
      company: 'Correios',
      company_id: '1',
      price: pacPrice,
      delivery_time: getDeliveryTime('pac', distancia),
      description: 'Envio econômico',
      service: 'pac',
      error: null
    });
  }

  // SEDEX
  const sedexPrice = calculateSedexPrice(peso, distancia);
  if (sedexPrice > 0) {
    options.push({
      id: 'sedex',
      name: 'SEDEX',
      company: 'Correios',
      company_id: '2',
      price: sedexPrice,
      delivery_time: getDeliveryTime('sedex', distancia),
      description: 'Envio expresso',
      service: 'sedex',
      error: null
    });
  }

  return options;
}

// Calcular distância entre CEPs (aproximada)
function calculateDistance(cepOrigem, cepDestino) {
  const origem = getRegionCode(cepOrigem);
  const destino = getRegionCode(cepDestino);
  
  const distances = {
    'SP': { 'SP': 0, 'RJ': 400, 'MG': 500, 'PR': 300, 'SC': 600, 'RS': 800, 'DF': 900, 'GO': 800, 'BA': 1000, 'PE': 2000, 'CE': 2500, 'PA': 3000, 'AM': 4000 },
    'RJ': { 'SP': 400, 'RJ': 0, 'MG': 300, 'PR': 700, 'SC': 1000, 'RS': 1200, 'DF': 1000, 'GO': 1100, 'BA': 800, 'PE': 1800, 'CE': 2200, 'PA': 2800, 'AM': 3800 },
    'MG': { 'SP': 500, 'RJ': 300, 'MG': 0, 'PR': 800, 'SC': 1100, 'RS': 1300, 'DF': 600, 'GO': 700, 'BA': 500, 'PE': 1500, 'CE': 1900, 'PA': 2500, 'AM': 3500 },
    'PR': { 'SP': 300, 'RJ': 700, 'MG': 800, 'PR': 0, 'SC': 300, 'RS': 500, 'DF': 1200, 'GO': 1300, 'BA': 1500, 'PE': 2300, 'CE': 2700, 'PA': 3300, 'AM': 4300 },
    'SC': { 'SP': 600, 'RJ': 1000, 'MG': 1100, 'PR': 300, 'SC': 0, 'RS': 200, 'DF': 1500, 'GO': 1600, 'BA': 1800, 'PE': 2600, 'CE': 3000, 'PA': 3600, 'AM': 4600 },
    'RS': { 'SP': 800, 'RJ': 1200, 'MG': 1300, 'PR': 500, 'SC': 200, 'RS': 0, 'DF': 1700, 'GO': 1800, 'BA': 2000, 'PE': 2800, 'CE': 3200, 'PA': 3800, 'AM': 4800 },
    'DF': { 'SP': 900, 'RJ': 1000, 'MG': 600, 'PR': 1200, 'SC': 1500, 'RS': 1700, 'DF': 0, 'GO': 100, 'BA': 800, 'PE': 1600, 'CE': 2000, 'PA': 2600, 'AM': 3600 },
    'GO': { 'SP': 800, 'RJ': 1100, 'MG': 700, 'PR': 1300, 'SC': 1600, 'RS': 1800, 'DF': 100, 'GO': 0, 'BA': 900, 'PE': 1700, 'CE': 2100, 'PA': 2700, 'AM': 3700 },
    'BA': { 'SP': 1000, 'RJ': 800, 'MG': 500, 'PR': 1500, 'SC': 1800, 'RS': 2000, 'DF': 800, 'GO': 900, 'BA': 0, 'PE': 800, 'CE': 1200, 'PA': 1800, 'AM': 2800 },
    'PE': { 'SP': 2000, 'RJ': 1800, 'MG': 1500, 'PR': 2300, 'SC': 2600, 'RS': 2800, 'DF': 1600, 'GO': 1700, 'BA': 800, 'PE': 0, 'CE': 400, 'PA': 1000, 'AM': 2000 },
    'CE': { 'SP': 2500, 'RJ': 2200, 'MG': 1900, 'PR': 2700, 'SC': 3000, 'RS': 3200, 'DF': 2000, 'GO': 2100, 'BA': 1200, 'PE': 400, 'CE': 0, 'PA': 600, 'AM': 1600 },
    'PA': { 'SP': 3000, 'RJ': 2800, 'MG': 2500, 'PR': 3300, 'SC': 3600, 'RS': 3800, 'DF': 2600, 'GO': 2700, 'BA': 1800, 'PE': 1000, 'CE': 600, 'PA': 0, 'AM': 1000 },
    'AM': { 'SP': 4000, 'RJ': 3800, 'MG': 3500, 'PR': 4300, 'SC': 4600, 'RS': 4800, 'DF': 3600, 'GO': 3700, 'BA': 2800, 'PE': 2000, 'CE': 1600, 'PA': 1000, 'AM': 0 }
  };

  return distances[origem]?.[destino] || 1000;
}

// Obter código da região baseado no CEP
function getRegionCode(cep) {
  const cleanCEP = cep.replace(/\D/g, '');
  const firstDigit = cleanCEP[0];
  
  const regionMap = {
    '0': 'SP', '1': 'SP', '2': 'RJ', '3': 'MG', '4': 'RS', '5': 'PE',
    '6': 'CE', '7': 'BA', '8': 'PR', '9': 'DF'
  };
  
  return regionMap[firstDigit] || 'SP';
}

// Calcular preço do PAC (fallback)
function calculatePacPrice(peso, distancia) {
  let preco = 0;
  
  if (peso <= 0.3) preco = 8.50;
  else if (peso <= 0.5) preco = 10.50;
  else if (peso <= 1) preco = 12.50;
  else if (peso <= 2) preco = 15.50;
  else if (peso <= 3) preco = 18.50;
  else if (peso <= 5) preco = 22.50;
  else if (peso <= 10) preco = 30.50;
  else preco = 30.50 + ((peso - 10) * 2.5);

  if (distancia > 1000) preco += 5;
  if (distancia > 2000) preco += 10;
  if (distancia > 3000) preco += 15;

  return Math.round(preco * 100) / 100;
}

// Calcular preço do SEDEX (fallback)
function calculateSedexPrice(peso, distancia) {
  let preco = 0;
  
  if (peso <= 0.3) preco = 15.50;
  else if (peso <= 0.5) preco = 18.50;
  else if (peso <= 1) preco = 22.50;
  else if (peso <= 2) preco = 28.50;
  else if (peso <= 3) preco = 34.50;
  else if (peso <= 5) preco = 42.50;
  else if (peso <= 10) preco = 55.50;
  else preco = 55.50 + ((peso - 10) * 4.5);

  if (distancia > 1000) preco += 8;
  if (distancia > 2000) preco += 15;
  if (distancia > 3000) preco += 25;

  return Math.round(preco * 100) / 100;
}

// Obter prazo de entrega
function getDeliveryTime(tipo, distancia) {
  const prazos = {
    'pac': {
      'local': '2-3',
      'regional': '3-5',
      'nacional': '5-8'
    },
    'sedex': {
      'local': '1-2',
      'regional': '2-3',
      'nacional': '3-5'
    }
  };

  let categoria = 'nacional';
  if (distancia < 200) categoria = 'local';
  else if (distancia < 1000) categoria = 'regional';

  return prazos[tipo][categoria];
}