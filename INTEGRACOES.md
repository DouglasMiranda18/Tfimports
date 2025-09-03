# 🚀 Integrações - Mercado Pago e Melhor Envio

## 📋 **Visão Geral**

Sistema completo de e-commerce com integrações reais para pagamentos e frete:

- ✅ **Mercado Pago** - Pagamentos PIX, cartão e boleto
- ✅ **Melhor Envio** - Cálculo de frete e etiquetas
- ✅ **Firebase** - Banco de dados e autenticação
- ✅ **Sistema de Pedidos** - Gerenciamento completo

## 🔧 **Configuração**

### **1. Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Mercado Pago
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR_12345678901234567890123456789012-123456-12345678901234567890123456789012-123456789
VITE_MERCADO_PAGO_ACCESS_TOKEN=APP_USR_12345678901234567890123456789012-123456-12345678901234567890123456789012-123456789
VITE_MERCADO_PAGO_SANDBOX=true

# Melhor Envio
VITE_MELHOR_ENVIO_TOKEN=12345678901234567890123456789012
VITE_MELHOR_ENVIO_SANDBOX=true
```

### **2. Obter Credenciais**

#### **Mercado Pago:**
1. Acesse: [https://www.mercadopago.com.br/developers](https://www.mercadopago.com.br/developers)
2. Crie uma conta de desenvolvedor
3. Obtenha as chaves de teste/produção
4. Configure webhooks para notificações

#### **Melhor Envio:**
1. Acesse: [https://melhorenvio.com.br/](https://melhorenvio.com.br/)
2. Crie uma conta
3. Obtenha o token de API
4. Configure CEP de origem da loja

## 🏗️ **Arquitetura**

### **Estrutura de Arquivos:**
```
├── api-config.js          # Configuração das APIs
├── mercado-pago.js        # Integração Mercado Pago
├── melhor-envio.js        # Integração Melhor Envio
├── order-manager.js       # Gerenciador de pedidos
├── index.html             # Interface principal
└── INTEGRACOES.md         # Esta documentação
```

### **Fluxo de Funcionamento:**

#### **1. Cálculo de Frete:**
```
Usuário insere CEP → Validação CEP → Melhor Envio API → Opções de frete → Seleção
```

#### **2. Processamento de Pagamento:**
```
Seleção método → Dados do pedido → Mercado Pago API → Redirecionamento → Confirmação
```

#### **3. Gerenciamento de Pedidos:**
```
Pedido criado → Status atualizado → Etiqueta gerada → Rastreamento
```

## 💳 **Mercado Pago**

### **Métodos Suportados:**
- ✅ **PIX** - Pagamento instantâneo
- ✅ **Cartão de Crédito** - Até 6x sem juros
- ✅ **Cartão de Débito** - Débito online
- ✅ **Boleto** - Pagamento em até 3 dias

### **Funcionalidades:**
- ✅ **Preferências de pagamento**
- ✅ **Processamento de cartão**
- ✅ **Webhooks para notificações**
- ✅ **Rastreamento de status**

### **Exemplo de Uso:**
```javascript
// Criar preferência PIX
const result = await mercadoPagoService.createPreference({
  items: [...],
  payer: {...},
  external_reference: 'PEDIDO-123'
});

// Redirecionar para pagamento
window.open(result.payment_url, '_blank');
```

## 📦 **Melhor Envio**

### **Funcionalidades:**
- ✅ **Cálculo de frete** em tempo real
- ✅ **Validação de CEP** automática
- ✅ **Múltiplas transportadoras**
- ✅ **Criação de etiquetas**
- ✅ **Rastreamento de envios**

### **Transportadoras Suportadas:**
- ✅ **Correios** - PAC, SEDEX
- ✅ **Jadlog** - Expresso
- ✅ **Total Express** - Rápido
- ✅ **Loggi** - Entrega rápida

### **Exemplo de Uso:**
```javascript
// Calcular frete
const result = await melhorEnvioService.calculateShipping({
  cepDestino: '01310-100',
  produtos: [...],
  pesoTotal: 1.5
});

// Exibir opções
result.options.forEach(option => {
  console.log(`${option.name}: ${option.price} - ${option.delivery_time} dias`);
});
```

## 🛒 **Sistema de Pedidos**

### **Estados do Pedido:**
- `pending_payment` - Aguardando pagamento
- `payment_approved` - Pagamento aprovado
- `shipping_created` - Etiqueta criada
- `shipped` - Enviado
- `delivered` - Entregue
- `cancelled` - Cancelado

### **Estrutura do Pedido:**
```javascript
{
  id: "TFI-ABC123",
  status: "payment_approved",
  user_id: "user123",
  items: [...],
  shipping: {...},
  payment: {...},
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}
```

## 🔒 **Segurança**

### **Medidas Implementadas:**
- ✅ **Validação de dados** em todas as entradas
- ✅ **Sanitização** de inputs do usuário
- ✅ **Rate limiting** para prevenir spam
- ✅ **Tokens seguros** para APIs
- ✅ **HTTPS obrigatório** em produção

### **Regras do Firestore:**
```javascript
// Pedidos - apenas o próprio usuário
match /pedidos/{document} {
  allow read, write: if request.auth != null && 
    (resource == null || resource.data.user_id == request.auth.uid);
}
```

## 🧪 **Modo Demo**

### **Quando Usar:**
- ✅ **Desenvolvimento** local
- ✅ **Testes** sem APIs reais
- ✅ **Demonstrações** para clientes
- ✅ **Configuração** inicial

### **Como Ativar:**
```javascript
// No api-config.js
export const apiConfig = {
  mercadoPago: {
    sandbox: true, // Modo teste
    publicKey: 'TEST-1234...' // Chave de teste
  }
};
```

## 📊 **Monitoramento**

### **Logs Importantes:**
- ✅ **Criação de pedidos**
- ✅ **Processamento de pagamentos**
- ✅ **Cálculo de fretes**
- ✅ **Erros de integração**

### **Métricas Recomendadas:**
- ✅ **Taxa de conversão** de pedidos
- ✅ **Tempo médio** de processamento
- ✅ **Taxa de erro** das APIs
- ✅ **Satisfação** do cliente

## 🚀 **Deploy em Produção**

### **Checklist:**
- ✅ **Variáveis de ambiente** configuradas
- ✅ **Chaves de produção** ativas
- ✅ **Webhooks** configurados
- ✅ **SSL/HTTPS** ativo
- ✅ **Monitoramento** ativo
- ✅ **Backup** do banco de dados

### **Configurações de Produção:**
```javascript
// api-config.js
export const apiConfig = {
  mercadoPago: {
    sandbox: false, // Produção
    publicKey: 'APP_USR_PROD_...' // Chave de produção
  },
  melhorEnvio: {
    sandbox: false, // Produção
    token: 'PROD_TOKEN_...' // Token de produção
  }
};
```

## 🆘 **Troubleshooting**

### **Problemas Comuns:**

#### **1. Erro de CEP:**
```
Solução: Verificar se CEP está no formato correto (12345-678)
```

#### **2. Pagamento não processado:**
```
Solução: Verificar chaves do Mercado Pago e status da conta
```

#### **3. Frete não calculado:**
```
Solução: Verificar token do Melhor Envio e CEP de origem
```

#### **4. Pedido não criado:**
```
Solução: Verificar regras do Firestore e autenticação
```

## 📞 **Suporte**

### **Documentação Oficial:**
- [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
- [Melhor Envio API](https://docs.melhorenvio.com.br/)
- [Firebase Documentation](https://firebase.google.com/docs)

### **Contato:**
- **Email**: contato@tfimports.com.br
- **WhatsApp**: (11) 99999-9999

---

**🎯 Sistema completo e funcional para e-commerce profissional!**
