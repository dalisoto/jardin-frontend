import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth(); // asume { nombre, correo } y logout()
  const location = useLocation();
  console.log(user);
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">🌿 Jardín Virtual</div>

      <div className="navbar-links">
        <Link to="/home" className={isActive("/home") ? "active" : ""}>
          Inicio
        </Link>

        <Link
          to="/my-plants"
          className={isActive("/my-plants") ? "active" : ""}
        >
          Mis Plantas
        </Link>

        <Link to="/watering" className={isActive("/watering") ? "active" : ""}>
          Riegos
        </Link>
      </div>

      <div className="user-profile">
        {user ? `Hola, ${user?.email ?? "Usuario"}` : ""}
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded ml-3"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
