// src/pages/WateringPage.jsx
import { useEffect, useMemo, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");

const isDue = (d) => (d ? new Date(d) <= new Date() : false);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : "—");

function Modal({ open, onClose, children, className = "" }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full max-w-4xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
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

function PlantDetailModal({ open, onClose, plant, refresh }) {
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);

  if (!open || !plant) return null;

  const sortedNotes = [...(plant.notes || [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const sortedLogs = [...(plant.careLogs || [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const notesToShow = showAllNotes ? sortedNotes : sortedNotes.slice(0, 5);
  const logsToShow = showAllLogs ? sortedLogs : sortedLogs.slice(0, 5);

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
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j?.error || "No se pudo agregar la nota");
      return;
    }
    await refresh?.();
  };

  const water = async () => {
    const res = await fetch(`${apiUrl}/api/plants/${plant._id}/water`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
    });
    const j = await res.json();
    if (!res.ok || j.error) return alert(j.error || "Error al regar");
    await refresh?.();
  };

  const fertilize = async () => {
    const res = await fetch(`${apiUrl}/api/plants/${plant._id}/fertilize`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
    });
    const j = await res.json();
    if (!res.ok || j.error) return alert(j.error || "Error al fertilizar");
    await refresh?.();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <img
            src={plant.imageUrl || "/img/placeholder.jpg"}
            alt={plant.nombreComun}
            className="w-40 h-40 object-cover rounded-xl"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold">
                  {plant.nombreComun} {plant.nickname ? `(${plant.nickname})` : ""}
                </h2>
                <p className="text-slate-600">{plant.family || "—"}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded-md border text-sm"
                  onClick={water}
                  title="Regar"
                >
                  💧 Regar
                </button>
                <button
                  className="px-3 py-1 rounded-md border text-sm"
                  onClick={fertilize}
                  title="Fertilizar"
                >
                  🌿 Fertilizar
                </button>
                <button
                  className="px-3 py-1 rounded-md bg-emerald-700 text-white text-sm"
                  onClick={addNote}
                  title="Agregar nota"
                >
                  + Nota
                </button>
              </div>
            </div>

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
              <Info label="Próx. riego" value={fmtDate(plant.nextWatering)} />
              <Info label="Próx. fertilización" value={fmtDate(plant.nextFertilization)} />
              <Info label="Ubicación" value={plant.locationInHome || "—"} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notas</h3>
              {sortedNotes.length > 5 && (
                <button
                  className="text-sm px-3 py-1 rounded-md border"
                  onClick={() => setShowAllNotes((s) => !s)}
                >
                  {showAllNotes ? "Ver menos" : "Ver todas"}
                </button>
              )}
            </div>
            <div className="mt-2 space-y-2">
              {sortedNotes.length === 0 && (
                <p className="text-sm text-slate-500">Sin notas.</p>
              )}
              {notesToShow.map((n, i) => (
                <div key={i} className="rounded-md border p-2 text-sm bg-slate-50">
                  <div className="text-slate-500">{fmtDateTime(n.date)}</div>
                  <div>{n.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Historial de cuidados</h3>
              {sortedLogs.length > 5 && (
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
                  <div className="text-slate-500">{fmtDateTime(c.date)}</div>
                  <div className="capitalize">{c.type}</div>
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

function PlantCard({ plant, onDetail, onWater, onFertilize, onAddNote }) {
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
            className={`text-sm ${due ? "text-red-500 font-semibold" : "text-sky-600"}`}
            title={due ? "Toca regar" : "Próximo riego"}
          >
            💧 {due ? "¡Regar hoy!" : `Próximo: ${fmtDate(plant.nextWatering)}`}
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
              className="px-3 py-1 rounded-md border text-sm"
              onClick={() => onAddNote(plant._id)}
              title="Agregar nota"
            >
              ✏️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WateringPage() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filtros: "hoy" | "proximos" | "todos"
  const [filter, setFilter] = useState("hoy");

  // modal
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);

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

  const todayList = useMemo(
    () => plants.filter((p) => isDue(p.nextWatering)),
    [plants]
  );
  const upcomingList = useMemo(
    () => plants.filter((p) => p.nextWatering && !isDue(p.nextWatering)),
    [plants]
  );

  const view = filter === "hoy" ? todayList : filter === "proximos" ? upcomingList : plants;

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
    if (!res.ok || data.error) return alert(data.error || "Error al fertilizar");
    data.plant
      ? setPlants((prev) => prev.map((p) => (p._id === id ? data.plant : p)))
      : fetchPlants();
  };

  const onAddNote = async (id) => {
    const text = prompt("Escribe una nota para esta planta:");
    if (!text) return;
    const res = await fetch(`${apiUrl}/api/plants/${id}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok || data.error) return alert(data.error || "No se pudo agregar la nota");
    fetchPlants();
  };

  const bulkWaterToday = async () => {
    if (todayList.length === 0) return alert("No hay plantas por regar hoy.");
    if (!confirm(`¿Regar ${todayList.length} planta(s) hoy?`)) return;
    for (const p of todayList) {
      try {
        const res = await fetch(`${apiUrl}/api/plants/${p._id}/water`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token()}` },
        });
        // no frenamos por error; seguimos
        // eslint-disable-next-line no-unused-vars
        const _ = await res.json().catch(() => ({}));
      } catch {
        // ignora
      }
    }
    await fetchPlants();
    alert("Listo. Se registró el riego de hoy (donde aplicaba).");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-emerald-50 rounded-xl p-6 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Riegos y Cuidados</h1>
          <p className="text-slate-700">
            Hoy: <b>{todayList.length}</b> por regar · Próximos: <b>{upcomingList.length}</b>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={`px-3 py-2 rounded-md border text-sm ${
              filter === "hoy" ? "bg-emerald-700 text-white" : ""
            }`}
            onClick={() => setFilter("hoy")}
          >
            Hoy
          </button>
          <button
            className={`px-3 py-2 rounded-md border text-sm ${
              filter === "proximos" ? "bg-emerald-700 text-white" : ""
            }`}
            onClick={() => setFilter("proximos")}
          >
            Próximos
          </button>
          <button
            className={`px-3 py-2 rounded-md border text-sm ${
              filter === "todos" ? "bg-emerald-700 text-white" : ""
            }`}
            onClick={() => setFilter("todos")}
          >
            Todos
          </button>

          <button
            className="px-3 py-2 rounded-md bg-emerald-700 text-white text-sm"
            onClick={bulkWaterToday}
            title="Registra el riego de todas las plantas que tocan hoy"
          >
            💧 Regar todas (hoy)
          </button>
        </div>
      </div>

      {/* Listado */}
      {loading && <p>Cargando...</p>}
      {err && <p className="text-red-600">{err}</p>}

      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        {!loading &&
          view.map((p) => (
            <PlantCard
              key={p._id}
              plant={p}
              onDetail={(pl) => {
                setSelected(pl);
                setShowDetail(true);
              }}
              onWater={onWater}
              onFertilize={onFertilize}
              onAddNote={onAddNote}
            />
          ))}
      </div>

      {/* Modal Detalle */}
      <PlantDetailModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        plant={selected}
        refresh={fetchPlants}
      />
    </div>
  );
}
