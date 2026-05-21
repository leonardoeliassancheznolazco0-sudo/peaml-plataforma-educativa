import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { authAPI } from "../services/api";
import { Brain, AlertCircle, CheckCircle } from "lucide-react";

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
      setTimeout(() => router.push("/login"), 2000);
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
            <h1 className="text-2xl font-black text-gray-800 mb-6">Crear cuenta</h1>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm">
                <CheckCircle className="w-4 h-4" /> ¡Cuenta creada! Redirigiendo...
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rol</label>
                <select name="role" value={form.role} onChange={handleChange} className="input-field bg-white">
                  <option value="student">Estudiante</option>
                  <option value="teacher">Docente</option>
                  <option value="admin">Administrador</option>
                </select>
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
        </div>
      </div>
    </>
  );
}