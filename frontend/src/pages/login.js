import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useAuth } from "../context/AuthContext";
import { Brain, Mail, Lock, AlertCircle } from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "👨‍🎓 Estudiante", email: "lucas@peaml.edu", pass: "estudiante123" },
  { label: "👩‍🏫 Docente", email: "docente@peaml.edu", pass: "docente123" },
  { label: "⚙️ Admin", email: "admin@peaml.edu", pass: "admin123" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "admin") router.push("/admin/dashboard");
      else if (user.role === "teacher") router.push("/teacher/dashboard");
      else router.push("/student/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Ingresar | PEAML</title></Head>
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
            <h1 className="text-2xl font-black text-gray-800 mb-6">Iniciar sesión</h1>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="correo@ejemplo.com" className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••" className="input-field pl-10" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center flex items-center gap-2">
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-3 font-medium">Cuentas demo:</p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map(a => (
                  <button key={a.email} onClick={() => { setEmail(a.email); setPassword(a.pass); }}
                    className="text-xs bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-lg px-2 py-2 text-gray-700 font-medium transition-colors">
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-primary-600 font-semibold hover:underline">Regístrate aquí</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}