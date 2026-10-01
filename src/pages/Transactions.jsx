import {
  useEffect,
  useState
} from "react";

function Transactions() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] =
    useState([]);

  const [selectedBook, setSelectedBook] =
    useState("");

  const [transactionType, setTransactionType] =
    useState("Borrow");

  const [quantity, setQuantity] =
    useState(1);

  const [borrower, setBorrower] =
    useState("");

  const [staff, setStaff] =
    useState("");

  const loadData = () => {
    setBooks(
      JSON.parse(
        localStorage.getItem("books")
      ) || []
    );

    setUsers(
      JSON.parse(
        localStorage.getItem("users")
      ) || []
    );

    setTransactions(
      JSON.parse(
        localStorage.getItem(
          "transactions"
        )
      ) || []
    );
  };

  useEffect(() => {
    loadData();

    window.addEventListener(
      "libraryDataChanged",
      loadData
    );

    return () => {
      window.removeEventListener(
        "libraryDataChanged",
        loadData
      );
    };
  }, []);

  const getBorrowedQuantity = (
    bookId
  ) => {
    const borrowed =
      transactions
        .filter(
          (transaction) =>
            transaction.bookId ===
              bookId &&
            transaction.type ===
              "Borrow"
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(
              transaction.quantity
            ),
          0
        );

    const returned =
      transactions
        .filter(
          (transaction) =>
            transaction.bookId ===
              bookId &&
            transaction.type ===
              "Return"
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(
              transaction.quantity
            ),
          0
        );

    return borrowed - returned;
  };

  const handleTransaction = (e) => {
    e.preventDefault();

    if (!selectedBook) {
      alert("Please select a book");
      return;
    }

    const amount = Number(quantity);

    if (
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      alert(
        "Quantity must be a whole number greater than zero"
      );
      return;
    }

    const book = books.find(
      (item) =>
        item.id ===
        Number(selectedBook)
    );

    if (!book) {
      alert("Book not found");
      return;
    }

    if (!staff) {
      alert(
        "Please select the staff member"
      );
      return;
    }

    const borrowedQuantity =
      getBorrowedQuantity(book.id);

    let newQuantity =
      Number(book.quantity);

    if (
      transactionType === "Borrow"
    ) {
      if (
        amount >
        Number(book.quantity)
      ) {
        alert(
          "There are not enough copies available"
        );
        return;
      }

      newQuantity =
        Number(book.quantity) -
        amount;
    }

    if (
      transactionType === "Return"
    ) {
      if (borrowedQuantity <= 0) {
        alert(
          "There are no borrowed copies to return"
        );
        return;
      }

      if (
        amount >
        borrowedQuantity
      ) {
        alert(
          `Only ${borrowedQuantity} borrowed copies can be returned`
        );
        return;
      }

      newQuantity =
        Number(book.quantity) +
        amount;
    }

    if (
      transactionType ===
      "Add Stock"
    ) {
      newQuantity =
        Number(book.quantity) +
        amount;
    }

    const updatedBooks =
      books.map((item) =>
        item.id === book.id
          ? {
              ...item,
              quantity:
                newQuantity
            }
          : item
      );

    const newTransaction = {
      id: Date.now(),
      bookId: book.id,
      bookTitle: book.title,
      type: transactionType,
      quantity: amount,
      borrower:
        transactionType ===
        "Borrow"
          ? borrower.trim()
          : "",
      staff,
      date:
        new Date().toLocaleString()
    };

    const updatedTransactions = [
      newTransaction,
      ...transactions
    ];

    setBooks(updatedBooks);
    setTransactions(
      updatedTransactions
    );

    localStorage.setItem(
      "books",
      JSON.stringify(updatedBooks)
    );

    localStorage.setItem(
      "transactions",
      JSON.stringify(
        updatedTransactions
      )
    );

    window.dispatchEvent(
      new Event("libraryDataChanged")
    );

    setSelectedBook("");
    setTransactionType("Borrow");
    setQuantity(1);
    setBorrower("");
    setStaff("");

    alert(
      `${transactionType} transaction completed`
    );
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Transactions</h1>

          <p>
            Manage borrowing, returns,
            stock and transaction history.
          </p>
        </div>
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <h2>
              Book Transaction
            </h2>

            <p>
              Record every movement of
              library books.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleTransaction}
          className="form-grid"
        >
          <div>
            <label>
              Select Book
            </label>

            <select
              value={selectedBook}
              onChange={(e) =>
                setSelectedBook(
                  e.target.value
                )
              }
              required
            >
              <option value="">
                Choose a book
              </option>

              {books.map((book) => (
                <option
                  key={book.id}
                  value={book.id}
                >
                  {book.title} -{" "}
                  {book.quantity}{" "}
                  available
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>
              Transaction Type
            </label>

            <select
              value={transactionType}
              onChange={(e) =>
                setTransactionType(
                  e.target.value
                )
              }
            >
              <option value="Borrow">
                Borrow Book
              </option>

              <option value="Return">
                Return Book
              </option>

              <option value="Add Stock">
                Add Stock
              </option>
            </select>
          </div>

          <div>
            <label>
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              required
            />
          </div>

          <div>
            <label>
              Borrower Name / Detail
            </label>

            <input
              type="text"
              value={borrower}
              onChange={(e) =>
                setBorrower(
                  e.target.value
                )
              }
              placeholder="Borrower name"
            />
          </div>

          <div>
            <label>
              Processed By
            </label>

            <select
              value={staff}
              onChange={(e) =>
                setStaff(
                  e.target.value
                )
              }
              required
            >
              <option value="">
                Select staff member
              </option>

              {users
                .filter(
                  (user) =>
                    user.role ===
                      "Admin" ||
                    user.role ===
                      "Librarian"
                )
                .map((user) => (
                  <option
                    key={user.id}
                    value={user.name}
                  >
                    {user.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn primary"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <h2>
              Transaction History
            </h2>

            <p>
              Complete record of library
              activity.
            </p>
          </div>
        </div>

        {transactions.length ===
        0 ? (
          <div className="empty-state">
            <div>↔</div>

            <h3>
              No transactions yet
            </h3>

            <p>
              Transactions will appear
              here.
            </p>
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
                {transactions.map(
                  (transaction) => (
                    <tr
                      key={
                        transaction.id
                      }
                    >
                      <td>
                        {
                          transaction.date
                        }
                      </td>

                      <td>
                        {
                          transaction.bookTitle
                        }
                      </td>

                      <td>
                        <span
                          className={`status transaction-${transaction.type
                            .toLowerCase()
                            .replaceAll(
                              " ",
                              "-"
                            )}`}
                        >
                          {
                            transaction.type
                          }
                        </span>
                      </td>

                      <td>
                        {
                          transaction.quantity
                        }
                      </td>

                      <td>
                        {transaction.borrower ||
                          "-"}
                      </td>

                      <td>
                        {transaction.staff ||
                          "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;