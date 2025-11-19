import React, { useState } from 'react';
import BookList from './pages/BookList';
import BookForm from './components/BookForm';
import BookDetails from './pages/BookDetails';
import { bookAPI } from './services/api';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('list');
  const [currentBook, setCurrentBook] = useState(null);
  const [message, setMessage] = useState('');

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  const handleViewBook = (book) => {
    setCurrentBook(book);
    setCurrentView('details');
  };

  const handleEditBook = (book) => {
    setCurrentBook(book);
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setCurrentBook(null);
  };

  const handleSubmitBook = async (bookData) => {
    try {
      if (currentBook) {
        await bookAPI.updateBook(currentBook.id, bookData);
        showMessage('Книга успешно обновлена');
      } else {
        await bookAPI.createBook(bookData);
        showMessage('Книга успешно добавлена');
      }
      setCurrentView('list');
      setCurrentBook(null);
    } catch (error) {
      console.error('Error saving book:', error);
      showMessage('Ошибка при сохранении книги', 'error');
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'form':
        return (
          <BookForm
            book={currentBook}
            onSubmit={handleSubmitBook}
            onCancel={handleBackToList}
          />
        );
      case 'details':
        return (
          <BookDetails
            bookId={currentBook?.id}
            onBack={handleBackToList}
            onEdit={handleEditBook}
          />
        );
      default:
        return (
          <BookList
            onEditBook={handleEditBook}
            onViewBook={handleViewBook}
          />
        );
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📚 Библиотечная система</h1>
      </header>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <main className="App-main">
        {renderCurrentView()}
      </main>

      <footer className="App-footer">
        <p>© 2025 Библиотечная система. Все права защищены.</p>
      </footer>
    </div>
  );
}

export default App;