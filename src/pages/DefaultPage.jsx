import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import img1 from "../assets/img/planta1.jpg";
import img2 from "../assets/img/planta2.jpg";
import img3 from "../assets/img/planta3.jpg";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// ---------- Esquemas Zod ----------
const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const registerSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z
    .string()
    .min(6, "Mínimo 6 caracteres")
    .max(64, "Máximo 64 caracteres"),
  nombre: z
    .string()
    .trim()
    .min(2, "Nombre muy corto")
    .max(80, "Nombre muy largo"),
  edad: z.coerce
    .number()
    .int("Edad inválida")
    .min(13, "Debes tener al menos 13 años")
    .max(120, "Edad fuera de rango"),
  tipoClima: z.enum(["humedo", "seco"], { message: "Selecciona un clima" }),
  zonaGeo: z.enum(["costa", "montaña", "ciudad", "rural"], {
    message: "Selecciona una zona",
  }),
  espacio: z.enum(["balcon", "patio", "interior", "terraza"], {
    message: "Selecciona un espacio",
  }),
  mascota: z.enum(["si", "no"], { message: "Indica si tienes mascotas" }),
  experiencia: z.enum(["principiante", "intermedio", "avanzado"], {
    message: "Selecciona tu nivel",
  }),
});

// ---------- Helpers UI ----------
const ErrorText = ({ msg }) =>
  msg ? <p className="text-red-600 text-sm -mt-1">{msg}</p> : null;

const apiUrl = import.meta.env.VITE_API_URL;

const DefaultPage = () => {
  const imagenes = [img1, img2, img3];
  const [imagenActual, setImagenActual] = useState(0);
  const [modal, setModal] = useState(null); // "registro" | "login" | null
  const [serverError, setServerError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  // RHF - Login
  const {
    register: regLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: loggingIn },
    reset: resetLogin,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // RHF - Registro
  const {
    register: regReg,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: regErrors, isSubmitting: registering },
    reset: resetRegister,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      nombre: "",
      edad: 18,
      tipoClima: "",
      zonaGeo: "",
      espacio: "",
      mascota: undefined,
      experiencia: "",
    },
  });

  // Carrusel
  const siguienteImagen = () =>
    setImagenActual((prev) => (prev + 1) % imagenes.length);
  const anteriorImagen = () =>
    setImagenActual((prev) => (prev - 1 + imagenes.length) % imagenes.length);

  const abrirModal = (tipo) => {
    setServerError("");
    setModal(tipo);
  };
  const cerrarModal = () => {
    setModal(null);
    setServerError("");
    resetLogin();
    resetRegister();
  };

  // ---------- Submits ----------
  const onLogin = async (data) => {
    setServerError("");
    console.log(data);
    try {
      // TODO: cambia URL por tu backend
      const resp = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await resp.json();
      console.log(responseData);

      if (!resp.ok) {
        alert(responseData.error);
        throw new Error((await resp.json()).message || "Error de login");
      }

      login(responseData.token);
      navigate("/home");
      cerrarModal();
    } catch (e) {
      setServerError(e.message || "No se pudo iniciar sesión");
    }
    cerrarModal();
  };

  const onRegister = async (data) => {
    setServerError("");
    console.log(data);
    try {
      const resp = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!resp.ok)
        throw new Error((await resp.json()).message || "Error de registro");
      // const result = await resp.json();
      cerrarModal();
    } catch (e) {
      setServerError(e.message || "No se pudo registrar");
    }
  };

  return (
    <div className="p-4 min-h-screen">
      {/* Hero */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-600 font-hallo tracking-wide">
          Bienvenido a tu Jardín 🌿
        </h1>
        <h3 className="text-gray-600 mt-2 text-xl">
          Un sitio que te ayuda a cuidar mejor tus plantas
        </h3>
      </header>

      {/* Contenido */}
      <div className="flex flex-wrap justify-center gap-10">
        {/* Carrusel */}
        <div className="max-w-sm w-full">
          <div className="relative rounded-lg overflow-hidden shadow-lg">
            <img
              src={imagenes[imagenActual]}
              alt="Carrusel"
              className="w-full h-96 object-cover"
            />
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-4">
              <button
                onClick={anteriorImagen}
                aria-label="Anterior"
                className="bg-black/50 hover:bg-black/80 text-white w-8 h-8 rounded-full"
              >
                ⟨
              </button>
              <button
                onClick={siguienteImagen}
                aria-label="Siguiente"
                className="bg-black/50 hover:bg-black/80 text-white w-8 h-8 rounded-full"
              >
                ⟩
              </button>
            </div>
          </div>
        </div>

        {/* Caja de info */}
        <div className="bg-white/90 p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-semibold mb-4">
            ¿Qué puedes hacer aquí?
          </h2>
          <ul className="space-y-2">
            <li>🌱 Registrar tus plantas y seguir su crecimiento.</li>
            <li>📅 Obtener recordatorios de riego y trasplante.</li>
            <li>📍 Recomendaciones según tu clima y espacio.</li>
            <li>📝 Consejos ecológicos.</li>
            <li>🪴 Los mejores cuidados para tus plantas.</li>
          </ul>
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => abrirModal("registro")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Registrarse
            </button>
            <button
              onClick={() => abrirModal("login")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>

      {/* -------- Modal Registro -------- */}
      {modal === "registro" && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={cerrarModal}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-1">Registro de usuario</h2>
            {serverError && (
              <div className="text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded mb-2">
                {serverError}
              </div>
            )}

            <form
              className="flex flex-col gap-2"
              onSubmit={handleRegisterSubmit(onRegister)}
            >
              <label className="text-left font-semibold">Correo</label>
              <input
                className="border p-2 rounded"
                placeholder="Correo"
                {...regReg("email")}
              />
              <ErrorText msg={regErrors.email?.message} />

              <label className="text-left font-semibold">Contraseña</label>
              <input
                type="password"
                className="border p-2 rounded"
                placeholder="Contraseña"
                {...regReg("password")}
              />
              <ErrorText msg={regErrors.password?.message} />

              <label className="text-left font-semibold">Nombre completo</label>
              <input
                className="border p-2 rounded"
                placeholder="Nombre completo"
                {...regReg("nombre")}
              />
              <ErrorText msg={regErrors.nombre?.message} />

              <label className="text-left font-semibold">Edad</label>
              <input
                type="number"
                className="border p-2 rounded"
                placeholder="Edad"
                {...regReg("edad")}
              />
              <ErrorText msg={regErrors.edad?.message} />

              <label className="text-left font-semibold">Tipo de clima</label>
              <select
                className="border p-2 rounded"
                defaultValue=""
                {...regReg("tipoClima")}
              >
                <option value="" disabled>
                  Selecciona una opción
                </option>
                <option value="humedo">Húmedo</option>
                <option value="seco">Seco</option>
              </select>
              <ErrorText msg={regErrors.tipoClima?.message} />

              <label className="text-left font-semibold">Zona geográfica</label>
              <select
                className="border p-2 rounded"
                defaultValue=""
                {...regReg("zonaGeo")}
              >
                <option value="" disabled>
                  Selecciona una opción
                </option>
                <option value="costa">Costa</option>
                <option value="montaña">Montaña</option>
                <option value="ciudad">Ciudad</option>
                <option value="rural">Rural</option>
              </select>
              <ErrorText msg={regErrors.zonaGeo?.message} />

              <label className="text-left font-semibold">
                Tipo de espacio para plantas
              </label>
              <select
                className="border p-2 rounded"
                defaultValue=""
                {...regReg("espacio")}
              >
                <option value="" disabled>
                  Selecciona una opción
                </option>
                <option value="balcon">Balcón</option>
                <option value="patio">Patio</option>
                <option value="interior">Interior</option>
                <option value="terraza">Terraza</option>
              </select>
              <ErrorText msg={regErrors.espacio?.message} />

              <label className="text-left font-semibold">
                ¿Tienes mascotas?
              </label>
              <div className="flex gap-6">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" value="si" {...regReg("mascota")} /> Sí
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" value="no" {...regReg("mascota")} /> No
                </label>
              </div>
              <ErrorText msg={regErrors.mascota?.message} />

              <label className="text-left font-semibold">
                Nivel de experiencia
              </label>
              <select
                className="border p-2 rounded"
                defaultValue=""
                {...regReg("experiencia")}
              >
                <option value="" disabled>
                  Selecciona una opción
                </option>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
              <ErrorText msg={regErrors.experiencia?.message} />

              <div className="flex gap-4 mt-3">
                <button
                  type="submit"
                  disabled={registering}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded"
                >
                  {registering ? "Registrando..." : "Registrarse"}
                </button>
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------- Modal Login -------- */}
      {modal === "login" && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={cerrarModal}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-1">Inicia sesión</h2>
            {serverError && (
              <div className="text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded mb-2">
                {serverError}
              </div>
            )}

            <form
              className="flex flex-col gap-2"
              onSubmit={handleLoginSubmit(onLogin)}
            >
              <label className="text-left font-semibold">Correo</label>
              <input
                className="border p-2 rounded"
                placeholder="Correo"
                {...regLogin("email")}
              />
              <ErrorText msg={loginErrors.email?.message} />

              <label className="text-left font-semibold">Contraseña</label>
              <input
                type="password"
                className="border p-2 rounded"
                placeholder="Contraseña"
                {...regLogin("password")}
              />
              <ErrorText msg={loginErrors.password?.message} />

              <div className="flex gap-4 mt-3">
                <button
                  type="submit"
                  disabled={loggingIn}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded"
                >
                  {loggingIn ? "Ingresando..." : "Iniciar sesión"}
                </button>
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DefaultPage;
