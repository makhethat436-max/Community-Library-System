import { useEffect, useState } from "react";

function Books() {
  const [books, setBooks] = useState(
    JSON.parse(localStorage.getItem("books")) || []
  );

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [isbn, setIsbn] = useState("");
  const [quantity, setQuantity] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
    window.dispatchEvent(new Event("libraryDataChanged"));
  }, [books]);

  const clearForm = () => {
    setTitle("");
    setAuthor("");
    setGenre("");
    setIsbn("");
    setQuantity("");
    setEditingId(null);
  };

  const saveBook = e => {
    e.preventDefault();

    if (
      !title.trim() ||
      !author.trim() ||
      !genre.trim() ||
      !isbn.trim() ||
      quantity === ""
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (
      Number(quantity) < 0 ||
      !Number.isInteger(Number(quantity))
    ) {
      alert("Quantity must be a whole number");
      return;
    }

    const duplicate = books.some(
      book =>
        book.isbn.toLowerCase() ===
          isbn.trim().toLowerCase() &&
        book.id !== editingId
    );

    if (duplicate) {
      alert("This ISBN already exists");
      return;
    }

    if (editingId) {
      setBooks(
        books.map(book =>
          book.id === editingId
            ? {
                ...book,
                title: title.trim(),
                author: author.trim(),
                genre: genre.trim(),
                isbn: isbn.trim(),
                quantity: Number(quantity)
              }
            : book
        )
      );

      alert("Book updated successfully");
    } else {
      setBooks([
        ...books,
        {
          id: Date.now(),
          title: title.trim(),
          author: author.trim(),
          genre: genre.trim(),
          isbn: isbn.trim(),
          quantity: Number(quantity)
        }
      ]);

      alert("Book added successfully");
    }

    clearForm();
  };

  const editBook = book => {
    setTitle(book.title);
    setAuthor(book.author);
    setGenre(book.genre);
    setIsbn(book.isbn);
    setQuantity(book.quantity);
    setEditingId(book.id);
  };

  const deleteBook = id => {
    if (!window.confirm("Delete this book?")) return;

    setBooks(books.filter(book => book.id !== id));
  };

  const filteredBooks = books.filter(book => {
    const text = search.toLowerCase();

    return (
      book.title.toLowerCase().includes(text) ||
      book.author.toLowerCase().includes(text) ||
      book.genre.toLowerCase().includes(text) ||
      book.isbn.toLowerCase().includes(text)
    );
  });

  const status = quantity => {
    if (Number(quantity) === 0) return "Out of Stock";
    if (Number(quantity) < 2) return "Low Stock";
    return "Available";
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Book Inventory</h1>
          <p>Manage books in the library.</p>
        </div>
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <h2>
              {editingId ? "Update Book" : "Add Book"}
            </h2>

            <p>Enter the book details below.</p>
          </div>
        </div>

        <form onSubmit={saveBook} className="form-grid">
          <div>
            <label>Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Author</label>
            <input
              value={author}
              onChange={e => setAuthor(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Genre</label>
            <input
              value={genre}
              onChange={e => setGenre(e.target.value)}
              required
            />
          </div>

          <div>
            <label>ISBN</label>
            <input
              value={isbn}
              onChange={e => setIsbn(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Quantity</label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button className="btn primary">
              {editingId ? "Update Book" : "Add Book"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn secondary"
                onClick={clearForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="section-card">
        <div className="section-heading search-heading">
          <div>
            <h2>Book Collection</h2>
            <p>Search the book collection.</p>
          </div>

          <input
            className="search-box"
            placeholder="Search books..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {filteredBooks.length === 0 ? (
          <div className="empty-state">
            <h3>No books found</h3>
            <p>Add a book or change your search.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>ISBN</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBooks.map(book => (
                  <tr
                    key={book.id}
                    className={
                      Number(book.quantity) < 2
                        ? "low-stock"
                        : ""
                    }
                  >
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>{book.isbn}</td>
                    <td>{book.quantity}</td>
                    <td>{status(book.quantity)}</td>

                    <td>
                      <button
                        className="action-button update-button"
                        onClick={() => editBook(book)}
                      >
                        Update
                      </button>

                      <button
                        className="action-button delete-button"
                        onClick={() => deleteBook(book.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Books;