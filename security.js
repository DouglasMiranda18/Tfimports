// Utilitários de segurança para prevenir XSS e validação de dados

/**
 * Sanitiza texto para prevenir XSS
 * Remove tags HTML e caracteres perigosos
 */
export function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limita tamanho
}

/**
 * Sanitiza HTML permitindo apenas tags seguras
 */
export function sanitizeHTML(html) {
  if (typeof html !== 'string') return '';
  
  // Lista de tags permitidas
  const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br'];
  const allowedAttributes = [];
  
  // Remove todas as tags exceto as permitidas
  let sanitized = html.replace(/<\/?[^>]+(>|$)/g, (match) => {
    const tagName = match.replace(/<\/?(\w+).*/, '$1').toLowerCase();
    return allowedTags.includes(tagName) ? match : '';
  });
  
  return sanitized.trim();
}

/**
 * Valida email
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Valida CEP brasileiro
 */
export function validateCEP(cep) {
  const cleanCEP = cep.replace(/\D/g, '');
  return /^\d{8}$/.test(cleanCEP);
}

/**
 * Valida preço
 */
export function validatePrice(price) {
  const num = parseFloat(price);
  return !isNaN(num) && num >= 0 && num <= 999999.99;
}

/**
 * Valida tamanhos de roupa
 */
export function validateSizes(sizes) {
  const validSizes = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG'];
  if (!Array.isArray(sizes)) return false;
  return sizes.every(size => validSizes.includes(size.toUpperCase()));
}

/**
 * Valida cores
 */
export function validateColors(colors) {
  const validColors = ['preto', 'branco', 'azul', 'verde', 'vermelho', 'amarelo', 'cinza', 'marrom', 'rosa', 'roxo'];
  if (!Array.isArray(colors)) return false;
  return colors.every(color => validColors.includes(color.toLowerCase()));
}

/**
 * Escape HTML para uso seguro em innerHTML
 */
export function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Cria elemento DOM de forma segura
 */
export function createSafeElement(tag, content, className = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  
  if (typeof content === 'string') {
    element.textContent = content; // Usa textContent em vez de innerHTML
  } else if (content instanceof HTMLElement) {
    element.appendChild(content);
  }
  
  return element;
}

/**
 * Valida dados do produto
 */
export function validateProduct(product) {
  const errors = [];
  
  if (!product.nome || typeof product.nome !== 'string' || product.nome.length < 2) {
    errors.push('Nome do produto inválido');
  }
  
  if (!validatePrice(product.preco)) {
    errors.push('Preço inválido');
  }
  
  if (product.promo && !validatePrice(product.promo)) {
    errors.push('Preço promocional inválido');
  }
  
  if (!validateSizes(product.tamanhos)) {
    errors.push('Tamanhos inválidos');
  }
  
  if (!validateColors(product.cores)) {
    errors.push('Cores inválidas');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Rate limiting simples (localStorage)
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rate_${key}`) || '[]');
  
  // Remove tentativas antigas
  const recentAttempts = attempts.filter(time => now - time < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return false; // Rate limit excedido
  }
  
  // Adiciona nova tentativa
  recentAttempts.push(now);
  localStorage.setItem(`rate_${key}`, JSON.stringify(recentAttempts));
  
  return true; // Permitido
}
