import React from 'react';
import './BookCard.css';

const BookCard = ({ book, onEdit, onDelete }) => {
  return (
    <div className="book-card">
      <div className="book-header">
        <h3 className="book-title">{book.title}</h3>
        <div className="book-actions">
          <button 
            className="btn-edit"
            onClick={() => onEdit(book)}
          >
            ✏️
          </button>
          <button 
            className="btn-delete"
            onClick={() => onDelete(book.id)}
          >
            🗑️
          </button>
        </div>
      </div>
      
      <div className="book-info">
        <p><strong>Автор:</strong> {book.author}</p>
        <p><strong>Жанр:</strong> {book.genre}</p>
        {book.publication_year && (
          <p><strong>Год издания:</strong> {book.publication_year}</p>
        )}
        {book.isbn && (
          <p><strong>ISBN:</strong> {book.isbn}</p>
        )}
      </div>
      
      {book.description && (
        <div className="book-description">
          <p>{book.description}</p>
        </div>
      )}
      
      <div className="book-footer">
        <small>
          Добавлено: {new Date(book.created_at).toLocaleDateString()}
        </small>
      </div>
    </div>
  );
};

export default BookCard;