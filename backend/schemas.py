from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class BookBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Название книги")
    author: str = Field(..., min_length=1, max_length=100, description="Автор книги")
    genre: str = Field(..., min_length=1, max_length=50, description="Жанр книги")
    description: Optional[str] = Field(None, description="Описание книги")
    publication_year: Optional[int] = Field(None, ge=1000, le=2100, description="Год публикации")
    isbn: Optional[str] = Field(None, pattern=r'^[0-9\-]+$', description="ISBN книги")

    @validator('publication_year')
    def validate_publication_year(cls, v):
        if v is not None and (v < 1000 or v > 2100):
            raise ValueError('Год публикации должен быть между 1000 и 2100')
        return v

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    author: Optional[str] = Field(None, min_length=1, max_length=100)
    genre: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None
    publication_year: Optional[int] = Field(None, ge=1000, le=2100)
    isbn: Optional[str] = Field(None, pattern=r'^[0-9\-]+$')

class BookResponse(BookBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class BookListResponse(BaseModel):
    books: list[BookResponse]
    total: int
    page: int
    page_size: int
    total_pages: int