// src/pages/MyPlantsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const apiUrl = import.meta.env.VITE_API_URL;

// ---------- Helpers ----------
const mapEnum = (v) => {
  if (!v) return v;
  const M = {
    facil: "Fácil",
    moderado: "Moderado",
    dificil: "Dificil",
    frio: "Frio",
    calido: "Calido",
    indirecta: "Indirecta",
    directa: "Directa",
    alta: "Alta",
    media: "Media",
    baja: "Baja",
    drenado: "Drenado",
    arcilloso: "Arcilloso",
    compacto: "Compacto",
    esqueje: "Esqueje",
    semilla: "Semilla",
  };
  return M[v] ?? v.charAt(0).toUpperCase() + v.slice(1);
};
const token = () => localStorage.getItem("token");
const isDue = (d) => (d ? new Date(d) <= new Date() : false);
const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "—");
const ErrorText = ({ msg }) =>
  msg ? <p className="text-red-600 text-sm mt-1">{msg}</p> : null;

// ---------- Zod schema del formulario de plantas ----------

const plantSchema = z.object({
  nombre: z
    .string({ required_error: "El nombre común es obligatorio" })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres"),

  familia: z
    .string({ required_error: "La familia es obligatoria" })
    .trim()
    .min(2, "La familia debe tener al menos 2 caracteres"),

  cuidado: z.enum(["facil", "moderado", "dificil"], {
    required_error: "Debes seleccionar el nivel de cuidado",
    message: "El nivel de cuidado debe ser Fácil, Moderado o Difícil",
  }),

  riego: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" ? undefined : Number(v)))
    .refine((v) => v !== undefined && !Number.isNaN(v) && v >= 0, {
      message: "El riego debe ser un número mayor o igual a 0 (en días)",
    }),

  cantidad: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" ? undefined : Number(v)))
    .refine((v) => v !== undefined && !Number.isNaN(v) && v >= 0, {
      message: "La cantidad debe ser un número mayor o igual a 0 (en ml)",
    }),

  iluminacion: z.enum(["directa", "indirecta"], {
    required_error: "Debes seleccionar el tipo de iluminación",
    message: "La iluminación debe ser Directa o Indirecta",
  }),

  temperatura: z.enum(["calido", "frio"], {
    required_error: "Debes seleccionar la temperatura",
    message: "La temperatura debe ser Cálido o Frío",
  }),

  humedad: z.enum(["alta", "media", "baja"], {
    required_error: "Debes seleccionar el nivel de humedad",
    message: "La humedad debe ser Alta, Media o Baja",
  }),

  suelo: z.enum(["drenado", "arcilloso", "compacto"], {
    required_error: "Debes seleccionar el tipo de suelo",
    message: "El suelo debe ser Drenado, Arcilloso o Compacto",
  }),

  propagacion: z.enum(["esqueje", "semilla"], {
    required_error: "Debes seleccionar el método de propagación",
    message: "La propagación debe ser por Esqueje o Semilla",
  }),

  toxica: z.enum(["si", "no"], {
    required_error: "Debes indicar si la planta es tóxica",
    message: "El valor debe ser Sí o No",
  }),

  imageUrl: z
    .string({ required_error: "La URL de la imagen es obligatoria" })
    .trim()
    .url("Debe ser una URL válida que comience con http:// o https://"),

  nickname: z.string().trim().optional().or(z.literal("")), // opcional y permite cadena vacía

  locationInHome: z
    .string({ required_error: "La ubicación en la casa es obligatoria" })
    .trim()
    .min(2, "La ubicación debe tener al menos 2 caracteres"),
});

// --------------------------- Modales base ---------------------------
function Modal({ open, onClose, children, className = "" }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full max-w-3xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// --------------------------- Formulario Crear/Editar (RHF + Zod) ---------------------------
function PlantFormModal({ open, onClose, onSaved, initial }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      nombre: "",
      familia: "",
      cuidado: "",
      riego: "",
      cantidad: "",
      iluminacion: "",
      temperatura: "calido",
      humedad: "",
      suelo: "",
      propagacion: "",
      toxica: "no",
      imageUrl: "",
      nickname: "",
      locationInHome: "",
    },
  });

  // Al abrir en modo edición, precarga valores
  useEffect(() => {
    if (open) {
      if (initial) {
        reset({
          nombre: initial.nombreComun || "",
          familia: initial.family || "",
          cuidado: (initial.nivelCuidado || "").toLowerCase(),
          riego:
            initial.riego === 0 || initial.riego ? String(initial.riego) : "",
          cantidad:
            initial.cantidad === 0 || initial.cantidad
              ? String(initial.cantidad)
              : "",
          iluminacion: (initial.iluminacion || "").toLowerCase(),
          temperatura: (initial.temperatura || "calido").toLowerCase(),
          humedad: (initial.humedad || "").toLowerCase(),
          suelo: (initial.suelo || "").toLowerCase(),
          propagacion: (initial.propagacion || "").toLowerCase(),
          toxica: initial.toxicity ? "si" : "no",
          imageUrl: initial.imageUrl || "",
          nickname: initial.nickname || "",
          locationInHome: initial.locationInHome || "",
        });
      } else {
        reset({
          nombre: "",
          familia: "",
          cuidado: "",
          riego: "",
          cantidad: "",
          iluminacion: "",
          temperatura: "calido",
          humedad: "",
          suelo: "",
          propagacion: "",
          toxica: "no",
          imageUrl: "",
          nickname: "",
          locationInHome: "",
        });
      }
    }
  }, [open, initial, reset]);

  const onSubmit = async (data) => {
    // mapear al backend
    const body = {
      nombreComun: data.nombre,
      family: data.familia || undefined,
      nivelCuidado: mapEnum(data.cuidado),
      riego: data.riego ?? undefined,
      cantidad: data.cantidad ?? undefined,
      iluminacion: mapEnum(data.iluminacion),
      temperatura: mapEnum(data.temperatura || "calido"),
      humedad: mapEnum(data.humedad),
      suelo: mapEnum(data.suelo),
      propagacion: mapEnum(data.propagacion),
      toxicity: data.toxica === "si",
      imageUrl: data.imageUrl || undefined,
      nickname: data.nickname || undefined,
      locationInHome: data.locationInHome || undefined,
    };

    const isEdit = Boolean(initial?._id);
    const url = isEdit
      ? `${apiUrl}/api/plants/${initial._id}`
      : `${apiUrl}/api/plants`;
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify(body),
    });
    const resp = await res.json();
    if (!res.ok) {
      alert(resp?.error || "Error guardando la planta");
      return;
    }
    onSaved(resp.plant);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {initial ? "Editar Planta" : "Nueva Planta"}
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium">Nombre común</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              {...register("nombre")}
            />
            <ErrorText msg={errors.nombre?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium">Familia</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              {...register("familia")}
            />
            <ErrorText msg={errors.familia?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium">Nivel cuidado</label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              {...register("cuidado")}
              defaultValue=""
            >
              <option value="" disabled>
                Selecciona
              </option>
              <option value="facil">Fácil</option>
              <option value="moderado">Moderado</option>
              <option value="dificil">Difícil</option>
            </select>
            <ErrorText msg={errors.cuidado?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Riego (cada hrs's)
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border px-3 py-2"
              {...register("riego")}
              min={0}
            />
            <ErrorText msg={errors.riego?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium">Cantidad (ml)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border px-3 py-2"
              {...register("cantidad")}
              min={0}
            />
            <ErrorText msg={errors.cantidad?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium">Iluminación</label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              {...register("iluminacion")}
              defaultValue=""
            >
              <option value="" disabled>
                Selecciona
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
              {...register("humedad")}
              defaultValue=""
            >
              <option value="" disabled>
                Selecciona
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
              {...register("suelo")}
              defaultValue=""
            >
              <option value="" disabled>
                Selecciona
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
              {...register("propagacion")}
              defaultValue=""
            >
              <option value="" disabled>
                Selecciona
              </option>
              <option value="esqueje">Esqueje</option>
              <option value="semilla">Semilla</option>
            </select>
            <ErrorText msg={errors.propagacion?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium">¿Es tóxica?</label>
            <div className="mt-2 flex gap-4">
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
            <label className="block text-sm font-medium">URL de imagen</label>
            <input
              type="url"
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="https://..."
              {...register("imageUrl")}
            />
            <ErrorText msg={errors.imageUrl?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Apodo (opcional)
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              {...register("nickname")}
            />
            <ErrorText msg={errors.nickname?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Ubicación en casa
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              {...register("locationInHome")}
            />
            <ErrorText msg={errors.locationInHome?.message} />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="rounded-md px-4 py-2 border"
              onClick={onClose}
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
    </Modal>
  );
}

// --------------------------- Modal Detalles (últimos 3) ---------------------------
function PlantDetailModal({ open, onClose, plant }) {
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);

  const addNote = async () => {
    const text = prompt("Escribe una nota:");
    if (!text) return;
    const res = await fetch(`${apiUrl}/api/plants/${plant._id}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) alert("No se pudo agregar la nota");
    else window.location.reload(); // simple por ahora
  };

  if (!open || !plant) return null;

  const sortedNotes = [...(plant.notes || [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const sortedLogs = [...(plant.careLogs || [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const notesToShow = showAllNotes ? sortedNotes : sortedNotes.slice(0, 3);
  const logsToShow = showAllLogs ? sortedLogs : sortedLogs.slice(0, 3);

  const fdate = (d) => (d ? new Date(d).toLocaleString() : "—");

  return (
    <Modal open={open} onClose={onClose} className="max-w-4xl">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <img
            src={plant.imageUrl || "/img/placeholder.jpg"}
            alt={plant.nombreComun}
            className="w-40 h-40 object-cover rounded-xl"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold">
              {plant.nombreComun} {plant.nickname ? `(${plant.nickname})` : ""}
            </h2>
            <p className="text-slate-600">{plant.family || "—"}</p>

            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <Info label="Cuidado" value={plant.nivelCuidado} />
              <Info label="Riego (días)" value={plant.riego ?? "—"} />
              <Info label="Cantidad (ml)" value={plant.cantidad ?? "—"} />
              <Info label="Iluminación" value={plant.iluminacion} />
              <Info label="Temperatura" value={plant.temperatura} />
              <Info label="Humedad" value={plant.humedad} />
              <Info label="Suelo" value={plant.suelo} />
              <Info label="Propagación" value={plant.propagacion} />
              <Info label="Tóxica" value={plant.toxicity ? "Sí" : "No"} />
              <Info label="Próx. riego" value={fmt(plant.nextWatering)} />
              <Info
                label="Próx. fertilización"
                value={fmt(plant.nextFertilization)}
              />
              <Info label="Ubicación" value={plant.locationInHome || "—"} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notas (últimas 3) */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notas (últimas)</h3>
              <div className="flex items-center gap-2">
                {sortedNotes.length > 3 && (
                  <button
                    className="text-sm px-3 py-1 rounded-md border"
                    onClick={() => setShowAllNotes((s) => !s)}
                  >
                    {showAllNotes ? "Ver menos" : "Ver todas"}
                  </button>
                )}
                <button
                  className="text-sm px-3 py-1 rounded-md bg-emerald-700 text-white"
                  onClick={addNote}
                >
                  + Nota
                </button>
              </div>
            </div>

            <div className="mt-2 space-y-2">
              {sortedNotes.length === 0 && (
                <p className="text-sm text-slate-500">Sin notas.</p>
              )}
              {notesToShow.map((n, i) => (
                <div
                  key={i}
                  className="rounded-md border p-2 text-sm bg-slate-50"
                >
                  <div className="text-slate-500">{fdate(n.date)}</div>
                  <div>{n.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Care logs (últimos 3) */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Historial de cuidados (últimos)</h3>
              {sortedLogs.length > 3 && (
                <button
                  className="text-sm px-3 py-1 rounded-md border"
                  onClick={() => setShowAllLogs((s) => !s)}
                >
                  {showAllLogs ? "Ver menos" : "Ver todos"}
                </button>
              )}
            </div>

            <div className="mt-2 space-y-2">
              {sortedLogs.length === 0 && (
                <p className="text-sm text-slate-500">Sin registros.</p>
              )}
              {logsToShow.map((c, i) => (
                <div key={i} className="rounded-md border p-2 text-sm">
                  <div className="capitalize text-slate-500">
                    {c.type} - {fdate(c.date)}
                  </div>
                  {c.details && <div>{c.details}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="px-4 py-2 rounded-md border" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border px-3 py-2 bg-white">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}

// --------------------------- Card ---------------------------
function PlantCard({
  plant,
  onDetail,
  onEdit,
  onDelete,
  onWater,
  onFertilize,
}) {
  const due = isDue(plant.nextWatering);
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
      <img
        src={plant.imageUrl || "/img/placeholder.jpg"}
        alt={plant.nombreComun}
        className="w-full h-44 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{plant.nombreComun}</h3>
        <p className="text-slate-600">{plant.family || "—"}</p>

        <div className="mt-3 flex flex-col gap-2">
          <span
            className={`text-sm ${
              due ? "text-red-500 font-semibold" : "text-sky-600"
            }`}
          >
            💧 {due ? "¡Regar hoy!" : `Próximo: ${fmt(plant.nextWatering)}`}
          </span>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded-md border text-sm"
              onClick={() => onDetail(plant)}
              title="Ver detalles"
            >
              📝
            </button>
            <button
              className="px-3 py-1 rounded-md border text-sm"
              onClick={() => onEdit(plant)}
              title="Editar"
            >
              ✏️
            </button>
            <button
              className="px-3 py-1 rounded-md border text-sm"
              onClick={() => onWater(plant._id)}
              title="Regar"
            >
              💧
            </button>
            <button
              className="px-3 py-1 rounded-md border text-sm"
              onClick={() => onFertilize(plant._id)}
              title="Fertilizar"
            >
              🌿
            </button>
            <button
              className="px-3 py-1 rounded-md border text-sm text-red-600"
              onClick={() => onDelete(plant._id)}
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------- Página principal ---------------------------
export default function MyPlantsPage() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);

  const count = useMemo(() => plants.length, [plants]);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await fetch(`${apiUrl}/api/plants`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
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

  // CRUD helpers
  const handleSaved = (p) => {
    if (editing) {
      setPlants((prev) => prev.map((x) => (x._id === p._id ? p : x)));
    } else {
      setPlants((prev) => [p, ...prev]);
    }
    setEditing(null);
  };

  const onDelete = async (id) => {
    if (!confirm("¿Eliminar esta planta?")) return;
    const res = await fetch(`${apiUrl}/api/plants/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (!res.ok) return alert("No se pudo eliminar");
    setPlants((prev) => prev.filter((p) => p._id !== id));
  };

  const onWater = async (id) => {
    const res = await fetch(`${apiUrl}/api/plants/${id}/water`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
    });
    const data = await res.json();
    if (!res.ok || data.error) return alert(data.error || "Error al regar");
    data.plant
      ? setPlants((prev) => prev.map((p) => (p._id === id ? data.plant : p)))
      : fetchPlants();
  };

  const onFertilize = async (id) => {
    const res = await fetch(`${apiUrl}/api/plants/${id}/fertilize`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
    });
    const data = await res.json();
    if (!res.ok || data.error)
      return alert(data.error || "Error al fertilizar");
    data.plant
      ? setPlants((prev) => prev.map((p) => (p._id === id ? data.plant : p)))
      : fetchPlants();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-emerald-50 rounded-xl p-6 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mis Plantas</h1>
          <p className="text-slate-700">Tienes {count} plantas registradas</p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-md bg-emerald-700 text-white"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + Nueva Planta
          </button>
        </div>
      </div>

      {/* Listado */}
      {loading && <p>Cargando...</p>}
      {err && <p className="text-red-600">{err}</p>}

      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        {!loading &&
          plants.map((p) => (
            <PlantCard
              key={p._id}
              plant={p}
              onDetail={(pl) => {
                setSelected(pl);
                setShowDetail(true);
              }}
              onEdit={(pl) => {
                setEditing(pl);
                setShowForm(true);
              }}
              onDelete={onDelete}
              onWater={onWater}
              onFertilize={onFertilize}
            />
          ))}
      </div>

      {/* Modales */}
      <PlantFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initial={editing}
      />

      <PlantDetailModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        plant={selected}
      />
    </div>
  );
}
