
import { useEffect, useState } from "react";

function Users() {
  const [users, setUsers] = useState([]);

  const [name, setName] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [role, setRole] = useState("Member");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);

  const USERS_URL = "http://localhost:5000/api/users";

  // Send login token
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  // Load users from MySQL
  const loadUsers = async () => {
    try {
      const response = await fetch(USERS_URL, {
        headers: getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load users.");
      }

      setUsers(data);

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Clear form
  const clearForm = () => {
    setName("");
    setMembershipId("");
    setRole("Member");
    setPassword("");
    setEditingId(null);
  };

  // Add or update user
  const saveUser = async (e) => {
    e.preventDefault();

    if (!name.trim() || !membershipId.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!editingId && !password.trim()) {
      alert("Please enter a password.");
      return;
    }

    if (password.trim() && password.trim().length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    const userData = {
      name: name.trim(),
      membership_id: membershipId.trim(),
      role
    };

    if (password.trim()) {
      userData.password = password.trim();
    }

    try {
      const response = await fetch(
        editingId ? `${USERS_URL}/${editingId}` : USERS_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: getHeaders(),
          body: JSON.stringify(userData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save user.");
      }

      await loadUsers();

      alert(
        result.message ||
        (editingId
          ? "User updated successfully!"
          : "User added successfully!")
      );

      clearForm();

    } catch (error) {
      alert(error.message);
    }
  };

  // Edit user
  const editUser = (user) => {
    setName(user.name);
    setMembershipId(user.membership_id);
    setRole(user.role);
    setPassword("");
    setEditingId(user.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Delete user
  const deleteUser = async (id) => {
    const selectedUser = users.find(
      user => user.id === id
    );

    if (!selectedUser) return;

    if (
      selectedUser.role === "Admin" &&
      users.filter(user => user.role === "Admin").length === 1
    ) {
      alert("The last Admin cannot be deleted.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch(`${USERS_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete user.");
      }

      await loadUsers();

      if (editingId === id) {
        clearForm();
      }

      alert(result.message || "User deleted successfully!");

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>User Management</h1>
          <p>Manage library users and their roles.</p>
        </div>
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <h2>{editingId ? "Update User" : "Add User"}</h2>
            <p>Register a library user.</p>
          </div>
        </div>

        <form onSubmit={saveUser} className="form-grid">
          <div>
            <label>Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Membership ID</label>
            <input
              value={membershipId}
              onChange={e => setMembershipId(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={
                editingId
                  ? "Leave empty to keep current password"
                  : "Enter password"
              }
              required={!editingId}
            />
          </div>

          <div>
            <label>Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option>Member</option>
              <option>Librarian</option>
              <option>Admin</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn primary">
              {editingId ? "Update User" : "Add User"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn secondary"
                onClick={clearForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <h2>Registered Users</h2>
            <p>Manage existing users.</p>
          </div>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <h3>No users registered</h3>
            <p>New users will appear here.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Membership ID</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.membership_id}</td>
                    <td>
                      <span className="role-badge">
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="action-button update-button"
                        onClick={() => editUser(user)}
                      >
                        Update
                      </button>

                      <button
                        type="button"
                        className="action-button delete-button"
                        onClick={() => deleteUser(user.id)}
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

export default Users;
