import axios, { AxiosInstance } from 'axios'

function getApiBaseUrl(): string {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (configuredBaseUrl) {
    return configuredBaseUrl
  }

  return import.meta.env.PROD ? '/_/backend/api' : '/api'
}

const api: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

export function asArray<T>(data: unknown, label: string): T[] {
  if (Array.isArray(data)) {
    return data
  }

  console.error(`Expected ${label} response to be an array, received:`, data)
  return []
}

export const productService = {
  getAll: () => api.get('/products'),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
}

export const stockService = {
  getAll: () => api.get('/stock'),
  getByProduct: (product_id: string) => api.get(`/stock/product/${product_id}`),
  getLowStock: (threshold?: number) => api.get('/stock/low-stock/all', { params: { threshold } }),
  updateQuantity: (
    product_id: string,
    quantity_change: number,
    updates?: {
      warehouse_location?: string;
      batch_number?: string;
      received_date?: string;
      reorder_threshold?: number;
    }
  ) => api.patch(`/stock/update/${product_id}`, { quantity_change, ...updates }),
}

export const orderService = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
}

export default api
