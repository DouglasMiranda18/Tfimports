// Serviço dos Correios - Integração com ViaCEP e cálculo de frete
// Baseado nas tarifas oficiais dos Correios

class CorreiosService {
  constructor() {
    this.baseUrl = 'https://viacep.com.br/ws';
    this.cepOrigem = '01310-100'; // CEP de origem (São Paulo)
  }

  // Validar CEP usando ViaCEP
  async validateCEP(cep) {
    try {
      const cleanCEP = cep.replace(/\D/g, '');
      
      if (cleanCEP.length !== 8) {
        return {
          success: false,
          error: 'CEP deve ter 8 dígitos'
        };
      }

      const response = await fetch(`${this.baseUrl}/${cleanCEP}/json/`);
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
        ibge: data.ibge,
        ddd: data.ddd
      };
    } catch (error) {
      console.error('Erro ao validar CEP:', error);
      return {
        success: false,
        error: 'Erro ao validar CEP'
      };
    }
  }

  // Formatar CEP
  formatCEP(cep) {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return cep;
  }

  // Calcular distância entre CEPs (aproximada)
  calculateDistance(cepOrigem, cepDestino) {
    // Código simplificado para cálculo de distância
    // Em produção, usar uma API de geolocalização
    const origem = this.getRegionCode(cepOrigem);
    const destino = this.getRegionCode(cepDestino);
    
    // Tabela de distâncias por região
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

    return distances[origem]?.[destino] || 1000; // Distância padrão
  }

  // Obter código da região baseado no CEP
  getRegionCode(cep) {
    const cleanCEP = cep.replace(/\D/g, '');
    const firstDigit = cleanCEP[0];
    
    const regionMap = {
      '0': 'SP', '1': 'SP', '2': 'RJ', '3': 'MG', '4': 'RS', '5': 'PE',
      '6': 'CE', '7': 'BA', '8': 'PR', '9': 'DF'
    };
    
    return regionMap[firstDigit] || 'SP';
  }

  // Calcular frete baseado nas tarifas dos Correios
  calculateShipping(cepDestino, peso, valor) {
    try {
      const distancia = this.calculateDistance(this.cepOrigem, cepDestino);
      
      // Tarifas baseadas nas tabelas oficiais dos Correios (2024)
      const opcoes = [];

      // PAC
      const pacBase = this.calculatePacPrice(peso, distancia);
      if (pacBase > 0) {
        opcoes.push({
          id: 'pac',
          name: 'PAC',
          company: 'Correios',
          company_id: '1',
          price: pacBase,
          delivery_time: this.getDeliveryTime('pac', distancia),
          description: 'Envio econômico'
        });
      }

      // SEDEX
      const sedexBase = this.calculateSedexPrice(peso, distancia);
      if (sedexBase > 0) {
        opcoes.push({
          id: 'sedex',
          name: 'SEDEX',
          company: 'Correios',
          company_id: '2',
          price: sedexBase,
          delivery_time: this.getDeliveryTime('sedex', distancia),
          description: 'Envio expresso'
        });
      }

      // SEDEX 10 (apenas para até 1kg)
      if (peso <= 1) {
        const sedex10Base = this.calculateSedex10Price(peso, distancia);
        if (sedex10Base > 0) {
          opcoes.push({
            id: 'sedex10',
            name: 'SEDEX 10',
            company: 'Correios',
            company_id: '3',
            price: sedex10Base,
            delivery_time: this.getDeliveryTime('sedex10', distancia),
            description: 'Entrega até 10h'
          });
        }
      }

      return {
        success: true,
        options: opcoes,
        origin: this.cepOrigem,
        destination: cepDestino,
        weight: peso,
        value: valor
      };

    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      return {
        success: false,
        error: 'Erro ao calcular frete'
      };
    }
  }

  // Calcular preço do PAC
  calculatePacPrice(peso, distancia) {
    // Tabela simplificada baseada nas tarifas dos Correios
    let preco = 0;
    
    if (peso <= 0.3) preco = 8.50;
    else if (peso <= 0.5) preco = 10.50;
    else if (peso <= 1) preco = 12.50;
    else if (peso <= 2) preco = 15.50;
    else if (peso <= 3) preco = 18.50;
    else if (peso <= 5) preco = 22.50;
    else if (peso <= 10) preco = 30.50;
    else preco = 30.50 + ((peso - 10) * 2.5);

    // Adicionar taxa por distância
    if (distancia > 1000) preco += 5;
    if (distancia > 2000) preco += 10;
    if (distancia > 3000) preco += 15;

    return Math.round(preco * 100) / 100;
  }

  // Calcular preço do SEDEX
  calculateSedexPrice(peso, distancia) {
    let preco = 0;
    
    if (peso <= 0.3) preco = 15.50;
    else if (peso <= 0.5) preco = 18.50;
    else if (peso <= 1) preco = 22.50;
    else if (peso <= 2) preco = 28.50;
    else if (peso <= 3) preco = 34.50;
    else if (peso <= 5) preco = 42.50;
    else if (peso <= 10) preco = 55.50;
    else preco = 55.50 + ((peso - 10) * 4.5);

    // Adicionar taxa por distância
    if (distancia > 1000) preco += 8;
    if (distancia > 2000) preco += 15;
    if (distancia > 3000) preco += 25;

    return Math.round(preco * 100) / 100;
  }

  // Calcular preço do SEDEX 10
  calculateSedex10Price(peso, distancia) {
    let preco = 0;
    
    if (peso <= 0.3) preco = 25.50;
    else if (peso <= 0.5) preco = 30.50;
    else if (peso <= 1) preco = 35.50;
    else return 0; // SEDEX 10 só até 1kg

    // Adicionar taxa por distância
    if (distancia > 1000) preco += 10;
    if (distancia > 2000) preco += 20;
    if (distancia > 3000) preco += 35;

    return Math.round(preco * 100) / 100;
  }

  // Obter prazo de entrega
  getDeliveryTime(tipo, distancia) {
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
      },
      'sedex10': {
        'local': '1',
        'regional': '1-2',
        'nacional': '2-3'
      }
    };

    let categoria = 'nacional';
    if (distancia < 200) categoria = 'local';
    else if (distancia < 1000) categoria = 'regional';

    return prazos[tipo][categoria];
  }

  // Validar endereço
  validateAddress(addressData) {
    const errors = [];

    if (!addressData.cep || addressData.cep.length !== 8) {
      errors.push('CEP inválido');
    }

    if (!addressData.logradouro || addressData.logradouro.length < 3) {
      errors.push('Logradouro inválido');
    }

    if (!addressData.cidade || addressData.cidade.length < 2) {
      errors.push('Cidade inválida');
    }

    if (!addressData.uf || addressData.uf.length !== 2) {
      errors.push('UF inválido');
    }

    if (!addressData.numero || addressData.numero.length < 1) {
      errors.push('Número inválido');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

// Exportar instância do serviço
export const correiosService = new CorreiosService();
