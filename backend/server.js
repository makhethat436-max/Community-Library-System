
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const booksRoutes = require("./routes/books");
const usersRoutes = require("./routes/users");
const transactionsRoutes = require("./routes/transactions");

require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/books", booksRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/transactions", transactionsRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("Community Library System API is running!");
});

// Test database connection
app.get("/test-db", async (req, res) => {
    try {
        const [result] = await db.query("SELECT 1");
        res.json({
            message: "MySQL database connected successfully!",
            result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Database connection failed."
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
