// src/pages/HomePage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import NewPlantModal from "../components/NewPlantModal";

const apiUrl = import.meta.env.VITE_API_URL;

// ---------- Helpers ----------
const token = () => localStorage.getItem("token");

const isDue = (isoDate) => (isoDate ? new Date(isoDate) <= new Date() : false);
const formatDateShort = (iso) =>
  iso ? new Date(iso).toLocaleDateString() : "—";
const ErrorText = ({ msg }) =>
  msg ? <p className="text-red-600 text-sm -mt-1">{msg}</p> : null;

export default function HomePage() {
  // ----------------------- Estado -----------------------
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Modal nueva planta
  const [modalOpen, setModalOpen] = useState(false);
  const abrirModal = () => setModalOpen(true);

  // React Hook Form

  // ----------------------- Cargar plantas -----------------------
  const fetchPlants = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await fetch(`${apiUrl}/api/plants`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPlants(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErr("No se pudieron cargar tus plantas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  // ----------------------- Derivados -----------------------
  const plantCount = useMemo(() => plants.length, [plants]);
  const wateringCount = useMemo(
    () => plants.filter((p) => isDue(p.nextWatering)).length,
    [plants]
  );

  // ----------------------- Submit form -----------------------

  // ----------------------- Acciones por planta -----------------------
  const waterPlant = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/api/plants/${id}/water`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || "Error al regar");
      if (data.plant) {
        setPlants((prev) =>
          prev.map((p) => (p._id === id ? { ...p, ...data.plant } : p))
        );
      } else {
        fetchPlants();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const fertilizePlant = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/api/plants/${id}/fertilize`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || "Error al fertilizar");
      if (data.plant) {
        setPlants((prev) =>
          prev.map((p) => (p._id === id ? { ...p, ...data.plant } : p))
        );
      } else {
        fetchPlants();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const addNote = async (id) => {
    const text = prompt("Escribe una nota para esta planta:");
    if (!text) return;
    try {
      const res = await fetch(`${apiUrl}/api/plants/${id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || "No se pudo agregar la nota");
      fetchPlants();
    } catch (e) {
      alert(e.message);
    }
  };

  // ----------------------- Render -----------------------
  return (
    <div className="p-6 w-full">
      {/* Hero */}
      <section className="bg-emerald-50 p-8 rounded-lg mb-6 text-center">
        <h1 className="text-3xl font-semibold text-emerald-900">
          Bienvenido al Jardín Virtual
        </h1>
        <p className="text-slate-700 mt-1">
          Tu aplicación preferida para el cuidado de plantas
        </p>
      </section>

      {/* Barra de acciones */}
      <div className="flex items-center justify-between gap-4">
        <button
          className="bg-emerald-700 text-white hover:bg-emerald-800 px-4 py-2 rounded-md min-w-[180px]"
          onClick={abrirModal}
        >
          ＋ Agregar Nueva Planta
        </button>

        <div className="flex gap-4 text-emerald-900">
          <span>🌱 {plantCount} plantas</span>
          <span>💧 {wateringCount} por regar hoy</span>
        </div>
      </div>

      {/* Listado/Tarjetas */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tus Plantas</h2>
          <Link to="/my-plants" className="text-emerald-700 hover:underline">
            Ver todas
          </Link>
        </div>

        {loading && <p className="mt-2">Cargando...</p>}
        {err && <p className="mt-2 text-red-600">{err}</p>}

        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] mt-4">
          {!loading &&
            plants.map((plant) => {
              const due = isDue(plant.nextWatering);
              return (
                <div
                  key={plant._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
                >
                  <img
                    src={plant.imageUrl || "/img/placeholder.jpg"}
                    alt={plant.nombreComun}
                    className="w-full h-52 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">
                      {plant.nombreComun}
                    </h3>
                    <p className="text-slate-600">{plant.family || "—"}</p>

                    <div className="mt-3 flex flex-col gap-2">
                      <span
                        className={`text-sm ${
                          due ? "text-red-500 font-semibold" : "text-sky-600"
                        }`}
                        title={due ? "Toca regar" : "Próximo riego"}
                      >
                        💧{" "}
                        {due
                          ? "¡Regar hoy!"
                          : `Próximo: ${formatDateShort(plant.nextWatering)}`}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1 rounded-md border text-sm"
                          title="Regar"
                          onClick={() => waterPlant(plant._id)}
                        >
                          💧
                        </button>
                        <button
                          className="px-3 py-1 rounded-md border text-sm"
                          title="Fertilizar"
                          onClick={() => fertilizePlant(plant._id)}
                        >
                          🌿
                        </button>
                        <button
                          className="px-3 py-1 rounded-md border text-sm"
                          title="Agregar nota"
                          onClick={() => addNote(plant._id)}
                        >
                          ✏️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* Acciones rápidas */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Acciones Rápidas</h2>
        <div className="flex flex-wrap gap-3 mt-3">
          <button
            className="bg-emerald-700 text-white hover:bg-emerald-800 px-4 py-2 rounded-md min-w-[180px]"
            onClick={() => alert("Elige una planta y pulsa 💧 en su tarjeta.")}
          >
            💧 Registrar Riego
          </button>
          <button
            className="bg-emerald-700 text-white hover:bg-emerald-800 px-4 py-2 rounded-md min-w-[180px]"
            onClick={() =>
              alert("Elige una planta y pulsa ✏️ para agregar nota.")
            }
          >
            ✏️ Agregar Nota
          </button>
        </div>
      </section>

      <NewPlantModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={(plant) => setPlants((prev) => [plant, ...prev])}
      />
      {/* Modal Nueva Planta (Tailwind) */}
      {/* {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-start md:items-center justify-center p-4"
          onClick={cerrarModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 text-emerald-950"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Nueva planta
            </h2>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 gap-3"
            >
              <div>
                <label className="block text-sm font-medium">
                  Nombre común
                </label>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  {...register("nombre")}
                />
                <ErrorText msg={errors.nombre?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Familia botánica
                </label>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  {...register("familia")}
                />
                <ErrorText msg={errors.familia?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Nivel cuidados
                </label>
                <select
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  defaultValue=""
                  {...register("cuidado")}
                >
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  <option value="facil">Fácil</option>
                  <option value="moderado">Moderado</option>
                  <option value="dificil">Difícil</option>
                </select>
                <ErrorText msg={errors.cuidado?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Riego (cada N días)
                </label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  min={0}
                  {...register("riego")}
                />
                <ErrorText msg={errors.riego?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Cantidad de agua (ml)
                </label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  min={0}
                  {...register("cantidad")}
                />
                <ErrorText msg={errors.cantidad?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium">Iluminación</label>
                <select
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  defaultValue=""
                  {...register("iluminacion")}
                >
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  <option value="directa">Directa</option>
                  <option value="indirecta">Indirecta</option>
                </select>
                <ErrorText msg={errors.iluminacion?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium">Temperatura</label>
                <select
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  {...register("temperatura")}
                >
                  <option value="calido">Cálido</option>
                  <option value="frio">Frío</option>
                </select>
                <ErrorText msg={errors.temperatura?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium">Humedad</label>
                <select
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  defaultValue=""
                  {...register("humedad")}
                >
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
                <ErrorText msg={errors.humedad?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium">Suelo</label>
                <select
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  defaultValue=""
                  {...register("suelo")}
                >
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  <option value="drenado">Drenado</option>
                  <option value="arcilloso">Arcilloso</option>
                  <option value="compacto">Compacto</option>
                </select>
                <ErrorText msg={errors.suelo?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium">Propagación</label>
                <select
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  defaultValue=""
                  {...register("propagacion")}
                >
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  <option value="esqueje">Esqueje</option>
                  <option value="semilla">Semilla</option>
                </select>
                <ErrorText msg={errors.propagacion?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium">¿Es tóxica?</label>
                <div className="mt-2 flex gap-6">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" value="si" {...register("toxica")} />
                    <span>Sí</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" value="no" {...register("toxica")} />
                    <span>No</span>
                  </label>
                </div>
                <ErrorText msg={errors.toxica?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  URL de imagen
                </label>
                <input
                  type="url"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  placeholder="https://..."
                  {...register("imageUrl")}
                />
                <ErrorText msg={errors.imageUrl?.message} />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full max-h-56 object-cover rounded-md mt-2 shadow"
                  />
                )}
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-md px-4 py-2 border"
                  onClick={() => {
                    cerrarModal();
                    reset();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md px-4 py-2 bg-emerald-700 text-white disabled:opacity-60"
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}
    </div>
  );
}
