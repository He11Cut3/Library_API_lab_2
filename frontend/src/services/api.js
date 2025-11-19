import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const bookAPI = {
  getAllBooks: (params = {}) => api.get('/books/', { params }),
  
  getBook: (id) => api.get(`/books/${id}`),
  
  createBook: (bookData) => api.post('/books/', bookData),
  
  updateBook: (id, bookData) => api.put(`/books/${id}`, bookData),
  
  deleteBook: (id) => api.delete(`/books/${id}`),
  
  searchBooks: (query, params = {}) => 
    api.get('/books/search/', { params: { q: query, ...params } }),

  getAuthorsStats: () => api.get('/stats/authors/'),

  getGenresStats: () => api.get('/stats/genres/'),
};

export default api;