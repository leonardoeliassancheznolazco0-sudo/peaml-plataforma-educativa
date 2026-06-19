import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { dashboardAPI, mlAPI, managementAPI } from "../../services/api";
import { Users, BookOpen, ClipboardList, Activity, CheckCircle, RefreshCw } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [coherence, setCoherence] = useState(null);
  const [recalc, setRecalc] = useState(false);

  useEffect(() => {
    dashboardAPI.admin().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
    managementAPI.listAllStudents().then(r => setStudents(r.data)).catch(() => {});
    mlAPI.coherence().then(r => setCoherence(r.data)).catch(() => {});
  }, []);

  const handleRecalc = async () => {
    setRecalc(true);
    try {
      const r = await mlAPI.coherence();
      setCoherence(r.data);
    } catch {} finally {
      setRecalc(false);
    }
  };

  if (loading) return <DashboardLayout title="Admin"><div className="p-8 text-center text-gray-400">Cargando...</div></DashboardLayout>;

  return (
    <DashboardLayout title="Panel Admin">
      <div className="p-8">
        <h1 className="text-2xl font-black text-gray-800 mb-2">Panel Administrador</h1>
        <p className="text-gray-500 mb-8">Gestión del sistema, usuarios, contenidos y modelo ML.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Usuarios", value: data?.total_users, icon: Users, color: "bg-blue-50 text-blue-600" },
            { label: "Estudiantes", value: data?.total_students, icon: Users, color: "bg-teal-50 text-teal-600" },
            { label: "Contenidos", value: data?.total_contents, icon: BookOpen, color: "bg-purple-50 text-purple-600" },
            { label: "Evaluaciones", value: data?.total_assessments, icon: ClipboardList, color: "bg-orange-50 text-orange-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
              <div className="text-2xl font-black text-gray-800">{value ?? 0}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <h2 className="font-bold text-gray-700 mb-4">Usuarios por Rol</h2>
            <div className="space-y-3">
              {Object.entries(data?.users_by_role || {}).map(([role, count]) => {
                const colors = { students: "bg-blue-400", teachers: "bg-teal-400", admins: "bg-purple-400" };
                const labels = { students: "Estudiantes", teachers: "Docentes", admins: "Administradores" };
                const total = data?.total_users || 1;
                return (
                  <div key={role}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">{labels[role]}</span>
                      <span className="font-bold text-gray-800">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className={`h-2 ${colors[role]} rounded-full`} style={{ width: `${(count / total) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

{/* Graficos */}
{students.length > 0 && (() => {
  const profileData = ["TEA","TDAH","dislexia","general"].map(p => ({
    name: p, value: students.filter(s => s.cognitive_profile === p).length
  })).filter(d => d.value > 0);

  const levelData = ["basico","intermedio","avanzado"].map(l => ({
    name: l.charAt(0).toUpperCase() + l.slice(1),
    cantidad: students.filter(s => s.current_level === l).length
  }));

  const COLORS = ["#2563eb","#f97316","#9333ea","#6b7280"];

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      <div className="card">
        <h2 className="font-bold text-gray-700 mb-4">Distribución de Perfiles Cognitivos</h2>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={profileData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name, value}) => `${name}: ${value}`}>
              {profileData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <h2 className="font-bold text-gray-700 mb-4">Estudiantes por Nivel</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={levelData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#2563eb" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
})()}



          <div className="card">
            <h2 className="font-bold text-gray-700 mb-4">Estado del Sistema</h2>
            <div className="space-y-3">
              {Object.entries(data?.system_status || {}).map(([service, status]) => (
                <div key={service} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 capitalize">{service.replace("_", " ")}</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
                    <CheckCircle className="w-4 h-4" /> {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-700">Modelo ML</h2>
              <p className="text-sm text-gray-500">Reglas de nivel y recomendación + K-Means (no supervisado). Métrica honesta: coherencia.</p>
            </div>
            <button onClick={handleRecalc} disabled={recalc} className="btn-primary flex items-center gap-2 text-sm">
              <RefreshCw className={`w-4 h-4 ${recalc ? "animate-spin" : ""}`} />
              {recalc ? "Calculando..." : "Recalcular coherencia"}
            </button>
          </div>

          <div className="bg-primary-50 rounded-2xl p-5 text-center mb-4">
            <div className="text-4xl font-black text-primary-700">{coherence ? `${coherence.coherencia}%` : "—"}</div>
            <div className="text-sm text-primary-600 mt-1">Coherencia de recomendaciones</div>
            <div className="text-xs text-gray-500 mt-1">{coherence?.criterio || "≥ 2 de 3 criterios (nivel, perfil, preferencia)"}</div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Recs coherentes", value: coherence ? `${coherence.recomendaciones_coherentes}/${coherence.total_recomendaciones}` : "—" },
              { label: "Estudiantes", value: coherence?.estudiantes_evaluados ?? "—" },
              { label: "Modelo", value: "Reglas + K-Means" },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="font-bold text-gray-700 text-sm">{m.value}</div>
                <div className="text-xs text-gray-500">{m.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            No se reporta accuracy clínico: no es medible sin datos reales validados por un profesional. La coherencia mide el output real del recomendador y es verificable a mano.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}