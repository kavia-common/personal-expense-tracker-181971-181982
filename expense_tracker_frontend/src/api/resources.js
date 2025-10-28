import api from './client';

/**
 * PUBLIC_INTERFACE
 * Categories API helpers
 */
export const CategoriesAPI = {
  list: () => api.get('/categories/').then(r => r.data),
  create: (payload) => api.post('/categories/', payload).then(r => r.data),
  update: (id, payload) => api.put(`/categories/${id}/`, payload).then(r => r.data),
  remove: (id) => api.delete(`/categories/${id}/`).then(r => r.status),
};

/**
 * PUBLIC_INTERFACE
 * Expenses API helpers
 */
export const ExpensesAPI = {
  list: (params = {}) => api.get('/expenses/', { params }).then(r => r.data),
  create: (payload) => api.post('/expenses/', payload).then(r => r.data),
  update: (id, payload) => api.put(`/expenses/${id}/`, payload).then(r => r.data),
  remove: (id) => api.delete(`/expenses/${id}/`).then(r => r.status),
};

/**
 * PUBLIC_INTERFACE
 * Budgets API helpers
 */
export const BudgetsAPI = {
  list: () => api.get('/budgets/').then(r => r.data),
  create: (payload) => api.post('/budgets/', payload).then(r => r.data),
  update: (id, payload) => api.put(`/budgets/${id}/`, payload).then(r => r.data),
  remove: (id) => api.delete(`/budgets/${id}/`).then(r => r.status),
};

/**
 * PUBLIC_INTERFACE
 * Reports API helpers
 */
export const ReportsAPI = {
  summary: () => api.get('/reports/summary').then(r => r.data),
  budgetStatus: () => api.get('/reports/budget-status').then(r => r.data),
};
