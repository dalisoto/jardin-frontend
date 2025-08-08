// src/layouts/MainLayout.tsx
import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export function MainLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando sesión...</div>; // Puedes poner un spinner bonito de MUI aquí
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}
