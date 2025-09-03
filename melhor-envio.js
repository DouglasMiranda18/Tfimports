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

      const response = await fetch(`${this.baseUrl}${endpoints.melhorEnvio.calculate}`, {
        method: 'POST',
        headers: getHeaders('melhorEnvio'),
        body: JSON.stringify(packageData)
      });

      if (!response.ok) {
        throw new Error(`Erro ao calcular frete: ${response.status}`);
      }

      const shippingOptions = await response.json();
      
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
      return {
        success: false,
        error: error.message,
        options: []
      };
    }
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

      const response = await fetch(`${this.baseUrl}/api/v2/me/cart`, {
        method: 'POST',
        headers: getHeaders('melhorEnvio'),
        body: JSON.stringify(labelData)
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar etiqueta: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        order_id: result.id,
        protocol: result.protocol,
        tracking_code: result.tracking
      };

    } catch (error) {
      console.error('Erro ao criar etiqueta de envio:', error);
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

  // Validar CEP
  async validateCEP(cep) {
    try {
      const cleanCEP = cep.replace(/\D/g, '');
      
      if (cleanCEP.length !== 8) {
        return {
          success: false,
          error: 'CEP deve ter 8 dígitos'
        };
      }

      // Simular validação (em produção, usar API do ViaCEP ou similar)
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao validar CEP');
      }

      const data = await response.json();
      
      if (data.erro) {
        return {
          success: false,
          error: 'CEP não encontrado'
        };
      }

      return {
        success: true,
        cep: data.cep,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf,
        ibge: data.ibge
      };

    } catch (error) {
      console.error('Erro ao validar CEP:', error);
      return {
        success: false,
        error: 'Erro ao validar CEP'
      };
    }
  }
}

// Instância global do serviço
export const melhorEnvioService = new MelhorEnvioService();
