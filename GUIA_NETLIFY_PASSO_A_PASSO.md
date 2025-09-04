# 🎯 GUIA PASSO A PASSO - Configurar Netlify

## 📱 **PASSO 1: Acessar o Netlify**
1. Abra seu navegador
2. Digite: `https://app.netlify.com`
3. Faça login com sua conta

## 🏠 **PASSO 2: Encontrar seu Site**
1. Na tela inicial, você verá uma lista de sites
2. Procure por: **"Tfimports"** ou **"TFI IMPORTS"**
3. **CLIQUE** no nome do site

## ⚙️ **PASSO 3: Ir para Configurações**
1. Clique em **"Site settings"** (no menu superior)
2. No menu lateral esquerdo, clique em **"Environment variables"**

## 🔑 **PASSO 4: Adicionar as "Senhas" (Variáveis)**

Para cada item abaixo, clique em **"Add variable"** e preencha:

### 🔥 **Firebase (Sistema de Login)**
```
Chave: VITE_FIREBASE_API_KEY
Valor: AIzaSyD__XrPqFeh4_K0ih4l1reNvWxjW7VItPw
```

```
Chave: VITE_FIREBASE_AUTH_DOMAIN
Valor: tfimports-27898.firebaseapp.com
```

```
Chave: VITE_FIREBASE_PROJECT_ID
Valor: tfimports-27898
```

```
Chave: VITE_FIREBASE_STORAGE_BUCKET
Valor: tfimports-27898.firebasestorage.app
```

```
Chave: VITE_FIREBASE_MESSAGING_SENDER_ID
Valor: 379291286011
```

```
Chave: VITE_FIREBASE_APP_ID
Valor: 1:379291286011:web:1feb4711b5235b04c4b35e
```

```
Chave: VITE_FIREBASE_MEASUREMENT_ID
Valor: G-B742BVBRES
```

### 💳 **Mercado Pago (Pagamentos)**
```
Chave: VITE_MERCADO_PAGO_PUBLIC_KEY
Valor: APP_USR-9e9ec536-b2c8-40eb-bd4a-69d5be0b0539
```

```
Chave: VITE_MERCADO_PAGO_ACCESS_TOKEN
Valor: APP_USR-5032663457298044-090316-620de3416b9f7f60d475223dd78c6b99-2018162925
```

```
Chave: VITE_MERCADO_PAGO_CLIENT_SECRET
Valor: POvnfQOswweLVB5zUXtyRbtFF11d8OhD
```

```
Chave: VITE_MERCADO_PAGO_SANDBOX
Valor: false
```

### 📦 **Melhor Envio (Frete)**
```
Chave: VITE_MELHOR_ENVIO_TOKEN
Valor: TOKEN_TEMPORARIO_MELHOR_ENVIO_12345
```

### 🌐 **Configurações Gerais**
```
Chave: VITE_APP_ENV
Valor: production
```

```
Chave: VITE_API_URL
Valor: https://tfimports.netlify.app
```

## ✅ **PASSO 5: Finalizar**
1. Após adicionar todas as variáveis, clique em **"Save"**
2. Volte para a tela principal do site
3. Clique em **"Deploys"** (no menu superior)
4. Clique em **"Trigger deploy"** → **"Deploy site"**

## 🎉 **PASSO 6: Testar**
1. Aguarde o deploy terminar (pode levar 2-5 minutos)
2. Clique no link do seu site
3. Teste: login, adicionar produto, finalizar compra

## 🆘 **Se algo der errado:**
- Verifique se copiou exatamente o valor
- Certifique-se que não há espaços extras
- Tente fazer um novo deploy manual

## 📞 **Precisa de ajuda?**
- Tire print da tela se der erro
- Me envie o link do seu site no Netlify
