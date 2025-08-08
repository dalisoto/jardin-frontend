/* eslint-env vitest */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import WateringPage from "./WateringPage";

const apiUrl = "http://localhost:3000";

beforeAll(() => {
  vi.stubEnv("VITE_API_URL", apiUrl);
});

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.setItem("token", "FAKE_TOKEN");
  vi.spyOn(window, "alert").mockImplementation(() => {});
  vi.spyOn(window, "confirm").mockImplementation(() => true);
  vi.spyOn(window, "prompt").mockImplementation(() => "Una nota");
});

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

const nowISO = new Date().toISOString();
const tmrwISO = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

const plantDue = {
  _id: "p1",
  nombreComun: "Aloe",
  family: "Xanthorrhoeaceae",
  nextWatering: nowISO, // due hoy
  imageUrl: "https://example.com/a.jpg",
};
const plantUpcoming = {
  _id: "p2",
  nombreComun: "Cactus",
  family: "Cactaceae",
  nextWatering: tmrwISO, // mañana
  imageUrl: "https://example.com/b.jpg",
};

describe("WateringPage", () => {
  /* it("muestra conteos y lista por defecto (hoy)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => [plantDue, plantUpcoming],
    });

    renderWithRouter(<WateringPage />);

    // Header
    expect(await screen.findByText(/Riegos y Cuidados/i)).toBeInTheDocument();
    // Conteos (Hoy: 1 · Próximos: 1)
    expect(screen.getByText(/Hoy:\s*1/i)).toBeInTheDocument();
    expect(screen.getByText(/Próximos:\s*1/i)).toBeInTheDocument();

    // Vista por defecto = "hoy" => solo Aloe
    expect(screen.getByText("Aloe")).toBeInTheDocument();
    expect(screen.queryByText("Cactus")).not.toBeInTheDocument();
  }); */

  it("cambia filtros: Próximos muestra solo próximas; Todos muestra ambas", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => [plantDue, plantUpcoming],
    });

    renderWithRouter(<WateringPage />);

    // Próximos
    await userEvent.click(await screen.findByRole("button", { name: /Próximos/i }));
    expect(screen.queryByText("Aloe")).not.toBeInTheDocument();
    expect(screen.getByText("Cactus")).toBeInTheDocument();

    // Todos
    await userEvent.click(screen.getByRole("button", { name: /Todos/i }));
    expect(screen.getByText("Aloe")).toBeInTheDocument();
    expect(screen.getByText("Cactus")).toBeInTheDocument();
  });

  it("regar desde tarjeta actualiza la planta", async () => {
    vi.spyOn(global, "fetch")
      // GET inicial
      .mockResolvedValueOnce({ ok: true, json: async () => [plantDue] })
      // POST /water
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ plant: { ...plantDue, nombreComun: "Aloe Regada" } }),
      });

    renderWithRouter(<WateringPage />);

    const btnWater = await screen.findByTitle("Regar");
    await userEvent.click(btnWater);

    expect(await screen.findByText("Aloe Regada")).toBeInTheDocument();
  });

  /* it("fertilizar desde tarjeta actualiza la planta", async () => {
    vi.spyOn(global, "fetch")
      // GET inicial
      .mockResolvedValueOnce({ ok: true, json: async () => [plantUpcoming] })
      // POST /fertilize
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ plant: { ...plantUpcoming, nombreComun: "Cactus Fertilizado" } }),
      });

    renderWithRouter(<WateringPage />);

    const btnFert = await screen.findByTitle("Fertilizar");
    await userEvent.click(btnFert);

    expect(await screen.findByText("Cactus Fertilizado")).toBeInTheDocument();
  }); */

  it("agregar nota desde tarjeta hace POST y refresca la lista", async () => {
    const fetchMock = vi.spyOn(global, "fetch")
      // GET inicial
      .mockResolvedValueOnce({ ok: true, json: async () => [plantDue] })
      // POST /notes
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
      // GET después de refresh
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ ...plantDue, nombreComun: "Aloe (con nota)" }],
      });

    renderWithRouter(<WateringPage />);

    const btnNote = await screen.findByTitle("Agregar nota");
    await userEvent.click(btnNote);

    expect(window.prompt).toHaveBeenCalled();
    expect(await screen.findByText("Aloe (con nota)")).toBeInTheDocument();

    // Verifica que el POST haya ido a /notes
    const [, postCall] = fetchMock.mock.calls;
    expect(postCall[0]).toMatch(/\/api\/plants\/p1\/notes$/);
    expect(postCall[1].method).toBe("POST");
  });

  it("Regar todas (hoy) hace POST por cada due y luego refresca", async () => {
    const fetchMock = vi.spyOn(global, "fetch")
      // GET inicial: 2 plantas, 1 due (Aloe) + 1 próxima
      .mockResolvedValueOnce({ ok: true, json: async () => [plantDue, plantUpcoming] })
      // POST /p1/water (solo la due)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
      // GET refresh
      .mockResolvedValueOnce({ ok: true, json: async () => [plantUpcoming] });

    renderWithRouter(<WateringPage />);

    await userEvent.click(await screen.findByRole("button", { name: /Regar todas \(hoy\)/i }));

    // Debe llamar al endpoint de riego de p1
    const [, postCall] = fetchMock.mock.calls;
    expect(postCall[0]).toBe(`${apiUrl}/api/plants/p1/water`);
    expect(window.alert).toHaveBeenCalled(); // mensaje final de éxito
  });

  it("abre el modal de detalles y se puede cerrar", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => [plantDue],
    });

    renderWithRouter(<WateringPage />);

    const btnDetail = await screen.findByTitle("Ver detalles");
    await userEvent.click(btnDetail);

    expect(await screen.findByText(/Historial de cuidados/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Cerrar/i }));
    expect(screen.queryByText(/Historial de cuidados/i)).not.toBeInTheDocument();
  });
});
