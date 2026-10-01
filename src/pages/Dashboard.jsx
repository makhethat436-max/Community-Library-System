import { useEffect, useState } from "react";

function Dashboard() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const loadData = () => {
    setBooks(JSON.parse(localStorage.getItem("books")) || []);
    setUsers(JSON.parse(localStorage.getItem("users")) || []);
    setTransactions(
      JSON.parse(localStorage.getItem("transactions")) || []
    );
  };

  useEffect(() => {
    loadData();

    window.addEventListener("libraryDataChanged", loadData);

    return () => {
      window.removeEventListener("libraryDataChanged", loadData);
    };
  }, []);

  const totalBooks = books.length;

  const totalCopies = books.reduce(
    (total, book) => total + Number(book.quantity),
    0
  );

  const lowStock = books.filter(
    (book) => Number(book.quantity) < 2
  ).length;

  const borrowedBooks = transactions
    .filter((transaction) => transaction.type === "Borrow")
    .reduce(
      (total, transaction) =>
        total + Number(transaction.quantity),
      0
    );

  const returnedBooks = transactions
    .filter((transaction) => transaction.type === "Return")
    .reduce(
      (total, transaction) =>
        total + Number(transaction.quantity),
      0
    );

  const getStatus = (quantity) => {
    if (Number(quantity) === 0) {
      return "Out of Stock";
    }

    if (Number(quantity) < 2) {
      return "Low Stock";
    }

    return "Available";
  };

  return (
    <div className="dashboard-page">
      <div className="welcome">
        <div>
          <h1>Library Overview</h1>

          <p>
            Track current stock levels, active members,
            and library activity.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>

          <div>
            <small>Book Titles</small>
            <h2>{totalBooks}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">▤</div>

          <div>
            <small>Total Copies</small>
            <h2>{totalCopies}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>

          <div>
            <small>Registered Users</small>
            <h2>{users.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠</div>

          <div>
            <small>Low Stock</small>
            <h2>{lowStock}</h2>
          </div>
        </div>
      </div>

      <div className="stats-grid secondary-stats">
        <div className="stat-card">
          <div className="stat-icon">↗</div>

          <div>
            <small>Borrowed Copies</small>
            <h2>{borrowedBooks}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">↩</div>

          <div>
            <small>Returned Copies</small>
            <h2>{returnedBooks}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">↔</div>

          <div>
            <small>Transactions</small>
            <h2>{transactions.length}</h2>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <h2>Current Inventory Status</h2>

            <p>
              Overview of books currently managed in the
              library.
            </p>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="empty-state">
            <div>📚</div>
            <h3>No books available</h3>
            <p>Add books from the Books section.</p>
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
                  <th>Copies</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => (
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

export default Dashboard;