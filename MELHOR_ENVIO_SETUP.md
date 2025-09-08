# 🚚 Configuração do Melhor Envio

## 📋 Visão Geral

O Melhor Envio está integrado ao sistema para cálculo de frete e geração de etiquetas. A integração inclui:

- ✅ **Cálculo de frete** em tempo real
- ✅ **Validação de CEP** via ViaCEP
- ✅ **Fallback inteligente** quando API não está disponível
- ✅ **Webhooks** para atualizações de status
- ✅ **Netlify Functions** para evitar problemas de CORS

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione no seu arquivo `.env`:

```env
# Melhor Envio Configuration
VITE_MELHOR_ENVIO_TOKEN=seu_token_aqui
MELHOR_ENVIO_WEBHOOK_SECRET=seu_webhook_secret_aqui
```

### 2. Obter Token do Melhor Envio

1. Acesse: https://melhorenvio.com.br/
2. Faça login na sua conta
3. Vá em **Configurações** > **API**
4. Gere um novo token
5. Copie o token e adicione na variável `VITE_MELHOR_ENVIO_TOKEN`

### 3. Configurar Webhooks (Opcional)

1. No painel do Melhor Envio, vá em **Webhooks**
2. Adicione a URL: `https://seu-dominio.netlify.app/.netlify/functions/melhor-envio-webhooks`
3. Selecione os eventos:
   - `shipment.created`
   - `shipment.paid`
   - `shipment.generated`
   - `shipment.dispatched`
   - `shipment.delivered`
   - `shipment.cancelled`

## 🚀 Como Funciona

### Cálculo de Frete

```javascript
// O sistema tenta usar a API real primeiro
const result = await melhorEnvioService.calculateShipping({
  cepDestino: '01310-100',
  produtos: [
    {
      id: 'produto1',
      peso: 0.3,
      preco: 50.00,
      quantidade: 1
    }
  ]
});

// Se falhar, usa fallback com valores realistas
if (!result.success) {
  // Usa cálculo baseado em tabela dos Correios
}
```

### Fallback Inteligente

Quando a API não está disponível, o sistema usa:

- ✅ **Valores realistas** baseados na tabela dos Correios
- ✅ **Cálculo por peso e distância**
- ✅ **Opções SEDEX, PAC e Expresso**
- ✅ **Prazos de entrega estimados**

### Validação de CEP

```javascript
const cepData = await melhorEnvioService.validateCEP('01310-100');
// Retorna: { cep, logradouro, bairro, cidade, uf, ... }
```

## 📊 Estrutura de Dados

### Opções de Frete

```javascript
{
  success: true,
  options: [
    {
      id: 'sedex',
      name: 'SEDEX',
      company: 'Correios',
      price: 28.50,
      delivery_time: 2,
      delivery_range: { min: 1, max: 3 }
    }
  ],
  cep: '01310-100'
}
```

### Webhook de Status

```javascript
{
  event: 'shipment.dispatched',
  data: {
    order_id: '12345',
    protocol: 'ABC123',
    tracking_code: 'BR123456789BR'
  }
}
```

## 🔄 Status de Envio

| Status | Descrição |
|--------|-----------|
| `created` | Envio criado |
| `paid` | Envio pago |
| `generated` | Etiqueta gerada |
| `dispatched` | Enviado |
| `delivered` | Entregue |
| `cancelled` | Cancelado |

## 🛠️ Funções Disponíveis

### MelhorEnvioService

```javascript
// Calcular frete
await melhorEnvioService.calculateShipping(data)

// Validar CEP
await melhorEnvioService.validateCEP('01310-100')

// Obter empresas
await melhorEnvioService.getShippingCompanies()

// Rastrear envio
await melhorEnvioService.trackShipping('BR123456789BR')
```

### Netlify Functions

- `/.netlify/functions/melhor-envio` - API proxy
- `/.netlify/functions/melhor-envio-webhooks` - Webhooks

## 🧪 Testando

### 1. Teste de Cálculo de Frete

```javascript
// No console do navegador
const shippingData = {
  cepDestino: '01310-100',
  produtos: [{
    id: 'teste',
    peso: 0.3,
    preco: 50.00,
    quantidade: 1
  }]
};

melhorEnvioService.calculateShipping(shippingData)
  .then(result => console.log(result));
```

### 2. Teste de Validação de CEP

```javascript
melhorEnvioService.validateCEP('01310-100')
  .then(result => console.log(result));
```

## 🚨 Troubleshooting

### Problema: "Token não configurado"

**Solução:**
1. Verifique se `VITE_MELHOR_ENVIO_TOKEN` está definida
2. Confirme se o token é válido
3. O sistema usará fallback automaticamente

### Problema: "Erro de CORS"

**Solução:**
- ✅ Já resolvido com Netlify Functions
- ✅ Sistema usa proxy automático

### Problema: "CEP não encontrado"

**Solução:**
1. Verifique se o CEP tem 8 dígitos
2. Teste com CEPs conhecidos (ex: 01310-100)
3. Sistema usa ViaCEP como fallback

## 📈 Monitoramento

### Logs Importantes

```javascript
// No console do navegador
console.log('🚚 Usando API real do Melhor Envio');
console.log('🚚 Usando fallback: Token não configurado');
console.log('📊 Calculando frete...');
console.log('✅ Resultado do cálculo:', result);
```

### Métricas

- ✅ Taxa de sucesso da API
- ✅ Tempo de resposta
- ✅ Uso de fallback vs API real
- ✅ Erros de CEP

## 🔐 Segurança

- ✅ Tokens em variáveis de ambiente
- ✅ Validação de webhooks
- ✅ CORS configurado
- ✅ Rate limiting (via Melhor Envio)

## 📞 Suporte

Para problemas com a API do Melhor Envio:
- 📧 Email: suporte@melhorenvio.com.br
- 📱 WhatsApp: (11) 3003-9303
- 🌐 Site: https://melhorenvio.com.br/ajuda

---

**Status:** ✅ **Implementado e Funcionando**
**Última Atualização:** Dezembro 2024
