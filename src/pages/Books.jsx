import { useEffect, useState } from "react";

function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [isbn, setIsbn] = useState("");
  const [quantity, setQuantity] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const savedBooks =
      JSON.parse(localStorage.getItem("books")) || [];

    setBooks(savedBooks);
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      title.trim() === "" ||
      author.trim() === "" ||
      genre.trim() === "" ||
      isbn.trim() === "" ||
      quantity === ""
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (
      Number(quantity) < 0 ||
      !Number.isInteger(Number(quantity))
    ) {
      alert("Quantity must be a whole number of zero or more");
      return;
    }

    const isbnExists = books.some(
      (book) =>
        book.isbn.toLowerCase() === isbn.trim().toLowerCase() &&
        book.id !== editingId
    );

    if (isbnExists) {
      alert("A book with this ISBN already exists");
      return;
    }

    if (editingId) {
      setBooks(
        books.map((book) =>
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
      const newBook = {
        id: Date.now(),
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim(),
        isbn: isbn.trim(),
        quantity: Number(quantity)
      };

      setBooks([...books, newBook]);

      alert("Book added successfully");
    }

    clearForm();
  };

  const editBook = (book) => {
    setTitle(book.title);
    setAuthor(book.author);
    setGenre(book.genre);
    setIsbn(book.isbn);
    setQuantity(book.quantity);
    setEditingId(book.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const deleteBook = (id) => {
    const answer = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (answer) {
      setBooks(
        books.filter((book) => book.id !== id)
      );
    }
  };

  const getStatus = (quantity) => {
    if (Number(quantity) === 0) {
      return "Out of Stock";
    }

    if (Number(quantity) < 2) {
      return "Low Stock";
    }

    return "Available";
  };

  const filteredBooks = books.filter((book) => {
    const searchText = search.toLowerCase();

    return (
      book.title.toLowerCase().includes(searchText) ||
      book.author.toLowerCase().includes(searchText) ||
      book.genre.toLowerCase().includes(searchText) ||
      book.isbn.toLowerCase().includes(searchText)
    );
  });

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Book Inventory</h1>

          <p>
            Add new titles or update existing library
            inventory.
          </p>
        </div>
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <h2>
              {editingId
                ? "Update Book"
                : "Manage Books"}
            </h2>

            <p>
              Enter the book information below.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="form-grid"
        >
          <div>
            <label>Title</label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. MOPHEME"
            />
          </div>

          <div>
            <label>Author</label>

            <input
              type="text"
              value={author}
              onChange={(e) =>
                setAuthor(e.target.value)
              }
              placeholder="e.g. S MATLOSA"
            />
          </div>

          <div>
            <label>Genre</label>

            <input
              type="text"
              value={genre}
              onChange={(e) =>
                setGenre(e.target.value)
              }
              placeholder="e.g. Drama"
            />
          </div>

          <div>
            <label>ISBN</label>

            <input
              type="text"
              value={isbn}
              onChange={(e) =>
                setIsbn(e.target.value)
              }
              placeholder="e.g. 9780133943030"
            />
          </div>

          <div>
            <label>Quantity</label>

            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value)
              }
              placeholder="Enter quantity"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn primary"
            >
              {editingId
                ? "Update Book"
                : "Add Book"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn secondary"
                onClick={clearForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="section-card">
        <div className="section-heading search-heading">
          <div>
            <h2>Book Collection</h2>

            <p>
              Search by title, author, genre or ISBN.
            </p>
          </div>

          <input
            type="text"
            className="search-box"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search books..."
          />
        </div>

        {filteredBooks.length === 0 ? (
          <div className="empty-state">
            <div>🔎</div>
            <h3>No books found</h3>
            <p>
              Try another search or add a new book.
            </p>
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
                {filteredBooks.map((book) => (
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

                    <td>
                      <span
                        className={`status ${getStatus(
                          book.quantity
                        )
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {getStatus(book.quantity)}
                      </span>
                    </td>

                    <td>
                      <button
                        className="action-button update-button"
                        onClick={() =>
                          editBook(book)
                        }
                      >
                        Update
                      </button>

                      <button
                        className="action-button delete-button"
                        onClick={() =>
                          deleteBook(book.id)
                        }
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