import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/listings" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
