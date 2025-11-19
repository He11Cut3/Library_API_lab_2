import React, { useState, useEffect } from 'react';
import { bookAPI } from '../services/api';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import './BookList.css';

const BookList = ({ onEditBook, onViewBook }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    author: '',
    genre: ''
  });

  const loadBooks = async (params = {}) => {
    try {
      setLoading(true);
      const response = await bookAPI.getAllBooks(params);
      setBooks(response.data.books);
      setError('');
    } catch (err) {
      setError('Ошибка при загрузке книг');
      console.error('Error loading books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleSearch = (searchQuery) => {
    if (searchQuery) {
      bookAPI.searchBooks(searchQuery)
        .then(response => {
          setBooks(response.data.books);
          setError('');
        })
        .catch(err => {
          setError('Ошибка при поиске книг');
          console.error('Error searching books:', err);
        });
    } else {
      loadBooks();
    }
  };

  const handleFilter = () => {
    const params = {};
    if (filters.author) params.author = filters.author;
    if (filters.genre) params.genre = filters.genre;
    loadBooks(params);
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту книгу?')) {
      try {
        await bookAPI.deleteBook(bookId);
        setBooks(books.filter(book => book.id !== bookId));
      } catch (err) {
        setError('Ошибка при удалении книги');
        console.error('Error deleting book:', err);
      }
    }
  };

  const clearFilters = () => {
    setFilters({ author: '', genre: '' });
    loadBooks();
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="book-list-page">
      <div className="page-header">
        <h1>Библиотека книг</h1>
        <button 
          className="btn-add"
          onClick={() => onEditBook(null)}
        >
          + Добавить книгу
        </button>
      </div>

      <SearchBar onSearch={handleSearch} />

      <div className="filters">
        <h3>Фильтры</h3>
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Фильтр по автору"
            value={filters.author}
            onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Фильтр по жанру"
            value={filters.genre}
            onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
          />
          <button onClick={handleFilter}>Применить фильтры</button>
          <button onClick={clearFilters}>Очистить</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="books-grid">
        {books.length === 0 ? (
          <div className="no-books">
            Книги не найдены
          </div>
        ) : (
          books.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={onEditBook}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default BookList;