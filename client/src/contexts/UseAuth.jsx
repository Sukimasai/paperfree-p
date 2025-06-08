import { useContext } from "react";
import AuthContext from "./AuthContextInstance.js";

export default function useAuth() {
  return useContext(AuthContext);
}
