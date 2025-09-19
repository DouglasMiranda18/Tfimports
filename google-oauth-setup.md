# 🔧 Configuração do Google OAuth - Guia Completo

## 🚨 Problema Atual
**Erro 400: redirect_uri_mismatch**

O Google está rejeitando o login porque o `redirect_uri` não está configurado corretamente.

## 📋 Solução Passo a Passo

### **Passo 1: Google Cloud Console**

1. **Acesse o Google Cloud Console**:
   - URL: https://console.cloud.google.com/
   - Faça login com sua conta Google

2. **Selecione o Projeto Firebase**:
   - No topo da página, clique no seletor de projeto
   - Escolha o projeto que corresponde ao seu Firebase

3. **Navegue para Credentials**:
   - Menu lateral esquerdo → "APIs & Services" → "Credentials"

4. **Encontre o OAuth 2.0 Client ID**:
   - Procure por "Web client" ou "OAuth 2.0 Client ID"
   - Clique no ícone de edição (lápis) para editar

5. **Configure os URIs de Redirecionamento**:
   ```
   https://tfimports-27898.firebaseapp.com/__/auth/handler
   https://tfimports01.com.br/__/auth/handler
   http://localhost:3000/__/auth/handler
   ```

6. **Salve as alterações**

### **Passo 2: Firebase Console**

1. **Acesse o Firebase Console**:
   - URL: https://console.firebase.google.com/
   - Selecione seu projeto

2. **Vá para Authentication**:
   - Menu lateral → "Authentication" → "Settings"

3. **Configure Authorized domains**:
   - Clique na aba "Authorized domains"
   - Adicione os seguintes domínios:
     ```
     tfimports01.com.br
     tfimports-27898.firebaseapp.com
     localhost
     ```

4. **Salve as alterações**

### **Passo 3: Verificar Configuração**

1. **Verifique se os domínios estão corretos**:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID

2. **Teste o login**:
   - Acesse https://tfimports01.com.br
   - Clique em "Entrar"
   - Teste o login com Google

## 🔍 URLs Importantes

### **Firebase Auth Handler URLs**:
```
https://tfimports-27898.firebaseapp.com/__/auth/handler
https://tfimports01.com.br/__/auth/handler
```

### **Domínios Autorizados**:
```
tfimports01.com.br
tfimports-27898.firebaseapp.com
localhost
```

## ⚠️ Pontos Importantes

1. **Use exatamente os URLs acima** - não mude nada
2. **O formato é `__/auth/handler`** (com dois underscores)
3. **Adicione tanto o domínio personalizado quanto o Firebase**
4. **Salve as alterações em ambos os consoles**

## 🚀 Após a Configuração

1. **Aguarde 5-10 minutos** para as alterações propagarem
2. **Teste o login** no site
3. **Se ainda der erro**, verifique se salvou em ambos os consoles

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique se salvou em ambos os consoles
2. Aguarde alguns minutos para propagação
3. Teste em modo incógnito
4. Verifique se não há cache do navegador

---

**Status**: ⏳ Aguardando configuração nos consoles
**Próximo passo**: Configurar os URIs nos consoles do Google e Firebase
