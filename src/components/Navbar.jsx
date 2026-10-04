import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));

  const logout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const canManage =
    user &&
    (user.role === "Admin" || user.role === "Librarian");

  return (
    <aside className="sidebar">
      <div className="brand">
        <div>
          <strong>Community</strong>
          <small>Library</small>
        </div>
      </div>

      <div className="navigation-title">MAIN MENU</div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-btn active" : "nav-btn"
          }
        >
          Dashboard
        </NavLink>

        {canManage && (
          <>
            <NavLink
              to="/books"
              className={({ isActive }) =>
                isActive ? "nav-btn active" : "nav-btn"
              }
            >
              Books
            </NavLink>

            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                isActive ? "nav-btn active" : "nav-btn"
              }
            >
              Transactions
            </NavLink>

            <NavLink
              to="/users"
              className={({ isActive }) =>
                isActive ? "nav-btn active" : "nav-btn"
              }
            >
              User Management
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-bottom">
        {user && (
          <div className="sidebar-user">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="sidebar-user-info">
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </div>
          </div>
        )}

        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Navbar;