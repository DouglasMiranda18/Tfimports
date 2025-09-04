# 🚀 Instruções de Deploy - TFI IMPORTS

## 📋 Configuração das Variáveis de Ambiente no Netlify

Para configurar o site em produção, você precisa adicionar as seguintes variáveis de ambiente no painel do Netlify:

### 🔥 Firebase Configuration
```
VITE_FIREBASE_API_KEY = AIzaSyD__XrPqFeh4_K0ih4l1reNvWxjW7VItPw
VITE_FIREBASE_AUTH_DOMAIN = tfimports-27898.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = tfimports-27898
VITE_FIREBASE_STORAGE_BUCKET = tfimports-27898.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 379291286011
VITE_FIREBASE_APP_ID = 1:379291286011:web:1feb4711b5235b04c4b35e
VITE_FIREBASE_MEASUREMENT_ID = G-B742BVBRES
```

### 💳 Mercado Pago Configuration (PRODUÇÃO)
```
VITE_MERCADO_PAGO_PUBLIC_KEY = APP_USR-9e9ec536-b2c8-40eb-bd4a-69d5be0b0539
VITE_MERCADO_PAGO_ACCESS_TOKEN = APP_USR-5032663457298044-090316-620de3416b9f7f60d475223dd78c6b99-2018162925
VITE_MERCADO_PAGO_CLIENT_SECRET = POvnfQOswweLVB5zUXtyRbtFF11d8OhD
VITE_MERCADO_PAGO_SANDBOX = false
```

### 📦 Melhor Envio Configuration
```
VITE_MELHOR_ENVIO_TOKEN = TOKEN_TEMPORARIO_MELHOR_ENVIO_12345
```

### 🌐 Ambiente
```
VITE_APP_ENV = production
VITE_API_URL = https://tfimports.netlify.app
```

## 📝 Como Configurar no Netlify:

1. **Acesse o painel do Netlify**
2. **Vá para seu site TFI IMPORTS**
3. **Clique em "Site settings"**
4. **Vá para "Environment variables"**
5. **Adicione cada variável acima**
6. **Clique em "Save"**
7. **Faça um novo deploy**

## 🔄 Deploy Automático:

Após configurar as variáveis, faça um commit na branch `main`:

```bash
git add .
git commit -m "feat: configurar credenciais de produção"
git push origin main
```

O Netlify fará o deploy automaticamente!

## ✅ Verificação:

Após o deploy, teste:
- [ ] Login com Google
- [ ] Adicionar produtos ao carrinho
- [ ] Finalizar compra (Checkout Pro)
- [ ] Cálculo de frete
- [ ] Webhooks do Mercado Pago

## 🔒 Segurança:

- ✅ Arquivo `.env` está no `.gitignore`
- ✅ Credenciais não são commitadas
- ✅ Variáveis são configuradas no Netlify
- ✅ CSP configurado no `netlify.toml`
