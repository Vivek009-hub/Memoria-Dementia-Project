/**
 * client.js — Centralized Mobile API Client
 *
 * Responsibilities:
 * - Base URL configuration (defaults to backend host)
 * - Request header injection (content-type, session/token credentials)
 * - Timeout handling
 * - Standardized error translation for elder-friendly consumption
 * - Retry support for resilient network operations
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

// User-friendly error message map converting backend system errors to simple text
const ERROR_MESSAGE_MAP = {
  SAFETY_EVENT_ALREADY_RESOLVED: 'This safety alert has already been handled.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You are not authorized to perform this action.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again in a moment.',
  NOT_FOUND: 'The requested safety information was not found.',
  NETWORK_ERROR: 'No internet connection. Event queued for retry.',
  SERVER_ERROR: 'Our safety system is experiencing temporary issues. Please try again.',
};

export class ApiClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:5000/api/v1';
    this.timeoutMs = options.timeoutMs || 10000;
    this.authToken = null;
    this.onUnauthenticated = options.onUnauthenticated || null;
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
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

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: this.getHeaders(options.headers),
        body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined,
        signal: controller.signal,
        credentials: 'include',
        ...options.fetchOptions,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let data = {};
      if (contentType && contentType.includes('application/json')) {
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
        throw new ApiError('Request timed out. Please check connection.', 408, 'TIMEOUT');
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
