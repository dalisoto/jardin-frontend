/* eslint-env vitest */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";

// Mock del modal para no renderizar su formulario
vi.mock("../components/NewPlantModal", () => ({
  default: ({ open, onClose, onSaved }) =>
    open ? (
      <div data-testid="mock-modal">
        <button onClick={() => onSaved({ _id: "new1", nombreComun: "Nueva", family: "Fam" })}>
          Guardar Planta
        </button>
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
}));

const apiUrl = "http://api.test";

beforeAll(() => {
  vi.stubEnv("VITE_API_URL", apiUrl);
});

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.setItem("token", "FAKE_TOKEN");
  // mock de alert para no explotar en tests
  vi.spyOn(window, "alert").mockImplementation(() => {});
});

const renderWithRouter = (ui) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("HomePage", () => {
  it("muestra título y plantas cargadas", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { _id: "1", nombreComun: "Rosa", family: "Rosaceae", imageUrl: "img.jpg" },
      ],
    });

    renderWithRouter(<HomePage />);

    expect(screen.getByText(/Bienvenido al Jardín Virtual/i)).toBeInTheDocument();
    expect(await screen.findByText("Rosa")).toBeInTheDocument();
    expect(screen.getByText(/🌱 1 plantas/)).toBeInTheDocument();
  });

  /* it("muestra mensaje de error si fetch falla", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Fail"));

    renderWithRouter(<HomePage />);

    expect(await screen.findByText(/No se pudieron cargar tus plantas/i)).toBeInTheDocument();
  }); */

  it("abre el modal de nueva planta y añade planta con onSaved", async () => {
    // fetch inicial: sin plantas
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<HomePage />);

    const btnAdd = screen.getByRole("button", { name: /agregar nueva planta/i });
    await userEvent.click(btnAdd);

    // Modal mock visible
    expect(screen.getByTestId("mock-modal")).toBeInTheDocument();

    // Guardar en el modal
    await userEvent.click(screen.getByText(/Guardar Planta/i));

    // La nueva planta aparece en la lista
    expect(await screen.findByText("Nueva")).toBeInTheDocument();
  });

  it("ejecuta waterPlant y actualiza planta", async () => {
    vi.spyOn(global, "fetch")
      // fetchPlants inicial
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { _id: "1", nombreComun: "Rosa", nextWatering: new Date().toISOString() },
        ],
      })
      // POST /water
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ plant: { _id: "1", nombreComun: "Rosa Regada" } }),
      });

    renderWithRouter(<HomePage />);

    const btnWater = await screen.findByTitle("Regar");
    await userEvent.click(btnWater);

    expect(await screen.findByText("Rosa Regada")).toBeInTheDocument();
  });

  it("ejecuta fertilizePlant y actualiza planta", async () => {
    vi.spyOn(global, "fetch")
      // fetchPlants inicial
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { _id: "1", nombreComun: "Rosa", nextWatering: null },
        ],
      })
      // POST /fertilize
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ plant: { _id: "1", nombreComun: "Rosa Fertilizada" } }),
      });

    renderWithRouter(<HomePage />);

    const btnFertilize = await screen.findByTitle("Fertilizar");
    await userEvent.click(btnFertilize);

    expect(await screen.findByText("Rosa Fertilizada")).toBeInTheDocument();
  });
});