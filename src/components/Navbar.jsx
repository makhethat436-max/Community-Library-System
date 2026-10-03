import {
  NavLink,
  useNavigate
} from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const currentUser =
    JSON.parse(
      localStorage.getItem("currentUser")
    ) || null;

  const getInitials = () => {
    if (!currentUser) {
      return "GU";
    }

    return currentUser.name
      .split(" ")
      .map((name) =>
        name.charAt(0)
      )
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const logout = () => {
    localStorage.removeItem(
      "loggedIn"
    );

    localStorage.removeItem(
      "currentUser"
    );

    navigate("/login", {
      replace: true
    });
  };

  const canManage =
    currentUser &&
    (
      currentUser.role ===
        "Admin" ||
      currentUser.role ===
        "Librarian"
    );

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          📚
        </div>

        <div>
          <strong>
            Community
          </strong>

          <small>
            Library
          </small>
        </div>
      </div>

      <div className="navigation-title">
        MAIN MENU
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? "nav-btn active"
              : "nav-btn"
          }
        >
          <span>▦</span>
          Dashboard
        </NavLink>

        {canManage && (
          <>
            <NavLink
              to="/books"
              className={({ isActive }) =>
                isActive
                  ? "nav-btn active"
                  : "nav-btn"
              }
            >
              <span>📚</span>
              Books
            </NavLink>

            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                isActive
                  ? "nav-btn active"
                  : "nav-btn"
              }
            >
              <span>↔</span>
              Transactions
            </NavLink>

            <NavLink
              to="/users"
              className={({ isActive }) =>
                isActive
                  ? "nav-btn active"
                  : "nav-btn"
              }
            >
              <span>👥</span>
              User Management
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-bottom">
        {currentUser && (
          <div className="sidebar-user">
            <div className="user-avatar">
              {getInitials()}
            </div>

            <div className="sidebar-user-info">
              <strong>
                {currentUser.name}
              </strong>

              <small>
                {currentUser.role}
              </small>
            </div>
          </div>
        )}

        <button
          type="button"
          className="logout-button"
          onClick={logout}
        >
          <span>↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Navbar;