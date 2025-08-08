// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  //   const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token); // Guardamos el token en el estado
    if (token) {
      try {
        const decoded = jwtDecode(token);

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
        localStorage.removeItem("token");
      }
    }
    setLoading(false); // Terminamos de intentar cargar
  }, []);

  const login = (token) => {
    // Guardamos el token en el localStorage
    localStorage.setItem("token", token);

    // Decodificamos el token y actualizamos el estado
    const decoded = jwtDecode(token);
    setUser(decoded);

    // Redirigimos a la página principal o donde quieras
    // navigate("/material");
  };

  const logout = () => {
    // Eliminar el token del localStorage
    localStorage.removeItem("token");

    // Limpiar el estado de usuario
    setUser(null);

    // Redirigir a la página de login
    // navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, token }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usarlo más fácil
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
