# 🛡️ Guia de Segurança - TFI IMPORTS

## ⚠️ Configuração de Segurança Obrigatória

### 1. **Configurar Variáveis de Ambiente**

```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas credenciais reais
nano .env
```

**NUNCA commite o arquivo `.env` com credenciais reais!**

### 2. **Configurar Firebase**

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto ou use um existente
3. Ative a autenticação com Google
4. Configure as regras de segurança do Firestore:

```javascript
// Regras do Firestore (firestore.rules)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Apenas usuários autenticados podem ler/escrever
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. **Configurar HTTPS (Obrigatório em Produção)**

```bash
# Para desenvolvimento local com HTTPS
npm run dev -- --https

# Para produção, configure certificados SSL
# Use Let's Encrypt ou seu provedor de hospedagem
```

### 4. **Headers de Segurança no Servidor**

Configure seu servidor web (Nginx/Apache) com:

```nginx
# Nginx
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https:; connect-src 'self' https://*.firebaseapp.com https://*.googleapis.com; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';" always;
```

### 5. **Backup e Monitoramento**

```bash
# Backup regular dos dados
# Configure backup automático do Firestore

# Monitoramento de segurança
npm run security-check
```

## 🔒 Funcionalidades de Segurança Implementadas

### ✅ **Prevenção XSS**
- Sanitização de todos os inputs do usuário
- Escape de HTML em renderização
- Validação rigorosa de dados

### ✅ **Rate Limiting**
- Limite de tentativas de feedback (3 por 5 minutos)
- Limite de cadastro de produtos (5 por minuto)
- Proteção contra spam

### ✅ **Validação de Dados**
- Validação de email, CEP, preços
- Validação de tamanhos e cores
- Sanitização de texto

### ✅ **Configuração Segura**
- Credenciais em variáveis de ambiente
- CSP (Content Security Policy)
- Headers de segurança

### ✅ **Autenticação Segura**
- Firebase Auth com Google
- Scopes limitados (email, profile)
- Verificação de usuário autenticado

## 🚨 Checklist de Segurança

Antes de colocar em produção:

- [ ] Configurar variáveis de ambiente
- [ ] Configurar HTTPS
- [ ] Configurar regras do Firestore
- [ ] Configurar headers de segurança no servidor
- [ ] Testar todas as funcionalidades
- [ ] Fazer backup dos dados
- [ ] Configurar monitoramento
- [ ] Testar rate limiting
- [ ] Validar CSP

## 🆘 Em Caso de Problemas

1. **Credenciais expostas**: Regenerar chaves no Firebase Console
2. **Ataque XSS**: Verificar logs e atualizar sanitização
3. **Rate limiting**: Ajustar limites no arquivo `security.js`
4. **CSP bloqueando recursos**: Ajustar política no HTML

## 📞 Suporte

Para dúvidas sobre segurança, consulte:
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
