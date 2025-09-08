# 🚀 Configuração no Netlify - Guia Completo

## 📋 Problema Identificado

O Netlify não está carregando as variáveis de ambiente do arquivo `enviar.env`. Precisamos configurar as variáveis diretamente no painel do Netlify.

## 🔧 Solução: Configurar Variáveis no Netlify

### 1. Acessar o Painel do Netlify

1. Acesse: https://app.netlify.com/
2. Faça login na sua conta
3. Selecione o projeto **tfimports01**

### 2. Configurar Variáveis de Ambiente

1. Vá em **"Site settings"** (Configurações do site)
2. Clique em **"Environment variables"** (Variáveis de ambiente)
3. Adicione as seguintes variáveis:

#### **Firebase Configuration:**
```
VITE_FIREBASE_API_KEY = AIzaSyBvQ8Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q
VITE_FIREBASE_AUTH_DOMAIN = tfimports-27898.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = tfimports-27898
VITE_FIREBASE_STORAGE_BUCKET = tfimports-27898.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = 123456789012
VITE_FIREBASE_APP_ID = 1:123456789012:web:abcdef1234567890
VITE_FIREBASE_MEASUREMENT_ID = G-ABCDEF1234
```

#### **Asaas Configuration:**
```
VITE_ASAAS_API_KEY = $aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjIyNDljZDdlLTY0OTEtNDdmZC05ZGVkLTMzNDNhNmQ4NWRhNDo6JGFhY2hfMGM1YWE5MGYtMjYxZi00ZTM4LTg4MTAtN2I5N2JiZGIxMmUx
VITE_ASAAS_ENVIRONMENT = sandbox
VITE_ASAAS_WEBHOOK_TOKEN = tfimports_webhook_secret_2024
```

#### **Melhor Envio Configuration:**
```
VITE_MELHOR_ENVIO_TOKEN = 2OYosOhoDN6DGfqeJt4yMg8Q3TalcU2rTrQ86IID
MELHOR_ENVIO_WEBHOOK_SECRET = tfimports_melhor_envio_webhook_2024
```

#### **Outras configurações:**
```
VITE_APP_ENV = production
VITE_API_URL = https://tfimports01.com.br
```

### 3. Como Adicionar Variáveis

Para cada variável:
1. Clique em **"Add variable"** (Adicionar variável)
2. **Key:** Nome da variável (ex: `VITE_MELHOR_ENVIO_TOKEN`)
3. **Value:** Valor da variável (ex: `2OYosOhoDN6DGfqeJt4yMg8Q3TalcU2rTrQ86IID`)
4. Clique em **"Save"** (Salvar)

### 4. Fazer Deploy

1. Após adicionar todas as variáveis
2. Vá em **"Deploys"** (Deploys)
3. Clique em **"Trigger deploy"** > **"Deploy site"** (Disparar deploy)
4. Aguarde o deploy completar

## 🧪 Testando

### 1. Verificar Logs

1. Vá em **"Functions"** (Funções)
2. Clique em **"melhor-envio"**
3. Veja os logs para verificar se o token está sendo carregado

### 2. Testar no Site

1. Acesse: https://tfimports01.com.br/
2. Abra o console do navegador (F12)
3. Teste o cálculo de frete
4. Verifique se aparece: `🚚 Usando API real do Melhor Envio`

### 3. Verificar Console

No console do navegador, deve aparecer:
```
🚚 Usando API real do Melhor Envio
🔑 Token configurado: 2OYosOhoD...
📊 Calculando frete...
```

## 🚨 Troubleshooting

### Problema: "Token não configurado"

**Solução:**
1. Verifique se as variáveis foram adicionadas no Netlify
2. Confirme se o nome da variável está correto
3. Faça um novo deploy após adicionar

### Problema: "Erro 401 - Unauthorized"

**Solução:**
1. Verifique se o token do Melhor Envio está correto
2. Confirme se a conta está ativa
3. Teste o token no painel do Melhor Envio

### Problema: "Função não encontrada"

**Solução:**
1. Verifique se o deploy foi concluído
2. Confirme se as funções estão sendo buildadas
3. Veja os logs de build

## 📊 Verificação Final

### ✅ Checklist:

- [ ] Variáveis adicionadas no Netlify
- [ ] Deploy realizado
- [ ] Logs verificados
- [ ] Teste de cálculo de frete
- [ ] Console sem erros
- [ ] Token sendo carregado

### 🎯 Resultado Esperado:

- ✅ **Cálculo de frete** com valores reais
- ✅ **Token carregado** corretamente
- ✅ **API funcionando** sem erros
- ✅ **Sistema completo** operacional

## 📞 Suporte

Se ainda não funcionar:
1. Verifique os logs do Netlify
2. Confirme as variáveis de ambiente
3. Teste o token no painel do Melhor Envio
4. Faça um novo deploy

---

**🎯 Objetivo:** Configurar variáveis de ambiente no Netlify para que o Melhor Envio funcione com API real.

**📅 Última Atualização:** Dezembro 2024
