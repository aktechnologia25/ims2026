import axios, { AxiosInstance } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const productService = {
  getAll: () => api.get('/products'),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
}

export const stockService = {
  getByProduct: (product_id: string) => api.get(`/stock/product/${product_id}`),
  getLowStock: (threshold?: number) => api.get('/stock/low-stock/all', { params: { threshold } }),
  updateQuantity: (product_id: string, quantity_change: number) =>
    api.patch(`/stock/update/${product_id}`, { quantity_change }),
}

export const orderService = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
}

export default api
