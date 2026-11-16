
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all transactions
router.get("/", async (req, res) => {
    try {
        const [transactions] = await db.query(`
            SELECT
                t.id,
                t.book_id,
                b.title AS book_title,
                t.user_id,
                u.name AS user_name,
                t.transaction_type,
                t.quantity,
                t.transaction_date
            FROM transactions t
            LEFT JOIN books b ON t.book_id = b.id
            LEFT JOIN users u ON t.user_id = u.id
            ORDER BY t.transaction_date DESC
        `);

        res.json(transactions);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error retrieving transactions."
        });
    }
});

// Create a transaction
router.post("/", async (req, res) => {
    const { book_id, user_id, transaction_type, quantity } = req.body;

    if (
        !Number.isInteger(Number(book_id)) ||
        Number(book_id) <= 0 ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) <= 0 ||
        !["Borrow", "Return", "Add Stock"].includes(transaction_type)
    ) {
        return res.status(400).json({
            message: "Please provide valid transaction details."
        });
    }

    if (
        transaction_type !== "Add Stock" &&
        (!Number.isInteger(Number(user_id)) || Number(user_id) <= 0)
    ) {
        return res.status(400).json({
            message: "A valid user is required for borrowing or returning books."
        });
    }

    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Check the book
        const [books] = await connection.query(
            "SELECT * FROM books WHERE id = ? FOR UPDATE",
            [book_id]
        );

        if (books.length === 0) {
            throw new Error("BOOK_NOT_FOUND");
        }

        // Check the user when required
        if (transaction_type !== "Add Stock") {
            const [users] = await connection.query(
                "SELECT id FROM users WHERE id = ?",
                [user_id]
            );

            if (users.length === 0) {
                throw new Error("USER_NOT_FOUND");
            }
        }

        const book = books[0];
        const amount = Number(quantity);

        if (transaction_type === "Borrow") {
            if (book.quantity < amount) {
                throw new Error("INSUFFICIENT_STOCK");
            }

            await connection.query(
                "UPDATE books SET quantity = quantity - ? WHERE id = ?",
                [amount, book_id]
            );
        }

        else if (transaction_type === "Return") {
            const [borrowed] = await connection.query(
                `SELECT COALESCE(SUM(
                    CASE
                        WHEN transaction_type = 'Borrow' THEN quantity
                        WHEN transaction_type = 'Return' THEN -quantity
                        ELSE 0
                    END
                ), 0) AS outstanding
                FROM transactions
                WHERE book_id = ? AND user_id = ?`,
                [book_id, user_id]
            );

            if (Number(borrowed[0].outstanding) < amount) {
                throw new Error("INVALID_RETURN");
            }

            await connection.query(
                "UPDATE books SET quantity = quantity + ? WHERE id = ?",
                [amount, book_id]
            );
        }

        else if (transaction_type === "Add Stock") {
            await connection.query(
                "UPDATE books SET quantity = quantity + ? WHERE id = ?",
                [amount, book_id]
            );
        }

        // Save transaction history
        await connection.query(
            `INSERT INTO transactions
            (book_id, user_id, transaction_type, quantity)
            VALUES (?, ?, ?, ?)`,
            [book_id, transaction_type === "Add Stock" ? null : user_id,
             transaction_type, amount]
        );

        await connection.commit();

        res.status(201).json({
            message: "Transaction completed successfully!"
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        const messages = {
            BOOK_NOT_FOUND: "Book not found.",
            USER_NOT_FOUND: "User not found.",
            INSUFFICIENT_STOCK: "Not enough books available.",
            INVALID_RETURN: "The return quantity exceeds the user's outstanding borrowed quantity."
        };

        console.error(error);

        res.status(messages[error.message] ? 400 : 500).json({
            message: messages[error.message] || "Error processing transaction."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;
