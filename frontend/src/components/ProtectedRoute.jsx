
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const loggedIn =
    localStorage.getItem("loggedIn") === "true";

  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("currentUser")
    );
  } catch (error) {
    currentUser = null;
  }

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
