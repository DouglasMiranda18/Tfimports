# 🚚 Como Configurar o Melhor Envio - Guia Completo

## 📋 Pré-requisitos

1. **Conta no Melhor Envio** - [Criar conta](https://melhorenvio.com.br/)
2. **Documentos da empresa** - CNPJ, endereço, etc.
3. **Acesso ao painel administrativo** do Melhor Envio

## 🔧 Passo a Passo

### 1. Criar Conta no Melhor Envio

1. Acesse: https://melhorenvio.com.br/
2. Clique em **"Criar Conta"**
3. Preencha os dados da empresa:
   - **Nome da empresa:** TFI IMPORTS
   - **CNPJ:** 12.345.678/0001-90
   - **Email:** contato@tfimports.com.br
   - **Telefone:** (11) 99999-9999
   - **Endereço completo**

### 2. Configurar Dados da Loja

No painel do Melhor Envio:

1. Vá em **"Configurações"** > **"Dados da Loja"**
2. Preencha:
   - **Nome:** TFI IMPORTS
   - **CNPJ:** 12.345.678/0001-90
   - **Endereço:** Rua das Flores, 123 - Centro - São Paulo/SP
   - **CEP:** 01310-100
   - **Telefone:** (11) 99999-9999
   - **Email:** contato@tfimports.com.br

### 3. Gerar Token da API

1. No painel, vá em **"Configurações"** > **"API"**
2. Clique em **"Gerar Novo Token"**
3. Copie o token gerado
4. **IMPORTANTE:** Guarde este token em local seguro

### 4. Configurar no Projeto

1. **Abra o arquivo `enviar.env`**
2. **Substitua `SEU_TOKEN_AQUI` pelo token real:**

```env
# Melhor Envio Configuration
VITE_MELHOR_ENVIO_TOKEN=seu_token_real_aqui
MELHOR_ENVIO_WEBHOOK_SECRET=tfimports_melhor_envio_webhook_2024
```

### 5. Configurar Webhooks (Opcional)

1. No painel do Melhor Envio, vá em **"Webhooks"**
2. Adicione a URL: `https://tfimports01.com.br/.netlify/functions/melhor-envio-webhooks`
3. Selecione os eventos:
   - ✅ `shipment.created`
   - ✅ `shipment.paid`
   - ✅ `shipment.generated`
   - ✅ `shipment.dispatched`
   - ✅ `shipment.delivered`
   - ✅ `shipment.cancelled`

### 6. Configurar Transportadoras

1. Vá em **"Transportadoras"**
2. Ative as principais:
   - ✅ **Correios (SEDEX)**
   - ✅ **Correios (PAC)**
   - ✅ **Jadlog**
   - ✅ **Total Express**
   - ✅ **Azul Cargo**

### 7. Configurar Dimensões e Pesos

1. Vá em **"Configurações"** > **"Produtos"**
2. Configure:
   - **Peso padrão:** 0.3 kg
   - **Dimensões padrão:** 20x15x10 cm
   - **Valor do seguro:** Automático

## 🧪 Testando a Integração

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
  .then(result => console.log('Resultado:', result));
```

### 2. Teste de Validação de CEP

```javascript
melhorEnvioService.validateCEP('01310-100')
  .then(result => console.log('CEP válido:', result));
```

### 3. Teste de Criação de Etiqueta

```javascript
const orderData = {
  service_id: '1', // SEDEX
  cliente: {
    nome: 'João Silva',
    telefone: '(11) 99999-9999',
    email: 'joao@email.com',
    documento: '123.456.789-00'
  },
  endereco: {
    logradouro: 'Rua das Flores, 123',
    complemento: 'Apto 45',
    numero: '123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01310-100'
  },
  produtos: [{
    nome: 'Produto Teste',
    quantidade: 1,
    preco: 50.00
  }],
  peso_total: 0.3
};

melhorEnvioService.createShippingLabel(orderData)
  .then(result => console.log('Etiqueta criada:', result));
```

## 📊 Monitoramento

### Logs Importantes

```javascript
// No console do navegador
console.log('🚚 Usando API real do Melhor Envio');
console.log('🔑 Token configurado: abc123...');
console.log('📊 Calculando frete...');
console.log('✅ Resultado do cálculo:', result);
```

### Verificar Status

1. **No painel do Melhor Envio:**
   - Vá em **"Envios"**
   - Veja todos os envios criados
   - Acompanhe status em tempo real

2. **No site:**
   - Teste cálculo de frete
   - Verifique se valores são reais
   - Confirme criação de etiquetas

## 🚨 Troubleshooting

### Problema: "Token não configurado"

**Solução:**
1. Verifique se `VITE_MELHOR_ENVIO_TOKEN` está definida
2. Confirme se o token é válido
3. Faça deploy após alterar variáveis

### Problema: "Erro de CORS"

**Solução:**
- ✅ Já resolvido com Netlify Functions
- ✅ Sistema usa proxy automático

### Problema: "CEP não encontrado"

**Solução:**
1. Verifique se o CEP tem 8 dígitos
2. Teste com CEPs conhecidos
3. Sistema usa ViaCEP como fallback

### Problema: "Frete muito alto/baixo"

**Solução:**
1. Verifique dimensões dos produtos
2. Confirme peso real
3. Ajuste configurações no painel

## 💰 Custos

### Melhor Envio
- **Taxa por envio:** R$ 0,50
- **Sem mensalidade**
- **Pagamento:** Por envio

### Correios
- **SEDEX:** R$ 28-45
- **PAC:** R$ 18-32
- **Valores reais** da tabela oficial

## 📞 Suporte

### Melhor Envio
- **Email:** suporte@melhorenvio.com.br
- **WhatsApp:** (11) 3003-9303
- **Chat:** No painel administrativo

### Documentação
- **API:** https://docs.melhorenvio.com.br/
- **Webhooks:** https://docs.melhorenvio.com.br/webhooks
- **Integração:** https://docs.melhorenvio.com.br/integracao

## ✅ Checklist Final

- [ ] Conta criada no Melhor Envio
- [ ] Dados da loja configurados
- [ ] Token da API gerado
- [ ] Token configurado no projeto
- [ ] Webhooks configurados (opcional)
- [ ] Transportadoras ativadas
- [ ] Teste de cálculo de frete
- [ ] Teste de criação de etiqueta
- [ ] Deploy realizado
- [ ] Monitoramento ativo

---

**🎯 Resultado:** Sistema de frete 100% funcional com valores reais e criação de etiquetas no Melhor Envio!

**📅 Última Atualização:** Dezembro 2024
