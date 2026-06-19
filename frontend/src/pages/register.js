import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { authAPI } from "../services/api";
import { Brain, AlertCircle, CheckCircle, Info, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authAPI.register(form);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Registrarse | PEAML</title></Head>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-black text-primary-700">PEAML</span>
            </Link>
          </div>

          <div className="card shadow-lg">
            <h1 className="text-2xl font-black text-gray-800 mb-2">Crear cuenta</h1>
            <p className="text-sm text-gray-500 mb-6">Registro público solo para estudiantes</p>

            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 text-xs text-blue-700">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                El registro público crea una cuenta en <strong>modo prueba</strong>.
                Los <strong>docentes</strong> son creados por el administrador.
                Los <strong>estudiantes formalizados</strong> son creados por los docentes.
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            {success && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-yellow-800 font-bold mb-2">
                  <CheckCircle className="w-4 h-4" /> ¡Cuenta creada en modo prueba!
                </div>
                <p className="text-yellow-700 text-xs leading-relaxed">
                  Tu cuenta está en <strong>modo prueba</strong>. Puedes explorar la plataforma,
                  pero algunas funciones estarán limitadas hasta que un administrador formalice tu cuenta.
                  Redirigiendo al login...
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre completo</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  placeholder="Tu nombre" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  placeholder="correo@ejemplo.com" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required
                  placeholder="Mínimo 6 caracteres" minLength={6} className="input-field" />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
                <span>Rol asignado:</span>
                <span className="font-semibold text-primary-700">Estudiante (modo prueba)</span>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Creando cuenta..." : "Registrarme"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-primary-600 font-semibold hover:underline">Inicia sesión</Link>
            </p>
          </div>

          <p className="text-center mt-6">
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
              <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}