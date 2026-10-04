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

    return () =>
      window.removeEventListener(
        "libraryDataChanged",
        loadData
      );
  }, []);

  const copies = books.reduce(
    (total, book) => total + Number(book.quantity),
    0
  );

  const lowStock = books.filter(
    book => Number(book.quantity) < 2
  ).length;

  const borrowed = transactions
    .filter(transaction => transaction.type === "Borrow")
    .reduce(
      (total, transaction) =>
        total + Number(transaction.quantity),
      0
    );

  const returned = transactions
    .filter(transaction => transaction.type === "Return")
    .reduce(
      (total, transaction) =>
        total + Number(transaction.quantity),
      0
    );

  const status = quantity => {
    if (Number(quantity) === 0) return "Out of Stock";
    if (Number(quantity) < 2) return "Low Stock";
    return "Available";
  };

  return (
    <div>
      <div className="welcome">
        <div>
          <h1>Library Overview</h1>
          <p>
            Track books, users and library activity.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <small>Book Titles</small>
            <h2>{books.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <small>Total Copies</small>
            <h2>{copies}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <small>Registered Users</small>
            <h2>{users.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <small>Low Stock</small>
            <h2>{lowStock}</h2>
          </div>
        </div>
      </div>

      <div className="stats-grid secondary-stats">
        <div className="stat-card">
          <div>
            <small>Borrowed Copies</small>
            <h2>{borrowed}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <small>Returned Copies</small>
            <h2>{returned}</h2>
          </div>
        </div>

        <div className="stat-card">
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
            <p>Current books and their availability.</p>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="empty-state">
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
                {books.map(book => (
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
                      <span className="status">
                        {status(book.quantity)}
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