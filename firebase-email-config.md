# Configuração de Emails Personalizados do Firebase

## Como Personalizar Emails em Português

### 1. Acesse o Console do Firebase
1. Vá para [console.firebase.google.com](https://console.firebase.google.com/)
2. Selecione seu projeto `tfimports-27898`
3. Vá para "Authentication" no menu lateral
4. Clique na aba "Templates"

### 2. Personalizar Template de Recuperação de Senha

**Título do Email:**
```
Recuperar Senha - TFIMPORTS
```

**Corpo do Email (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #0b1220 0%, #1a2332 100%); 
            margin: 0; 
            padding: 20px; 
            min-height: 100vh;
        }
        .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 16px; 
            overflow: hidden; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .header { 
            background: linear-gradient(135deg, #0b1220 0%, #1dd1a1 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        .logo { 
            font-size: 32px; 
            font-weight: 800; 
            margin-bottom: 8px; 
            letter-spacing: 2px;
            position: relative;
            z-index: 1;
        }
        .tagline { 
            font-size: 14px; 
            opacity: 0.9; 
            font-weight: 300;
            position: relative;
            z-index: 1;
        }
        .content { 
            padding: 50px 40px; 
            background: white;
        }
        .greeting { 
            font-size: 28px; 
            font-weight: 700; 
            color: #0b1220; 
            margin-bottom: 20px;
        }
        .main-text { 
            font-size: 16px; 
            line-height: 1.6; 
            color: #4a5568; 
            margin-bottom: 30px;
        }
        .email-highlight { 
            color: #1dd1a1; 
            font-weight: 600; 
            text-decoration: none;
        }
        .button-container { 
            text-align: center; 
            margin: 40px 0;
        }
        .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #1dd1a1 0%, #18b68c 100%); 
            color: white; 
            padding: 18px 40px; 
            text-decoration: none; 
            border-radius: 12px; 
            font-weight: 700; 
            font-size: 16px;
            box-shadow: 0 8px 20px rgba(29, 209, 161, 0.3);
            transition: all 0.3s ease;
            letter-spacing: 0.5px;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(29, 209, 161, 0.4);
        }
        .important-section { 
            background: #f8fafc; 
            border-left: 4px solid #1dd1a1; 
            padding: 25px; 
            margin: 30px 0; 
            border-radius: 0 8px 8px 0;
        }
        .important-title { 
            font-size: 18px; 
            font-weight: 700; 
            color: #0b1220; 
            margin-bottom: 15px;
        }
        .important-list { 
            list-style: none; 
            padding: 0;
        }
        .important-list li { 
            padding: 8px 0; 
            color: #4a5568; 
            position: relative;
            padding-left: 25px;
        }
        .important-list li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #1dd1a1;
            font-weight: bold;
        }
        .fallback-section { 
            background: #f1f5f9; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 30px 0;
        }
        .fallback-text { 
            font-size: 14px; 
            color: #64748b; 
            margin-bottom: 10px;
        }
        .fallback-link { 
            word-break: break-all; 
            background: white; 
            padding: 15px; 
            border-radius: 6px; 
            font-family: 'Courier New', monospace; 
            font-size: 12px; 
            color: #475569;
            border: 1px solid #e2e8f0;
        }
        .footer { 
            background: #0b1220; 
            padding: 30px; 
            text-align: center; 
            color: #94a3b8;
        }
        .footer-text { 
            font-size: 14px; 
            margin-bottom: 10px;
        }
        .footer-copyright { 
            font-size: 12px; 
            opacity: 0.8;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 30px 0;
        }
        @media (max-width: 600px) {
            .content { padding: 30px 20px; }
            .header { padding: 30px 20px; }
            .logo { font-size: 28px; }
            .greeting { font-size: 24px; }
            .button { padding: 15px 30px; font-size: 14px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">TFIMPORTS</div>
            <div class="tagline">Moda Masculina Premium</div>
        </div>
        
        <div class="content">
            <div class="greeting">Olá!</div>
            
            <div class="main-text">
                Recebemos uma solicitação para redefinir a senha da sua conta 
                <a href="mailto:%EMAIL%" class="email-highlight">%EMAIL%</a>.
            </div>
            
            <div class="main-text">
                Clique no botão abaixo para criar uma nova senha:
            </div>
            
            <div class="button-container">
                <a href="%LINK%" class="button">🔐 Redefinir Senha</a>
            </div>
            
            <div class="divider"></div>
            
            <div class="important-section">
                <div class="important-title">📋 Informações Importantes</div>
                <ul class="important-list">
                    <li>Este link é válido por 1 hora</li>
                    <li>Se você não solicitou esta alteração, ignore este email</li>
                    <li>Sua senha atual continuará funcionando até ser alterada</li>
                    <li>Mantenha sua senha segura e não a compartilhe</li>
                </ul>
            </div>
            
            <div class="fallback-section">
                <div class="fallback-text">
                    <strong>💡 Dica:</strong> Se o botão não funcionar, copie e cole este link no seu navegador:
                </div>
                <div class="fallback-link">%LINK%</div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Este email foi enviado automaticamente. Não responda a esta mensagem.
            </div>
            <div class="footer-copyright">
                © 2024 TFIMPORTS - Todos os direitos reservados
            </div>
        </div>
    </div>
</body>
</html>
```

### 3. Configurar Domínio Personalizado (Para Evitar Spam)

#### 3.1 Adicionar Domínio Personalizado
1. No Console do Firebase, vá para "Authentication" > "Settings"
2. Na aba "Authorized domains", adicione:
   - `tfimports01.com.br`
   - `www.tfimports01.com.br`

#### 3.2 Configurar DNS (Recomendado)
Para melhorar a reputação do email e evitar spam:

1. **Adicionar registros SPF:**
   ```
   v=spf1 include:_spf.google.com ~all
   ```

2. **Adicionar registros DKIM:**
   - Configure DKIM no Google Workspace ou Gmail
   - Adicione o registro DKIM fornecido pelo Google

3. **Adicionar registros DMARC:**
   ```
   v=DMARC1; p=quarantine; rua=mailto:dmarc@tfimports01.com.br
   ```

### 4. Configurações Adicionais

#### 4.1 Configurar Nome do Remetente
1. No Console do Firebase, vá para "Authentication" > "Settings"
2. Na seção "Email templates", configure:
   - **Sender name:** TFIMPORTS
   - **Sender email:** noreply@tfimports01.com.br (se configurado)

#### 4.2 Configurar Ação Personalizada (Opcional)
Para redirecionar para uma página personalizada após reset:

1. Vá para "Authentication" > "Settings" > "Authorized domains"
2. Adicione sua URL de redirecionamento personalizada

### 5. Teste a Configuração

1. **Teste o envio:** Use a funcionalidade "Esqueci a senha" no site
2. **Verifique a caixa de entrada:** O email deve chegar em português
3. **Verifique o spam:** Com as configurações DNS, deve ir para a caixa principal
4. **Teste o link:** Clique no link para verificar se funciona

### 6. Monitoramento

- **Console do Firebase:** Verifique logs de autenticação
- **Google Analytics:** Monitore conversões de recuperação de senha
- **Feedback dos usuários:** Colete feedback sobre a experiência

## Resultado Esperado

Após essas configurações:
- ✅ Emails em português com design personalizado
- ✅ Menor chance de ir para spam
- ✅ Experiência profissional e consistente com a marca
- ✅ Melhor taxa de conversão na recuperação de senhas
