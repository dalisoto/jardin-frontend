/* eslint-env vitest */
import { render, screen, fireEvent } from "@testing-library/react";
import DefaultPage from "./DefaultPage";

// 🧪 Mocks de imágenes (Vite las resuelve a URLs; aquí ponemos strings sencillas)
vi.mock("../assets/img/planta1.jpg", () => ({ default: "img1.jpg" }), {
  virtual: true,
});
vi.mock("../assets/img/planta2.jpg", () => ({ default: "img2.jpg" }), {
  virtual: true,
});
vi.mock("../assets/img/planta3.jpg", () => ({ default: "img3.jpg" }), {
  virtual: true,
});

// 🧪 Mock de AuthContext
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ login: vi.fn() }),
}));

// 🧪 Mock de useNavigate
vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    useNavigate: () => vi.fn(), // evita necesidad de Router
  };
});

describe("DefaultPage (básico)", () => {
  it("muestra el título principal", () => {
    render(<DefaultPage />);
    expect(
      screen.getByText(/Bienvenido a tu Jardín Virtual/i)
    ).toBeInTheDocument();
  });

  it("abre el modal de registro y lo cierra con 'Cancelar'", () => {
    render(<DefaultPage />);

    // Abre
    fireEvent.click(screen.getByRole("button", { name: /registrarse/i }));
    expect(screen.getByText(/Registro de usuario/i)).toBeInTheDocument();

    // Cierra con botón
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(screen.queryByText(/Registro de usuario/i)).not.toBeInTheDocument();
  });

  it("abre el modal de login y lo cierra clickeando el backdrop", () => {
    render(<DefaultPage />);

    // Abre
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    expect(screen.getByText(/Inicia sesión/i)).toBeInTheDocument();

    // Clic en backdrop (div con role por defecto no está, así que buscamos por texto y subimos al contenedor)
    const modalTitle = screen.getByText(/Inicia sesión/i);
    // backdrop es el padre con onClick={cerrarModal}; subimos 2 niveles (title -> panel -> backdrop)
    const backdrop = modalTitle.parentElement?.parentElement;
    fireEvent.click(backdrop); // debería cerrar
    expect(screen.queryByText(/Inicia sesión/i)).not.toBeInTheDocument();
  });

  it("el carrusel cambia de imagen con Siguiente y Anterior", () => {
    render(<DefaultPage />);

    const img = screen.getByAltText(/Carrusel/i);
    // Estado inicial: img1.jpg
    expect(img.getAttribute("src")).toContain("img1.jpg");

    // Siguiente -> img2.jpg
    fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));
    expect(img.getAttribute("src")).toContain("img2.jpg");

    // Anterior -> regresa a img1.jpg
    fireEvent.click(screen.getByRole("button", { name: /Anterior/i }));
    expect(img.getAttribute("src")).toContain("img1.jpg");
  });
});
