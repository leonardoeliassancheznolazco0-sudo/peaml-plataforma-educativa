import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";
import { recommendationsAPI } from "../services/api";
import { BookOpen, Headphones, Monitor, FileText, Zap, PlayCircle, AlertCircle } from "lucide-react";

const typeIcons  = { visual: Monitor, auditivo: Headphones, lectura: FileText, interactivo: Zap };
const typeColors = { visual: "bg-blue-50 text-blue-600", auditivo: "bg-purple-50 text-purple-600", lectura: "bg-green-50 text-green-600", interactivo: "bg-orange-50 text-orange-600" };
const levelColors = { basico: "bg-green-100 text-green-700", intermedio: "bg-yellow-100 text-yellow-700", avanzado: "bg-red-100 text-red-700" };

export default function RecommendationsPage() {
  const { user, studentProfile } = useAuth();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    const studentId = studentProfile?.id;
    if (!studentId) {
      setError("No se encontró tu perfil de estudiante. Completa una evaluación primero.");
      setLoading(false);
      return;
    }
    recommendationsAPI.getByStudent(studentId)
      .then(r => setRecs(r.data))
      .catch(e => setError(e.response?.data?.detail || "Error al cargar recomendaciones"))
      .finally(() => setLoading(false));
  }, [user, studentProfile]);

  return (
    <DashboardLayout title="Recomendaciones">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-800">Contenidos Recomendados</h1>
          <p className="text-gray-500 mt-1">Seleccionados por el modelo ML según tu perfil cognitivo.</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-16">Cargando recomendaciones...</div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
          </div>
        ) : recs.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay recomendaciones aún.</p>
            <p className="text-sm text-gray-400 mt-1">Completa tu evaluación diagnóstica primero.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recs.map((rec, i) => {
              const Icon      = typeIcons[rec.content_type]  || BookOpen;
              const iconColor = typeColors[rec.content_type] || "bg-gray-50 text-gray-600";
              const lvlColor  = levelColors[rec.level]       || "bg-gray-100 text-gray-700";
              return (
                <div key={i} className="card hover:shadow-md transition-all border-2 border-transparent hover:border-primary-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 ${iconColor} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <span className={`badge ${lvlColor} capitalize`}>{rec.level}</span>
                      <span className="badge bg-gray-100 text-gray-600 capitalize">{rec.content_type}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{rec.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{rec.description}</p>
                  {rec.match_score !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Compatibilidad</span><span>{Math.round(rec.match_score * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div className="h-1.5 bg-gradient-to-r from-primary-400 to-teal-400 rounded-full"
                          style={{ width: `${rec.match_score * 100}%` }} />
                      </div>
                    </div>
                  )}
                  <Link href={`/quiz/${rec.id}`}
                    className="btn-primary w-full text-center text-sm flex items-center justify-center gap-2">
                    Resolver actividad <PlayCircle className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}