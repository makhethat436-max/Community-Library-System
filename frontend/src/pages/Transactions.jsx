
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
  const [loading, setLoading] = useState(true);

  const BOOKS_URL = "http://localhost:5000/api/books";
  const USERS_URL = "http://localhost:5000/api/users";
  const TRANSACTIONS_URL = "http://localhost:5000/api/transactions";

  // Get the login token
  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  // Load information from MySQL
  const loadData = async () => {
    try {
      const headers = getHeaders();

      const [booksResponse, usersResponse, transactionsResponse] =
        await Promise.all([
          fetch(BOOKS_URL, { headers }),
          fetch(USERS_URL, { headers }),
          fetch(TRANSACTIONS_URL, { headers })
        ]);

      if (
        !booksResponse.ok ||
        !usersResponse.ok ||
        !transactionsResponse.ok
      ) {
        throw new Error("Unable to load transaction information. Please check your login.");
      }

      const booksData = await booksResponse.json();
      const usersData = await usersResponse.json();
      const transactionsData = await transactionsResponse.json();

      setBooks(booksData);
      setUsers(usersData);
      setTransactions(transactionsData);

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save a transaction in MySQL
  const saveTransaction = async (e) => {
    e.preventDefault();

    const amount = Number(quantity);

    if (
      !bookId ||
      !staff ||
      !Number.isInteger(amount) ||
      amount < 1
    ) {
      alert("Please complete all required fields.");
      return;
    }

    if (type !== "Add Stock" && !borrower.trim()) {
      alert("Please enter the borrower name.");
      return;
    }

    const selectedStaff = users.find(
      user => String(user.id) === staff
    );

    if (!selectedStaff) {
      alert("Please select a valid staff member.");
      return;
    }

    const transactionData = {
      book_id: Number(bookId),
      user_id: selectedStaff.id,
      borrower_name: type === "Add Stock" ? null : borrower.trim(),
      transaction_type: type,
      quantity: amount
    };

    try {
      const response = await fetch(TRANSACTIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders()
        },
        body: JSON.stringify(transactionData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Transaction could not be completed."
        );
      }

      await loadData();

      setBookId("");
      setType("Borrow");
      setQuantity(1);
      setBorrower("");
      setStaff("");

      alert(result.message || "Transaction completed successfully!");

    } catch (error) {
      alert(error.message);
    }
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

        {loading ? (
          <p>Loading transaction information...</p>
        ) : (
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
                step="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                required
              />
            </div>

            {type !== "Add Stock" && (
              <div>
                <label>Borrower</label>

                <input
                  value={borrower}
                  onChange={e => setBorrower(e.target.value)}
                  placeholder="Enter borrower name"
                  required
                />
              </div>
            )}

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
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn primary">
                Save Transaction
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <h2>Transaction History</h2>
            <p>Library transaction records.</p>
          </div>
        </div>

        {loading ? (
          <p>Loading transactions...</p>
        ) : transactions.length === 0 ? (
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
                  <th>Processed By</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>
                      {transaction.transaction_date
                        ? new Date(
                            transaction.transaction_date
                          ).toLocaleString()
                        : "-"}
                    </td>

                    <td>{transaction.book_title || "-"}</td>
                    <td>{transaction.transaction_type}</td>
                    <td>{transaction.quantity}</td>
                    <td>{transaction.borrower_name || "-"}</td>
                    <td>{transaction.staff_name || "-"}</td>
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
