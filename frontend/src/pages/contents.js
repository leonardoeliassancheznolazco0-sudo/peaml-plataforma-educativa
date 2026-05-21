import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { contentsAPI } from "../services/api";
import { BookOpen, Monitor, Headphones, FileText, Zap, ExternalLink } from "lucide-react";

const typeIcons = { visual: Monitor, auditivo: Headphones, lectura: FileText, interactivo: Zap };
const typeColors = { visual: "bg-blue-50 text-blue-600", auditivo: "bg-purple-50 text-purple-600", lectura: "bg-green-50 text-green-600", interactivo: "bg-orange-50 text-orange-600" };
const levelColors = { basico: "bg-green-100 text-green-700", intermedio: "bg-yellow-100 text-yellow-700", avanzado: "bg-red-100 text-red-700" };
const profileColors = { TEA: "bg-blue-100 text-blue-700", TDAH: "bg-orange-100 text-orange-700", dislexia: "bg-purple-100 text-purple-700", general: "bg-gray-100 text-gray-700" };

export default function ContentsPage() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    contentsAPI.list().then(r => setContents(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? contents : contents.filter(c => c.recommended_profile === filter);

  return (
    <DashboardLayout title="Contenidos">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-800">Biblioteca de Contenidos</h1>
          <p className="text-gray-500 mt-1">Todos los materiales educativos disponibles en PEAML.</p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "TEA", "TDAH", "dislexia", "general"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                filter === f ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300"
              }`}>
              {f === "all" ? "Todos" : f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Cargando contenidos...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(c => {
              const Icon = typeIcons[c.content_type] || BookOpen;
              return (
                <div key={c.id} className="card hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 ${typeColors[c.content_type] || "bg-gray-50 text-gray-600"} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      <span className={`badge ${levelColors[c.level] || "bg-gray-100 text-gray-600"} capitalize text-xs`}>{c.level}</span>
                      <span className={`badge ${profileColors[c.recommended_profile] || "bg-gray-100 text-gray-600"} text-xs`}>{c.recommended_profile}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{c.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{c.description}</p>
                  <a href={c.url || "#"} target="_blank" rel="noreferrer"
                    className="btn-primary w-full text-sm text-center flex items-center justify-center gap-2">
                    Ver Contenido <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}