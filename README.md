# 🛍️ TFI IMPORTS - Moda Masculina Premium

E-commerce de moda masculina premium com autenticação segura e funcionalidades completas.

## 🚀 Deploy no Netlify

### **Passo 1: Preparar o Repositório**

```bash
# 1. Inicializar git (se ainda não foi feito)
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer commit
git commit -m "Initial commit - TFI IMPORTS"

# 4. Conectar ao GitHub
git remote add origin https://github.com/SEU_USUARIO/tfi-imports.git

# 5. Push para GitHub
git push -u origin main
```

### **Passo 2: Configurar no Netlify**

1. **Acesse [Netlify](https://netlify.com)**
2. **Clique em "New site from Git"**
3. **Conecte sua conta GitHub**
4. **Selecione o repositório `tfi-imports`**

### **Passo 3: Configurar Build Settings**

No Netlify, configure:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18`

### **Passo 4: Configurar Variáveis de Ambiente**

No Netlify Dashboard:

1. Vá em **Site settings** → **Environment variables**
2. Adicione as variáveis:

```
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id
VITE_APP_ENV=production
```

### **Passo 5: Configurar Firebase**

1. **Acesse [Firebase Console](https://console.firebase.google.com)**
2. **Crie um novo projeto**
3. **Ative Authentication → Google**
4. **Configure Firestore Database**
5. **Adicione seu domínio Netlify nas configurações**

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🛡️ Segurança

- ✅ Sanitização de dados
- ✅ Rate limiting
- ✅ Content Security Policy
- ✅ Headers de segurança
- ✅ Validação de inputs
- ✅ Autenticação Firebase

## 📱 Funcionalidades

- 🛍️ Catálogo de produtos
- 🛒 Carrinho de compras
- 👤 Autenticação Google
- 📝 Sistema de feedbacks
- 💬 Chat de atendimento
- 🔧 Painel administrativo
- 📱 Design responsivo

## 🎨 Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Styling**: Tailwind CSS
- **Build**: Vite
- **Auth**: Firebase Authentication
- **Database**: Firestore (opcional)
- **Deploy**: Netlify

## 📞 Suporte

Para dúvidas sobre deploy ou configuração, consulte:
- [Netlify Docs](https://docs.netlify.com/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vite Docs](https://vitejs.dev/)

---

**TFI IMPORTS** - Exclusividade • Atitude • Sofisticação
