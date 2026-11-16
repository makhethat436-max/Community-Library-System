
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all books
router.get("/", async (req, res) => {
    try {
        const [books] = await db.query("SELECT * FROM books");
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving books" });
    }
});

// Add a new book
router.post("/", async (req, res) => {
    try {
        const { title, author, genre, isbn, quantity } = req.body;

        if (!title || !author || !isbn || quantity === undefined ||
            !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
            return res.status(400).json({
                message: "Please provide valid book details and quantity."
            });
        }

        const [result] = await db.query(
            "INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)",
            [title, author, genre || null, isbn, Number(quantity)]
        );

        res.status(201).json({
            message: "Book added successfully!",
            bookId: result.insertId
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "A book with this ISBN already exists."
            });
        }

        res.status(500).json({ message: "Error adding book" });
    }
});


// Update a book
router.put("/:id", async (req, res) => {
    try {
        const { title, author, genre, isbn, quantity } = req.body;
        const { id } = req.params;

        if (!title || !author || !isbn || quantity === undefined ||
            !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
            return res.status(400).json({
                message: "Please provide valid book details."
            });
        }

        const [result] = await db.query(
            `UPDATE books
             SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ?
             WHERE id = ?`,
            [title, author, genre || null, isbn, Number(quantity), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Book not found." });
        }

        res.json({ message: "Book updated successfully!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating book." });
    }
});

// Delete a book
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM books WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Book not found." });
        }

        res.json({ message: "Book deleted successfully!" });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                message: "This book has transaction records and cannot be deleted."
            });
        }

        res.status(500).json({ message: "Error deleting book." });
    }
});

module.exports = router;
