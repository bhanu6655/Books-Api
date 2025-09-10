const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const jwt = require("jsonwebtoken");

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'goodreads.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()



app.post(`/login/`, async (request, response) => {
  const {username, password} = request.body
  try {
    const getuser = `select * from user where username = '${username}'`
    const user = await db.get(getuser)
    if (user === undefined) {
      response.status(400)
      response.send('Invalid user')
    } else {
      isPasswordMathced = await bcrypt.compare(password, user.password)
      if (isPasswordMathced === true) {
        const payload = {username: username}
        const jwtToken = jwt.sign(payload, 'secretkey')
        response.send({jwtToken})
      } else {
        response.status(400)
        response.send('Invalid password')
      }
    }
  } catch (e) {
    process.exit(1)
  }
})



// Secret key for signing JWT (keep it safe, use env variable in real projects)
const JWT_SECRET = "MY_SECRET_KEY";

// Middleware to verify JWT
const authenticateToken = (request, response, next) => {
  const authHeader = request.headers["authorization"];

  // Format: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (token === undefined) {
    response.status(401).send({ error: "Access Denied. Token Missing" });
  } else {
    jwt.verify(token, JWT_SECRET, (error, payload) => {
      if (error) {
        response.status(403).send({ error: "Invalid Token" });
      } else {
        // store payload in request object for later use
        request.user = payload;
        next();
      }
    });
  }
};


// Get Books API
app.get('/books/',authenticateToken, async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`
  const booksArray = await db.all(getBooksQuery)
  response.send(booksArray)
})

//Get Book API
app.get('/books/:bookId/',authenticateToken, async (request, response) => {
  const {bookId} = request.params
  const bookQuery = `SELECT * FROM book 
  WHERE book_id = ${bookId};`
  const getbook = await db.get(bookQuery)
  response.send(getbook)
})

app.post('/books/',authenticateToken, async (request, response) => {
  const bookDetails = request.body
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`

  const dbResponse = await db.run(addBookQuery)
  const bookId = dbResponse.lastID
  response.send({bookId: bookId})
})

app.put('/books/:bookId/',authenticateToken, async (request, response) => {
  const {bookId} = request.params
  const bookDetails = request.body
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails
  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price=${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`
  await db.run(updateBookQuery)
  response.send('Book Updated Successfully')
})

app.delete('/books/:bookId/',authenticateToken, async (request, response) => {
  const {bookId} = request.params
  const deleteBookQuery = `
    DELETE FROM
      book
    WHERE
      book_id = ${bookId};`
  await db.run(deleteBookQuery)
  response.send('Book Deleted Successfully')
})

app.get('/authors/:authorId/books/', async (request, response) => {
  const {authorId} = request.params
  const getAuthorBooksQuery = `
    SELECT
     *
    FROM
     book
    WHERE
      author_id = ${authorId};`
  const booksArray = await db.all(getAuthorBooksQuery)
  response.send(booksArray)
})

app.get('/books/',authenticateToken, async (request, response) => {
  const {
    offset = 2,
    limit = 5,
    order = 'ASC',
    order_by = 'book_id',
    search_q = '',
  } = request.query
  const getBooksQuery = `
    SELECT
      *
    FROM
     book
    WHERE
     title LIKE '%${search_q}%'
    ORDER BY ${order_by} ${order}
    LIMIT ${limit} OFFSET ${offset};`
  const booksArray = await db.all(getBooksQuery)
  response.send(booksArray)
})


//joins
//How many books that author written using joins
app.get("/authors/:authorId/books/count/",authenticateToken, async (request, response) => {
  const { authorId } = request.params;
  const getAuthorBookCountQuery = `
    SELECT 
      author.author_id,
      author.author_name,
      COUNT(book.book_id) AS total_books
    FROM 
      author
    JOIN 
      book 
    ON 
      author.author_id = book.author_id
    WHERE 
      author.author_id = ${authorId}
    GROUP BY 
      author.author_id;`;

  const bookCount = await db.get(getAuthorBookCountQuery);
  response.send(bookCount);
});

