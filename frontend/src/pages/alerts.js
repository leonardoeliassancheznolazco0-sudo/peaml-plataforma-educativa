import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";
import { analyticsAPI } from "../services/api";
import { AlertTriangle, CheckCircle, Users, FileWarning } from "lucide-react";

export default function AlertsPage() {
  const { user } = useAuth();
  const [studentAlerts, setStudentAlerts] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== "teacher" && user.role !== "admin")) { setLoading(false); return; }
    Promise.all([analyticsAPI.studentAlerts(), analyticsAPI.itemQuality()])
      .then(([a, b]) => {
        setStudentAlerts(a.data || []);
        setItems(b.data?.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (<div className="p-8 text-center"><Link href="/login" className="btn-primary">Iniciar sesión</Link></div>);
  if (user.role !== "teacher" && user.role !== "admin") {
    return (
      <DashboardLayout title="Alertas">
        <div className="p-8">
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" /> Solo docentes y administradores pueden ver las alertas.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const malos = items.filter((i) => i.mala);

  return (
    <DashboardLayout title="Alertas">
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Alertas</h1>
          <p className="text-gray-500 mt-1">Estudiantes que necesitan apoyo y preguntas de baja calidad.</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Cargando...</div>
        ) : (
          <>
            <section>
              <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-primary-600" /> Estudiantes que necesitan apoyo ({studentAlerts.length})
              </h2>
              {studentAlerts.length === 0 ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" /> Ningún estudiante en alerta por ahora.
                </div>
              ) : (
                <div className="space-y-2">
                  {studentAlerts.map((a) => (
                    <div key={a.student_id} className="card flex items-start justify-between gap-3 border-l-4 border-amber-400">
                      <div>
                        <p className="font-semibold text-gray-800">{a.name}</p>
                        <p className="text-xs text-gray-500">{a.email} · nivel {a.nivel} · {a.total_quizzes} quizzes</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {a.motivos.map((m, i) => <span key={i} className="badge bg-amber-100 text-amber-700 text-xs">{m}</span>)}
                        </div>
                      </div>
                      <span className="text-lg font-black text-amber-600">{a.promedio}%</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                <FileWarning className="w-5 h-5 text-primary-600" /> Preguntas de baja calidad ({malos.length})
              </h2>
              {malos.length === 0 ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" /> No hay preguntas marcadas. (Se necesitan suficientes respuestas de estudiantes para evaluarlas.)
                </div>
              ) : (
                <div className="space-y-2">
                  {malos.map((i) => (
                    <div key={i.question_id} className="card border-l-4 border-red-400">
                      <p className="font-semibold text-gray-800 text-sm">{i.text}</p>
                      <p className="text-xs text-gray-500 mb-1">{i.content_title}</p>
                      <div className="flex gap-2 flex-wrap text-xs">
                        <span className="badge bg-red-100 text-red-700">{i.motivo}</span>
                        <span className="badge bg-gray-100 text-gray-600">dificultad {i.dificultad}</span>
                        <span className="badge bg-gray-100 text-gray-600">discriminación {i.discriminacion}</span>
                        <span className="badge bg-gray-100 text-gray-600">{i.n} respuestas</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
