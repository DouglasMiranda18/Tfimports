// Módulo de segurança para TFI IMPORTS
// Implementa rate limiting, sanitização e validação

// Rate limiting storage
const rateLimitStore = new Map();

/**
 * Verifica rate limiting para uma ação específica
 * @param {string} action - Nome da ação (ex: 'feedback', 'addProduct')
 * @param {number} maxAttempts - Máximo de tentativas
 * @param {number} windowMs - Janela de tempo em milissegundos
 * @returns {boolean} - true se permitido, false se bloqueado
 */
export function checkRateLimit(action, maxAttempts, windowMs) {
  const now = Date.now();
  const key = `${action}_${getUserIdentifier()}`;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }
  
  const attempts = rateLimitStore.get(key);
  
  // Remove tentativas antigas
  const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
  rateLimitStore.set(key, validAttempts);
  
  if (validAttempts.length >= maxAttempts) {
    return false;
  }
  
  // Adiciona nova tentativa
  validAttempts.push(now);
  rateLimitStore.set(key, validAttempts);
  
  return true;
}

/**
 * Sanitiza texto removendo caracteres perigosos
 * @param {string} text - Texto a ser sanitizado
 * @returns {string} - Texto sanitizado
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
 * Valida dados de produto
 * @param {Object} produto - Objeto produto a ser validado
 * @returns {Object} - {isValid: boolean, errors: string[]}
 */
export function validateProduct(produto) {
  const errors = [];
  
  if (!produto.nome || produto.nome.length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }
  
  if (!produto.categoria) {
    errors.push('Categoria é obrigatória');
  }
  
  if (!produto.preco || produto.preco <= 0) {
    errors.push('Preço deve ser maior que zero');
  }
  
  if (produto.promo && produto.promo >= produto.preco) {
    errors.push('Preço promocional deve ser menor que o preço normal');
  }
  
  if (!produto.cores || produto.cores.length === 0) {
    errors.push('Pelo menos uma cor deve ser especificada');
  }
  
  if (!produto.tamanhos || produto.tamanhos.length === 0) {
    errors.push('Pelo menos um tamanho deve ser especificado');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida CEP brasileiro
 * @param {string} cep - CEP a ser validado
 * @returns {boolean} - true se válido
 */
export function validateCEP(cep) {
  const cleanCEP = cep.replace(/\D/g, '');
  return /^\d{8}$/.test(cleanCEP);
}

/**
 * Valida email
 * @param {string} email - Email a ser validado
 * @returns {boolean} - true se válido
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Obtém identificador único do usuário para rate limiting
 * @returns {string} - Identificador do usuário
 */
function getUserIdentifier() {
  // Em um ambiente real, use o ID do usuário autenticado
  // Para demo, usa uma combinação de user agent e timestamp
  return btoa(navigator.userAgent + Date.now().toString()).substring(0, 16);
}

/**
 * Limpa dados sensíveis do localStorage
 */
export function clearSensitiveData() {
  const sensitiveKeys = ['firebase:authUser', 'tfi_user_data'];
  sensitiveKeys.forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Verifica se o ambiente é seguro (HTTPS em produção)
 * @returns {boolean} - true se seguro
 */
export function isSecureEnvironment() {
  if (location.protocol === 'https:') return true;
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return true;
  return false;
}

// Log de segurança
if (!isSecureEnvironment()) {
  console.warn('⚠️ Ambiente não seguro detectado. Use HTTPS em produção.');
}