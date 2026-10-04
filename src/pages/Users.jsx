import { useEffect, useState } from "react";

function Users() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [role, setRole] = useState("Member");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    setUsers(JSON.parse(localStorage.getItem("users")) || []);
  }, []);

  const saveUsers = newUsers => {
    setUsers(newUsers);
    localStorage.setItem("users", JSON.stringify(newUsers));
    window.dispatchEvent(new Event("libraryDataChanged"));
  };

  const clearForm = () => {
    setName("");
    setMembershipId("");
    setRole("Member");
    setPassword("");
    setEditingId(null);
  };

  const saveUser = e => {
    e.preventDefault();

    if (!name.trim() || !membershipId.trim()) {
      alert("Please fill in all fields");
      return;
    }

    if (!editingId && !password.trim()) {
      alert("Please enter a password");
      return;
    }

    const exists = users.some(
      user =>
        user.membershipId.toLowerCase() ===
          membershipId.trim().toLowerCase() &&
        user.id !== editingId
    );

    if (exists) {
      alert("This membership ID already exists");
      return;
    }

    if (editingId) {
      saveUsers(
        users.map(user =>
          user.id === editingId
            ? {
                ...user,
                name: name.trim(),
                membershipId: membershipId.trim(),
                role,
                password: password.trim()
                  ? password
                  : user.password
              }
            : user
        )
      );

      alert("User updated successfully");
    } else {
      saveUsers([
        ...users,
        {
          id: Date.now(),
          name: name.trim(),
          membershipId: membershipId.trim(),
          role,
          password: password.trim()
        }
      ]);

      alert("User added successfully");
    }

    clearForm();
  };

  const editUser = user => {
    setName(user.name);
    setMembershipId(user.membershipId);
    setRole(user.role);
    setPassword("");
    setEditingId(user.id);
  };

  const deleteUser = id => {
    const user = users.find(user => user.id === id);

    if (
      user.role === "Admin" &&
      users.filter(user => user.role === "Admin").length === 1
    ) {
      alert("The last Admin cannot be deleted");
      return;
    }

    if (!window.confirm("Delete this user?")) return;

    saveUsers(users.filter(user => user.id !== id));
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
                editingId ? "Leave empty to keep current password" : ""
              }
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
            <button className="btn primary">
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
                  <td>{user.membershipId}</td>
                  <td>
                    <span className="role-badge">
                      {user.role}
                    </span>
                  </td>

                  <td>
                    <button
                      className="action-button update-button"
                      onClick={() => editUser(user)}
                    >
                      Update
                    </button>

                    <button
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
      </div>
    </div>
  );
}

export default Users;