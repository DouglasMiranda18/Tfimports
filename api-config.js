// Configuração das APIs de Pagamento e Frete
// IMPORTANTE: Estas chaves devem ser configuradas no Firebase Functions ou servidor seguro

export const apiConfig = {
  // Asaas - Sistema de Pagamento
  asaas: {
    apiKey: import.meta.env.VITE_ASAAS_API_KEY || 'SUA_API_KEY_AQUI',
    environment: import.meta.env.VITE_ASAAS_ENVIRONMENT || 'sandbox', // sandbox ou production
    baseUrl: import.meta.env.VITE_ASAAS_ENVIRONMENT === 'production' 
      ? 'https://www.asaas.com/api/v3' 
      : 'https://sandbox.asaas.com/api/v3',
    webhookToken: import.meta.env.VITE_ASAAS_WEBHOOK_TOKEN || 'SEU_WEBHOOK_TOKEN_AQUI'
  },
  
  // Melhor Envio
  melhorEnvio: {
    token: import.meta.env.VITE_MELHOR_ENVIO_TOKEN || 'TOKEN_TEMPORARIO_MELHOR_ENVIO_12345',
    sandbox: false, // false para produção
    baseUrl: 'https://www.melhorenvio.com.br'
  },
  
  // Configurações da loja
  loja: {
    cepOrigem: '59140-000', // CEP de origem (Parnamirim/RN)
    pesoPadrao: 0.3, // Peso padrão em kg por produto
    dimensoes: {
      altura: 5, // cm
      largura: 30, // cm
      comprimento: 40 // cm
    }
  }
};

// URLs dos endpoints
export const endpoints = {
  asaas: {
    customers: '/customers',
    payments: '/payments',
    subscriptions: '/subscriptions',
    webhooks: '/webhooks',
    notifications: '/notifications'
  },
  melhorEnvio: {
    calculate: '/api/v2/me/shipment/calculate',
    companies: '/api/v2/me/shipment/companies',
    tracking: '/api/v2/me/shipment/tracking',
    cart: '/api/v2/me/cart',
    checkout: '/api/v2/me/cart/{id}/checkout',
    generate: '/api/v2/me/shipment/generate',
    print: '/api/v2/me/shipment/print',
    cancel: '/api/v2/me/shipment/cancel',
    user: '/api/v2/me',
    balance: '/api/v2/me/balance'
  }
};

// Função para validar configuração
export function validateConfig() {
  const errors = [];
  
  // Validar Asaas
  if (!apiConfig.asaas.apiKey || apiConfig.asaas.apiKey === 'SUA_API_KEY_AQUI') {
    errors.push('Asaas API Key não configurada');
  }
  
  // Validar Melhor Envio - aceitar qualquer token não vazio
  if (!apiConfig.melhorEnvio.token || apiConfig.melhorEnvio.token.trim() === '') {
    errors.push('Melhor Envio Token não configurado');
  }
  
  console.log('🔍 Validando configuração:', {
    asaas: {
      apiKey: apiConfig.asaas.apiKey && apiConfig.asaas.apiKey !== 'SUA_API_KEY_AQUI' ? '✅ Configurada' : '❌ Não configurada',
      environment: apiConfig.asaas.environment
    },
    melhorEnvio: {
      token: apiConfig.melhorEnvio.token ? '✅ Configurado' : '❌ Não configurado'
    },
    errors: errors
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Função para obter headers das APIs
export function getHeaders(api) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  switch (api) {
    case 'asaas':
      headers['access_token'] = apiConfig.asaas.apiKey;
      break;
    case 'melhorEnvio':
      headers['Authorization'] = `Bearer ${apiConfig.melhorEnvio.token}`;
      break;
  }
  
  return headers;
}
