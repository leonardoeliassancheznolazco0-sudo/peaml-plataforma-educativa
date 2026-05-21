import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { dashboardAPI } from "../../services/api";
import { Users, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const profileColors = { TEA: "bg-blue-100 text-blue-700", TDAH: "bg-orange-100 text-orange-700", dislexia: "bg-purple-100 text-purple-700", general: "bg-gray-100 text-gray-700" };
const levelColors = { basico: "bg-green-100 text-green-700", intermedio: "bg-yellow-100 text-yellow-700", avanzado: "bg-red-100 text-red-700" };

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.teacher().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout title="Panel Docente"><div className="p-8 text-gray-400 text-center">Cargando...</div></DashboardLayout>;

  return (
    <DashboardLayout title="Panel Docente">
      <div className="p-8">
        <h1 className="text-2xl font-black text-gray-800 mb-2">Panel Docente</h1>
        <p className="text-gray-500 mb-8">Seguimiento de estudiantes y métricas de progreso.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Estudiantes", value: data?.total_students ?? 0, icon: Users, color: "bg-blue-50 text-blue-600" },
            { label: "Puntaje Clase", value: `${data?.avg_class_score ?? 0}%`, icon: TrendingUp, color: "bg-teal-50 text-teal-600" },
            { label: "Necesitan Apoyo", value: data?.students_needing_help ?? 0, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
            { label: "Buen Desempeño", value: (data?.total_students ?? 0) - (data?.students_needing_help ?? 0), icon: CheckCircle, color: "bg-green-50 text-green-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
              <div className="text-2xl font-black text-gray-800">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="font-bold text-gray-700 mb-4">Listado de Estudiantes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Estudiante", "Perfil", "Nivel", "Puntaje Prom.", "Sesiones", "Estado"].map(h => (
                    <th key={h} className="text-left text-gray-500 font-semibold pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.students?.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-semibold text-gray-800">{s.name}</td>
                    <td className="py-3 pr-4"><span className={`badge ${profileColors[s.profile] || "bg-gray-100 text-gray-600"}`}>{s.profile}</span></td>
                    <td className="py-3 pr-4"><span className={`badge ${levelColors[s.level] || "bg-gray-100 text-gray-600"} capitalize`}>{s.level}</span></td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                          <div className="h-1.5 rounded-full bg-primary-400" style={{ width: `${s.avg_score}%` }} />
                        </div>
                        <span className="text-gray-600 font-medium">{s.avg_score}%</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{s.sessions}</td>
                    <td className="py-3">
                      {s.needs_help
                        ? <span className="badge bg-red-100 text-red-700">⚠ Refuerzo</span>
                        : <span className="badge bg-green-100 text-green-700">✓ Bien</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}