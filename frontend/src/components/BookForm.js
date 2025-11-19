import React, { useState, useEffect } from 'react';
import './BookForm.css';

const BookForm = ({ book, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    publication_year: '',
    isbn: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        genre: book.genre || '',
        publication_year: book.publication_year || '',
        isbn: book.isbn || '',
        description: book.description || ''
      });
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Название обязательно';
    if (!formData.author.trim()) newErrors.author = 'Автор обязателен';
    if (!formData.genre.trim()) newErrors.genre = 'Жанр обязателен';
    
    if (formData.publication_year) {
      const year = parseInt(formData.publication_year);
      if (year < 1000 || year > 2100) {
        newErrors.publication_year = 'Год должен быть между 1000 и 2100';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        publication_year: formData.publication_year ? parseInt(formData.publication_year) : null
      };
      onSubmit(submitData);
    }
  };

  return (
    <div className="book-form-container">
      <form onSubmit={handleSubmit} className="book-form">
        <h2>{book ? 'Редактировать книгу' : 'Добавить новую книгу'}</h2>
        
        <div className="form-group">
          <label htmlFor="title">Название *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="author">Автор *</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className={errors.author ? 'error' : ''}
          />
          {errors.author && <span className="error-text">{errors.author}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="genre">Жанр *</label>
          <input
            type="text"
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            className={errors.genre ? 'error' : ''}
          />
          {errors.genre && <span className="error-text">{errors.genre}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="publication_year">Год издания</label>
            <input
              type="number"
              id="publication_year"
              name="publication_year"
              value={formData.publication_year}
              onChange={handleChange}
              className={errors.publication_year ? 'error' : ''}
            />
            {errors.publication_year && <span className="error-text">{errors.publication_year}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="isbn">ISBN</label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Отмена
          </button>
          <button type="submit" className="btn-submit">
            {book ? 'Обновить' : 'Добавить'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;