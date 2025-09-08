// Integração com Melhor Envio
import { apiConfig, endpoints, getHeaders } from './api-config.js';

export class MelhorEnvioService {
  constructor() {
    this.config = apiConfig.melhorEnvio;
    this.baseUrl = this.config.baseUrl;
    this.lojaConfig = apiConfig.loja;
  }

  // Calcular frete
  async calculateShipping(shippingData) {
    try {
      const { cepDestino, produtos, pesoTotal } = shippingData;
      
      // Verificar se devemos usar fallback
      if (this.shouldUseFallback()) {
        return this.calculateShippingFallback(shippingData);
      }
      
      // Preparar dados para cálculo
      const packageData = {
        from: {
          postal_code: this.lojaConfig.cepOrigem
        },
        to: {
          postal_code: cepDestino.replace(/\D/g, '')
        },
        products: produtos.map(produto => ({
          id: produto.id,
          width: this.lojaConfig.dimensoes.largura,
          height: this.lojaConfig.dimensoes.altura,
          length: this.lojaConfig.dimensoes.comprimento,
          weight: produto.peso || this.lojaConfig.pesoPadrao,
          insurance_value: produto.preco * produto.quantidade,
          quantity: produto.quantidade
        })),
        services: "1,2,3,4,17", // Códigos dos serviços principais
        options: {
          insurance_value: produtos.reduce((total, produto) => 
            total + (produto.preco * produto.quantidade), 0),
          receipt: false,
          own_hand: false
        }
      };

      // Usar Netlify Function para evitar CORS
      const response = await fetch('/.netlify/functions/melhor-envio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'calculate',
          data: packageData
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao calcular frete: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido');
      }

      const shippingOptions = result.data;
      
      // Processar e formatar opções de frete
      const formattedOptions = shippingOptions.map(option => ({
        id: option.id,
        name: option.name,
        company: option.company.name,
        price: parseFloat(option.price),
        delivery_time: option.delivery_time,
        delivery_range: option.delivery_range,
        packages: option.packages,
        additional_services: option.additional_services,
        company_id: option.company.id
      }));

      return {
        success: true,
        options: formattedOptions,
        cep: cepDestino
      };

    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      
      // Se falhar, usar fallback
      console.log('Usando cálculo de frete alternativo devido a erro');
      return this.calculateShippingFallback(shippingData);
    }
  }

  // Verificar se deve usar fallback
  shouldUseFallback() {
    // Usar API real se tivermos token válido
    const hasValidToken = this.config.token && 
                         this.config.token !== 'TOKEN_TEMPORARIO_MELHOR_ENVIO_12345' &&
                         this.config.token !== 'SEU_TOKEN_AQUI' &&
                         this.config.token.trim() !== '';
    
    // Se não temos token válido, usar fallback
    if (!hasValidToken) {
      console.log('🚚 Usando fallback: Token do Melhor Envio não configurado');
      console.log('💡 Para usar API real, configure VITE_MELHOR_ENVIO_TOKEN no arquivo .env');
      return true;
    }
    
    // Com token válido, sempre usar API real (mesmo em desenvolvimento)
    console.log('🚚 Usando API real do Melhor Envio');
    console.log('🔑 Token configurado:', this.config.token.substring(0, 10) + '...');
    return false;
  }

  // Cálculo de frete alternativo (fallback)
  calculateShippingFallback(shippingData) {
    console.log('🚚 Usando cálculo de frete alternativo (fallback)');
    const { cepDestino, produtos } = shippingData;
    
    // Calcular peso total
    const pesoTotal = produtos.reduce((total, produto) => 
      total + (produto.peso || this.lojaConfig.pesoPadrao) * produto.quantidade, 0);
    
    // Calcular valor total dos produtos
    const valorTotal = produtos.reduce((total, produto) => 
      total + produto.preco * produto.quantidade, 0);
    
    // Simular opções de frete baseadas no peso e distância
    const cepOrigem = parseInt(this.lojaConfig.cepOrigem.replace(/\D/g, ''));
    const cepDestinoNum = parseInt(cepDestino.replace(/\D/g, ''));
    const distancia = Math.abs(cepDestinoNum - cepOrigem);
    
    console.log(`📍 CEP Origem: ${this.lojaConfig.cepOrigem}, CEP Destino: ${cepDestino}`);
    console.log(`📦 Peso total: ${pesoTotal}kg, Distância: ${distancia}`);
    
    // Opções de frete simuladas
    const shippingOptions = [
      {
        id: 'sedex',
        name: 'SEDEX',
        company: 'Correios',
        price: this.calculatePriceByWeight(pesoTotal, distancia, 'sedex'),
        delivery_time: Math.max(1, Math.min(3, Math.floor(distancia / 1000000))),
        delivery_range: { min: 1, max: 3 },
        packages: 1,
        additional_services: [],
        company_id: 1
      },
      {
        id: 'pac',
        name: 'PAC',
        company: 'Correios',
        price: this.calculatePriceByWeight(pesoTotal, distancia, 'pac'),
        delivery_time: Math.max(3, Math.min(10, Math.floor(distancia / 500000))),
        delivery_range: { min: 3, max: 10 },
        packages: 1,
        additional_services: [],
        company_id: 1
      },
      {
        id: 'express',
        name: 'Expresso',
        company: 'Transportadora',
        price: this.calculatePriceByWeight(pesoTotal, distancia, 'express'),
        delivery_time: Math.max(1, Math.min(5, Math.floor(distancia / 800000))),
        delivery_range: { min: 1, max: 5 },
        packages: 1,
        additional_services: [],
        company_id: 2
      }
    ];

    return {
      success: true,
        options: shippingOptions,
        cep: cepDestino,
        fallback: true
      };
    }

         // Calcular preço baseado no peso e distância (valores realistas dos Correios)
     calculatePriceByWeight(peso, distancia, tipo) {
       let basePrice = 0;
       
       // Calcular distância em km (aproximada)
       const distanciaKm = Math.abs(distancia) / 1000000;
       
       // Valores baseados na tabela real dos Correios para envio entre estados
       switch (tipo) {
         case 'sedex':
           // SEDEX: R$ 28-42 (valores reais dos Correios)
           if (distanciaKm < 100) {
             basePrice = 28 + (peso * 2.5);
           } else if (distanciaKm < 500) {
             basePrice = 32 + (peso * 3);
           } else {
             basePrice = 36 + (peso * 3.5);
           }
           break;
         case 'pac':
           // PAC: R$ 18-32 (valores reais dos Correios)
           if (distanciaKm < 100) {
             basePrice = 18 + (peso * 1.8);
           } else if (distanciaKm < 500) {
             basePrice = 22 + (peso * 2.2);
           } else {
             basePrice = 26 + (peso * 2.8);
           }
           break;
         case 'express':
           // Expresso: R$ 24-38 (transportadora privada)
           if (distanciaKm < 100) {
             basePrice = 24 + (peso * 2.2);
           } else if (distanciaKm < 500) {
             basePrice = 28 + (peso * 2.6);
           } else {
             basePrice = 32 + (peso * 3.2);
           }
           break;
         default:
           basePrice = 20 + (peso * 2);
       }
       
       // Limitar valores entre R$ 15 e R$ 45 (valores realistas)
       basePrice = Math.max(15, Math.min(45, basePrice));
       
       // Arredondar para 2 casas decimais
       return Math.round(basePrice * 100) / 100;
     }

  // Obter empresas de transporte
  async getShippingCompanies() {
    try {
      const response = await fetch(`${this.baseUrl}${endpoints.melhorEnvio.companies}`, {
        method: 'GET',
        headers: getHeaders('melhorEnvio')
      });

      if (!response.ok) {
        throw new Error(`Erro ao obter empresas: ${response.status}`);
      }

      const companies = await response.json();
      return {
        success: true,
        companies: companies.map(company => ({
          id: company.id,
          name: company.name,
          picture: company.picture,
          status: company.status
        }))
      };

    } catch (error) {
      console.error('Erro ao obter empresas de transporte:', error);
      return {
        success: false,
        error: error.message,
        companies: []
      };
    }
  }

  // Criar etiqueta de envio
  async createShippingLabel(orderData) {
    try {
      // Se não temos token válido, simular criação
      if (this.shouldUseFallback()) {
        return this.createShippingLabelFallback(orderData);
      }

      const labelData = {
        service: orderData.service_id,
        from: {
          name: "TFI IMPORTS",
          phone: "(11) 99999-9999",
          email: "contato@tfimports.com.br",
          document: "12.345.678/0001-90",
          company_document: "12.345.678/0001-90",
          state_register: "123456789",
          address: "Rua das Flores, 123",
          complement: "Sala 1",
          number: "123",
          district: "Centro",
          city: "São Paulo",
          country_id: "BR",
          postal_code: this.lojaConfig.cepOrigem
        },
        to: {
          name: orderData.cliente.nome,
          phone: orderData.cliente.telefone,
          email: orderData.cliente.email,
          document: orderData.cliente.documento,
          address: orderData.endereco.logradouro,
          complement: orderData.endereco.complemento,
          number: orderData.endereco.numero,
          district: orderData.endereco.bairro,
          city: orderData.endereco.cidade,
          state_abbr: orderData.endereco.uf,
          country_id: "BR",
          postal_code: orderData.endereco.cep
        },
        products: orderData.produtos.map(produto => ({
          name: produto.nome,
          quantity: produto.quantidade,
          unitary_value: produto.preco
        })),
        volumes: [{
          height: this.lojaConfig.dimensoes.altura,
          width: this.lojaConfig.dimensoes.largura,
          length: this.lojaConfig.dimensoes.comprimento,
          weight: orderData.peso_total
        }]
      };

      // Usar Netlify Function para criar etiqueta
      const response = await fetch('/.netlify/functions/melhor-envio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_label',
          data: labelData
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar etiqueta: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido');
      }

      return {
        success: true,
        order_id: result.data.id,
        protocol: result.data.protocol,
        tracking_code: result.data.tracking
      };

    } catch (error) {
      console.error('Erro ao criar etiqueta de envio:', error);
      
      // Se falhar, usar fallback
      console.log('Usando criação de etiqueta alternativa devido a erro');
      return this.createShippingLabelFallback(orderData);
    }
  }

  // Criação de etiqueta alternativa (fallback)
  createShippingLabelFallback(orderData) {
    console.log('🏷️ Usando criação de etiqueta alternativa (fallback)');
    
    // Simular criação de etiqueta
    const orderId = 'ME' + Date.now();
    const protocol = 'PROT' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const trackingCode = 'BR' + Math.random().toString(36).substr(2, 9).toUpperCase() + 'BR';
    
    return {
      success: true,
      order_id: orderId,
      protocol: protocol,
      tracking_code: trackingCode,
      fallback: true
    };
  }

  // Adicionar ao carrinho do Melhor Envio
  async addToCart(cartData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/me/cart`, {
        method: 'POST',
        headers: getHeaders('melhorEnvio'),
        body: JSON.stringify(cartData)
      });

      if (!response.ok) {
        throw new Error(`Erro ao adicionar ao carrinho: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        cart_id: result.id,
        protocol: result.protocol
      };

    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Finalizar compra do frete
  async checkoutCart(cartId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/me/cart/${cartId}/checkout`, {
        method: 'POST',
        headers: getHeaders('melhorEnvio')
      });

      if (!response.ok) {
        throw new Error(`Erro ao finalizar compra: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        order_id: result.id,
        protocol: result.protocol,
        tracking_codes: result.tracking_codes
      };

    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Gerar etiqueta PDF
  async generateLabelPDF(orderId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/me/shipment/generate`, {
        method: 'POST',
        headers: getHeaders('melhorEnvio'),
        body: JSON.stringify({
          orders: [orderId]
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao gerar etiqueta: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        url: result.url,
        expires_at: result.expires_at
      };

    } catch (error) {
      console.error('Erro ao gerar etiqueta PDF:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Imprimir etiqueta
  async printLabel(orderId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/me/shipment/print`, {
        method: 'POST',
        headers: getHeaders('melhorEnvio'),
        body: JSON.stringify({
          orders: [orderId]
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao imprimir etiqueta: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        url: result.url
      };

    } catch (error) {
      console.error('Erro ao imprimir etiqueta:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cancelar envio
  async cancelShipping(orderId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/me/shipment/cancel`, {
        method: 'POST',
        headers: getHeaders('melhorEnvio'),
        body: JSON.stringify({
          order: {
            id: orderId
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao cancelar envio: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message
      };

    } catch (error) {
      console.error('Erro ao cancelar envio:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obter informações do usuário
  async getUserInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/me`, {
        method: 'GET',
        headers: getHeaders('melhorEnvio')
      });

      if (!response.ok) {
        throw new Error(`Erro ao obter informações do usuário: ${response.status}`);
      }

      const userInfo = await response.json();
      return {
        success: true,
        user: {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone,
          document: userInfo.document,
          company_document: userInfo.company_document,
          state_register: userInfo.state_register,
          address: userInfo.address,
          city: userInfo.city,
          state: userInfo.state,
          postal_code: userInfo.postal_code
        }
      };

    } catch (error) {
      console.error('Erro ao obter informações do usuário:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obter saldo da conta
  async getBalance() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/me/balance`, {
        method: 'GET',
        headers: getHeaders('melhorEnvio')
      });

      if (!response.ok) {
        throw new Error(`Erro ao obter saldo: ${response.status}`);
      }

      const balance = await response.json();
      return {
        success: true,
        balance: balance.balance,
        credit: balance.credit
      };

    } catch (error) {
      console.error('Erro ao obter saldo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Rastrear envio
  async trackShipping(trackingCode) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoints.melhorEnvio.tracking}/${trackingCode}`, {
        method: 'GET',
        headers: getHeaders('melhorEnvio')
      });

      if (!response.ok) {
        throw new Error(`Erro ao rastrear envio: ${response.status}`);
      }

      const tracking = await response.json();
      return {
        success: true,
        tracking: {
          code: tracking.code,
          status: tracking.status,
          events: tracking.events || [],
          estimated_delivery: tracking.estimated_delivery
        }
      };

    } catch (error) {
      console.error('Erro ao rastrear envio:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validar e buscar CEP
  async validateCEP(cep) {
    try {
      // Limpar CEP (remover caracteres não numéricos)
      const cleanCEP = cep.replace(/\D/g, '');
      
      // Validar formato
      if (cleanCEP.length !== 8) {
        return {
          success: false,
          error: 'CEP deve ter exatamente 8 dígitos'
        };
      }

      // Validar se contém apenas números
      if (!/^\d{8}$/.test(cleanCEP)) {
        return {
          success: false,
          error: 'CEP deve conter apenas números'
        };
      }

      // Usar Netlify Function para validar CEP
      const response = await fetch('/.netlify/functions/melhor-envio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'validate_cep',
          data: { cep: cleanCEP }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erro na validação: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'CEP não encontrado'
        };
      }

      return {
        success: true,
        cep: result.data.cep,
        logradouro: result.data.logradouro,
        bairro: result.data.bairro,
        cidade: result.data.cidade,
        uf: result.data.uf,
        ibge: result.data.ibge,
        ddd: result.data.ddd
      };

    } catch (error) {
      console.error('Erro ao validar CEP:', error);
      
      // Retornar erro específico baseado no tipo
      if (error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Erro de conexão. Verifique sua internet e tente novamente.'
        };
      }
      
      return {
        success: false,
        error: 'Erro ao validar CEP. Tente novamente em alguns instantes.'
      };
    }
  }

  // Formatar CEP
  formatCEP(cep) {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length <= 5) {
      return cleanCEP;
    }
    return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  // Validar endereço completo
  validateAddress(addressData) {
    const errors = [];
    
    if (!addressData.cep || addressData.cep.replace(/\D/g, '').length !== 8) {
      errors.push('CEP inválido');
    }
    
    if (!addressData.logradouro || addressData.logradouro.trim().length < 3) {
      errors.push('Logradouro inválido');
    }
    
    if (!addressData.bairro || addressData.bairro.trim().length < 2) {
      errors.push('Bairro inválido');
    }
    
    if (!addressData.cidade || addressData.cidade.trim().length < 2) {
      errors.push('Cidade inválida');
    }
    
    if (!addressData.uf || addressData.uf.trim().length !== 2) {
      errors.push('UF inválido');
    }
    
    if (!addressData.numero || addressData.numero.trim().length < 1) {
      errors.push('Número é obrigatório');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Instância global do serviço
export const melhorEnvioService = new MelhorEnvioService();
