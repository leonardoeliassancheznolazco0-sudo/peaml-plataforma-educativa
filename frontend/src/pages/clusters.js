import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";
import { analyticsAPI } from "../services/api";
import { Layers, AlertTriangle } from "lucide-react";

const COLORS = ["border-primary-400", "border-teal-400", "border-amber-400", "border-purple-400", "border-pink-400"];

export default function ClustersPage() {
  const { user } = useAuth();
  const [k, setK] = useState(3);
  const [grupos, setGrupos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = (kk) => {
    setLoading(true);
    analyticsAPI.clusters(kk)
      .then((r) => { setGrupos(r.data?.grupos || []); setTotal(r.data?.total_estudiantes || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user || (user.role !== "teacher" && user.role !== "admin")) { setLoading(false); return; }
    load(k);
  }, [user]);

  if (!user) return (<div className="p-8 text-center"><Link href="/login" className="btn-primary">Iniciar sesión</Link></div>);
  if (user.role !== "teacher" && user.role !== "admin") {
    return (
      <DashboardLayout title="Grupos">
        <div className="p-8">
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" /> Solo docentes y administradores.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Grupos de aprendizaje">
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary-600" /> Grupos de aprendizaje (clustering)
          </h1>
          <p className="text-gray-500 mt-1">Estudiantes agrupados por patrones de desempeño con K-Means (no supervisado).</p>
        </div>

        <div className="card mb-6 flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-600">Número de grupos (k)</label>
          <select value={k} onChange={(e) => { const kk = parseInt(e.target.value); setK(kk); load(kk); }}
            className="input-field max-w-24">
            {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="text-xs text-gray-400">{total} estudiantes</span>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Calculando grupos...</div>
        ) : grupos.length === 0 ? (
          <div className="text-center text-gray-400 py-12">Aún no hay datos suficientes para agrupar.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {grupos.map((g, i) => (
              <div key={g.grupo} className={`card border-l-4 ${COLORS[i % COLORS.length]}`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-800">Grupo {g.grupo} — {g.etiqueta}</h3>
                  <span className="text-sm font-black text-gray-700">{g.promedio}%</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{g.num_estudiantes} estudiantes · promedio del grupo</p>
                <ul className="space-y-1">
                  {g.miembros.map((m) => (
                    <li key={m.student_id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{m.name}</span>
                      <span className="text-gray-400 text-xs capitalize">{m.nivel} · {m.promedio}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-6">
          Nota: el clustering es exploratorio. Con pocos datos reales es ilustrativo; mejora a medida que más estudiantes resuelven actividades.
        </p>
      </div>
    </DashboardLayout>
  );
}
