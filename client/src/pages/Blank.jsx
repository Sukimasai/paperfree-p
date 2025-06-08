import { Navigate } from "react-router-dom";
import useAuth from "../contexts/UseAuth";

export default function Blank() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  return user ? (
    <Navigate to="/home" replace />
  ) : (
    <Navigate to="/landing" replace />
  );
}
