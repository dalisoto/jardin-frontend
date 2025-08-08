/* eslint-env vitest */
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

let NewPlantModal;
beforeAll(async () => {
  vi.stubEnv("VITE_API_URL", "http://api.test");
  NewPlantModal = (await import("./NewPlantModal.jsx")).default;
});

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("NewPlantModal (básico)", () => {
  it("no renderiza cuando open=false", () => {
    render(<NewPlantModal open={false} onClose={() => {}} />);
    expect(screen.queryByText(/Nueva planta/i)).not.toBeInTheDocument();
  });

  it("renderiza cuando open=true y muestra el título", () => {
    render(<NewPlantModal open={true} onClose={() => {}} />);
    expect(screen.getByText(/Nueva planta/i)).toBeInTheDocument();
  });

  it("muestra errores de validación si se envía vacío", async () => {
    render(<NewPlantModal open={true} onClose={() => {}} />);
    const btnGuardar = screen.getByRole("button", { name: /guardar/i });
    await userEvent.click(btnGuardar);

    // Verificamos un par de mensajes clave
    expect(
      await screen.findByText("El nombre debe tener al menos 2 caracteres")
    ).toBeInTheDocument();
    expect(
      screen.getByText("La familia debe tener al menos 2 caracteres")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Debe ser una URL válida/)
    ).toBeInTheDocument();
  });

  it("en submit válido hace fetch y llama onSaved + onClose", async () => {
    localStorage.setItem("token", "FAKE_TOKEN");

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({ plant: { _id: "1", nombreComun: "Rosa" } }),
      });

    const onClose = vi.fn();
    const onSaved = vi.fn();

    const { container } = render(
      <NewPlantModal open={true} onClose={onClose} onSaved={onSaved} />
    );

    // Seleccionar campos por name
    const nombre = container.querySelector('input[name="nombre"]');
    const familia = container.querySelector('input[name="familia"]');
    const cuidado = container.querySelector('select[name="cuidado"]');
    const riego = container.querySelector('input[name="riego"]');
    const cantidad = container.querySelector('input[name="cantidad"]');
    const iluminacion = container.querySelector('select[name="iluminacion"]');
    const humedad = container.querySelector('select[name="humedad"]');
    const suelo = container.querySelector('select[name="suelo"]');
    const propagacion = container.querySelector('select[name="propagacion"]');
    const toxicaNo = container.querySelector('input[name="toxica"][value="no"]');
    const imageUrl = container.querySelector('input[name="imageUrl"]');
    const locationInHome = container.querySelector('input[name="locationInHome"]');

    // Rellenar campos
    await userEvent.type(nombre, "Rosa");
    await userEvent.type(familia, "Rosaceae");
    await userEvent.selectOptions(cuidado, "moderado");
    await userEvent.type(riego, "48");
    await userEvent.type(cantidad, "200");
    await userEvent.selectOptions(iluminacion, "indirecta");
    await userEvent.selectOptions(humedad, "media");
    await userEvent.selectOptions(suelo, "drenado");
    await userEvent.selectOptions(propagacion, "esqueje");
    await userEvent.click(toxicaNo);
    await userEvent.type(imageUrl, "https://example.com/img.jpg");
    await userEvent.type(locationInHome, "Balcón");

    // Guardar
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOpts] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe("http://api.test/api/plants");
    expect(calledOpts.method).toBe("POST");
    expect(calledOpts.headers.Authorization).toBe("Bearer FAKE_TOKEN");

    expect(onSaved).toHaveBeenCalledWith({ _id: "1", nombreComun: "Rosa" });
    expect(onClose).toHaveBeenCalled();
  });

  it("cierra al presionar 'Cancelar'", async () => {
    const onClose = vi.fn();
    render(<NewPlantModal open={true} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
