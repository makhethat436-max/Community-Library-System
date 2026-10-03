import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const loggedIn =
    localStorage.getItem("loggedIn") === "true";

  const currentUser =
    JSON.parse(
      localStorage.getItem("currentUser")
    ) || null;

  if (!loggedIn || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(currentUser.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;