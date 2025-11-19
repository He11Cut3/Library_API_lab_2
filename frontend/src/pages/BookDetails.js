import React, { useState, useEffect } from 'react';
import { bookAPI } from '../services/api';
import './BookDetails.css';

const BookDetails = ({ bookId, onBack, onEdit }) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        const response = await bookAPI.getBook(bookId);
        setBook(response.data);
        setError('');
      } catch (err) {
        setError('Ошибка при загрузке книги');
        console.error('Error loading book:', err);
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      loadBook();
    }
  }, [bookId]);

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={onBack} className="btn-back">Назад</button>
      </div>
    );
  }

  if (!book) {
    return <div className="no-book">Книга не найдена</div>;
  }

  return (
    <div className="book-details">
      <div className="details-header">
        <button onClick={onBack} className="btn-back">← Назад</button>
        <h1>{book.title}</h1>
        <button 
          onClick={() => onEdit(book)}
          className="btn-edit"
        >
          Редактировать
        </button>
      </div>

      <div className="details-content">
        <div className="book-info-section">
          <h2>Информация о книге</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Автор:</label>
              <span>{book.author}</span>
            </div>
            <div className="info-item">
              <label>Жанр:</label>
              <span>{book.genre}</span>
            </div>
            {book.publication_year && (
              <div className="info-item">
                <label>Год издания:</label>
                <span>{book.publication_year}</span>
              </div>
            )}
            {book.isbn && (
              <div className="info-item">
                <label>ISBN:</label>
                <span>{book.isbn}</span>
              </div>
            )}
            <div className="info-item">
              <label>Дата добавления:</label>
              <span>{new Date(book.created_at).toLocaleDateString()}</span>
            </div>
            {book.updated_at && (
              <div className="info-item">
                <label>Последнее обновление:</label>
                <span>{new Date(book.updated_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {book.description && (
          <div className="description-section">
            <h2>Описание</h2>
            <p>{book.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;