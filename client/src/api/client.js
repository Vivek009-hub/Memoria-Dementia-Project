/**
 * client.js — Canonical API Client for Memora Web & Mobile Frontend
 */

export class ApiError extends Error {
  constructor(message, status = 500, code = 'UNKNOWN_ERROR', originalError = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.originalError = originalError;
  }
}

const ERROR_MESSAGE_MAP = {
  SAFETY_EVENT_ALREADY_RESOLVED: 'This safety alert has already been handled.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again in a moment.',
  RATE_LIMITED: 'I am busy right now. Please try again in a moment.',
  NOT_FOUND: 'The requested information was not found.',
  MODEL_NOT_FOUND: 'The requested AI model is unavailable.',
  INVALID_API_KEY: 'Unauthorized AI configuration. Please verify backend API keys.',
  AI_PROVIDER_ERROR: 'Unable to connect to AI service. Please try again in a moment.',
  CLIENT_TIMEOUT: 'Memora took too long to respond. Please try again.',
  NETWORK_ERROR: 'Unable to connect to Memora server. Please check your internet connection.',
  SERVER_ERROR: 'System experiencing temporary issues. Please try again.',
};

export class ApiClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || (import.meta.env?.VITE_API_BASE_URL || '/api/v1');
    this.timeoutMs = options.timeoutMs || 30000;
    this.authToken = null;
    this.onUnauthenticated = options.onUnauthenticated || null;
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  getHeaders(customHeaders = {}, isFormData = false) {
    const headers = { ...customHeaders };
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  translateError(errorData, status) {
    const code = errorData?.error?.code || errorData?.code || 'UNKNOWN_ERROR';
    const rawMessage = errorData?.error?.message || errorData?.message;
    const userFriendlyMessage = ERROR_MESSAGE_MAP[code] || rawMessage || ERROR_MESSAGE_MAP.SERVER_ERROR;
    
    return new ApiError(userFriendlyMessage, status, code, errorData);
  }

  async request(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || this.timeoutMs);
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const requestHeaders = this.getHeaders(options.headers, isFormData);

    const requestBody = options.body
      ? isFormData
        ? options.body
        : typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body)
      : undefined;

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
        credentials: 'include',
        ...options.fetchOptions,
      });

      clearTimeout(timeoutId);

      const contentType = response?.headers?.get ? response.headers.get('content-type') : null;
      let data = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (typeof response.json === 'function') {
        data = await response.json();
      }

      if (!response.ok) {
        if (response.status === 401 && this.onUnauthenticated) {
          this.onUnauthenticated();
        }
        throw this.translateError(data, response.status);
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new ApiError('Memora took too long to respond. Please try again.', 408, 'CLIENT_TIMEOUT');
      }
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(ERROR_MESSAGE_MAP.NETWORK_ERROR, 0, 'NETWORK_ERROR', err);
    }
  }

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  patch(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const defaultApiClient = new ApiClient();

export async function request(endpoint, options = {}) {
  return defaultApiClient.request(endpoint, options);
}
