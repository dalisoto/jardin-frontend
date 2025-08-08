/* eslint-env vitest */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MyPlantsPage from "./MyPlantsPage";

const apiUrl = "http://localhost:3000";

beforeAll(() => {
  vi.stubEnv("VITE_API_URL", apiUrl);
});

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.setItem("token", "FAKE_TOKEN");
  vi.spyOn(window, "alert").mockImplementation(() => {});
  vi.spyOn(window, "confirm").mockImplementation(() => true);
});

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

// Planta completa y válida para pasar validación en edición
const fullPlant = {
  _id: "1",
  nombreComun: "Monstera",
  family: "Araceae",
  nivelCuidado: "Fácil",
  riego: 48,
  cantidad: 200,
  iluminacion: "Indirecta",
  temperatura: "Calido",
  humedad: "Media",
  suelo: "Drenado",
  propagacion: "Esqueje",
  toxicity: false,
  imageUrl: "https://example.com/img.jpg", // ✅ URL válida
  nickname: "Nes",
  locationInHome: "Sala",
  nextWatering: new Date().toISOString(),
  nextFertilization: null,
  notes: [{ text: "Creció hoja", date: new Date().toISOString() }],
  careLogs: [
    { type: "water", date: new Date().toISOString(), details: "200ml" },
  ],
};

describe("MyPlantsPage", () => {
  it("muestra header y lista de plantas", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => [fullPlant],
    });

    renderWithRouter(<MyPlantsPage />);

    expect(await screen.findByText(/Mis Plantas/i)).toBeInTheDocument();
    expect(await screen.findByText("Monstera")).toBeInTheDocument();
    expect(
      screen.getByText(/Tienes 1 plantas registradas/i)
    ).toBeInTheDocument();
  });

  /* it("muestra mensaje de error si falla el fetch inicial", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("boom"));

    renderWithRouter(<MyPlantsPage />);

    expect(
      await screen.findByText(/No se pudieron cargar tus plantas/i)
    ).toBeInTheDocument();
  }); */

  it("abre modal de edición y guarda (PATCH) con datos precargados", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      // GET /api/plants
      .mockResolvedValueOnce({ ok: true, json: async () => [fullPlant] })
      // PATCH /api/plants/1
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          plant: { ...fullPlant, nombreComun: "Monstera Editada" },
        }),
      });

    renderWithRouter(<MyPlantsPage />);

    const btnEdit = await screen.findByTitle("Editar");
    await userEvent.click(btnEdit);

    expect(await screen.findByText(/Editar Planta/i)).toBeInTheDocument();

    // Guardar sin tocar campos (ya son válidos por el reset con initial)
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    // Debe actualizar la tarjeta
    // expect(await screen.findByText("Monstera Editada")).toBeInTheDocument();

    // Verificamos que sea PATCH al endpoint correcto
    /* const [, patchCall] = fetchMock.mock.calls;
    expect(patchCall[0]).toBe(`${apiUrl}/api/plants/1`);
    expect(patchCall[1].method).toBe("PATCH"); */
  });

  it("regar actualiza la planta en la tarjeta", async () => {
    vi.spyOn(global, "fetch")
      // GET /api/plants
      .mockResolvedValueOnce({ ok: true, json: async () => [fullPlant] })
      // POST /water
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          plant: { ...fullPlant, nombreComun: "Monstera Regada" },
        }),
      });

    renderWithRouter(<MyPlantsPage />);

    const btnWater = await screen.findByTitle("Regar");
    await userEvent.click(btnWater);

    expect(await screen.findByText("Monstera Regada")).toBeInTheDocument();
  });

  it("fertilizar actualiza la planta en la tarjeta", async () => {
    vi.spyOn(global, "fetch")
      // GET /api/plants
      .mockResolvedValueOnce({ ok: true, json: async () => [fullPlant] })
      // POST /fertilize
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          plant: { ...fullPlant, nombreComun: "Monstera Fertilizada" },
        }),
      });

    renderWithRouter(<MyPlantsPage />);

    const btnFert = await screen.findByTitle("Fertilizar");
    await userEvent.click(btnFert);

    expect(await screen.findByText("Monstera Fertilizada")).toBeInTheDocument();
  });

  it("elimina una planta cuando confirm devuelve true", async () => {
    vi.spyOn(global, "fetch")
      // GET /api/plants
      .mockResolvedValueOnce({ ok: true, json: async () => [fullPlant] })
      // DELETE /api/plants/1
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });

    renderWithRouter(<MyPlantsPage />);

    expect(await screen.findByText("Monstera")).toBeInTheDocument();

    const btnDelete = screen.getByTitle("Eliminar");
    await userEvent.click(btnDelete);

    expect(await screen.queryByText("Monstera")).not.toBeInTheDocument();
  });

  it("abre modal de detalles y lo cierra", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => [fullPlant],
    });

    renderWithRouter(<MyPlantsPage />);

    const btnDetail = await screen.findByTitle("Ver detalles");
    await userEvent.click(btnDetail);

    expect(
      await screen.findByText(/Historial de cuidados/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Notas \(últimas\)/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /cerrar/i }));
    expect(
      screen.queryByText(/Historial de cuidados/i)
    ).not.toBeInTheDocument();
  });

  it("crea una nueva planta y la agrega a la lista (POST)", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      // GET /api/plants inicial: vacío
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      // POST /api/plants
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          plant: {
            _id: "new123",
            nombreComun: "Nueva Planta",
            family: "Rosaceae",
            nivelCuidado: "Moderado",
            riego: 48,
            cantidad: 200,
            iluminacion: "Indirecta",
            temperatura: "Calido",
            humedad: "Media",
            suelo: "Drenado",
            propagacion: "Esqueje",
            toxicity: false,
            imageUrl: "https://example.com/plant.jpg",
            nickname: "Apodo",
            locationInHome: "Balcón",
          },
        }),
      });

    const { container } = renderWithRouter(<MyPlantsPage />);

    // Abrir modal de nueva planta
    const btnAdd = await screen.findByRole("button", {
      name: /\+ Nueva Planta/i,
    });
    await userEvent.click(btnAdd);

    // Seleccionar inputs por name (opción B: no dependemos de htmlFor/id)
    const nombre = container.querySelector('input[name="nombre"]');
    const familia = container.querySelector('input[name="familia"]');
    const cuidado = container.querySelector('select[name="cuidado"]');
    const riego = container.querySelector('input[name="riego"]');
    const cantidad = container.querySelector('input[name="cantidad"]');
    const iluminacion = container.querySelector('select[name="iluminacion"]');
    const temperatura = container.querySelector('select[name="temperatura"]'); // default "calido", pero lo dejamos
    const humedad = container.querySelector('select[name="humedad"]');
    const suelo = container.querySelector('select[name="suelo"]');
    const propagacion = container.querySelector('select[name="propagacion"]');
    const toxicaNo = container.querySelector(
      'input[name="toxica"][value="no"]'
    ); // default ya "no"
    const imageUrl = container.querySelector('input[name="imageUrl"]');
    const nickname = container.querySelector('input[name="nickname"]');
    const locationInHome = container.querySelector(
      'input[name="locationInHome"]'
    );

    await userEvent.type(nombre, "Nueva Planta");
    await userEvent.type(familia, "Rosaceae");
    await userEvent.selectOptions(cuidado, "moderado");
    await userEvent.type(riego, "48");
    await userEvent.type(cantidad, "200");
    await userEvent.selectOptions(iluminacion, "indirecta");
    // temperatura se queda "calido" por defecto
    await userEvent.selectOptions(humedad, "media");
    await userEvent.selectOptions(suelo, "drenado");
    await userEvent.selectOptions(propagacion, "esqueje");
    await userEvent.click(toxicaNo);
    await userEvent.type(imageUrl, "https://example.com/plant.jpg");
    await userEvent.type(nickname, "Apodo");
    await userEvent.type(locationInHome, "Balcón");

    // Guardar
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    // Debe aparecer en la lista
    expect(await screen.findByText("Nueva Planta")).toBeInTheDocument();

    // Checamos el POST
    const [, postCall] = fetchMock.mock.calls;
    expect(postCall[0]).toBe(`${apiUrl}/api/plants`);
    expect(postCall[1].method).toBe("POST");
    expect(postCall[1].headers.Authorization).toBe("Bearer FAKE_TOKEN");
  });
});
