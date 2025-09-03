// Configuração das APIs de Pagamento e Frete
// IMPORTANTE: Estas chaves devem ser configuradas no Firebase Functions ou servidor seguro

export const apiConfig = {
  // Mercado Pago
  mercadoPago: {
    publicKey: import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY || 'APP_USR-9e9ec536-b2c8-40eb-bd4a-69d5be0b0539',
    accessToken: import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-5032663457298044-090316-620de3416b9f7f60d475223dd78c6b99-2018162925',
    sandbox: import.meta.env.VITE_MERCADO_PAGO_SANDBOX === 'true' || false, // false para produção
    baseUrl: 'https://api.mercadopago.com',
    userId: '2018162925',
    appId: '5032663457298044',
    clientSecret: import.meta.env.VITE_MERCADO_PAGO_CLIENT_SECRET || 'POvnfQOswweLVB5zUXtyRbtFF11d8OhD'
  },
  
  // Melhor Envio
  melhorEnvio: {
    token: import.meta.env.VITE_MELHOR_ENVIO_TOKEN || 'TEST-12345678901234567890123456789012',
    sandbox: import.meta.env.VITE_MELHOR_ENVIO_SANDBOX === 'true' || true, // true para teste, false para produção
    baseUrl: import.meta.env.VITE_MELHOR_ENVIO_SANDBOX === 'true' ? 
      'https://sandbox.melhorenvio.com.br' : 
      'https://www.melhorenvio.com.br'
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
  mercadoPago: {
    preferences: '/v1/checkout/preferences',
    payments: '/v1/payments',
    orders: '/merchant_orders',
    webhooks: '/v1/webhooks'
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
  
  if (!apiConfig.mercadoPago.publicKey || apiConfig.mercadoPago.publicKey.includes('TEST-1234') || apiConfig.mercadoPago.publicKey.includes('123456')) {
    errors.push('Mercado Pago Public Key não configurada');
  }
  
  if (!apiConfig.mercadoPago.accessToken || apiConfig.mercadoPago.accessToken.includes('TEST-1234') || apiConfig.mercadoPago.accessToken.includes('123456')) {
    errors.push('Mercado Pago Access Token não configurado');
  }
  
  if (!apiConfig.melhorEnvio.token || apiConfig.melhorEnvio.token.includes('TEST-1234')) {
    errors.push('Melhor Envio Token não configurado');
  }
  
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
    case 'mercadoPago':
      headers['Authorization'] = `Bearer ${apiConfig.mercadoPago.accessToken}`;
      break;
    case 'melhorEnvio':
      headers['Authorization'] = `Bearer ${apiConfig.melhorEnvio.token}`;
      break;
  }
  
  return headers;
}
