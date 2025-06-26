import { auth } from '../firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async getAuthToken() {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }
    
    const token = await auth.currentUser.getIdToken(true);
    localStorage.setItem('authToken', token);
    return token;
  }

  async request(endpoint, options = {}) {
    const token = await this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (response.status === 401) {
      try {
        const newToken = await this.getAuthToken();
        config.headers['Authorization'] = `Bearer ${newToken}`;
        return fetch(`${this.baseURL}${endpoint}`, config);
      } catch (error) {
        window.location.href = '/login';
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  async get(endpoint) {
    const response = await this.request(endpoint);
    return response.json();
  }

  async post(endpoint, data) {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    return response.json();
  }

  async put(endpoint, data) {
    const response = await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async delete(endpoint) {
    const response = await this.request(endpoint, {
      method: 'DELETE',
    });
    return response.json();
  }
}

export const apiClient = new ApiClient();

export const predictMood = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return apiClient.post('/predict', formData);
};

export const getAvailableMoods = () => apiClient.get('/moods');
export const getHealthStatus = () => apiClient.get('/health');
export const ping = () => apiClient.get('/ping'); 