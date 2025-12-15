import axios from 'axios';
import { Product } from '../types/product';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config: any) => {
    // You can add auth token here if needed
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Add a response interceptor
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export async function fetchProducts(): Promise<Product[]> {
  const res = await api.get('/products');
  return res.data;
}

export async function createProduct(product: Partial<Product>) {
  const res = await api.post('/products', product);
  return res.data;
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const res = await api.put(`/products/${id}`, product);
  return res.data;
}

export async function deleteProduct(id: string) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
}

export default api;

const API_BASE_URL = 'http://localhost:3001/api';

// Product APIs
export const getProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

export const getProduct = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!response.ok) throw new Error('Failed to fetch product');
  return response.json();
};

export const createProductAPI = async (productData: any) => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error('Failed to create product');
  return response.json();
};

export const updateProductAPI = async (id: string, productData: any) => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error('Failed to update product');
  return response.json();
};

export const deleteProductAPI = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete product');
  return response.json();
};

// Order APIs
export const getOrders = async () => {
  const response = await fetch(`${API_BASE_URL}/orders`);
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
};

export const getOrder = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/orders/${id}`);
  if (!response.ok) throw new Error('Failed to fetch order');
  return response.json();
};

export const createOrder = async (orderData: any) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) throw new Error('Failed to create order');
  return response.json();
};

export const updateOrderStatus = async (orderId: string, status: string, user: string) => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, user }),
  });
  if (!response.ok) throw new Error('Failed to update order status');
  return response.json();
};

export const updateOrder = async (id: string, orderData: any) => {
  const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) throw new Error('Failed to update order');
  return response.json();
};

export const deleteOrder = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete order');
  return response.json();
};

export const getOrderStats = async () => {
  const response = await fetch(`${API_BASE_URL}/orders/stats/summary`);
  if (!response.ok) throw new Error('Failed to fetch order stats');
  return response.json();
};

// Order History APIs
export const fetchOrderHistory = async (orderId: string) => {
  const response = await fetch(`${API_BASE_URL}/order-history/${orderId}`);
  if (!response.ok) throw new Error('Failed to fetch order history');
  return response.json();
};

export const createOrderHistory = async (historyData: any) => {
  const response = await fetch(`${API_BASE_URL}/order-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(historyData),
  });
  if (!response.ok) throw new Error('Failed to create order history');
  return response.json();
}; 