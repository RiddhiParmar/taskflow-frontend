// src/utils/apiClient.ts
import type { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import type { ApiError } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://taskflow-backend-dycf.onrender.com';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => this.handleError(error)
    );

    // Load token from localStorage on initialization
    this.loadToken();
  }

  /**
   * Set auth token
   */
  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  /**
   * Load token from localStorage
   */
  private loadToken(): void {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.token = token;
    }
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Handle API errors with user-friendly messages
   */
  private handleError(error: AxiosError): Promise<never> {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      statusCode: error.response?.status,
    };

    if (error.response) {
      const data = error.response.data as any;
      apiError.message = this.extractErrorMessage(data, error.message);
      apiError.data = data;

      // Handle specific error cases
      switch (error.response.status) {
        case 400:
          apiError.message = this.extractErrorMessage(data, 'Invalid request. Please check your input.');
          break;
        case 401:
          apiError.message = this.extractErrorMessage(data, 'Unauthorized. Please login again.');
          this.handleUnauthorized(error);
          break;
        case 403:
          apiError.message = this.extractErrorMessage(data, 'You do not have permission to perform this action.');
          break;
        case 404:
          apiError.message = this.extractErrorMessage(data, 'Resource not found.');
          break;
        case 409:
          apiError.message = this.extractErrorMessage(data, 'This email is already registered.');
          break;
        case 500:
          apiError.message = this.extractErrorMessage(data, 'Server error. Please try again later.');
          break;
      }
    } else if (error.request) {
      apiError.message = 'Network error. Please check your connection.';
    }

    return Promise.reject(apiError);
  }

  private handleUnauthorized(error: AxiosError): void {
    const hadActiveToken = Boolean(this.token);
    const requestUrl = error.config?.url ?? '';
    const isAuthRequest = requestUrl.includes('/user/auth');

    this.setToken(null);

    if (!hadActiveToken || isAuthRequest) {
      return;
    }

    if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
      window.location.replace('/signin');
    }
  }

  private extractErrorMessage(data: unknown, fallback: string): string {
    if (!data || typeof data !== 'object') {
      return fallback;
    }

    const message = (data as { message?: unknown; error?: unknown }).message;
    const errorMessage = (data as { error?: unknown }).error;

    if (Array.isArray(message)) {
      const normalizedMessages = message
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim());

      if (normalizedMessages.length > 0) {
        return normalizedMessages.join(', ');
      }
    }

    if (typeof message === 'string' && message.trim().length > 0) {
      return message.trim();
    }

    if (typeof errorMessage === 'string' && errorMessage.trim().length > 0) {
      return errorMessage.trim();
    }

    return fallback;
  }

  /**
   * Generic GET request
   */
  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Generic POST request
   */
  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PATCH request
   */
  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export default new ApiClient();
