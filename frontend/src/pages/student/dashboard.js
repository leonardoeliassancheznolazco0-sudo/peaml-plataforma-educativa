import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { dashboardAPI } from "../../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ClipboardList, Star, TrendingUp, Brain, Zap, AlertCircle } from "lucide-react";

export default function StudentDashboard() {
  const { user, studentProfile } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "student") { router.push("/login"); return; }

    if (!studentProfile) {
      setError("No se encontró perfil de estudiante. Intenta cerrar sesión y volver a entrar.");
      setLoading(false);
      return;
    }

    dashboardAPI.student(studentProfile.id)
      .then(r => setData(r.data))
      .catch(() => setError("Error al cargar el dashboard"))
      .finally(() => setLoading(false));
  }, [user, studentProfile]);

  if (loading) return <DashboardLayout title="Mi Panel"><div className="p-8 text-center text-gray-400">Cargando...</div></DashboardLayout>;

  if (error) return (
    <DashboardLayout title="Mi Panel">
      <div className="p-8">
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /><p>{error}</p>
        </div>
      </div>
    </DashboardLayout>
  );

  const stats = [
    { label: "Sesiones", value: data?.sessions_count ?? 0, icon: ClipboardList, color: "bg-blue-50 text-blue-600" },
    { label: "Puntaje Promedio", value: `${data?.avg_score ?? 0}%`, icon: TrendingUp, color: "bg-teal-50 text-teal-600" },
    { label: "Nivel Actual", value: data?.current_level ?? "Básico", icon: Star, color: "bg-purple-50 text-purple-600" },
    { label: "Perfil", value: data?.cognitive_profile ?? "General", icon: Brain, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <DashboardLayout title="Mi Panel">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-800">¡Hola, {data?.name || user?.name}! </h1>
          <p className="text-gray-500 mt-1">Aquí puedes ver tu progreso y acceder a contenidos personalizados.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-gray-800">{value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {data?.progress?.length > 0 && (
          <div className="card mb-8">
            <h2 className="font-bold text-gray-700 mb-4">Progreso de Evaluaciones</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.progress}>
                <XAxis dataKey="session" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={v => [`${v}%`, "Puntaje"]} />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/assessment" className="card hover:shadow-md transition-shadow border-2 border-primary-100 hover:border-primary-300 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <ClipboardList className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Iniciar Evaluación</h3>
                <p className="text-sm text-gray-500">Completa tu evaluación diagnóstica</p>
              </div>
            </div>
          </Link>
          <Link href="/recommendations" className="card hover:shadow-md transition-shadow border-2 border-teal-100 hover:border-teal-300 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                <Zap className="w-7 h-7 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Ver Recomendaciones</h3>
                <p className="text-sm text-gray-500">Contenidos personalizados para ti</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}