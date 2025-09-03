// Configuração das APIs de Pagamento e Frete
// IMPORTANTE: Estas chaves devem ser configuradas no Firebase Functions ou servidor seguro

export const apiConfig = {
  // Mercado Pago
  mercadoPago: {
    publicKey: import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY || 'TEST-12345678-1234-1234-1234-123456789012',
    accessToken: import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN || 'TEST-12345678901234567890123456789012-123456-12345678901234567890123456789012-123456789',
    sandbox: import.meta.env.VITE_MERCADO_PAGO_SANDBOX === 'true' || true, // true para teste, false para produção
    baseUrl: 'https://api.mercadopago.com'
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
    preferences: '/checkout/preferences',
    payments: '/v1/payments',
    orders: '/merchant_orders'
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
  
  if (!apiConfig.mercadoPago.publicKey || apiConfig.mercadoPago.publicKey.includes('TEST-1234')) {
    errors.push('Mercado Pago Public Key não configurada');
  }
  
  if (!apiConfig.mercadoPago.accessToken || apiConfig.mercadoPago.accessToken.includes('TEST-1234')) {
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
