import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { studentsAPI } from "../services/api";
import { Search } from "lucide-react";

const profileColors = { TEA: "bg-blue-100 text-blue-700", TDAH: "bg-orange-100 text-orange-700", dislexia: "bg-purple-100 text-purple-700", general: "bg-gray-100 text-gray-700" };
const levelColors = { basico: "bg-green-100 text-green-700", intermedio: "bg-yellow-100 text-yellow-700", avanzado: "bg-red-100 text-red-700" };

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    studentsAPI.list().then(r => setStudents(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout title="Estudiantes">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Estudiantes</h1>
            <p className="text-gray-500 mt-1">{students.length} estudiantes registrados</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar estudiante..." className="input-field pl-9 w-60" />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Cargando...</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["ID", "Nombre", "Email", "Edad", "Perfil", "Preferencia", "Nivel", "Puntaje", "Sesiones"].map(h => (
                    <th key={h} className="text-left text-gray-500 font-semibold pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 text-gray-400 font-mono text-xs">#{s.id}</td>
                    <td className="py-3 pr-4 font-semibold text-gray-800">{s.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{s.email}</td>
                    <td className="py-3 pr-4 text-gray-600">{s.age} años</td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${profileColors[s.cognitive_profile] || "bg-gray-100 text-gray-600"} text-xs`}>{s.cognitive_profile}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="badge bg-gray-100 text-gray-600 text-xs capitalize">{s.learning_preference}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${levelColors[s.current_level] || "bg-gray-100 text-gray-600"} text-xs capitalize`}>{s.current_level}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full">
                          <div className="h-1.5 bg-primary-400 rounded-full" style={{ width: `${s.total_score}%` }} />
                        </div>
                        <span className="text-gray-600 text-xs">{s.total_score}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{s.sessions_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}