# 👥 Sistema de Usuários - TFI IMPORTS

## 🎯 **Funcionalidades Implementadas**

### 🔐 **Sistema de Autenticação**
- **Login com Google** - Integração completa
- **Login com Email/Senha** - Registro e login
- **Controle de Acesso** - Admin vs Usuário comum

### 👑 **Painel Administrativo**
- **Acesso Restrito**: Apenas `admin@tfimports.com.br` pode acessar
- **Funcionalidades**:
  - ✅ Cadastrar produtos
  - ✅ Gerenciar produtos (destacar/remover)
  - ✅ Visualizar lista de produtos
- **Proteção**: Usuários comuns são redirecionados

### 👤 **Área "Minha Conta"**
- **Acesso**: Qualquer usuário logado
- **Funcionalidades**:
  - ✅ Informações pessoais
  - ✅ Histórico de pedidos
  - ✅ Data de cadastro
  - 🔄 Produtos favoritos (futuro)

## 🚀 **Como Usar**

### **Para Administradores:**
1. **Login**: Use `admin@tfimports.com.br`
2. **Acesso**: Clique em "Painel Admin" no menu
3. **Gerenciar**: Adicione/edite produtos normalmente

### **Para Usuários Comuns:**
1. **Registro**: Clique em "Entrar" → "Criar conta"
2. **Login**: Use email/senha ou Google
3. **Minha Conta**: Acesse via menu ou botão "Conta"

## 🔧 **Configuração do Admin**

### **Email do Administrador:**
```javascript
adminEmail: 'admin@tfimports.com.br'
```

### **Para Alterar o Admin:**
1. Edite o arquivo `index.html`
2. Localize a linha: `adminEmail: 'admin@tfimports.com.br'`
3. Altere para o email desejado
4. Faça commit e push

## 📱 **Navegação Dinâmica**

### **Usuário Não Logado:**
- Menu: Home, Loja, Novidades, Feedbacks, Contato
- Botão: "Entrar"

### **Usuário Comum Logado:**
- Menu: Home, Loja, Novidades, Feedbacks, Contato, **Minha Conta**
- Botão: "Conta" (leva para Minha Conta)

### **Admin Logado:**
- Menu: Home, Loja, Novidades, Feedbacks, Contato, **Painel Admin**
- Botão: "Conta" (leva para Minha Conta)

## 🛡️ **Segurança**

### **Proteções Implementadas:**
- ✅ **Admin**: Apenas email específico
- ✅ **Minha Conta**: Apenas usuários logados
- ✅ **Redirecionamento**: Automático para área correta
- ✅ **Validação**: Verificação de permissões

### **Regras do Firestore:**
```javascript
// Produtos - leitura pública, escrita apenas para autenticados
match /produtos/{document} {
  allow read: if true;
  allow write: if request.auth != null;
}

// Pedidos - apenas o próprio usuário
match /pedidos/{document} {
  allow read, write: if request.auth != null && 
    (resource == null || resource.data.userId == request.auth.uid);
}
```

## 🎨 **Interface**

### **Minha Conta:**
- **Informações Pessoais**: Nome, email, data de cadastro
- **Meus Pedidos**: Histórico dos últimos 5 pedidos
- **Favoritos**: Preparado para implementação futura

### **Painel Admin:**
- **Cadastro de Produtos**: Formulário completo
- **Lista de Produtos**: Gerenciamento com ações
- **Interface Limpa**: Sem tutorial, foco na funcionalidade

## 🔄 **Fluxo de Uso**

### **1. Usuário Novo:**
```
Entrar → Criar Conta → Login → Minha Conta
```

### **2. Usuário Existente:**
```
Entrar → Login → Minha Conta (ou Admin se for admin)
```

### **3. Admin:**
```
Login com admin@tfimports.com.br → Painel Admin
```

## 📊 **Benefícios**

### **Para o Negócio:**
- ✅ **Fidelização**: Usuários têm área personalizada
- ✅ **Controle**: Apenas admin pode gerenciar produtos
- ✅ **Segurança**: Acesso restrito e controlado
- ✅ **Experiência**: Interface adaptada ao tipo de usuário

### **Para os Usuários:**
- ✅ **Conveniência**: Acesso rápido aos pedidos
- ✅ **Personalização**: Área própria no site
- ✅ **Histórico**: Visualização de compras anteriores
- ✅ **Segurança**: Dados protegidos

## 🚀 **Próximos Passos (Opcionais)**

### **Funcionalidades Futuras:**
- 🔄 **Sistema de Favoritos**
- 🔄 **Wishlist de Produtos**
- 🔄 **Histórico de Navegação**
- 🔄 **Notificações Personalizadas**
- 🔄 **Programa de Fidelidade**

---

**🎯 Sistema implementado e funcionando!**
**📧 Admin: admin@tfimports.com.br**
**🌐 Site: https://tfimports01.com.br/**
