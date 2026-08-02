import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../auth";

// Enveloppe une page pour exiger un token valide en localStorage.
// Si absent, redirige vers la page de connexion stagiaire.
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
