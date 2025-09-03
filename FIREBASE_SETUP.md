# 🔥 Configuração do Firebase - TFI IMPORTS

## ⚠️ **IMPORTANTE: Aplicar as Regras do Firestore**

### 📋 **Passo 1: Acessar o Firebase Console**
1. Vá para: [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Selecione o projeto: **tfimports-27898**

### 📋 **Passo 2: Configurar Firestore Database**
1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Rules"** (aba superior)
3. **Substitua** todo o conteúdo atual pelas regras abaixo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para produtos - leitura pública, escrita apenas para usuários autenticados
    match /produtos/{document} {
      allow read: if true; // Qualquer um pode ler produtos
      allow write: if request.auth != null; // Apenas usuários logados podem escrever
    }
    
    // Regras para feedbacks - leitura pública, escrita apenas para usuários autenticados
    match /feedbacks/{document} {
      allow read: if true; // Qualquer um pode ler feedbacks
      allow write: if request.auth != null; // Apenas usuários logados podem escrever
    }
    
    // Regras para pedidos - leitura e escrita apenas para o próprio usuário
    match /pedidos/{document} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Regras para mensagens - leitura e escrita apenas para usuários autenticados
    match /mensagens/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Regras para usuários - leitura e escrita apenas para o próprio usuário
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 📋 **Passo 3: Publicar as Regras**
1. Clique em **"Publish"** (botão azul)
2. Confirme a publicação

### 📋 **Passo 4: Configurar Authentication**
1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Sign-in method"**
3. **Ative** os seguintes provedores:
   - ✅ **Email/Password** (para login com email/senha)
   - ✅ **Google** (para login com Google)

### 📋 **Passo 5: Configurar Domínios Autorizados**
1. Em **Authentication** → **Settings** → **Authorized domains**
2. Adicione os domínios:
   - `tfimports01.com.br`
   - `localhost` (para desenvolvimento)

## 🧪 **Teste Após Configuração**

### ✅ **Verificar se Funciona:**
1. Acesse: [https://tfimports01.com.br/](https://tfimports01.com.br/)
2. Tente fazer login (deve funcionar sem erros)
3. Acesse o painel admin
4. Tente adicionar um produto
5. Verifique se não há mais erros de "Missing or insufficient permissions"

## 🚨 **Se Ainda Houver Problemas:**

### **Erro: "Missing or insufficient permissions"**
- Verifique se as regras foram publicadas corretamente
- Confirme se o usuário está logado
- Verifique se o Authentication está ativado

### **Erro: "CSP violation"**
- As correções já foram aplicadas no código
- Aguarde o deploy do Netlify (pode levar alguns minutos)

## 📞 **Suporte**
Se precisar de ajuda, verifique:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**🎯 Após seguir estes passos, o sistema deve funcionar 100%!**
