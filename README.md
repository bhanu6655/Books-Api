Books Management System (BMS)

Books Management System (BMS) is a RESTful API built with Node.js, Express.js, and SQLite for managing books and authors efficiently. The system allows full CRUD operations on books, fetching books by authors, and supports advanced features like search, sorting, and pagination.

Features

CRUD Operations: Add, update, fetch, and delete books.

Author-Book Relationship: Retrieve all books written by a specific author.

Search & Filter: Search books by title using query parameters.

Sorting & Pagination: Sort books by any column and paginate results for better scalability.

RESTful API Design: Structured endpoints suitable for frontend integration.

Tech Stack

Backend: Node.js, Express.js

Database: SQLite

Other: SQL Joins, Query Parameters, REST API

Example Endpoints

GET /books/ → Fetch all books

POST /books/ → Add a new book

GET /books/:bookId/ → Fetch details of a book

PUT /books/:bookId/ → Update book details

DELETE /books/:bookId/ → Delete a book

GET /authors/:authorId/books/ → Get books by a specific author




- Third-Party Packages
  - nodemon
 
  - 
- SQLite Methods
  - get()
  - run()
