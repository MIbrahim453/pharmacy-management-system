import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard based on their role
    const defaultPath =
      user.role === "super"
        ? "/super-admin/dashboard"
        : user.role === "admin"
        ? "/admin/dashboard"
        : "/staff/billing";
    return <Navigate to={defaultPath} replace />;
  }

  return children;
}
