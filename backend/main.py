from fastapi import FastAPI, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import engine, get_db
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Library API",
    description="API для учёта книг в библиотеке",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Library API",
        version="1.0.0",
        description="API для управления библиотекой книг",
        routes=app.routes,
    )
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.get("/", response_class=JSONResponse)
async def root():
    return {
        "message": "Добро пожаловать в Library API!",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.post("/books/", response_model=schemas.BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    """Создание новой книги"""
    if book.isbn:
        existing_book = db.query(models.Book).filter(models.Book.isbn == book.isbn).first()
        if existing_book:
            raise HTTPException(
                status_code=400,
                detail="Книга с таким ISBN уже существует"
            )
    
    db_book = models.Book(**book.dict())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

@app.get("/books/", response_model=schemas.BookListResponse)
def get_books(
    skip: int = Query(0, ge=0, description="Количество записей для пропуска"),
    limit: int = Query(10, ge=1, le=100, description="Количество записей на странице"),
    author: Optional[str] = Query(None, description="Фильтр по автору"),
    genre: Optional[str] = Query(None, description="Фильтр по жанру"),
    sort_by: str = Query("id", description="Поле для сортировки"),
    sort_order: str = Query("asc", regex="^(asc|desc)$", description="Порядок сортировки"),
    db: Session = Depends(get_db)
):
    """Получение списка книг с фильтрацией, пагинацией и сортировкой"""
    query = db.query(models.Book)

    if author:
        query = query.filter(models.Book.author.ilike(f"%{author}%"))
    if genre:
        query = query.filter(models.Book.genre.ilike(f"%{genre}%"))

    total = query.count()
    
    sort_column = getattr(models.Book, sort_by, models.Book.id)
    if sort_order == "desc":
        sort_column = sort_column.desc()
    
    query = query.order_by(sort_column)
    
    books = query.offset(skip).limit(limit).all()
    
    total_pages = (total + limit - 1) // limit if limit > 0 else 0
    current_page = (skip // limit) + 1 if limit > 0 else 1
    
    return {
        "books": books,
        "total": total,
        "page": current_page,
        "page_size": limit,
        "total_pages": total_pages
    }

@app.get("/books/{book_id}", response_model=schemas.BookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)):
    """Получение информации о конкретной книге по ID"""
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if db_book is None:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    return db_book

@app.put("/books/{book_id}", response_model=schemas.BookResponse)
def update_book(book_id: int, book: schemas.BookUpdate, db: Session = Depends(get_db)):
    """Обновление информации о книге"""
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if db_book is None:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    
    if book.isbn and book.isbn != db_book.isbn:
        existing_book = db.query(models.Book).filter(
            models.Book.isbn == book.isbn,
            models.Book.id != book_id
        ).first()
        if existing_book:
            raise HTTPException(
                status_code=400,
                detail="Книга с таким ISBN уже существует"
            )
    
    update_data = book.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_book, field, value)
    
    db.commit()
    db.refresh(db_book)
    return db_book

@app.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    """Удаление книги"""
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if db_book is None:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    
    db.delete(db_book)
    db.commit()
    return None

@app.get("/books/search/", response_model=schemas.BookListResponse)
def search_books(
    q: str = Query(..., min_length=1, description="Поисковый запрос"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Поиск книг по названию, автору или описанию"""
    query = db.query(models.Book).filter(
        models.Book.title.ilike(f"%{q}%") |
        models.Book.author.ilike(f"%{q}%") |
        models.Book.description.ilike(f"%{q}%")
    )
    
    total = query.count()
    books = query.offset(skip).limit(limit).all()
    
    total_pages = (total + limit - 1) // limit if limit > 0 else 0
    current_page = (skip // limit) + 1 if limit > 0 else 1
    
    return {
        "books": books,
        "total": total,
        "page": current_page,
        "page_size": limit,
        "total_pages": total_pages
    }

@app.get("/stats/authors/")
def get_authors_stats(db: Session = Depends(get_db)):
    """Статистика по авторам (количество книг каждого автора)"""
    from sqlalchemy import func
    
    stats = db.query(
        models.Book.author,
        func.count(models.Book.id).label('book_count')
    ).group_by(models.Book.author).all()
    
    return {
        "authors": [
            {"author": author, "book_count": count}
            for author, count in stats
        ]
    }

@app.get("/stats/genres/")
def get_genres_stats(db: Session = Depends(get_db)):
    """Статистика по жанрам (количество книг каждого жанра)"""
    from sqlalchemy import func
    
    stats = db.query(
        models.Book.genre,
        func.count(models.Book.id).label('book_count')
    ).group_by(models.Book.genre).all()
    
    return {
        "genres": [
            {"genre": genre, "book_count": count}
            for genre, count in stats
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)