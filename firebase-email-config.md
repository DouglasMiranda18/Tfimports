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
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0b1220, #1dd1a1); color: white; padding: 30px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #1dd1a1, #18b68c); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">TFIMPORTS</div>
            <p>Moda Masculina Premium</p>
        </div>
        <div class="content">
            <h2>Olá!</h2>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta <strong>%EMAIL%</strong>.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center;">
                <a href="%LINK%" class="button">Redefinir Senha</a>
            </div>
            <p><strong>Importante:</strong></p>
            <ul>
                <li>Este link é válido por 1 hora</li>
                <li>Se você não solicitou esta alteração, ignore este email</li>
                <li>Sua senha atual continuará funcionando até ser alterada</li>
            </ul>
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">%LINK%</p>
        </div>
        <div class="footer">
            <p>Este email foi enviado automaticamente. Não responda a esta mensagem.</p>
            <p>© 2024 TFIMPORTS - Todos os direitos reservados</p>
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
