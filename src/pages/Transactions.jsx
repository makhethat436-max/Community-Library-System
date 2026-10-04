import { useEffect, useState } from "react";

function Transactions() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [bookId, setBookId] = useState("");
  const [type, setType] = useState("Borrow");
  const [quantity, setQuantity] = useState(1);
  const [borrower, setBorrower] = useState("");
  const [staff, setStaff] = useState("");

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

  const borrowed = id => {
    const borrowedBooks = transactions
      .filter(t => t.bookId === id && t.type === "Borrow")
      .reduce((total, t) => total + Number(t.quantity), 0);

    const returnedBooks = transactions
      .filter(t => t.bookId === id && t.type === "Return")
      .reduce((total, t) => total + Number(t.quantity), 0);

    return borrowedBooks - returnedBooks;
  };

  const saveTransaction = e => {
    e.preventDefault();

    if (!bookId || !staff || quantity < 1) {
      alert("Please complete all required fields");
      return;
    }

    const book = books.find(
      book => book.id === Number(bookId)
    );

    const amount = Number(quantity);

    if (!book) return;

    if (
      type === "Borrow" &&
      amount > Number(book.quantity)
    ) {
      alert("There are not enough copies available");
      return;
    }

    if (
      type === "Return" &&
      amount > borrowed(book.id)
    ) {
      alert("There are not enough borrowed copies");
      return;
    }

    let newQuantity = Number(book.quantity);

    if (type === "Borrow") {
      newQuantity -= amount;
    }

    if (type === "Return" || type === "Add Stock") {
      newQuantity += amount;
    }

    const updatedBooks = books.map(item =>
      item.id === book.id
        ? { ...item, quantity: newQuantity }
        : item
    );

    const transaction = {
      id: Date.now(),
      bookId: book.id,
      bookTitle: book.title,
      type,
      quantity: amount,
      borrower: type === "Borrow" ? borrower : "",
      staff,
      date: new Date().toLocaleString()
    };

    const updatedTransactions = [
      transaction,
      ...transactions
    ];

    localStorage.setItem(
      "books",
      JSON.stringify(updatedBooks)
    );

    localStorage.setItem(
      "transactions",
      JSON.stringify(updatedTransactions)
    );

    setBooks(updatedBooks);
    setTransactions(updatedTransactions);

    window.dispatchEvent(new Event("libraryDataChanged"));

    setBookId("");
    setType("Borrow");
    setQuantity(1);
    setBorrower("");
    setStaff("");

    alert("Transaction completed");
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Transactions</h1>
          <p>Manage borrowing, returns and stock.</p>
        </div>
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <h2>Book Transaction</h2>
            <p>Record library book activity.</p>
          </div>
        </div>

        <form onSubmit={saveTransaction} className="form-grid">
          <div>
            <label>Book</label>

            <select
              value={bookId}
              onChange={e => setBookId(e.target.value)}
              required
            >
              <option value="">Choose a book</option>

              {books.map(book => (
                <option key={book.id} value={book.id}>
                  {book.title} - {book.quantity} available
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Transaction Type</label>

            <select
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option>Borrow</option>
              <option>Return</option>
              <option>Add Stock</option>
            </select>
          </div>

          <div>
            <label>Quantity</label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Borrower</label>

            <input
              value={borrower}
              onChange={e => setBorrower(e.target.value)}
              placeholder="Borrower name"
            />
          </div>

          <div>
            <label>Processed By</label>

            <select
              value={staff}
              onChange={e => setStaff(e.target.value)}
              required
            >
              <option value="">Select staff</option>

              {users
                .filter(
                  user =>
                    user.role === "Admin" ||
                    user.role === "Librarian"
                )
                .map(user => (
                  <option key={user.id}>
                    {user.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-actions">
            <button className="btn primary">
              Save Transaction
            </button>
          </div>
        </form>
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <h2>Transaction History</h2>
            <p>Library transaction records.</p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <h3>No transactions yet</h3>
            <p>Transactions will appear here.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Book</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Borrower</th>
                  <th>Staff</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>{transaction.bookTitle}</td>
                    <td>{transaction.type}</td>
                    <td>{transaction.quantity}</td>
                    <td>{transaction.borrower || "-"}</td>
                    <td>{transaction.staff}</td>
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

export default Transactions;