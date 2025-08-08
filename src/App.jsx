import { Navigate, Route, Routes } from "react-router-dom";
import DefaultPage from "./pages/DefaultPage";
import HomePage from "./pages/HomePage.jsx";
import MyPlantsPage from "./pages/MyPlantsPage.jsx";
import WateringPage from "./pages/WateringPage.jsx";

import { MainLayout } from "./layouts/MainLayout.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DefaultPage />} />
      <Route element={<MainLayout />}>
        <Route path="home" element={<HomePage />} />
        <Route path="my-plants" element={<MyPlantsPage />} />
        <Route path="watering" element={<WateringPage />} />
      </Route>
      {/* Página 404 si no existe la ruta */}
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
}
