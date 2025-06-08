import { useState, useEffect } from "react";
import AuthContext from "./AuthContextInstance.js";
import { fetchCurrentUser } from "../components/utils";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshUser = async () => {
    try {
      const userData = await fetchCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    }
  };
  useEffect(() => {
    async function fetchUserData() {
      try {
        const userData = await fetchCurrentUser();
        setUser(userData);
        setLoading(false);
      } catch {
        setUser(null);
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
