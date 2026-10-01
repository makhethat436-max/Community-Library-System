import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function Layout() {
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
      .map((name) => name.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>Community Library</h2>

            <p>
              Welcome,{" "}
              <strong>
                {currentUser
                  ? currentUser.name
                  : "Guest User"}
              </strong>
            </p>
          </div>

          <div className="top-user">
            <div className="user-badge">
              {getInitials()}
            </div>

            {currentUser && (
              <div className="top-user-info">
                <strong>
                  {currentUser.name}
                </strong>

                <small>
                  {currentUser.role}
                </small>
              </div>
            )}
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;