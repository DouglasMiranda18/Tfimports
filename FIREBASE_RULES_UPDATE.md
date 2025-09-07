# 🔥 Atualização das Regras do Firestore

## ⚠️ AÇÃO NECESSÁRIA

As regras do Firestore foram corrigidas no código, mas precisam ser atualizadas no Firebase Console.

### 📋 Passos para Atualizar:

1. **Acesse o Firebase Console:**
   - Vá para: https://console.firebase.google.com/
   - Selecione seu projeto: `tfimports-27898`

2. **Navegue para Firestore:**
   - No menu lateral, clique em "Firestore Database"
   - Clique na aba "Regras" (Rules)

3. **Substitua as regras atuais por:**

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
    match /orders/{document} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.user_id == request.auth.uid);
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

4. **Publique as regras:**
   - Clique em "Publicar" (Publish)
   - Confirme a atualização

### 🔧 O que foi corrigido:

- ❌ **Antes:** Collection `pedidos` com campo `userId`
- ✅ **Agora:** Collection `orders` com campo `user_id`
- ✅ **Permissões:** Usuários podem ler/escrever apenas seus próprios pedidos

### 🎯 Resultado:

Após atualizar as regras, a aba "Meus Pedidos" deve funcionar corretamente sem erros de permissão.

---

**⚠️ IMPORTANTE:** Esta atualização é necessária para que o sistema funcione corretamente!
