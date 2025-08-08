// NewPlantModal.jsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const apiUrl = import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");

const ErrorText = ({ msg }) =>
  msg ? <p className="text-red-600 text-sm mt-1">{msg}</p> : null;

// ====== Esquema Zod (todos obligatorios menos nickname) ======
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
      message: "El riego debe ser un número mayor o igual a 0 (en hrs)",
    }),
  cantidad: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" ? undefined : Number(v)))
    .refine((v) => v !== undefined && !Number.isNaN(v) && v >= 0, {
      message: "La cantidad debe ser un número mayor o igual a 0 (en ml)",
    }),
  iluminacion: z.enum(["directa", "indirecta"], {
    message: "Debes seleccionar el tipo de iluminación",
  }),
  temperatura: z.enum(["calido", "frio"], {
    message: "Debes seleccionar la temperatura",
  }),
  humedad: z.enum(["alta", "media", "baja"], {
    message: "Debes seleccionar el nivel de humedad",
  }),
  suelo: z.enum(["drenado", "arcilloso", "compacto"], {
    message: "Debes seleccionar el tipo de suelo",
  }),
  propagacion: z.enum(["esqueje", "semilla"], {
    message: "Debes seleccionar el método de propagación",
  }),
  toxica: z.enum(["si", "no"], {
    message: "Debes indicar si la planta es tóxica",
  }),
  imageUrl: z
    .string({ message: "La URL de la imagen es obligatoria" })
    .trim()
    .url("Debe ser una URL válida que comience con http:// o https://"),
  nickname: z.string().trim().optional().or(z.literal("")),
  locationInHome: z
    .string({ message: "La ubicación en casa es obligatoria" })
    .trim()
    .min(2, "La ubicación debe tener al menos 2 caracteres"),
});

// helper enum → backend
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
  return M[v] ?? v;
};

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

export default function NewPlantModal({ open, onClose, onSaved }) {
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

  // limpiar al cerrar
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit = async (data) => {
    const body = {
      nombreComun: data.nombre,
      family: data.familia,
      nivelCuidado: mapEnum(data.cuidado),
      riego: Number(data.riego),
      cantidad: Number(data.cantidad),
      iluminacion: mapEnum(data.iluminacion),
      temperatura: mapEnum(data.temperatura),
      humedad: mapEnum(data.humedad),
      suelo: mapEnum(data.suelo),
      propagacion: mapEnum(data.propagacion),
      toxicity: data.toxica === "si",
      imageUrl: data.imageUrl,
      nickname: data.nickname || undefined, // opcional
      locationInHome: data.locationInHome,
      acquisitionDate: new Date(),
    };

    const res = await fetch(`${apiUrl}/api/plants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify(body),
    });
    const resp = await res.json();
    if (!res.ok) {
      alert(resp?.error || "Error creando la planta");
      return;
    }
    onSaved?.(resp.plant);
    onClose();
    reset();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 text-emerald-950">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Nueva planta
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
              defaultValue=""
              {...register("cuidado")}
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
              Riego (cada N días)
            </label>
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-md border px-3 py-2"
              {...register("riego")}
            />
            <ErrorText msg={errors.riego?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium">Cantidad (ml)</label>
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-md border px-3 py-2"
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
              defaultValue=""
              {...register("humedad")}
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
              defaultValue=""
              {...register("suelo")}
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
              defaultValue=""
              {...register("propagacion")}
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

          <div className="md:col-span-2 ">
            <label className="block text-sm font-medium">URL de imagen</label>
            <input
              type="url"
              placeholder="https://..."
              className="mt-1 w-full rounded-md border px-3 py-2"
              {...register("imageUrl")}
            />
            <ErrorText msg={errors.imageUrl?.message} />
            {/* {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                className="max-w-30 max-h-30 object-cover rounded-md mt-2 shadow"
              />
            )} */}
          </div>

          <div>
            <label className="block text-sm font-medium">
              Apodo (opcional)
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              {...register("nickname")}
            />
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
