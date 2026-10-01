import {
  useEffect,
  useState
} from "react";

function Users() {
  const [users, setUsers] = useState([]);

  const [name, setName] = useState("");
  const [membershipId, setMembershipId] =
    useState("");
  const [role, setRole] =
    useState("Member");
  const [password, setPassword] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  useEffect(() => {
    const savedUsers =
      JSON.parse(
        localStorage.getItem("users")
      ) || [];

    setUsers(savedUsers);
  }, []);

  const saveUsers = (newUsers) => {
    setUsers(newUsers);

    localStorage.setItem(
      "users",
      JSON.stringify(newUsers)
    );

    window.dispatchEvent(
      new Event("libraryDataChanged")
    );
  };

  const clearForm = () => {
    setName("");
    setMembershipId("");
    setRole("Member");
    setPassword("");
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      name.trim() === "" ||
      membershipId.trim() === ""
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (
      !editingId &&
      password.trim() === ""
    ) {
      alert("Please enter a password");
      return;
    }

    const exists = users.some(
      (user) =>
        user.membershipId.toLowerCase() ===
          membershipId
            .trim()
            .toLowerCase() &&
        user.id !== editingId
    );

    if (exists) {
      alert(
        "This membership ID already exists"
      );
      return;
    }

    if (editingId) {
      const updatedUsers = users.map(
        (user) => {
          if (user.id !== editingId) {
            return user;
          }

          return {
            ...user,
            name: name.trim(),
            membershipId:
              membershipId.trim(),
            role,
            password:
              password.trim() === ""
                ? user.password
                : password
          };
        }
      );

      saveUsers(updatedUsers);

      alert(
        "User updated successfully"
      );
    } else {
      const newUser = {
        id: Date.now(),
        name: name.trim(),
        membershipId:
          membershipId.trim(),
        role,
        password: password.trim()
      };

      saveUsers([
        ...users,
        newUser
      ]);

      alert(
        "User added successfully"
      );
    }

    clearForm();
  };

  const editUser = (user) => {
    setName(user.name);
    setMembershipId(
      user.membershipId
    );
    setRole(user.role);
    setPassword("");
    setEditingId(user.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const deleteUser = (id) => {
    const user = users.find(
      (item) => item.id === id
    );

    if (
      user &&
      user.role === "Admin"
    ) {
      const admins = users.filter(
        (item) => item.role === "Admin"
      );

      if (admins.length === 1) {
        alert(
          "The last Admin cannot be deleted."
        );
        return;
      }
    }

    const answer = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!answer) {
      return;
    }

    const newUsers = users.filter(
      (user) => user.id !== id
    );

    saveUsers(newUsers);
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>User Management</h1>

          <p>
            Manage library members,
            librarians and administrators.
          </p>
        </div>
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <h2>
              {editingId
                ? "Update User"
                : "Add New User"}
            </h2>

            <p>
              Register and manage library
              accounts.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="form-grid"
        >
          <div>
            <label>Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Full name"
              required
            />
          </div>

          <div>
            <label>
              Membership ID
            </label>

            <input
              type="text"
              value={membershipId}
              onChange={(e) =>
                setMembershipId(
                  e.target.value
                )
              }
              placeholder="e.g. LIB002"
              required
            />
          </div>

          <div>
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder={
                editingId
                  ? "Leave empty to keep current password"
                  : "Enter password"
              }
            />
          </div>

          <div>
            <label>Role</label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >
              <option value="Member">
                Member
              </option>

              <option value="Librarian">
                Librarian
              </option>

              <option value="Admin">
                Admin
              </option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn primary"
            >
              {editingId
                ? "Update User"
                : "Add User"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn secondary"
                onClick={clearForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <h2>
              Registered Users
            </h2>

            <p>
              Update member information
              or remove users.
            </p>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="empty-state">
            <div>👥</div>

            <h3>
              No users registered
            </h3>

            <p>
              Add your first library
              user above.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>
                    Membership ID
                  </th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.name}
                    </td>

                    <td>
                      {user.membershipId}
                    </td>

                    <td>
                      <span className="role-badge">
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="action-button update-button"
                        onClick={() =>
                          editUser(user)
                        }
                      >
                        Update
                      </button>

                      <button
                        type="button"
                        className="action-button delete-button"
                        onClick={() =>
                          deleteUser(
                            user.id
                          )
                        }
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