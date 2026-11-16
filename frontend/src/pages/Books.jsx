
import { useEffect, useState } from "react";

function Books() {
  const API_URL = "http://localhost:5000/api/books";

  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [isbn, setIsbn] = useState("");
  const [quantity, setQuantity] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Send the login token with requests
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  // Load books from MySQL
  const loadBooks = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load books.");
      }

      setBooks(data);

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const clearForm = () => {
    setTitle("");
    setAuthor("");
    setGenre("");
    setIsbn("");
    setQuantity("");
    setEditingId(null);
  };

  // Add or update a book
  const saveBook = async (e) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !author.trim() ||
      !genre.trim() ||
      !isbn.trim() ||
      quantity === ""
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (
      Number(quantity) < 0 ||
      !Number.isInteger(Number(quantity))
    ) {
      alert("Quantity must be a whole number.");
      return;
    }

    const bookData = {
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      isbn: isbn.trim(),
      quantity: Number(quantity)
    };

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: getHeaders(),
          body: JSON.stringify(bookData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save book.");
      }

      await loadBooks();

      alert(
        result.message ||
        (editingId
          ? "Book updated successfully."
          : "Book added successfully.")
      );

      clearForm();

    } catch (error) {
      alert(error.message);
    }
  };

  // Put selected book details into the form
  const editBook = (book) => {
    setTitle(book.title);
    setAuthor(book.author);
    setGenre(book.genre);
    setIsbn(book.isbn);
    setQuantity(book.quantity);
    setEditingId(book.id);
  };

  // Delete a book from MySQL
  const deleteBook = async (id) => {
    if (!window.confirm("Delete this book?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete book.");
      }

      await loadBooks();

      if (editingId === id) {
        clearForm();
      }

      alert(result.message || "Book deleted successfully.");

    } catch (error) {
      alert(error.message);
    }
  };

  const getStatus = (quantity) => {
    if (Number(quantity) === 0) {
      return "OUT OF STOCK";
    }

    if (Number(quantity) < 2) {
      return "LOW STOCK";
    }

    return "Available";
  };

  const filteredBooks = books.filter((book) => {
    const text = search.toLowerCase();

    return (
      book.title.toLowerCase().includes(text) ||
      book.author.toLowerCase().includes(text) ||
      (book.genre || "").toLowerCase().includes(text) ||
      book.isbn.toLowerCase().includes(text)
    );
  });

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
              step="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn primary">
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

        {loading ? (
          <p>Loading books...</p>
        ) : filteredBooks.length === 0 ? (
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
                      Number(book.quantity) < 2 ? "low-stock" : ""
                    }
                  >
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>{book.isbn}</td>
                    <td>{book.quantity}</td>

                    <td>
                      <span
                        className={
                          Number(book.quantity) < 2
                            ? "stock-warning"
                            : "status"
                        }
                      >
                        {getStatus(book.quantity)}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="action-button update-button"
                        onClick={() => editBook(book)}
                      >
                        Update
                      </button>

                      <button
                        type="button"
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
