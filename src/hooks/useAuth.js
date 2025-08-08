import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Verificar que el token no esté expirado
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          console.log("Token expirado");
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setUser(decoded);
        }
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        setUser(null);
      }
    }
  }, []);

  return { user };
}
