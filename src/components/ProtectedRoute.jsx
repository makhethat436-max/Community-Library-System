import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const loggedIn =
    localStorage.getItem("loggedIn") === "true";

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;