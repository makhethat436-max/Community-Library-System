
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");

// Get all users
router.get("/", async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, name, membership_id, role, created_at FROM users"
        );

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving users." });
    }
});

// Add a new user
router.post("/", async (req, res) => {
    try {
        const { name, membership_id, role, password } = req.body;

        const allowedRoles = ["Admin", "Librarian", "Member"];

        if (
            !name?.trim() ||
            !membership_id?.trim() ||
            !password ||
            password.length < 6 ||
            !allowedRoles.includes(role)
        ) {
            return res.status(400).json({
                message: "Provide valid user details. Password must have at least 6 characters."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO users
            (name, membership_id, role, password_hash)
            VALUES (?, ?, ?, ?)`,
            [name.trim(), membership_id.trim(), role, hashedPassword]
        );

        res.status(201).json({
            message: "User added successfully!",
            userId: result.insertId
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "Membership ID already exists."
            });
        }

        res.status(500).json({ message: "Error adding user." });
    }
});

// Update a user
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, membership_id, role, password } = req.body;

        const allowedRoles = ["Admin", "Librarian", "Member"];

        if (
            !name?.trim() ||
            !membership_id?.trim() ||
            !allowedRoles.includes(role)
        ) {
            return res.status(400).json({
                message: "Please provide valid user details."
            });
        }

        if (password && password.length < 6) {
            return res.status(400).json({
                message: "Password must have at least 6 characters."
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM users WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        let query;
        let values;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);

            query = `UPDATE users
                     SET name = ?, membership_id = ?, role = ?, password_hash = ?
                     WHERE id = ?`;

            values = [
                name.trim(),
                membership_id.trim(),
                role,
                hashedPassword,
                id
            ];
        } else {
            query = `UPDATE users
                     SET name = ?, membership_id = ?, role = ?
                     WHERE id = ?`;

            values = [
                name.trim(),
                membership_id.trim(),
                role,
                id
            ];
        }

        await db.query(query, values);

        res.json({ message: "User updated successfully!" });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "Membership ID already exists."
            });
        }

        res.status(500).json({
            message: "Error updating user."
        });
    }
});

// Delete a user
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM users WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.json({ message: "User deleted successfully!" });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error deleting user."
        });
    }
});


module.exports = router;
